import React, { useState, useEffect, useRef } from 'react'
import './VendorMaster.css'
//import * as XLSX from "xlsx";
import * as XLSX from "xlsx";

import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import { FaFileExcel } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { FaEdit } from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { saveVendorMaster, saveExcelVendorUpload, getVenodtMaster, updateVendor, deleteVendor, downloadSearchVendor, downloadVendor } from '../../Services/Services';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";

const VeendorMaster = () => {
    const [excelUploadData, setExcelUploadData] = useState([]);
    const [duplicateProducts, setDuplicateProducts] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [deletButton, setDeletButton] = useState();
    const [handleSubmitButton, setHandleSubmitButton] = useState(true);
    const [handleUpdateButton, setHandleUpdateButton] = useState(false);
    const [handleUploadButton, setHandleUploadButton] = useState(false);
    const [showUploadTable, setShowUploadTable] = useState(false);
    const [showVendorTable, setShowVendorTable] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [vendorMaster, setVendorMaster] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [uploadTotalRows, setUploadTotalRows] = useState(0);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    //const [filteredVendors, setFilteredVendors] = useState(vendorMaster);
    const filteredVendors = vendorMaster.filter(v =>
        v.vendorCode?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.vendorName?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.country?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.modifiedby?.toLowerCase().includes(searchText.toLowerCase())

    );
    const [formData, setFormData] = useState({
        vendorCode: '',
        vendorName: '',
        country: "",
        createdby: "",
        modifiedby: "",
        Date: ""
    })

    const handleChange = (e, filed) => {
        const { name, value } = e.target;
        // console.log(value)
        // console.log("e",e.target.name)

        setFormData({ ...formData, [name]: value });
    };
    const podate = new Date(2025, 3, 25);
    const [value, setValue] = React.useState(null);

    const handleAccept = (newValue) => {
        if (newValue < podate) {
            // alert("Date must be same as or after PO Date");
            setErrorMessage("Date must be same as or after PO Date")
            setShowErrorPopup(true);
            setValue(null);
        } else {
            setValue(newValue);
        }
    };
    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.vendorCode) {
            errors.vendorCode = "Please Enter vendorcode";
            isValid = false;
        }
        if (!formData.vendorName) {
            errors.vendorName = "please Enter VenderName";
            isValid = false;
        }
        if (!formData.country) {
            errors.country = "please Enter country";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    };
    const handleDownloadExcel = () => {
        const worksheetData = [
            ["vendorCode", "vendorName", "country"]
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

        XLSX.writeFile(workbook, "vendorMaster.xlsx");
    };
    const exceluploadClear = () => {
        setShowVendorTable(true);
        setShowUploadTable(false);
        setHandleUploadButton(false);
        setHandleSubmitButton(true);
    }
    const handleUpload = (event) => {
        setExcelUploadData([]);
        setShowVendorTable(false);
        setHandleUpdateButton(false);
        setFormData({ vendorCode: "", vendorName: "", country: "" });
        setSelectedRows([]);
        setDeletButton(false);
        const file = event.target.files[0];
        if (!file) return;
        if (!file.name.startsWith("vendorMaster")) {
            setErrorMessage("Invalid file. Please upload Product_Data.xlsx");
            setShowErrorPopup(true);
            event.target.value = null;
            exceluploadClear();
            return;
        }
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const sheetHeaders = jsonData[0]?.map((header) => header.toLowerCase()) || [];
            const expectedColumns = ["vendorCode", "vendorName", "country"];
            const isValid = expectedColumns.every((col) => sheetHeaders.includes(col));
            const parsedData = XLSX.utils.sheet_to_json(worksheet);

            if (!parsedData || parsedData.length === 0) {
                setErrorMessage("No data found in the uploaded file");
                setShowErrorPopup(true);
                event.target.value = null;
                exceluploadClear();
                return
            }
            setExcelUploadData(parsedData);
            setTotalRows(parsedData.length);
            setHandleUploadButton(true);
            setHandleSubmitButton(false);
            setShowVendorTable(false);
            setShowUploadTable(true);
        };

        reader.onerror = (error) => {
            setErrorMessage("File read error:", error)
            setShowErrorPopup(true)
            // console.error("File read error:", error);
        };
    };

    const formClear = () => {
        setExcelUploadData([]);
        setHandleSubmitButton(true);
        setHandleUploadButton(false);
        setHandleUpdateButton(false)
        setFormErrors("");
        setShowVendorTable(true);
        setShowUploadTable(false);
        setDeletButton(false);
        setSelectedRows([]);
        setFormData({
            vendorCode: '',
            vendorName: '',
            country: ''
        })
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const countryList = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
        "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
        "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
        "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
        "Comoros", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
        "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
        "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
        "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
        "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
        "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
        "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
        "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
        "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
        "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
        "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
        "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
        "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
        "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
        "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
        "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valiDate()) return;

        const createdby = sessionStorage.getItem("userName") || "System";
        const modifiedby = sessionStorage.getItem("userName") || "System";

        const updateFormData = {
            ...formData,
            createdby,
            modifiedby,
        }
        saveVendorMaster(updateFormData)
            .then((response) => {
                setShowSuccessPopup(true);
                setSuccessMessage("Vendor data Added Successfully");
                //formClear();
                setFormData({
                    vendorCode: "",
                    vendorName: "",
                    country: ""
                })
                setSearchText("");
                fetchVendotMaster();
                setPage(1);

            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        setShowErrorPopup(true)
                        setErrorMessage("Vendor already exists")
                    } else {
                        setErrorMessage("Something went wrong");
                        setShowErrorPopup(true);
                    }
                }
            })

    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(vendorMaster.map((row) => row.id));
            setDeletButton(true);
            setHandleSubmitButton(false);
            setHandleUpdateButton(false);
            setFormData({ vendorCode: "", vendorName: "", country: "" });

        } else {
            setSelectedRows([]);
            setDeletButton(false);
            setHandleSubmitButton(true);
        }
    };
    // useEffect(() => {
    //     console.log("setSelectedRows:", selectedRows); // Logs the updated state
    // }, [selectedRows]);

    const handleRowSelect = (rowKey) => {
        setFormData({ vendorCode: "", vendorName: "", country: "" });
        setHandleUpdateButton(false);
        setSelectedRows((prevSelectedRows) => {
            const isRowSelected = prevSelectedRows.includes(rowKey);

            const updatedRows = isRowSelected
                ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect row
                : [...prevSelectedRows, rowKey]; // Select row

            if (updatedRows.length === 0) {
                setDeletButton(false);
                setHandleSubmitButton(true);
                setHandleUpdateButton(false);

            } else {
                setDeletButton(true);
                setHandleSubmitButton(false);
            }
            return updatedRows;
        });
    };

    const calculateColumnWidth = (data, key, minWidth = 290, maxWidth = 318) => {
        if (!data || data.length === 0) return minWidth;
        const maxLength = Math.max(...data.map(row => (row[key] ? row[key].toString().length : 0)));
        const width = maxLength * 8; // Adjust the multiplier as needed for better fit
        return Math.min(Math.max(width, minWidth), maxWidth);
    };

    const columns = [
        {
            name: (
                <div style={{ textAlign: 'center', marginLeft: '10px' }}>
                    <label>Select</label>
                    <br />
                    <input type="checkbox" onChange={handleSelectAll}
                        checked={selectedRows.length === vendorMaster.length && vendorMaster.length > 0}
                    />
                </div>
            ),
            cell: (row) => (
                <div style={{ paddingLeft: '23px', width: '100%' }}>
                    <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)}
                    />
                </div>
            ),
            width: "97px",
            center: true,
        }
        ,
        { name: "Edit", selector: row => (<button className="edit-button" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },
        {
            name: "Vendor code", selector: row => row.vendorCode, sortable: true, width: `${calculateColumnWidth(vendorMaster, 'vendorcode')}px`
        },
        {
            name: "Vendor Name", selector: row => row.vendorName, width: `${calculateColumnWidth(vendorMaster, 'vendorname')}px`
        },
        {
            name: "Country", selector: row => row.country, width: `${calculateColumnWidth(vendorMaster, 'country')}px`
        }
    ];

    const uploadColumns = [
        {
            name: "Vendor Code", selector: row => row.vendorCode, sortable: true, width: `${calculateColumnWidth(vendorMaster, 'vendorCode')}px`
        },
        {
            name: "Vendor Name", selector: row => row.vendorName, width: `${calculateColumnWidth(vendorMaster, 'vendorName')}px`
        },
        {
            name: "Country", selector: row => row.country, width: `${calculateColumnWidth(vendorMaster, 'country')}px`
        }
    ];

    const handlePageChange = (newPage) => {
        setPage(newPage)
    }
    const handlePerRowsChange = (newPerPage, newPage) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }

    const filteredData = vendorMaster.filter(row =>
        Object.values(row).some(value =>
            typeof value === "string" && value.toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const uploadFilteredData = excelUploadData.filter((row) =>
        Object.values(row).some((value) =>
            String(value || "").toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const paginatedData = filteredData.slice(
        (page - 1) * perPage,
        page * perPage
    );
    const uploadPaginatedData = uploadFilteredData.slice(
        (page - 1) * perPage,
        page * perPage
    );

    useEffect(() => {
        setPage(1);
    }, [searchText]);

    const handleExcelUpload = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const createdby = sessionStorage.getItem("userName") || "System";
        const modifiedby = sessionStorage.getItem("userName") || "System";
        const enrichedData = excelUploadData.map((item) => ({
            ...item,
            createdby,
            modifiedby,
        }));
        saveExcelVendorUpload(enrichedData)
            .then((response) => {
                setSuccessMessage("Vendor Excel uploaded");
                setShowSuccessPopup(true);
                setShowUploadTable(false);
                setShowVendorTable(true);
                setExcelUploadData([]);
                setHandleUploadButton(false);
                setHandleSubmitButton(true);
            }).catch((error) => {
                if (error.response?.status === 409) {
                    setErrorMessage(error.response.data?.error || "Duplicate error");

                    setErrorMessage(errorMessage);
                    setShowErrorPopup(true);
                } else {
                    setErrorMessage("Something went wrong");
                    setShowErrorPopup(true);
                }
                setShowUploadTable(false);
                setShowVendorTable(true);
                setHandleUploadButton(false);
                setHandleSubmitButton(true);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }

    useEffect(() => {
        fetchVendotMaster();
    }, [])

    const fetchVendotMaster = async () => {
        setLoading(true);
        try {
            const response = await getVenodtMaster();
            setPage(1)
            setVendorMaster(response.data);
        } catch (error) {
            setErrorMessage("Error fetching vendors", error);
            setShowErrorPopup(true)
            // console.error("Error fetching vendors", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTotalRows(filteredData.length); // important!
    }, [filteredData]);

    const handleEdit = (row) => {
        setFormData(row); // or whatever sets the data
        formRef.current?.scrollIntoView({ behavior: "smooth" });
        setFormData({
            id: row.id || "",
            vendorCode: row.vendorCode || "",
            vendorName: row.vendorName || "",
            country: row.country || ""

        });
        setHandleSubmitButton(false);
        setHandleUpdateButton(true);
        setHandleUploadButton(false);
        setDeletButton(false);
        setSelectedRows([]);
    }
    const handleUpdate = (e, id) => {
        e.preventDefault();
        if (!valiDate()) return;
        setLoading(true)
        const modifiedby = sessionStorage.getItem("userName") || "System";
        // console.log("e", e)
        const updateFormData = {
            ...formData,
            id,
            modifiedby
        }

        updateVendor(id, updateFormData)
            .then((response) => {
                setSuccessMessage("Updated sucessfully");
                setShowSuccessPopup(true);
                setFormData({
                    vendorCode: "",
                    vendorName: "",
                    country: ""
                })
                setHandleUpdateButton(false);
                setSearchText("");
                setHandleSubmitButton(true);
                fetchVendotMaster().then(() => {
                    setPage(1); // 👈 Reset pagination AFTER data is fetched
                });        //setPage(1); 

            }).catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        setErrorMessage("Product already exists");
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
    }
    const onDeleteClick = () => {
        setConfirmDelete(true);
    };

    const handleCancel = () => {
        setSelectedRows([]);
        setConfirmDelete(false);
        setSearchText("");
        setDeletButton(false)
        setHandleSubmitButton(true)

    };
    const handleDelete = async () => {
        setLoading(true)
        try {
            await deleteVendor(selectedRows);
            setSuccessMessage("deleted sucessfully");
            setShowSuccessPopup(true);
            fetchVendotMaster();
            setHandleSubmitButton(true);
            setDeletButton(false);
            setConfirmDelete(false)
            setPage(1);
        } catch (error) {
            setErrorMessage("Delete error:", error);
            setShowErrorPopup(true);
        }finally{
            setLoading(false)
        }
    }

    const exportToExcel = (searchText = "") => {
        if (searchText && searchText.trim() !== "") {
            if (!Array.isArray(vendorMaster) || filteredVendors.length === 0) {
                // console.warn("No data to export.");
                return;
            }
            const sheet = XLSX.utils.json_to_sheet(filteredVendors);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Vendors");
            XLSX.writeFile(workbook, "VendorMaster.xlsx");

        } else {
            if (!Array.isArray(vendorMaster) || vendorMaster.length === 0) {
                // console.warn("No data to export.");
                return;
            }
            const sheet = XLSX.utils.json_to_sheet(vendorMaster);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Vendors");
            XLSX.writeFile(workbook, "VendorMaster.xlsx");
        }

    };
    return (
        <div className='COMCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Vendor Master</p>
                </div>
                <div className='ComCssUpload'>
                    <input type="file" accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>
                    <button onClick={handleDownloadExcel}> Excel Download </button>
                </div>
                <div className='VendorTexfiled'>
                    <ThemeProvider theme={TextFiledTheme}>

                        <TextField
                            id="outlined-basic"
                            label="Vendor Code"
                            variant="outlined"
                            name="vendorCode"
                            value={formData.vendorCode}
                            // onChange={(e)=>handleChange(e,"name")}
                            onChange={handleChange}
                            error={Boolean(formErrors.vendorCode)}
                            helperText={formErrors.vendorCode}
                            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                            size="small"
                            className='VendorTexfiled-textfield '

                        />
                        <TextField
                            id="outlined-basic"
                            label="Vendor Name"
                            variant="outlined"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleChange}
                            error={Boolean(formErrors.vendorName)}
                            helperText={formErrors.vendorName}
                            className='VendorTexfiled-textfield '
                            size="small"

                        />
                        <Autocomplete
                            options={countryList}
                            getOptionLabel={(option) => option}
                            value={formData.country || ""}
                            onChange={(event, newValue) =>
                                setFormData({ ...formData, country: newValue || "" })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Country"
                                    variant="outlined"
                                    size="small"
                                    error={Boolean(formErrors.country)}
                                    helperText={formErrors.country}
                                    className='VendorTexfiled-textfield '
                                />
                            )}
                        />
                    </ThemeProvider>
                    {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label="Select Date"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        onAccept={handleAccept}  // Fires right after user selects date from calendar
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </LocalizationProvider> */}
                </div>
                <div className='ComCssButton9'>
                    {handleSubmitButton && <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>}
                    {handleUpdateButton && <button className='ComCssUpdateButton' onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
                    {handleUploadButton && (
                        isLoading ? (
                            <div className='ComCssExcelUploadButton'>
                                <div className="spinner"></div>
                                <p>Uploading, please wait...</p>
                            </div>
                        ) : (
                            <button className='ComCssExcelUploadButton' onClick={handleExcelUpload} disabled={isLoading}>Upload </button>
                        )
                    )}
                    {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}  >Delete</button>}
                    <button className='ComCssClearButton' onClick={formClear}>Clear</button>
                </div>
            </div>
            <div className='ComCssTable'>
                {showVendorTable && !showUploadTable && (
                    <h5 className='ComCssTableName'>Vendor Detail</h5>
                )}
                {showUploadTable && !showVendorTable && (
                    <h5 className='ComCssTableName'>Upload Vedor deatil</h5>
                )}
                {showVendorTable && !showUploadTable && (
                    <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                        <button className="btn btn-success" onClick={() => exportToExcel(searchText)}  >
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
                        {/* {filteredVendors.map(vendor => (
            <div key={vendor.id}>
                {vendor.vendorName}
            </div>
        ))} */}

                    </div>
                )}
                {/* Default table */}
                {showVendorTable && !showUploadTable && (
                    <>
                        <LoadingOverlay loading={loading} />

                        <DataTable
                            columns={columns}
                            data={paginatedData}
                            pagination
                            paginationServer
                            progressPending={loading}
                            paginationTotalRows={totalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            paginationPerPage={perPage}
                            paginationDefaultPage={page}
                            paginationRowsPerPageOptions={[10, 20, 30, 50]}
                            paginationComponentOptions={{
                                rowsPerPageText: 'Rows per page:',
                                rangeSeparatorText: 'of',
                                noRowsPerPage: false,
                                //selectAllRowsItem: true,
                                //selectAllRowsItemText: 'All',
                            }}
                            highlightOnHover
                            fixedHeader
                            fixedHeaderScrollHeight="500px"
                            className="react-datatable"
                        />
                    </>

                )}
                {showUploadTable && !showVendorTable && (
                    <>
                        <LoadingOverlay loading={loading} />
                        <DataTable
                            columns={uploadColumns}
                            data={uploadPaginatedData}
                            pagination
                            paginationServer
                            progressPending={loading}
                            paginationTotalRows={uploadTotalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[5, 10, 15, 20]}
                            paginationComponentOptions={{
                                rowsPerPageText: 'Rows per page:',
                                rangeSeparatorText: 'of',
                                noRowsPerPage: false,
                                selectAllRowsItem: true,
                                selectAllRowsItemText: 'All',
                            }}
                            highlightOnHover
                            fixedHeader
                            fixedHeaderScrollHeight="400px"
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
                                        alignItems: "center",
                                        fontFamily: "Arial, Helvetica, sans-serif",
                                    },
                                },
                                cells: {
                                    style: {
                                        padding: "5px",
                                        justifyContent: "center",
                                    },
                                },
                                headCells: {
                                    style: {
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "left",
                                        textAlign: "left",
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
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                    },
                                },
                            }}
                        />
                    </>
                )}
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
export default VeendorMaster