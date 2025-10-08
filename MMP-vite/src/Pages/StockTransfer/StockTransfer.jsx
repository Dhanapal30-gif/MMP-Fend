import React, { useState, useEffect, useRef } from 'react';
import StockTransferTextFile from "../../components/StockTransfer/StockTransferTextFile";
import StockTransferTable from "../../components/StockTransfer/StockTransferTable";
import RequesterDefaultTable from "../../components/Requester/RequesterDefaultTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchRequesterDetail, fetchRequesterSearch } from "../../components/Requester/RequesterActions.js";

import { FaFileExcel, FaBars } from "react-icons/fa";
import { saveGRN } from '../../Services/Services_09.js';
import { checkAvailable, downloadRequester, fetchAvailableAndCompatabilityQty, fetchProductAndPartcode, fetchRequesterType, fetchRetPartcode, fetchStockTransferAll, fetchTransferPartcode, saveRequester, saveReturning, saveStockTransfer } from '../../Services/Services-Rc.js';
import { ContactSupportOutlined } from '@mui/icons-material';

const StockTransfer = () => {

    const [formData, setFormData] = useState({
        ordertype: "",         // For Order Type dropdown
        partcode: "",  // For Transfer Partcode dropdown
    });

    const userId = sessionStorage.getItem("userId");
    const [formErrors, setFormErrors] = useState({});
    const [trnasferPrtcode, setTrnasferPrtcode] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [isFrozen, setIsFrozen] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [downloadDone, setDownloadDone] = useState(false);
    const [ stockTransferDetail,setStockTransferDetail]= useState([]);
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (!formData.ordertype) return;

        fetchTransferPartcode(formData.ordertype)
            .then(res => setTrnasferPrtcode(res.data || []))
            .catch(err => console.error(err));
    }, [formData.ordertype]);



    // const fetchTransferPartcodeList = (orderType) => {
    //     fetchTransferPartcode(orderType)
    //         .then((res) => {
    //             setTrnasferPrtcode(res.data || []);
    //             console.log("partcode:", res.data);
    //         })
    //         .catch(err => console.error(err));
    // };


    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.transfertype) {
            errors.transfertype = "select transferType";
            isValid = false;
        }
        if (!formData.ordertype) {
            errors.ordertype = "select Order Type";
            isValid = false;
        }

        if (!formData.partcode) {
            errors.partcode = "select partcode";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!valiDate()) return;

        try {
            const payload = [
                {
                    ...formData,
                    createdby: userId,
                    updatedby: userId,
                }
            ];

            const response = await saveStockTransfer(payload); // ensure this posts JSON

            if (response?.status === 200 && response.data) {
                setSuccessMessage(response.data.message || "Saved successfully");
                setShowSuccessPopup(true);
                setFormData({ transfertype: "", orderType: "", partcode: "" });
            } else {
                setErrorMessage(response.data?.message || "Unknown error");
                setShowErrorPopup(true);
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || "Network error, please try again";
            setErrorMessage(errMsg);
            setShowErrorPopup(true);
        }
    };

const fetchAll = (page = 1, perPage = 10, search = "") => {
    if (search && search.trim() !== "") {
        // Uncomment when search API is ready
        // fetchStockSearch(page, perPage, search, setPutawayDetail, setTotalRows);
    } else {
        fetchStockAll(page, perPage);
    }
};

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
    
            fetchAll(page, perPage, debouncedSearch);
    
        }, [page, perPage, debouncedSearch]);
    

        const fetchStockAll = (page, size) => {
    fetchStockTransferAll(page, size)
        .then((response) => {
            if (response?.data?.content) {
                setStockTransferDetail(response.data.content); // use correct state setter
                setTotalRows(response.data.totalElements || 0);
            } else {
                console.warn("No content found in response:", response.data);
            }
        })
        .catch((error) => {
            console.error("Error fetching stock data:", error);
        });
};

    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Stock Transfer</p>
                </div>
                <StockTransferTextFile
                    formData={formData}
                    handleChange={handleChange}
                    formErrors={formErrors}
                    trnasferPrtcode={trnasferPrtcode}
                />
                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>
                    <button className='ComCssClearButton'  >Clear</button>
                </div>

            </div>
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Requested Tickets</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)} disabled={loading}>
                        {loading
                            ? downloadProgress !== null
                                ? `Downloading... ${downloadProgress}%`
                                : "Downloading..."
                            : downloadDone
                                ? "✅ Done"
                                : (
                                    <>
                                        <FaFileExcel /> Export
                                    </>
                                )}
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
                <StockTransferTable
                    data={stockTransferDetail}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}

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
        </div>)
}
export default StockTransfer