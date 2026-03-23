import React, { useState, useEffect, useRef } from 'react';
import ProductRepairQtyTextFiled from "../../components/ProductRepairQtyMaster/ProductRepairQtyTextFiled";
import ProductQtyMasterTable from "../../components/ProductRepairQtyMaster/ProductQtyMasterTable";
import { getProduct, getProductQtyMaster, saveProductQtyMaster } from '../../Services/Services';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";

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
        const [searchText, setSearchText] = useState("");
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


     const getFirstDayOfMonth = () => {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`;
    };
    const [formData, setFormData] = useState({
        productname: "",
        scrap:"",
        repairedOk:"",
        dateyear: "",
        totalRepairedQty:"",
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

    if (!formData.repairedOk) {
        errors.repairedOk = "Please enter Repaired Ok";
        isValid = false;
    }

    if (!formData.scrap) {
        errors.scrap = "Please enter Scrap";
        isValid = false;
    }

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


    const formClear = () => {  

        setFormData({
             productname: "",
        scrap:"",
        repairedOk:"",
        dateyear: "",
        totalRepairedQty:"",
        productgroup:"",
        productfamily:""
        })
        setFormErrors("");


    }

const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };
    const debouncedSearch = useDebounce(searchText, 500); // delay in ms


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
        fetchProductQtyMaster(page, perPage,search);
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
                    <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>
                    <button className='ComCssClearButton' onClick={formClear} >Clear</button>

                </div>
            </div>
            <div className='ComCssTable'>
                                <h5 className='ComCssTableName'>Report Detail</h5>
<>
                                    <LoadingOverlay loading={loading} />
                                    <ProductQtyMasterTable
                                        data={bomMaster}
                                        page={page}
                                        perPage={perPage}
                                        totalRows={totalRows}
                                        setPage={setPage}
                                        setPerPage={setPerPage}
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