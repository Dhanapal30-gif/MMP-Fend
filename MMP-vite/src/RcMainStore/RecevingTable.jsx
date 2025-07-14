import React, { useState, useEffect } from 'react'
import DataTable from "react-data-table-component";
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CustomDialog from "../COM_Component/CustomDialog";
import { FaTimesCircle } from "react-icons/fa"; // ❌ Stylish icon

export const RecevingTable = ({ poDetail, handleFieldChange, formErrors, selectedRows, setSelectedRows }) => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const paginatedData = poDetail.slice((page - 1) * perPage, page * perPage);

    const calculateColumnWidth = (data, key, charWrap = 19, charWidth = 8, minWidth = 190, maxWidth = 318) => {
        if (!Array.isArray(data) || data.length === 0) return minWidth;
        const maxLines = Math.max(
            ...data.map(row => {
                const text = row[key]?.toString() || "";
                return Math.ceil(text.length / charWrap); // count wrapped lines
            })
        );
        const width = charWrap * charWidth;
        return Math.min(Math.max(width, minWidth), maxWidth);
    };



    // /const getRowKey = (row) => `${row.ponumber}-${row.partcode}`;
    const getRowKey = (row) => `${String(row.ponumber)}-${String(row.partcode)}`;
    const allKeys = paginatedData.map(getRowKey);
    const allSelected = allKeys.every((key) => selectedRows.includes(key));

    const handleSelectAll = (e) => {
        const currentPageKeys = paginatedData.map(getRowKey);
        if (e.target.checked) {
            setSelectedRows((prev) => [...new Set([...prev, ...currentPageKeys])]);
        } else {
            setSelectedRows((prev) => prev.filter((k) => !currentPageKeys.includes(k)));
        }
    };



    const handleSelect = (row, checked) => {
        const key = getRowKey(row);
        if (checked) {
            setSelectedRows((prev) => [...prev, key]);
        } else {
            setSelectedRows((prev) => prev.filter((k) => k !== key));
        }
    };



    const Defaultcolumn = [

        {
            name: (
                <div style={{ textAlign: 'center' }}>
                    <label>Select All</label><br />
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                    />
                </div>
            ),
            cell: (row) => (
                <div style={{ paddingLeft: '23px', width: '100%' }}>
                    <input
                        type="checkbox"
                        checked={selectedRows.includes(getRowKey(row))}
                        onChange={(e) => handleSelect(row, e.target.checked)}
                    />
                </div>
            ),
            width: "97px",
            center: true,
        },
        ,
        {
            name: "partcode",
            selector: row => row.partcode?.split(" ")[0], // ⬅️ Extract date part before space
            //width: `${calculateColumnWidth( 'modifieddate')}px`
            width: '130px'
        },
        {
            name: "partdescription",
            selector: row => row.partdescription,
            wrap: true,

            //  width: `${calculateColumnWidth( 'currency')}px`
            width: '310px'
        },
        {
            name: "orderqty",
            selector: row => row.orderqty,
            sortable: true,
            // width: '130px'
            //   width: `${calculateColumnWidth('orderqty')}px`
            width: "115px"
        },
        {
            name: "openOrderQty",
            selector: row => row.openOrderQty,
            wrap: true,
            width: '150px'

        },
        {
            name: "UOM",
            selector: row => row.UOM,
            wrap: true,
            grow: 2,
            //   width: `${calculateColumnWidth('UOM')}px`
            width: '130px'
        },
        {
            name: "Type of Component",
            selector: row => row.tyc,
            wrap: true,

            width: `${calculateColumnWidth('vendorCode')}px`
            //   width: '130px'
        },
        {
            name: "unitprice",
            selector: row => row.unitprice,
            width: `${calculateColumnWidth('unitprice')}px`
        },

        {
            name: "Receving Qty",
            cell: (row, index) => (
                <TextField
                    variant="outlined"
                    placeholder="Receving Qty"
                    type="number"
                    name="recevingQty"
                    value={row.recevingQty || ""}
                    error={Boolean(formErrors[`recevingQty-${index}`])}
                    helperText={formErrors[`recevingQty-${index}`]}
                    onChange={(e) => {
                        const value = e.target.value;

                        // Always allow input
                        handleFieldChange(index, 'recevingQty', value);

                        // Show error popup (but don't block typing)
                        if (Number(value) > Number(row.orderqty)) {
                            setErrorMessage("Receving Qty cannot be more than Order Qty");
                            setShowErrorPopup(true);
                        }

                        // Clear inline error if value is valid
                        if (formErrors[`recevingQty-${index}`] && Number(value) > 0) {
                            setFormErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors[`recevingQty-${index}`];
                                return newErrors;
                            });
                        }
                    }}
                    className="invoice-input"
                />
            ),
        }

        ,
        {
            name: "TotalValue",
            cell: (row, index) => (
                <TextField
                    variant="outlined"
                    placeholder='totalValue'
                    name='totalValue'
                    value={row.totalValue || ""}
                    type='number'
                    onChange={(e) => {
                        const total = parseFloat(e.target.value) || 0;
                        const ccf = parseFloat(row.ccf) || 1;
                        const euro = total * ccf;

                        handleFieldChange(index, 'totalValue', total);
                        handleFieldChange(index, 'totalValueEuro', euro.toFixed(2)); // ✅ update Euro value
                    }}
                    error={Boolean(formErrors[`totalValue-${index}`])}                        // ✅ show red border if error
                    helperText={formErrors[`totalValue-${index}`]}



                    className="invoice-input"
                />
            ),
        }
        ,
        {
            name: "totalValueEuro",
            selector: row => row.totalValueEuro,
            width: `${calculateColumnWidth('totalValueEuro')}px`

        }
        ,
        {
            name: "Expiry Date",
            cell: (row, index) => {
                const expApplicable = row.expdateapplicable?.toLowerCase().replace(/\s/g, "");
                const isDisabled = expApplicable === "notapplicable";

                // ✅ Auto-calculate only ONCE if "no"
                if (
                    expApplicable === "no" &&
                    row.shelflife &&
                    !row.exp_date &&
                    !row.expiryAutoSet
                ) {
                    const today = new Date();
                    const expiry = new Date(today);
                    expiry.setMonth(expiry.getMonth() + parseInt(row.shelflife, 10));
                    expiry.setDate(0); // Last day of the previous month
                    const formatted = expiry.toISOString().split("T")[0];
                    setTimeout(() => {
                        handleFieldChange(index, "exp_date", formatted);
                        handleFieldChange(index, "expiryAutoSet", true); // ✅ Mark as set
                    }, 0);
                }

                return (
                    <TextField
                        type="date"
                        variant="outlined"
                        value={row.exp_date ? row.exp_date.slice(0, 10) : ""}
                        onChange={(e) => {
                            if (expApplicable === "yes") {
                                const selected = new Date(e.target.value);
                                const receiving = new Date(row.receivingDate);
                                const minExpiry = new Date(receiving);
                                minExpiry.setMonth(minExpiry.getMonth() + 2);
                                minExpiry.setDate(1);

                                if (selected < minExpiry) {
                                    alert("Expiry must be at least 2 months after Receiving Date.");
                                    return;
                                }

                                handleFieldChange(index, "exp_date", e.target.value);
                            }
                        }}

                        disabled={isDisabled}
                        className="invoice-input"
                    />
                );
            }
        }
    ]





    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePerRowsChange = (newPerPage, newPage) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }
    return (
        <div >
            <DataTable
                columns={Defaultcolumn}
                data={poDetail}
                pagination
                progressPending={loading}
                paginationTotalRows={poDetail.length}   // ✅ total rows (34, not 30)
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                paginationPerPage={perPage}
                paginationRowsPerPageOptions={[10, 20, 30, 50]}
                paginationComponentOptions={{
                    rowsPerPageText: 'Rows per page:',
                    rangeSeparatorText: 'of',
                    noRowsPerPage: false,
                }}
                fixedHeader
                fixedHeaderScrollHeight="400px"
                highlightOnHover
                className="react-datatable"
            />


            <CustomDialog
                open={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Success"
                message={successMessage}
                severity="success"
                color="primary"
            />
            <CustomDialog
                open={showErrorPopup}
                onClose={() => setShowErrorPopup(false)}
                title="Error"
                message={errorMessage}
                severity="error"
                color="secondary"
            />
        </div>
    )
}


