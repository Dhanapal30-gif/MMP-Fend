import React, { useEffect, useState } from 'react';
import "../../components/Com_Component/COM_Css.css";
import "./CurnecyMaaster.css";
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import { FaFileExcel } from "react-icons/fa";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import { FaEdit } from "react-icons/fa";
import { deleteCurency, fetchCurency, saveCurencyMaster, updateCurrency } from '../../Services/Services';

const CurencyMaster = () => {
    const [formErrors, setFormErrors] = useState({});
    const [excelUpload, setExcelUploadData] = useState([]);
    const [handleUpdateButton, setHandleUpdateButton] = useState(false);
    const [handleSubmitButton, setHandleSubmitButton] = useState(true);
    const [handleDeleteButton, setHandleDeleteButton] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [curencyMster, setCurencyMaster] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showCurencyTable, setShowCurnecyTable] = useState(true);
    const [showUploadTable, setShowUploadTable] = useState(false);
    const [perPage, setPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [normal, setNormal] = useState(true);
    const [handleEditTe, sethandleEditTe] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const getFirstDayOfMonth = () => {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`;
    };
    const [formData, setFormData] = useState({
        currencyname: "",
        currencyvalue: "",
        createdby: "",
        modifiedby: "",
        effectivedate: getFirstDayOfMonth()
    });

    const filteredCurency = curencyMster.filter(filt =>
        filt.currencyname?.toLowerCase().includes(searchText.toLowerCase()) ||
        filt.currencyvalue?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        filt.effectivedate?.toString().toLowerCase().includes(searchText.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePerRowsChange = (newPerPage, newPage) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }
    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.currencyname) {
            errors.currencyname = "Please selctc curnecyName";
            isValid = false;
        }
        if (!formData.currencyvalue) {
            errors.currencyvalue = "Please Enter curnecy Value";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    }

    const formClear = () => {
        setFormData({
            currencyname: "", currencyvalue: "", effectivedate: getFirstDayOfMonth()
        })
        setShowCurnecyTable(true);
        setFormErrors("");
        setHandleSubmitButton(true);
        setHandleUpdateButton(false);
        setHandleDeleteButton(false);
        setSelectedRows([]);
        setHandleDeleteButton(false);
        setNormal(true);
        sethandleEditTe(false);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valiDate()) return;
        const createdby = sessionStorage.getItem("userName") || "System";
        const modifiedby = sessionStorage.getItem("userName") || "System";
        const updateFormData = {
            ...formData,
            createdby,
            modifiedby,
            effectivedate: getFirstDayOfMonth(),
        };
        saveCurencyMaster(updateFormData)
            .then((response) => {
                setSuccessMessage("Currency added Successfully");
                setShowSuccessPopup(true);
                //  formClear();
                fetchCurencyMaster();
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        setShowErrorPopup(true);
                        setErrorMessage("Curnecy already exists")
                    } else {
                        setShowErrorPopup(true);
                        setErrorMessage(error.response.status)
                    }
                }
            }).finally(() => {
                formClear();
            })
    }

    const handleUpdate = (e, id) => {
        e.preventDefault();
        if (!valiDate()) return;
        //setLoading(true);
        const updatedby = sessionStorage.getItem('userName') || "System";
        const updateFormData = {
            ...formData,
            id,
            updatedby
        };
        updateCurrency(id, updateFormData)
            .then((response) => {
                setSuccessMessage("Curency updated");
                setShowSuccessPopup(true);
                formClear();
                fetchCurencyMaster();
                setSearchText("");
            }).catch((error) => {
                setLoading(false);
                if (error.response) {
                    if (error.response.status === 409) {
                        setErrorMessage("Already exists");
                        setShowErrorPopup(true);
                    } else {
                        setErrorMessage("Something went wrong");
                        setShowErrorPopup(true);
                    }
                } else {
                    setErrorMessage("Network error, please try again");
                    setShowErrorPopup(true);
                }
            }).finally(() => {
                setLoading(false);
            });
    };

    const onDeleteClick = () => {
        setConfirmDelete(true);
    };

    const handleCancel = () => {
        setSelectedRows([]);
        setConfirmDelete(false);
        setHandleDeleteButton(false)
        setHandleSubmitButton(true)
    }

    const handleDelete = async () => {
        setConfirmDelete(false);
        try {
            await deleteCurency(selectedRows);
            setSuccessMessage("Data successfullly deleted");
            setShowSuccessPopup(true);
            setSelectedRows([]);
            //setHandleSubmitButton(true)
            formClear();
            fetchCurencyMaster();
        } catch (error) {
            setErrorMessage("delete error", error);
            setShowErrorPopup(true);
        }
    }

    useEffect(() => {
        fetchCurencyMaster();
    }, []);


    const fetchCurencyMaster = () => {
        fetchCurency()
            .then((response) => {
                setCurencyMaster(response.data || []);
                setTotalRows(response.data.toatlElements || 0)
                console.log("fetchCurrency", response.data);
            })
    }

    const exportToExcel = (searchText = "") => {
        if (searchText && searchText.trim() !== "") {
            if (!Array.isArray(filteredCurency) || filteredCurency.length === 0) {
                console.warn("No data to export.");
                return;
            }
            const sheet = XLSX.utils.json_to_sheet(filteredCurency);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Vendors");
            XLSX.writeFile(workbook, "curencyMster.xlsx");
        } else {
            if (!Array.isArray(curencyMster) || curencyMster.length === 0) {
                console.warn("No data to export.");
                return;
            }
            const sheet = XLSX.utils.json_to_sheet(curencyMster);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Vendors");
            XLSX.writeFile(workbook, "curencyMster.xlsx");
        }
    }
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(curencyMster.map((row) => row.id));
            setHandleDeleteButton(true);
            setHandleSubmitButton(false);
            setHandleUpdateButton(false);
            setFormData({ currencyname: "", currencyvalue: "", effectivedate: getFirstDayOfMonth() })
            setNormal(true);
            sethandleEditTe(false);
        } else {
            setSelectedRows([]);
            setHandleSubmitButton(true);
            setHandleDeleteButton(false);
        }
    };
    const handleRowSelect = (rowKey) => {
        setHandleUpdateButton(false);
        setFormData({
            currencyname: "", currencyvalue: "", effectivedate: getFirstDayOfMonth()
        });
        setNormal(true);
        sethandleEditTe(false);
        setSelectedRows((prevSelectedRows) => {
            const isRowSelected = prevSelectedRows.includes(rowKey);
            const updatedRows = isRowSelected
                ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect
                : [...prevSelectedRows, rowKey]; // Select row
            if (updatedRows.length === 0) {
                setHandleDeleteButton(false);
                setHandleSubmitButton(true);
                setHandleUpdateButton(false);
            } else {
                setHandleDeleteButton(true);
                setHandleSubmitButton(false);
            }
            return updatedRows;
        });
    };
    const calculateColumnWidth = (data, key, charWrap = 19, charWidth = 8, minWidth = 190, maxWidth = 318) => {
        if (!Array.isArray(data) || data.length === 0) return minWidth;
        const maxLines = Math.max(
            ...data.map(row => {
                const text = row[key]?.toString() || "";
                return Math.ceil(text.length / charWrap);
            })
        );

        const width = charWrap * charWidth;
        return Math.min(Math.max(width, minWidth), maxWidth);
    };
    const column = [
        {
            name: (
                <div style={{ textAlign: 'center', }}>
                    <label>Delete All</label>
                    <br />
                    <input type="checkbox" onChange={handleSelectAll}
                        checked={selectedRows.length === curencyMster.length && curencyMster.length > 0}
                    />
                </div>
            ),
            cell: (row) => (
                <div style={{ paddingLeft: '27px', width: '100%' }}>
                    <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)}
                    />
                </div>
            ),
            width: "97px",
            center: true,
        }
        ,
        {
            name: "Edit",
            selector: row => (
                <button className="edit-button" onClick={() => handleEdit(row)}>
                    <FaEdit size={15} />
                </button>
            ),
            width: "79px",
        },
        {
            name: "Currency Name",
            selector: row => row.currencyname,
            sortable: true,
            width: `${calculateColumnWidth(curencyMster, 'CurrencyName')}px`
        },
        {
            name: "Currency Value",
            selector: row => row.currencyvalue,
            wrap: true,
            width: `${calculateColumnWidth(curencyMster, 'CurrencyValue')}px`
        },
        {
            name: "Effective Date",
            selector: row => row.effectivedate,
            width: `${calculateColumnWidth(curencyMster, 'Effectivedate')}px`
        },
        {
            name: "Modified Date",
            selector: row => row.modifieddate,
            width: `${calculateColumnWidth(curencyMster, 'modifieddate')}px`
        }
    ]

    const handleEdit = (row) => {
        setFormData(row);
        setNormal(false);
        sethandleEditTe(true);
        setFormData({
            id: row.id || "",
            currencyname: row.currencyname || "",
            currencyvalue: row.currencyvalue || "",
            effectivedate: row.effectivedate || ""

        });
        setHandleSubmitButton(false);
        setHandleUpdateButton(true);
        setHandleDeleteButton(false);
        setSelectedRows([]);
    };
    const filteredData = curencyMster.filter(row =>
        Object.values(row).some(value =>
            typeof value === "string" && value.toLowerCase().includes(searchText.toLowerCase())
        )
    );
    const paginatedData = filteredData.slice(
        (page - 1) * perPage,
        page * perPage
    );

    // console.log("searchText", searchText)
    return (
        <div className='COMCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Curnecy Master</p>
                </div>
                <div className='ProductTexfiled'>
                    <ThemeProvider theme={TextFiledTheme}>

                        {normal && (
                            <Autocomplete
                                options={["USD", "CNY", "INR"]}
                                getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
                                value={formData.currencyname || []}
                                onChange={(event, newValue) => setFormData({ ...formData, currencyname: newValue || [] })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Currency Name"
                                        variant="outlined"
                                        error={Boolean(formErrors.currencyname)}
                                        helperText={formErrors.currencyname}
                                        size="small"  // <-- Reduce height
                                        className='ProductTexfiled-textfield '

                                    />
                                )}
                            />
                        )}
                        {handleEditTe && (
                            <TextField
                                label="Currency Type"
                                variant="outlined"
                                value={formData.currencyname}
                                InputProps={{ readOnly: true }}
                                size="small"
                                className='ProductTexfiled-textfield '
                            />
                        )}
                        <TextField
                            id="outlined-basic"
                            label="Convertion Factor[Change to EURO]"
                            variant="outlined"
                            name="currencyvalue"
                            type='number'
                            value={formData.currencyvalue}
                            onChange={handleChange}
                            // onChange={(e) => setFormData({ ...formData, productname: e.target.value })}
                            error={Boolean(formErrors.currencyvalue)}
                            helperText={formErrors.currencyvalue}
                            size="small"  // <-- Reduce height
                            className='ProductTexfiled-textfield '
                        />
                        <TextField
                            label="Effective Date"
                            variant="outlined"
                            name="effectivedate"
                            value={formData.effectivedate}
                            InputProps={{ readOnly: true }}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            className='ProductTexfiled-textfield '
                        />
                    </ThemeProvider>
                </div>
                <div className='ComCssButton9'>
                    {handleSubmitButton && <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>}
                    {handleUpdateButton && <button className='ComCssUpdateButton'  onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
                    {handleDeleteButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}   >Delete</button>}
                    <button className='ComCssClearButton' onClick={formClear}>Clear</button>
                </div>
            </div>

            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Curnnecy Detail</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)}>
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
                    data={paginatedData}
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
                        // selectAllRowsItem: true,
                        // selectAllRowsItemText: 'All',
                    }}
                    fixedHeader
                    fixedHeaderScrollHeight="400px"
                    highlightOnHover
                    className="react-datatable"
                    //conditionalRowStyles={rowHighlightStyle}
                    customStyles={{
                        headRow: {
                            style: {
                                background: "linear-gradient(to bottom, rgb(37, 9, 102), rgb(16, 182, 191))",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "14px",
                                textAlign: "center",
                                minHeight: "50px",

                            },
                        },
                        rows: {
                            style: {
                                fontSize: "14px",
                                textAlign: "center",
                                alignItems: "center", // Centers content vertically
                                fontFamily: "Arial, Helvetica, sans-serif",
                            },
                        },
                        cells: {
                            style: {
                                padding: "5px",  // Removed invalid negative padding
                                //textAlign: "center",
                                justifyContent: "center",  // Centers header text
                                whiteSpace: 'pre-wrap', // wrap text
                                wordBreak: 'break-word', // allow breaking words
                            },
                        },
                        headCells: {
                            style: {
                                display: "flex",
                                justifyContent: "center",  // Centers header text
                                alignItems: "left",
                                textAlign: "left",
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            },
                        },
                        pagination: {
                            style: {
                                border: "1px solid #ddd",
                                backgroundColor: "#f9f9f9",
                                color: "#333",
                                minHeight: "35px",
                                padding: "5px",
                                fontSize: "12px",
                                fontWeight: "bolder",
                                display: "flex",
                                justifyContent: "flex-end", // Corrected
                                alignItems: "center", // Corrected
                            },
                        },
                    }}
                />
            </div>
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
            <CustomDialog
                open={confirmDelete}
                onClose={handleCancel}
                onConfirm={handleDelete}
                title="Confirm"
                message="Are you sure you want to delete this?"
                color="primary"
            />
        </div>
    )
}
export default CurencyMaster