import React, { useState, useEffect, useRef ,useMemo  } from 'react';
import ProductRepairQtyTextFiled from "../../components/ProductRepairQtyMaster/ProductRepairQtyTextFiled";
import ProductQtyMasterTable from "../../components/ProductRepairQtyMaster/ProductQtyMasterTable";
import { getProduct, getProductQtyMaster, saveProductQtyMaster } from '../../Services/Services';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { FaFileExcel } from "react-icons/fa";
import { downloadProductQtyFilter, saveProductQtyBulck } from '../../Services/Services_09';
import * as XLSX from "xlsx";
import DataTable from 'react-data-table-component';
const ProductRepairQtyMaster = () => {

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
    // const [searchText, setSearchText] = useState("");
    const [showBomTable, setShowBomTable] = useState(true);
    const [perPage, setPerPage] = useState(20);
    const [showUploadTable, setShowUploadTable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [options, setOptions] = useState([]);
    const [storeRc, setStoreRc] = useState([]);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [page, setPage] = useState(1);
    const formRef = useRef(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [openMsg, setOpenMsg] = useState(false);
    const [storeProduct, setStoreProduct] = useState([]);
    const [updateButton, setUpdateButton] = useState(false)
    const [addButton, setAddButton] = useState(true);
    const [isEdit, setIsEdit] = useState(true);
    const [editingRowId, setEditingRowId] = useState(null);
    const [addSearchText, setAddSearchText] = useState("");
    const [uploadErrors, setUploadErrors] = useState([]);

    const getFirstDayOfMonth = () => {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`;
    };
    const [formData, setFormData] = useState({
        productname: "",
        scrap: "",
        repairedOk: "",
        dateyear: "",
        totalRepairedQty: "",
        // effectivedate:""
    });



    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData({ ...formData, [name]: value })
    // };


    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        fetchProduct();
    }, [])

    const fetchProduct = () => {
        getProduct()
            .then((response) => {
                setStoreProduct(response.data)
            })
    }
    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.productname) {
            errors.productname = "Please select Product Name";
            isValid = false;
        }



        if (!formData.dateyear) {
            errors.dateyear = "Please select Month & Year";
            isValid = false;
        }

        if (!formData.totalRepairedQty) {
            errors.totalRepairedQty = "Please enter Total Repaired Qty";
            isValid = false;
        }

        // if (!formData.repairedOk) {
        //     errors.repairedOk = "Please enter Repaired Ok";
        //     isValid = false;
        // }

        // if (!formData.scrap) {
        //     errors.scrap = "Please enter Scrap";
        //     isValid = false;
        // }

        setFormErrors(errors);
        return isValid;
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!valiDate()) return;
        setLoading(true)

        // const createdby = sessionStorage.getItem("userName") || "System";
        // const updatedby = sessionStorage.getItem("userName") || "System";
        const createdby = localStorage.getItem("userName") || "System";
        const updatedby = localStorage.getItem("userName") || "System";
        const updatedFormData = {
            ...formData,
            createdby,
            updatedby,
        };
        saveProductQtyMaster(updatedFormData)
            .then((response) => {
                //alert("Product added Successfully");
                setSuccessMessage("ProductQty Master Created");
                setShowSuccessPopup(true);
                formClear();
                fetchProductQtyMaster();
                // setResetKey(prev => prev + 1);
                // fetchBomMaster()
                // formClear();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        //alert("Product already exists");
                        setShowErrorPopup(true);
                        setErrorMessage("Product already exists")
                    } else {
                        //alert(error.response.status);
                        setShowErrorPopup(true);
                        setErrorMessage(error.response.status)
                    }
                }
            })
            .finally(() => {
                // formClear();
                setLoading(false)
            })
    }

    const handleDownloadExcel = () => {
        const worksheetData = [
            ["productname", "dateyear", "totalRepairedQty"]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ProductQtyMaster");

        XLSX.writeFile(workbook, "ProductQtyMaster.xlsx");
    };


    const calculateColumnWidthExcelUpload = (data, key, charWrap = 19, charWidth = 8, minWidth = 250, maxWidth = 518) => {
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

    const uploadColumn = useMemo(() => {
        // console.log("Recalculating column widths...");
        return [
            {
                name: "ProductName", selector: row => row.productname, sortable: true, width: `${calculateColumnWidthExcelUpload(excelUploadData, 'partcode')}px`
            },
            {
                name: "Month Year", selector: row => row.dateyear, width: `${calculateColumnWidthExcelUpload(excelUploadData, 'partdescription')}px`
            },
            {
                name: "RepairedQty", selector: row => row.totalRepairedQty, width: `${calculateColumnWidthExcelUpload(excelUploadData, 'productname')}px`
            },
            
        ]
    }, [excelUploadData]);

    // const formClear = () => {

    //     setFormData({
    //         productname: "",
    //         scrap: "",
    //         repairedOk: "",
    //         // dateyear: "",
    //         dateyear: prev.dateyear, 
    //         totalRepairedQty: "",
    //         productgroup: "",
    //         productfamily: ""
    //     })
    //     setFormErrors("");
    //     setUpdateButton(false)
    //     setAddButton(true)


    // }

    const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const errors = [];
        const dateYearRegex = /^\d{4}-(0[1-9]|1[0-2])$/; // format: 2025-09

        data.forEach((row, index) => {
            const rowNum = index + 2; // Excel row number (1=header, so data starts at 2)

            if (!row.dateyear || !dateYearRegex.test(String(row.dateyear).trim())) {
                errors.push(`Row ${rowNum}: "dateyear" value "${row.dateyear}" is invalid. Expected format: 2025-09`);
            }

            if (!row.totalRepairedQty || isNaN(Number(row.totalRepairedQty))) {
                errors.push(`Row ${rowNum}: "totalRepairedQty" value "${row.totalRepairedQty}" is not numeric.`);
            }
        });

        if (errors.length > 0) {
            setUploadErrors(errors);
            setExcelUploadData([]);
            setShowUploadTable(false);
            // reset file input so same file can be re-selected after fix
            setFileInputKey(Date.now());
            return;
        }

        setUploadErrors([]);
        setExcelUploadData(data);
        setShowUploadTable(true);
    };
    reader.readAsBinaryString(file);
};

const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
};

const handlePageChange = (newPage) => {
    setPage(newPage);
};
    const formClear = () => {
    setFormData(prev => ({
        productname: "",
        scrap: "",
        repairedOk: "",
        dateyear: prev.dateyear,  // ← keep existing dateyear
        totalRepairedQty: "",
        productgroup: "",
        productfamily: ""
    }));
    setFormErrors("");
    setUpdateButton(false);
    setAddButton(true);
};

    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };
    const debouncedSearch = useDebounce(addSearchText, 500); // delay in ms


    useEffect(() => {
        fetchData(page, perPage, debouncedSearch);
    }, [page, perPage, debouncedSearch])

    const fetchData = (page = 1, size = 10, search = "") => {
        // // console.log("searchfetch", search);
        // if (search && search.trim() !== "") {
        //     fetchBomMaster(page, size, search);

        // } else {
        //     fetchBomMaster(page, perPage);
        // }
        fetchProductQtyMaster(page, perPage, search);
    }

    const fetchProductQtyMaster = (page = 1, size = 10, search = "") => {
        setLoading(true)
        getProductQtyMaster(page - 1, size, search)
            .then((response) => {
                setBomMaster(response.data.content || []);
                setTotalRows(response.data.totalElements || 0);
                // console.log('fetchBomMaster', response.data);
            })
            .finally(() => setLoading(false)); // ensure loading is reset
    }

    const handleEditClick = (row) => {
        setIsEdit(false)
        setUpdateButton(true)
        setAddButton(false)
        // setAddButton(false)

        setEditingRowId(row.id);

        setFormData(prev => ({
            ...prev, // keep previous data if missing in row
            id: row.id ?? prev.id ?? "",
            productname: row.productname ?? prev.productname ?? "",
            productgroup: row.productgroup ?? prev.productgroup ?? "",
            productfamily: row.productfamily ?? prev.productfamily ?? "",
            dateyear: row.dateyear ?? prev.dateyear ?? "",
            totalRepairedQty: row.totalRepairedQty ?? prev.totalRepairedQty ?? "",

        }));

        setFormErrors({});

        // setData([{ ...row, selectedid: row.id }]);
        setTotalRows(1);
    };


    const handleUpdate = async () => {
        setUpdateButton(true)
        // setAddButton(false)
        setLoading(true);
        try {
            // const userName = sessionStorage.getItem("userId") || "System";
            const userName = sessionStorage.getItem("userId") || "System";
            // Determine if formData is a single object or an array
            let payload = Array.isArray(formData)
                ? formData.map((row) => ({ ...row, modifiedby: userName }))
                : { ...formData, modifiedby: userName };

            const response = await saveProductQtyMaster(payload);

            if (response?.status === 200 && response.data) {
                const { message } = response.data;
                setSuccessMessage(message || "Update successfully");
                setShowSuccessPopup(true);
                // clear();
                fetchProductQtyMaster();
                setAddButton(true)
                setUpdateButton(false)
                formClear();
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || error.message;
            setErrorMessage(errMsg);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };



    const exportToExcel = (search = "") => {
            setLoading(true);
            let apiCall;
    
            const payload = {
                ...formData,
                search: search?.trim() || null
            };
            apiCall = () => downloadProductQtyFilter(payload);
    
            apiCall(search, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setDownloadProgress(percent);
                },
            })
                .then(response => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "RecevingReport.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setDownloadDone(true);
                })
                .catch((error) => {
                    console.error("Download failed:", error);
                })
                .finally(() => {
                    setLoading(false);
                    setTimeout(() => setDownloadDone(false), 5000); // Reset "Done" after 3s
                });
        };
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Product RepairQty Master</p>
                </div>
                <div className='ComCssUpload'>
<input 
    type="file" 
    key={fileInputKey} 
    accept=".xlsx, .xls" 
    id="fileInput" 
    style={{ display: 'none' }} 
    onChange={handleFileUpload}   // ← ADD THIS
/>                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>

                    <button onClick={handleDownloadExcel}> Excel Download </button>
                </div>
                <ProductRepairQtyTextFiled
                    data={storeProduct}
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    formErrors={formErrors}
                />
                <div className="ReworkerButton9">
                    {addButton &&
                        <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>
                    }
                    <button className='ComCssClearButton' onClick={formClear} >Clear</button>
                    {updateButton &&
                        <button className='ComCssSubmitButton' onClick={handleUpdate} >Update</button>
                    }
                    
                </div>
            </div>

   
   {/* Validation errors */}
{uploadErrors.length > 0 && (
    <div style={{
        margin: '10px 0',
        padding: '10px 14px',
        backgroundColor: '#fff3f3',
        border: '1px solid #f5c6cb',
        borderRadius: 6,
    }}>
        <strong style={{ color: '#c0392b' }}>❌ Upload Validation Errors:</strong>
        <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 18 }}>
            {uploadErrors.map((err, i) => (
                <li key={i} style={{ color: '#c0392b', fontSize: 13 }}>{err}</li>
            ))}
        </ul>
    </div>
)}

{showUploadTable && (
    <div className='ComCssTable'>

        {/* Upload & Cancel buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            
            <span style={{ fontSize: 12, color: '#555', alignSelf: 'center' }}>
                {excelUploadData.length} record(s) ready to upload
            </span>
        </div>

        <DataTable
            columns={uploadColumn}
            data={excelUploadData}
            pagination
            progressPending={loading}
            paginationTotalRows={excelUploadData.length}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[5, 10, 15, 20]}
            fixedHeader
            fixedHeaderScrollHeight="400px"
            highlightOnHover
            className="react-datatable"
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
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    },
                },
                headCells: {
                    style: {
                        display: "flex",
                        justifyContent: "center",
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
                        justifyContent: "flex-end",
                        alignItems: "center",
                    },
                },
            }}
        />

         <div className="ReworkerButton9"> 
            <button
                className='ComCssSubmitButton'
                onClick={async () => {
    try {
        setLoading(true);
        const response = await saveProductQtyBulck(excelUploadData); // your service call
        const result = response.data;

        if (result.failedCount > 0) {
            setErrorMessage(
                `✅ ${result.successCount} saved.  ❌ ${result.failedCount} failed:\n` +
                result.failedList.join("\n")
            );
            setShowErrorPopup(true);
        } else {
            setSuccessMessage(`✅ All ${result.successCount} records uploaded successfully!`);
            setShowSuccessPopup(true);
        }

        // close upload table after upload
        setShowUploadTable(false);
        setExcelUploadData([]);
        setFileInputKey(Date.now());
        fetchProductQtyMaster(); // refresh main table

    } catch (error) {
        setErrorMessage("Bulk upload failed: " + error.message);
        setShowErrorPopup(true);
    } finally {
        setLoading(false);
    }
}}
            >
                Upload
            </button>
            <button
                className='ComCssClearButton'
                onClick={() => {
                    setShowUploadTable(false);
                    setExcelUploadData([]);
                    setUploadErrors([]);
                    setFileInputKey(Date.now()); // reset file input
                }}
            >
                Cancel
            </button>
         </div>
    </div>
)}



            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Report Detail</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(addSearchText)} disabled={loading}>
                        {loading

                            ? "✅ Done"
                            : (
                                <>
                                    <FaFileExcel /> Export
                                </>
                            )}
                    </button>
                    <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
                        <input
                            type="text" className="form-control" style={{ height: "30px", paddingRight: "30px" }}
                            placeholder="Search..." value={addSearchText}
                            onChange={(e) => setAddSearchText(e.target.value)}
                        />
                        {addSearchText && (
                            <span onClick={() => setAddSearchText("")}
                                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold", }}> ✖
                            </span>
                        )}
                    </div>
                </div>
                <>
                    <LoadingOverlay loading={loading} />
                    <ProductQtyMasterTable
                        data={bomMaster}
                        page={page}
                        perPage={perPage}
                        totalRows={totalRows}
                        setPage={setPage}
                        setPerPage={setPerPage}
                        onEdit={handleEditClick}
                    />


                </>
              
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
            {/* <CustomDialog
                            open={confirmDelete}
                            onClose={handleCancel}
                            onConfirm={handleDelete}
                            title="Confirm"
                            message="Are you sure you want to delete this?"
                            color="primary"
                        /> */}
        </div>
    )
}
export default ProductRepairQtyMaster