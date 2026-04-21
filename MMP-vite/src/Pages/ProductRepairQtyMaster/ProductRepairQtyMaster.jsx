import React, { useState, useEffect, useRef } from 'react';
import ProductRepairQtyTextFiled from "../../components/ProductRepairQtyMaster/ProductRepairQtyTextFiled";
import ProductQtyMasterTable from "../../components/ProductRepairQtyMaster/ProductQtyMasterTable";
import { getProduct, getProductQtyMaster, saveProductQtyMaster } from '../../Services/Services';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { FaFileExcel } from "react-icons/fa";
import { downloadProductQtyFilter } from '../../Services/Services_09';
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