import React, { useState,useMemo , useRef } from 'react'
import './RcMainStore.css'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import { saveMainMaterial } from '../ServicesComponent/Services';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";

const RcMainStore = () => {
    const [formErrors, setFormErrors] = useState({});
    const [handleSubmitButton, setHandleSubmitButton] = useState(true);
    const [handleUpdateButton, setHandleUpdateButton] = useState(false);
    const [handleUploadButton, setHandleUploadButton] = useState(false);
    const [excelUploadData, setExcelUploadData] = useState([]);
    const [showUploadTable, setShowUploadTable] = useState(false);
    const [showRcTable, setShowRcTable] = useState(true);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);

    const [formData, setFormData] = useState({
        partcode: '',
        partdescription: '',
        rohsstatus: '',
        racklocation: '',
        msdstatus: '',
        technology: '',
        unitprice: '',
        createdby: '',
        modifiedby: '',
        quantity: '',
        UOM: '',
        AFO: '',
        ComponentUsage: '',
        TYC: '',
        TLT: '',
        MOQ: '',
        TRQty: '',
        POSLT: '',
        BG: '',
        expdateapplicable: '',
        shelflife: 0
    })
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const formClear = () => {
        setFormData({
            partcode: '',
            partdescription: '',
            rohsstatus: '',
            racklocation: '',
            msdstatus: '',
            technology: '',
            unitprice: '',
            createdby: '',
            modifiedby: '',
            quantity: '',
            UOM: '',
            AFO: '',
            ComponentUsage: '',
            TYC: '',
            TLT: '',
            MOQ: '',
            TRQty: '',
            POSLT: '',
            BG: '',
            expdateapplicable: '',
            shelflife: 0
        });
        setFileInputKey(Date.now()); // Change key to force re-render
        setExcelUploadData([]);
        setHandleSubmitButton(true);
        setHandleUpdateButton(false);
        setHandleUploadButton(false);
        setShowUploadTable(false);
        setShowRcTable(true);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valiDate()) return;
        const createdby = sessionStorage.getItem("userName") || "System";
        const modifiedby = sessionStorage.getItem("userName") || "System";

        const updatedFormData = {
            ...formData,
            createdby,
            modifiedby,
        };

        console.log("updatedFormData", updatedFormData);

        saveMainMaterial(updatedFormData)
            .then((response) => {
                alert("Account Created Successfully");
                formClear(); // ✅ clear form only once
                fetchProduct(page, perPage);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        alert("Product already exists");
                    } else {
                        alert("Something went wrong");
                    }
                }
            });
    };

    const valiDate = () => {
        const errors = {};
        let isValid = true; // Assume valid initially

        if (!formData.partcode) {
            errors.partcode = "Please Enter partcode";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid; // Now it correctly returns false if any field is empty
    };

    const handleDownloadExcel = () => {
        // Define the header and data format
        const worksheetData = [
            ["partcode", "partdescription", "rohsstatus", "racklocation", "msdstatus", "technology", "unitprice", "quantity",
                "UOM", "AFO", "ComponentUsage", "TYC", "TLT", "MOQ", "TRQty", "POSLT", "BG", "expdateapplicable", "shelflife"]
        ];
        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

        // Create an Excel file and trigger download
        XLSX.writeFile(workbook, "RcMaain.xlsx");
    };

    const fileInputRef = useRef(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const handleUpload = (event) => {
        setExcelUploadData([]); // Clear previous data
        //setShowUploadTable(false); // Hide table until new data loads
        setShowRcTable(false); // Hide product table

        const file = event.target.files[0];
        if (!file) return;

        //setLoading(true);
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
                setLoading(false);
                return;
            }
            setExcelUploadData(jsonData);
            setHandleUploadButton(true);
            setHandleSubmitButton(false);
            setShowUploadTable(true);
            setShowRcTable(false);
        };
        reader.onerror = (error) => {
            console.error("File read error:", error);
            setLoading(false);
        };
    };

    const calculateColumnWidth = (data, key, charWrap = 5, charWidth = 8, minWidth = 150, maxWidth = 318) => {
        if (!Array.isArray(data) || data.length === 0) return minWidth;
      
        const maxLines = Math.max(
          ...data.map(row => {
            const length = row[key]?.toString().length || 0;
            return Math.ceil(length / charWrap);
          })
        );
      
        const width = charWrap * charWidth * maxLines;
        return Math.min(Math.max(width, minWidth), maxWidth);
      };
      
      

    //const uploadColumn = [
        const uploadColumn = useMemo(() => {
            console.log("Recalculating column widths...");
return [

        {
            name: "Partcode", selector: row => row.partcode || "N/A", sortable: true, width: `${calculateColumnWidth(excelUploadData,'partcode')}px`
        },
        {
            name: "Partdescription",
            selector: row => row.partdescription || "N/A",   wrap: true,

            width: `${calculateColumnWidth(excelUploadData, 'partdescription')}px`
          },
        {
            name: "Rohs-status", selector: row => row.rohsstatus || "N/A", width: `${calculateColumnWidth(excelUploadData,'rohsstatus')}px`
        },
        {
            name: "Rack Location",
            selector: row => row.racklocation
                ? row.racklocation.split(",").map(email => <div key={email}>{email}</div>)
                : "N/A", width: `${calculateColumnWidth(excelUploadData,'racklocation')}px`

        },
        {
            name: "Msd Status", selector: row => row.msdstatus || "N/A", width: `${calculateColumnWidth(excelUploadData,'msdstatus')}px`
        },
        {
            name: "Technology", selector: row => row.technology || "N/A", width: `${calculateColumnWidth(excelUploadData,'technology')}px`
        },
        {
            name: "UnitPrice", selector: row => row.unitprice || "N/A", width: `${calculateColumnWidth(excelUploadData,'unitprice')}px`
        },
        {
            name: "Quantity", selector: row => row.quantity || "N/A", width: `${calculateColumnWidth(excelUploadData,'quantity')}px`
        },
        {
            name: "UOM", selector: row => row.UOM || "N/A", width: `${calculateColumnWidth(excelUploadData,'UOM')}px`
        },
        {
            name: "Active For Ordering", selector: row => row.AFO || "N/A", width: `${calculateColumnWidth(excelUploadData,'AFO')}px`
        },
        {
            name: "ComponentUsage", selector: row => row.ComponentUsage || "N/A", width: `${calculateColumnWidth(excelUploadData,'ComponentUsage')}px`
        },
        {
            name:(<div>Type Of <br/> Component</div>) , selector: row => row.TYC || "N/A", width: `${calculateColumnWidth(excelUploadData,'TYC')}px`
        },
        {
            name: "TLT", selector: row => row.TLT || "N/A", width: `${calculateColumnWidth(excelUploadData,'TLT')}px`
        },
        {
            name: "MOQ", selector: row => row.MOQ || "N/A", width: `${calculateColumnWidth(excelUploadData,'MOQ')}px`
        },
        {
            name: (<div>Threshold <br/>Request Qty</div>), selector: row => row.TRQty || "N/A", width: `${calculateColumnWidth(excelUploadData,'TRQty')}px`
        },
        {
            name: (
                <div>
                  Planned Ordering<br />Stock Lead Time
                </div>
              ), selector: row => row.POSLT || "N/A", width: `${calculateColumnWidth(excelUploadData,'POSLT')}px`
        },
        {
            name: "BG", selector: row => row.BG || "N/A", width: `${calculateColumnWidth(excelUploadData,'BG')}px`
        },
        {
            name:(<div>Expdate <br/>Applicable</div>), selector: row => row.expdateapplicable || "N/A", width: `${calculateColumnWidth(excelUploadData,'expdateapplicable')}px`
        },
        {
            name: "Shelflife", selector: row => row.shelflife || "N/A", width: `${calculateColumnWidth(excelUploadData,'shelflife')}px`
        }
    ]
}, [excelUploadData]);
    const handlePerRowsChange = (newPerPage) => {
        setPerPage(newPerPage);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        console.log("Page changed to:", newPage);
        setPage(newPage);
    };
    return (
        <div className='RcContainer'>
            <div className='RcStoreInput'>
                <div className='RcStoreFiledName'>
                    <h5>MainMaterial Master </h5>
                </div>
                <div className='productUpload'>

                    <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>

                    <button onClick={handleDownloadExcel}> Excel Download </button>
                </div>
                <div className='RcStoreTexfiled'>
                    <TextField
                        id="outlined-basic"
                        label="partcode"
                        variant="outlined"
                        name="partcode"
                        value={formData.partcode}
                        onChange={handleChange}
                        error={Boolean(formErrors.partcode)}
                        helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="part Description"
                        variant="outlined"
                        name="partdescription"
                        value={formData.partdescription}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="UOM"
                        variant="outlined"
                        name="UOM"
                        value={formData.UOM}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Active For Ordering"
                        variant="outlined"
                        name="AFO"
                        value={formData.AFO}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="ComponentUsage"
                        variant="outlined"
                        name="ComponentUsage"
                        value={formData.ComponentUsage}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Type Of Component"
                        variant="outlined"
                        name="TYC"
                        value={formData.TYC}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Total Lead Time"
                        variant="outlined"
                        name="TLT"
                        value={formData.TLT}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="MOQ"
                        variant="outlined"
                        name="MOQ"
                        value={formData.MOQ}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Threshold Request Qty"
                        variant="outlined"
                        name="TRQty"
                        value={formData.TRQty}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Planned Ordering Stock Lead Time"
                        variant="outlined"
                        name="POSLT"
                        value={formData.POSLT}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="BG"
                        variant="outlined"
                        name="BG"
                        value={formData.BG}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Rohs Status"
                        variant="outlined"
                        name="rohsstatus"
                        value={formData.rohsstatus}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Msd Status"
                        variant="outlined"
                        name="msdstatus"
                        value={formData.msdstatus}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Technology"
                        variant="outlined"
                        name="technology"
                        value={formData.technology}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Rack Location"
                        variant="outlined"
                        name="racklocation"
                        value={formData.racklocation}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Quantity"
                        variant="outlined"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <TextField
                        id="outlined-basic"
                        label="Unit Price"
                        variant="outlined"
                        name="unitprice"
                        value={formData.unitprice}
                        onChange={handleChange}
                        //error={Boolean(formErrors.partcode)}
                        //helperText={formErrors.partcode}
                        //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                        size="small"
                    />
                    <Autocomplete
                        options={["Yes", "No", "NotApplicable"]}
                        getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
                        value={formData.expdateapplicable || []}
                        onChange={(event, newValue) => setFormData({ ...formData, expdateapplicable: newValue || [] })}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Expdateapplicable"
                                variant="outlined"
                                //error={Boolean(formErrors.recordstatus)}
                                // helperText={formErrors.recordstatus}
                                // sx={{ "& .MuiInputBase-root": { height: "40px" } }}
                                size="small"  // <-- Reduce height
                            />
                        )}
                    />
                    {formData.expdateapplicable === 'No' && (
                        <TextField
                            id="shelfLife"
                            label="Shelf Life"
                            name="shelflife"
                            type="number"
                            value={formData.shelflife}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                            defaultValue={0}
                            variant="outlined"
                            size="small"
                        />
                    )}
                </div>
                <div className='productButton9'>
                    {handleSubmitButton && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>}
                    {handleUpdateButton && <button style={{ backgroundColor: 'orange' }}>Update</button>}
                    {handleUploadButton && <button style={{ backgroundColor: 'orange' }} >Upload</button>}
                    <button onClick={formClear}>Clear</button>
                </div>
                {showUploadTable && !showRcTable && (
                    <DataTable
                        columns={uploadColumn}
                        data={excelUploadData}
                        pagination
                        paginationServer
                        progressPending={loading}
                        paginationTotalRows={totalRows}
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
                        fixedHeaderScrollHeight="400px"
                        className="react-datatable"
                        customStyles={{
                            headRow: {
                                style: {
                                    background: "linear-gradient(to bottom, rgb(37, 9, 102), rgb(16, 182, 191))",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                    textAlign: "center",
                                    minHeight: "40px",
                                    
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

export default RcMainStore