export const ColumnTable = ({ recevingData, selectedRows, totalRows, page, perPage, setPage, setPerPage, loading }) => {



    const column = [
        {
            name: (
                <div style={{ textAlign: 'center' }}>
                    <label>Select All</label><br />
                    <input
                        type="checkbox"
                    // checked={allSelected}
                    // onChange={handleSelectAll}
                    />
                </div>
            ),
            cell: (row) => (
                <div style={{ paddingLeft: '23px', width: '100%' }}>
                    <input
                        type="checkbox"
                    // checked={selectedRows.includes(getRowKey(row))}
                    // onChange={(e) => handleSelect(row, e.target.checked)}
                    />
                </div>
            ),
            width: "97px",
            center: true,
        },
        ,
        {
            name: "Rec_ticket_no",
            selector: row => row.rec_ticket_no, // ⬅️ Extract date part before space
            width: '130px'
        },
        {
            name: "PoNumber",
            selector: row => row.pono,
            wrap: true,
            width: '130px'
        },
        {
            name: "Podate",
            selector: row => row.podate,
            sortable: true,
            // width: '130px'
            //   width: `${calculateColumnWidth('orderqty')}px`
            width: "115px"
        },
        {
            name: "vendorname",
            selector: row => row.vendorname,
            wrap: true,
            width: '150px'

        },
        {
            name: "Postingdate",
            selector: row => row.postingdate,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Partcode",
            selector: row => row.partcode,
            wrap: true,
            // width: `${calculateColumnWidth('vendorCode')}px`
            width: '130px'
        },
        {
            name: "partdescription",
            selector: row => row.partdescription,
            wrap: true,
            grow: 2,
            width: '290px'
        },
        {
            name: "Rec_qty",
            selector: row => row.rec_qty,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Total_value",
            selector: row => row.total_value,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Exp_date",
            selector: row => row.exp_date,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "totalvalueeuro",
            selector: row => row.totalvalueeuro,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "invoiceno",
            selector: row => row.invoiceno,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "invoicedate",
            selector: row => row.invoicedate,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "receivingdate",
            selector: row => row.receivingdate,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "rcbatchcode",
            selector: row => row.rcbatchcode,
            wrap: true,
            grow: 2,
            width: '130px'
        },
    ];
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePerRowsChange = (newPerPage, newPage) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }

    return (
        <DataTable
            columns={column}
            data={recevingData}
            pagination
            paginationServer
            progressPending={loading}
            paginationTotalRows={totalRows}   // ✅ total rows (34, not 30)
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            paginationComponentOptions={{
                rowsPerPageText: 'Rows per page:',
                rangeSeparatorText: 'of',
                noRowsPerPage: false,
            }}
            fixedHeader
            fixedHeaderScrollHeight="400px"
            highlightOnHover
            className="react-datatable"
        />

    )
}