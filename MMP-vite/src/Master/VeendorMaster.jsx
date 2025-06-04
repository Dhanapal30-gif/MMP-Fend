import React, { useState, useEffect , useRef } from 'react'
import './VendorMaster.css'
import * as XLSX from "xlsx";
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import { FaFileExcel } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { FaEdit } from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { saveVendorMaster, saveExcelVendorUpload, getVenodtMaster ,updateVendor, deleteVendor } from '../ServicesComponent/Services';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [uploadTotalRows, setUploadTotalRows] = useState(0);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);

   // const podate ='25-04-2025'


    const [formData, setFormData] = useState({
        vendorCode: '',
        vendorName: '',
        country: "",
        createdby: "",
        modifiedby: "",
        Date:""
        })

    const handleChange = (e,filed) => {
        const { name, value } = e.target;
        console.log(value)
        console.log("e",e.target.name)

        setFormData({ ...formData, [name]: value });
    };
 const podate = new Date(2025, 3, 25); // April 25, 2025 (0-based month)

  const [value, setValue] = React.useState(null);

  const handleAccept = (newValue) => {
    if (newValue < podate) {
      alert("Date must be same as or after PO Date");
      setValue(null);
    } else {
      setValue(newValue);
    }
  };
    const valiDate = () => {
        const errors = {};
        let isValid = true; // Assume valid initially

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
        return isValid; // Now it correctly returns false if any field is empty
    };
    const handleDownloadExcel = () => {
        // Define the header and data format
        const worksheetData = [
            ["vendorCode", "vendorName", "country"]
        ];
        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

        // Create an Excel file and trigger download
        XLSX.writeFile(workbook, "vendorMaster.xlsx");
    };

    const handleUpload = (event) => {
        setExcelUploadData([]); // Clear previous data
        setDuplicateProducts([]); // or any other error-related state

        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsBinaryString(file);

        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary" });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (!jsonData || jsonData.length === 0) {
                alert("No data found in the uploaded file.");
                return;
            }

            // // ✅ Set data after reading
            setExcelUploadData(jsonData);
            setUploadTotalRows(jsonData.length);
            setHandleUploadButton(true);
            setHandleSubmitButton(false);
            setShowUploadTable(true);
            setShowVendorTable(false);

            // ✅ Clear file input after processing
            event.target.value = null;
        };

        reader.onerror = (error) => {
            console.error("File read error:", error);
        };
    };

    const formClear = () => {
        setExcelUploadData([]);
        setHandleSubmitButton(true);
        setHandleUploadButton(false);
        setHandleUpdateButton(false)
        setShowVendorTable(true);
        setShowUploadTable(false);
        setFormData({
            vendorCode: '',
            vendorName: '',
            country: ''
        })

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

            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        // alert("Product already exists");
                        setShowErrorPopup(true)
                        setErrorMessage("Vendor already exists")
                    } else {
                        alert("Something went wrong");
                    }
                }
            })

    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(vendorMaster.map((row) => row.id)); // ✅ Ensure unique selection key
            setDeletButton(true);
            setHandleSubmitButton(false);
        } else {
            setSelectedRows([]);
            setDeletButton(false);
            setHandleSubmitButton(true);
        }
    };

    //console
    useEffect(() => {
        console.log("setSelectedRows:", selectedRows); // Logs the updated state
    }, [selectedRows]);

    const handleRowSelect = (rowKey) => {
        setSelectedRows((prevSelectedRows) => {
            const isRowSelected = prevSelectedRows.includes(rowKey);

            // Update selected rows
            const updatedRows = isRowSelected
                ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect row
                : [...prevSelectedRows, rowKey]; // Select row

            // Conditional button states based on updated rows
            if (updatedRows.length === 0) {
                setDeletButton(false); // Disable delete button if no rows are selected
                setHandleSubmitButton(true); // Enable submit button
            } else {
                setDeletButton(true); // Enable delete button if rows are selected
                setHandleSubmitButton(false); // Disable submit button
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
        //{ name: "Delete", selector: row => <input type="checkbox" />, width: "90px" },
        {
            name: (
                <div style={{ textAlign: "center" }}>
                    <label>Delete All</label>
                    <br />
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === vendorMaster.length && vendorMaster.length > 0} />
                </div>
            ),
            cell: (row) => (
                <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)} />
            ),
            width: "130px",
        },
        { name: "Edit", selector: row => (<button className="btn btn-warning btn-sm" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },
        {
            name: "vendorcode", selector: row => row.vendorCode, sortable: true, width: `${calculateColumnWidth(vendorMaster, 'vendorcode')}px`
        },
        {
            name: "vendorname", selector: row => row.vendorName, width: `${calculateColumnWidth(vendorMaster, 'vendorname')}px`
        },
        {
            name: "country", selector: row => row.country, width: `${calculateColumnWidth(vendorMaster, 'country')}px`
        }
    ];

    const uploadColumns = [
        //{ name: "Delete", selector: row => <input type="checkbox" />, width: "90px" },

        {
            name: "vendorCode", selector: row => row.vendorCode, sortable: true, width: `${calculateColumnWidth(vendorMaster, 'vendorCode')}px`
        },
        {
            name: "vendorName", selector: row => row.vendorName, width: `${calculateColumnWidth(vendorMaster, 'vendorName')}px`
        },
        {
            name: "country", selector: row => row.country, width: `${calculateColumnWidth(vendorMaster, 'country')}px`
        }
    ];

    const handlePageChange = (newPage) => {
        setPage(newPage)
    }
    const handlePerRowsChange = (newPerPage,newPage) => {
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
                setIsLoading(false); // ✅ Stop loading
            })

    }

    // const fetchVendotMaster = ()=>{
    //     getVenodtMaster()
    //     .then((response)=>{
    //         setVendorMaster(response.data);
    //     }).catch((error)=>{
    //         setErrorMessage("Data not find")
    //     })
    // }

    useEffect(()=>{
        fetchVendotMaster();
    },[])

    const fetchVendotMaster = async () => {
        setLoading(true);
        try {
          const response = await getVenodtMaster();
          setVendorMaster(response.data);
        } catch (error) {
          console.error("Error fetching vendors", error);
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
        setTotalRows(filteredData.length); // important!
      }, [filteredData]);
      
      const handleEdit=(row) =>{
        setFormData(row); // or whatever sets the data
  formRef.current?.scrollIntoView({ behavior: "smooth" });
        setFormData({
            id:row.id || "",
            vendorCode:row.vendorCode || "",
            vendorName:row.vendorName || "",
            country:row.country || ""


        });
        setHandleSubmitButton(false);
        setHandleUpdateButton(true);
        setHandleUploadButton(false);
      }
      const handleUpdate =(e,id) =>{
        e.preventDefault();
        if(!valiDate()) return;
        setIsLoading(true)
        const modifiedby = sessionStorage.getItem("userName") || "System";
        console.log("e",e)

        const updateFormData={
            ...formData,
            id,
            modifiedby
        }
    //     if (!id) {
    //   alert("Error: Product ID is missing!");
    //   return;
    // }
     updateVendor(id,updateFormData)
     .then((response)=>{
        setSuccessMessage("Updated sucessfully");
        setShowSuccessPopup(true);
        setFormData({
            vendorCode:"",
            vendorName:"",
            country:""
        })
        setHandleUpdateButton(false);
        setHandleSubmitButton(true);
        fetchVendotMaster().then(() => {
            setPage(1); // 👈 Reset pagination AFTER data is fetched
          });        //setPage(1); 
    
     }).catch((error)=>{
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
     }).finally(()=>{
        setIsLoading(false);
     });
      }

      const handleDelete =  async () => {
        try{
            await deleteVendor(selectedRows);
            setSuccessMessage("deleted sucessfully");
            setShowSuccessPopup(true);
            fetchVendotMaster();
            setHandleSubmitButton(true);
            setDeletButton(false);

        }catch(error){
            setErrorMessage("Delete error:",error);
            setShowErrorPopup(true);
        }
      }
    return (
        <div className='VendorContainer'>
            <div className='VendorInput'>
                <div className='VendorFiledName'>
                    <h5>Vendor Master</h5>
                </div>
                <div className='productUpload'>
                    <input type="file" accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>
                    <button onClick={handleDownloadExcel}> Excel Download </button>
                </div>
                <div className='VendorTexfiled'>
                    <TextField
                        id="outlined-basic"
                        label="vendorCode"
                        variant="outlined"
                        name="vendorCode"
                        value={formData.vendorCode}
                        // onChange={(e)=>handleChange(e,"name")}
                        onChange={handleChange}
                        error={Boolean(formErrors.vendorCode)}
                        helperText={formErrors.vendorCode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="vendorName"
                        variant="outlined"
                        name="vendorName"
                        value={formData.vendorName}
                        onChange={handleChange}
                        error={Boolean(formErrors.vendorName)}
                        helperText={formErrors.vendorName}
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
                                label="country"
                                variant="outlined"
                                size="small"
                                error={Boolean(formErrors.country)}
                                helperText={formErrors.country}
                            />
                        )}
                    />
                     <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label="Select Date"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        onAccept={handleAccept}  // Fires right after user selects date from calendar
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </LocalizationProvider>
                </div>
                <div className='productButton9'>
                    {handleSubmitButton && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit} >Submit</button>}
                    {handleUpdateButton && <button style={{ backgroundColor: 'orange' }} onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
                    {handleUploadButton && (
                        isLoading ? (
                            <div style={{ textAlign: 'center', margin: '20px' }}>
                                <div className="spinner"></div>
                                <p>Uploading, please wait...</p>
                            </div>
                        ) : (
                            <button style={{ backgroundColor: 'orange' }} onClick={handleExcelUpload} disabled={isLoading}>Upload </button>
                        )
                    )}
                    {deletButton && <button style={{ backgroundColor: 'orange' }} onClick={handleDelete}  >Delete</button>}
                    <button onClick={formClear}>Clear</button>
                </div>
            </div>
            <div className='vendorTable'>
                {showVendorTable && !showUploadTable && (
                    <h5 className='prodcutTableName'>All Vendor deatil</h5>
                )}
                {showUploadTable && !showVendorTable && (
                    <h5 className='prodcutTableName'>Upload Vedor deatil</h5>
                )}
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" style={{ fontSize: '13px', backgroundColor: 'green' }}>
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
                {/* Default table */}
                {showVendorTable && !showUploadTable && (

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
                        paginationDefaultPage={page}  // 👈 This line is IMPORTANT
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
                        fixedHeaderScrollHeight="500px"
                        className="react-datatable"
                        customStyles={{
                            headRow: {
                                style: {
                                    //background: "linear-gradient(to bottom, rgb(37, 9, 102), rgb(16, 182, 191))",
                                    background: "linear-gradient(to bottom, rgb(48, 59, 137), #159cab)",

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


                                },
                            },
                            headCells: {
                                style: {
                                    display: "flex",
                                    justifyContent: "center",  // Centers header text
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
                                    justifyContent: "flex-end", // Corrected
                                    alignItems: "center", // Corrected
                                },
                            },
                        }}

                    />

                )}
                {showUploadTable && !showVendorTable && (
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
                )}
            </div>
            <Dialog open={showSuccessPopup} onClose={() => setShowSuccessPopup(false)}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {successMessage} {/* Dynamic success message */}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSuccessPopup(false)} color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showErrorPopup} onClose={() => setShowErrorPopup(false)}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {errorMessage} {/* Display the dynamic error message */}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowErrorPopup(false)} color="secondary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default VeendorMaster