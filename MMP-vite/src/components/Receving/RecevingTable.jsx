import React, { useState, useEffect } from 'react'
import DataTable from "react-data-table-component";
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { FaTimesCircle } from "react-icons/fa"; // ❌ Stylish icon
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

export const RecevingTable = ({ formData, filteredAddData, handleFieldChange, formErrors,setFormErrors, selectedRows, setSelectedRows }) => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const paginatedData = filteredAddData.slice((page - 1) * perPage, page * perPage);

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
    const getRowKey = (row) => `${row.ponumber}-${row.partcode}`;
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

    // console.log("handleselect",selectedRows)

    const handleSelect = (row, checked) => {
        const key = getRowKey(row);
        if (checked) {
            setSelectedRows((prev) => [...prev, key]);
        } else {
            setSelectedRows((prev) => prev.filter((k) => k !== key));
        }
    };
    // useEffect(() => {
    //     const updatedData = filteredAddData.map((row, index) => {
    //         const expApplicable = row.expdateapplicable?.toLowerCase().replace(/\s/g, "");
    //         if (
    //             expApplicable === "no" &&
    //             row.shelflife &&
    //             !row.exp_date &&
    //             !row.expiryAutoSet
    //         ) {
    //             const today = new Date();
    //             const expiry = new Date(today);
    //             expiry.setMonth(expiry.getMonth() + parseInt(row.shelflife, 10));
    //             expiry.setDate(0);
    //             return {
    //                 ...row,
    //                 exp_date: expiry.toISOString().split("T")[0],
    //                 expiryAutoSet: true,
    //             };
    //         }
    //         return row;
    //     });

    //     // Update poDetail state
    //     updatedData.forEach((row, idx) => handleFieldChange(idx, "exp_date", row.exp_date));
    //     updatedData.forEach((row, idx) => handleFieldChange(idx, "expiryAutoSet", row.expiryAutoSet));
    // }, [filteredAddData]);


    useEffect(() => {
    // Flag to track if any state change occurred in this run
    let madeUpdates = false; 

    const updatedData = filteredAddData.map((row, index) => {
        const expApplicable = row.expdateapplicable?.toLowerCase().replace(/\s/g, "");
        
        // Use the row data to check if an update is needed
        if (
            expApplicable === "no" &&
            row.shelflife &&
            !row.exp_date &&             // Check 1: Must NOT have an exp_date
            !row.expiryAutoSet          // Check 2: Must NOT be auto-set already
        ) {
            const today = new Date();
            const expiry = new Date(today);
            const shelfLifeMonths = parseInt(row.shelflife, 10);
            
            // Set expiry date to shelf life months in the future
            expiry.setMonth(expiry.getMonth() + shelfLifeMonths);
            // setDate(0) sets it to the last day of the *previous* month.
            // A more typical approach is to set it to the last day of the calculated month:
            // expiry.setDate(0); 
            // It seems you intended to use setDate(1) then go back, or just set to the calculated end date.
            // Let's stick to your current logic as you said it "is working" in terms of calculation:
            expiry.setDate(0); 
            
            const newExpDate = expiry.toISOString().split("T")[0];
            
            madeUpdates = true; // An update *will* be made
            
            // Return the calculated new row object
            return {
                ...row,
                exp_date: newExpDate,
                expiryAutoSet: true,
            };
        }
        return row;
    });

    // ⛔️ IMPORTANT CHANGE: Only call handleFieldChange if an update was actually calculated
    if (madeUpdates) {
        // Now, perform your updates. Since you calculate a fully updated row, 
        // you only need to update the two changed fields if they were changed.
        
        updatedData.forEach((row, idx) => {
            // Only update if it was part of the 'madeUpdates' calculation
            if (row.expiryAutoSet) {
                 handleFieldChange(idx, "exp_date", row.exp_date);
                 handleFieldChange(idx, "expiryAutoSet", row.expiryAutoSet);
            }
        });
    }

    // You MUST ensure 'handleFieldChange' is stable (wrapped in useCallback) 
    // or remove it from the dependency array if possible, 
    // AND that the state change it triggers only changes 
    // the value of filteredAddData ONCE for these fields.
    
}, [filteredAddData, handleFieldChange]); // Add handleFieldChange if it's not stable
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
            // center: true,
        },

        {
            name: "PartCode",
            selector: row => row.partcode?.split(" ")[0],
            //width: `${calculateColumnWidth( 'modifieddate')}px`
            width: '130px'
        },
        {
            name: "Part Description",
            selector: row => row.partdescription,
            wrap: true,
            //  width: `${calculateColumnWidth( 'currency')}px`
            width: '310px'
        },
        {
            name: "Order Qty",
            selector: row => row.orderqty,
            sortable: true,
            // width: '130px'
            //   width: `${calculateColumnWidth('orderqty')}px`
            width: "115px"
        },
        {
            name: "OpenOrder Qty",
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
            name: "Type Of Component",
            selector: row => row.tyc,
            wrap: true,

            width: `${calculateColumnWidth('vendorCode')}px`
            //   width: '130px'
        },
        {
            name: "Unitprice",
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
                    error={Boolean(formErrors[`recevingQty-${row.ponumber}-${row.partcode}`])}
                    helperText={formErrors[`recevingQty-${row.ponumber}-${row.partcode}`]}
                    onChange={(e) => {
                        const value = e.target.value;
                        const key = `${row.ponumber}-${row.partcode}`;
                        const idx = filteredAddData.findIndex(r => `${r.ponumber}-${r.partcode}` === key);
                        if (idx === -1) return;

                        handleFieldChange(idx, 'recevingQty', value);

                        // if (Number(value) > Number(row.orderqty)) {
                        //     setErrorMessage("Receving Qty cannot be more than Order Qty");
                        //     setShowErrorPopup(true);
                        //     handleFieldChange(idx, 'recevingQty', ""); // reset
                        //     return;
                        // }
                        const allowedQty = row.openOrderQty > 0 ? row.openOrderQty : row.orderqty;
                        const qtyType = row.openOrderQty > 0 ? "Open Order Qty" : "Order Qty";

                        if (Number(value) > Number(allowedQty)) {
                            setErrorMessage(`Receiving Qty cannot be more than ${qtyType}`);
                            setShowErrorPopup(true);
                            handleFieldChange(idx, "recevingQty", "");
                            return;
                        }
                        // Remove error if corrected
                        if (formErrors[`recevingQty-${key}`] && Number(value) > 0) {
                            setFormErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors[`recevingQty-${key}`];
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
                    placeholder="Total Value"
                    name="totalValue"
                    value={row.totalValue || ""}
                    type="text"
                    onChange={(e) => {
                        const value = e.target.value;
                        const key = `${row.ponumber}-${row.partcode}`; // stable unique key
                        const idx = filteredAddData.findIndex(r => `${r.ponumber}-${r.partcode}` === key);
                        if (idx === -1) return;

                        // allow empty or partial decimal inputs
                        if (/^\d*\.?\d*$/.test(value) || value === "") {
                            handleFieldChange(idx, 'totalValue', value);

                            // Only update Euro if valid number
                            const total = parseFloat(value);
                            if (!isNaN(total)) {
                                const ccf = parseFloat(filteredAddData[idx].ccf) || 1;
                                handleFieldChange(idx, 'totalValueEuro', (total * ccf).toFixed(2));
                            } else {
                                handleFieldChange(idx, 'totalValueEuro', '');
                            }
                        }
                    }}
                    error={Boolean(formErrors[`totalValue-${row.ponumber}-${row.partcode}`])}
                    helperText={formErrors[`totalValue-${row.ponumber}-${row.partcode}`]}
                    className="invoice-input"
                />


            ),
        }
        ,
        {
            name: "TotalValue Euro",
            selector: row => row.totalValueEuro,
            width: `${calculateColumnWidth('totalValueEuro')}px`
        }
        ,
        // {
        //     name: "Expiry Date",
        //     cell: (row) => {
        //         const expApplicable = row.expdateapplicable?.toLowerCase().replace(/\s/g, "");
        //         const isDisabled = expApplicable === "notapplicable";

        //         // Calculate min date (2 months after receivingDate)
        //         let minExpiryDate = "";
        //         const receiving = new Date(formData.receivingDate);
        //         if (!isNaN(receiving)) {
        //             const minDate = new Date(receiving);
        //             minDate.setMonth(minDate.getMonth() + 2);
        //             minDate.setDate(1);
        //             minExpiryDate = minDate.toISOString().split("T")[0];
        //         }

        //         return (
        //             <TextField
        //                 type="date"
        //                 variant="outlined"
        //                 value={row.exp_date || ""}
        //                 onChange={(e) => {
        //                     if (expApplicable === "yes") {
        //                         const key = `${row.ponumber}-${row.partcode}`;
        //                         const idx = filteredAddData.findIndex(r => `${r.ponumber}-${r.partcode}` === key);
        //                         if (idx === -1) return;
        //                         handleFieldChange(idx, "exp_date", e.target.value);
        //                     }
        //                 }}
        //                 disabled={isDisabled}
        //                 className="invoice-input"
        //                 error={Boolean(formErrors[`exp_date-${row.ponumber}-${row.partcode}`])}
        //                 helperText={formErrors[`exp_date-${row.ponumber}-${row.partcode}`]}
        //                 inputProps={{
        //                     min: expApplicable === "yes" ? minExpiryDate : undefined,
        //                 }}
        //             />

        //         );
        //     }
        // }

{
    name: "Expiry Date",
    cell: (row) => {
        const expApplicable = row.expdateapplicable?.toLowerCase().replace(/\s/g, "");
        const isDisabled = expApplicable === "notapplicable";

        // --- 1. Calculate the ABSOLUTE MINIMUM Date (2 Months from Today) ---
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        // Clone today's date for the minimum calculation
        const finalMinDate = new Date(today);
        
        // Set the minimum selectable date to exactly 2 months from today
        finalMinDate.setMonth(finalMinDate.getMonth() + 2);
        
        // Convert the final minimum date to the required 'YYYY-MM-DD' string format
        const minExpiryDate = finalMinDate.toISOString().split("T")[0];
        
        // --- 2. Calculate the MAXIMUM Date (2 Months after the Minimum Date) ---
        
        // Clone the final minimum date
        const finalMaxDate = new Date(finalMinDate);
        
        // Add exactly 2 more months to define the maximum boundary
        finalMaxDate.setMonth(finalMaxDate.getMonth() + 2);
        
        // Convert the final maximum date to the required 'YYYY-MM-DD' string format
        const maxExpiryDate = finalMaxDate.toISOString().split("T")[0];

        // --- 3. Render the TextField with both 'min' and 'max' attributes ---
        
        return (
            <TextField
                type="date"
                variant="outlined"
                value={row.exp_date || ""}
                onChange={(e) => {
                    if (expApplicable === "yes") {
                        const key = `${row.ponumber}-${row.partcode}`;
                        const idx = filteredAddData.findIndex(r => `${r.ponumber}-${r.partcode}` === key);
                        if (idx === -1) return;
                        handleFieldChange(idx, "exp_date", e.target.value);
                    }
                }}
                disabled={isDisabled}
                className="invoice-input"
                error={Boolean(formErrors[`exp_date-${row.ponumber}-${row.partcode}`])}
                helperText={formErrors[`exp_date-${row.ponumber}-${row.partcode}`]}
                inputProps={{
                    // MINIMUM date constraint: Today + 2 Months (e.g., 04-02-2026)
                    min: expApplicable === "yes" ? minExpiryDate : undefined,
                    // MAXIMUM date constraint: Min Date + 2 Months (e.g., 04-04-2026)
                    max: expApplicable === "yes" ? maxExpiryDate : undefined, 
                }}
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
                data={filteredAddData}
                pagination
                progressPending={loading}
                paginationTotalRows={filteredAddData.length}
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

export const ColumnTable = ({ recevingData, selectedRows, totalRows, page, perPage, setPage, setPerPage, loading, searchText, setSearchText, handleEdit, handleRowSelect, selectedDeleteRows, exportToExcel }) => {
    //const [searchText, setSearchText] = useState("");

    const column = [
        {
            name: (
                <div style={{ textAlign: 'center' }}>
                    <label>Select </label><br />

                </div>
            ),
            cell: (row) => (
                <div style={{ paddingLeft: '23px', width: '100%' }}>
                    <input type="checkbox" checked={selectedDeleteRows.includes(row.id)} onChange={() => handleRowSelect(row.id)}
                    />
                </div>
            ),
            width: "97px",
            // center: true,
        },
        { name: "Edit", selector: row => (<button className="edit-button" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },

        {
            name: "Rec Ticket No",
            selector: row => row.recevingTicketNo, // ⬅️ Extract date part before space
            width: '130px'
        },
        {
            name: "PoNumber",
            selector: row => row.ponumber,
            wrap: true,
            width: '130px'
        },

        {
            name: "vendorName",
            selector: row => row.vendorname,
            wrap: true,
            width: '150px'

        },
        {
            name: "Posting Date",
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
            name: "part Description",
            selector: row => row.partdescription,
            wrap: true,
            grow: 2,
            width: '290px'
        },
        {
            name: "UOM",
            selector: row => row.UOM,
            wrap: true,
            grow: 2,
            width: '190px'
        },
        {
            name: "TYC",
            selector: row => row.TYC,
            wrap: true,
            grow: 2,
            width: '190px'
        },
        {
            name: "Order Qty",
            selector: row => row.orderqty,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Open Order Qty",
            selector: row => row.orderqty - row.recevingQty,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Rec Qty",
            selector: row => row.recevingQty,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Currency",
            selector: row => row.currency,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "CCfactor",
            selector: row => row.ccf,
            wrap: true,
            grow: 2,
            width: '90px'
        },
        {
            name: "Total Value",
            selector: row => row.totalValue,
            wrap: true,
            grow: 2,
            width: '130px'
        },

        {
            name: "TotalValue Euro",
            selector: row => row.totalValueEuro,
            wrap: true,
            grow: 2,
            width: '130px'
        },

        {
            name: "Invoice No",
            selector: row => row.invoiceNo,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Invoice Date",
            selector: row => row.invoiceDate,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Receiving Date",
            selector: row => row.receivingDate,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "Exp Date",
            selector: row => row.exp_date,
            wrap: true,
            grow: 2,
            width: '130px'
        },
        {
            name: "RcBatch Code",
            selector: row => row.rcBactchCode,
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



        <div className='RecevingDetailTable'>
            <h5 className='ComCssTableName'>Receving Detail</h5>
            <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                <button className="btn btn-success" onClick={() => exportToExcel(searchText)} >
                    <FaFileExcel /> Export
                </button>
                <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
                    <input type="text" className="form-control" style={{ height: "30px", paddingRight: "30px" }} placeholder="Search..." value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <span
                            onClick={() => setSearchText("")}
                            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold" }} >
                            ✖
                        </span>
                    )}
                </div>


            </div>

            <DataTable
                columns={column}
                data={recevingData}
                pagination
                paginationServer
                progressPending={loading}
                paginationTotalRows={totalRows}
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
        </div>


    )
}