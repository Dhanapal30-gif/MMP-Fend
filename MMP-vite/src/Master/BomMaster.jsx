import React, { useState, useMemo, useRef, useEffect } from 'react'
import './BOM.css'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { getPartcode, getProduct } from '../ServicesComponent/Services';
const BomMaster = () => {
    const [formErrors, setFormErrors] = useState({});
    const [excelUploadData, setExcelUploadData] = useState([]);
    const [handleUploadButton, setHandleUploadButton] = useState(false);
    const [handleUpdateButton, setHandleUpdateButton] = useState(false);
    const [handleSubmitButton, setHandleSubmitButton] = useState(true);
    const fileInputRef = useRef(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [deletButton, setDeletButton] = useState();
    const [selectedRows, setSelectedRows] = useState([]);
    const [bomMaster, setBomMaster] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showBomTable, setShowBomTable] = useState(true);
    const [showUploadTable, setShowUploadTable] = useState(false);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [options, setOptions] = useState([]);
    const [storeRc, setStoreRc] = useState([]);
    const [storeProduct, setStoreProduct] = useState([]);

    const [formData, setFormData] = useState({
        partcode: "",
        partdiscription: "",
        productName: "",
        productFamily: "",
        productGroup: ""
    })

    const handleChange = () => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    };

    const valiDate = () => {
        const errors = {};
        let isValid = true; // Assume valid initially

        if (!formData.partcode) {
            errors.partcode = "Please Enter partcode";
            isValid = false;
        }

        if (!formData.productName) {
            errors.productName = "Please Enter productName";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid; // Now it correctly returns false if any field is empty
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

            // ✅ Set data after reading
            setExcelUploadData(jsonData);
            setHandleUploadButton(true);
            setHandleSubmitButton(false);
            setShowUploadTable(true);
            setShowRcTable(false);

            // ✅ Clear file input after processing
            event.target.value = null;
        };

        reader.onerror = (error) => {
            console.error("File read error:", error);
        };
    };


    const handleDownloadExcel = () => {
        // Define the header and data format
        const worksheetData = [
            ["partcode", "partdescription", "productName", "ProductGroup", "ProductFamily"]
        ];
        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

        // Create an Excel file and trigger download
        XLSX.writeFile(workbook, "RcMaain.xlsx");
    };

    const formClear = () => { }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valiDate()) return;
    }

    const calculateColumnWidth = (data, key, charWrap = 19, charWidth = 8, minWidth = 150, maxWidth = 318) => {
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

    const handlePerRowsChange = (newPerPage, newPage) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }


    const handlePageChange = (newPage) => {
        setPage(newPage);
    };
    const uploadColumn = useMemo(() => {
        console.log("Recalculating column widths...");
        return [

            {
                name: "Partcode", selector: row => row.partcode, sortable: true, width: `${calculateColumnWidth(excelUploadData, 'partcode')}px`
            },
            {
                name: "partdiscription",
                selector: row => row.partdiscription, wrap: true,

                width: `${calculateColumnWidth(excelUploadData, 'partdiscription')}px`
            },
            {
                name: "productName", selector: row => row.productName, width: `${calculateColumnWidth(excelUploadData, 'productName')}px`
            },
            {
                name: "productGroup", selector: row => row.productGroup, width: `${calculateColumnWidth(excelUploadData, 'productGroup')}px`
            },
            {
                name: "productFamily", selector: row => row.productFamily, width: `${calculateColumnWidth(excelUploadData, 'productFamily')}px`
            },

        ]
    }, [excelUploadData]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(rcStoreData.map((row) => row.id)); // ✅ Ensure unique selection key
            setDeletButton(true);
            setHandleSubmitButton(false);
        } else {
            setSelectedRows([]);
            setDeletButton(false);
            setHandleSubmitButton(true);
        }
    };
    const column = [

        {
            name: (
                <div style={{ textAlign: "center" }}>
                    <label>Delete All</label>
                    <br />

                    <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === bomMaster.length && bomMaster.length > 0} />
                </div>
            ),
            cell: (row) => (
                <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)} />
            ),
            width: "130px",
        },
        { name: "Edit", selector: row => (<button className="btn btn-warning btn-sm" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },
        ,
        {
            name: "Partcode",
            selector: row => row.partcode,
            sortable: true,
            width: `${calculateColumnWidth(bomMaster, 'partcode')}px`
        },
        {
            name: "Partdescription",
            selector: row => row.partdiscription,
            wrap: true,
            width: `${calculateColumnWidth(bomMaster, 'partdescription')}px`
        },
        {
            name: "productName",
            selector: row => row.productName,
            width: `${calculateColumnWidth(bomMaster, 'productName')}px`
        },

        {
            name: "productFamily",
            selector: row => row.productFamily,
            width: `${calculateColumnWidth(bomMaster, 'productFamily')}px`
        },
        {
            name: "productGroup",
            selector: row => row.productGroup,
            width: `${calculateColumnWidth(bomMaster, 'productGroup')}px`
        },

    ]

    const handleRowSelect = (rowKey) => {
        setSelectedRows((prevSelectedRows) => {
            const isRowSelected = prevSelectedRows.includes(rowKey);

            // Update selected rows
            const updatedRows = isRowSelected
                ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect
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

    const rowHighlightStyle = [
        {
            when: row =>
                row?.partcode &&
                duplicateProducts?.some(
                    dup =>
                        dup &&
                        dup.toString().trim().toLowerCase() === row.partcode.toString().trim().toLowerCase()
                ),
            style: {
                backgroundColor: '#d4edda', // Light green
            },
        },
    ];

    useEffect(() => {
        fetchPartcode();
    }, [])

    const fetchPartcod = () => {
        getPartcode()
            .then((response) => {
                const unique = new Map();
                response.data.forEach(item => {
                    if (!unique.has(item.partcode)) {
                        unique.set(item.partcode, item);
                    }
                });
                setOptions(Array.from(unique.values()));
            })
            .catch((error) => console.error("Error fetching data", error));


    }
    const fetchPartcode = () => {
        getPartcode()
            .then((response) => {
                const data = response.data;
                setStoreRc(response.data);

            })
    }

    const fetchProduct = () => {
        getProduct()
            .then((response) => {
                setStoreProduct(response.data)
                console.log("product", response.data);
            })
    }
    useEffect(() => {
        fetchProduct();
    }, [])

    console.log("productName", storeProduct)
    //   useEffect(()=>{
    //         console.log("storeRc",storeRc);

    //   },[storeRc]);


    return (
        <div className='BomContainer'>
            <div className='BomMasterInput'>
                <div className='BomMasterFiledName'>
                    <h5>BOM Master </h5>
                </div>
                <div className='productUpload'>
                    <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>

                    <button onClick={handleDownloadExcel}> Excel Download </button>

                </div>
                <div className='BomMasterTexfiled'>

                    <Autocomplete
                        options={storeRc}
                        getOptionLabel={(option) => option.partcode}
                        value={storeRc.find(item => item.partcode === formData.partcode) || null}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    partcode: newValue.partcode,
                                    partdiscription: newValue.partdiscription
                                });
                            } else {
                                setFormData({ ...formData, partcode: "", partdiscription: "" });
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Partcode"
                                variant="outlined"
                                error={Boolean(formErrors.partcode)}
                                helperText={formErrors.partcode}
                                size="small"
                            />
                        )}
                    />

                    <Autocomplete
                        options={storeRc}
                        getOptionLabel={(option) => option.partdescription}
                        value={storeRc.find(item => item.partdiscription === formData.partdiscription) || null}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    partcode: newValue.partcode,
                                    partdiscription: newValue.partdiscription
                                });
                            } else {
                                setFormData({ ...formData, partcode: "", partdiscription: "" });
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Part Description"
                                variant="outlined"
                                size="small"
                            />
                        )}
                    />

                    <Autocomplete
                        options={storeProduct}
                        getOptionLabel={(option) => option.productName}
                        value={storeProduct.find(item => item.productName === formData.productName) || null}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    productName: newValue.productName,
                                    productGroup: newValue.productGroup,
                                       productFamily: newValue.productFamily,

                                });
                            } else {
                                setFormData({ ...formData, productName: "", productGroup: "" , productFamily: "" });
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="productName"
                                variant="outlined"
                                error={Boolean(formErrors.productName)}
                                helperText={formErrors.productName}
                                size="small"
                                sx={{
    "& label.MuiInputLabel-shrink": {
      color: "green", // label color when floated
    },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "green", // optional: border on focus
      fontWeight:""
    },
  }}
                            />
                        )}
                    />

                    <TextField
                        id="outlined-basic"
                        label="productGroup"
                        variant="outlined"
                        name="productGroup"
                        value={formData.productGroup}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="productFamily"
                        variant="outlined"
                        name="productFamily"
                        value={formData.productFamily}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                </div>
                <div className='productButton9'>
                    {handleSubmitButton && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>}
                    {handleUpdateButton && <button style={{ backgroundColor: 'orange' }} onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
                    {handleUploadButton && <button style={{ backgroundColor: 'orange' }} onClick={excelUpload}>Upload</button>}
                    {deletButton && <button style={{ backgroundColor: 'orange' }} onClick={handleDelete}  >Delete</button>}
                    <button onClick={formClear}>Clear</button>
                </div>
            </div>
            <div className='bomMasterTable'>
                {showBomTable && !showUploadTable && (
                    <h5 className='prodcutTableName'>All Master deatil</h5>
                )}
                {showUploadTable && !showBomTable && (
                    <h5 className='prodcutTableName'>Upload Master deatil</h5>
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

                {showBomTable && !showUploadTable && (


                    <DataTable
                        columns={column}
                        // data={rcStoreData}
                        pagination
                        paginationServer
                        progressPending={loading}
                        paginationTotalRows={totalRows}
                        onChangeRowsPerPage={handlePerRowsChange}
                        onChangePage={handlePageChange}
                        paginationPerPage={perPage}
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                        paginationComponentOptions={{
                            rowsPerPageText: 'Rows per page:',
                            rangeSeparatorText: 'of',
                            noRowsPerPage: false,
                            // selectAllRowsItem: true,
                            // selectAllRowsItemText: 'All',
                        }}
                        fixedHeader    // ✅ ADD THIS LINE
                        fixedHeaderScrollHeight="400px"
                        highlightOnHover
                        className="react-datatable"
                        conditionalRowStyles={rowHighlightStyle}
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
                )}



            </div>
        </div>


    )
}

export default BomMaster