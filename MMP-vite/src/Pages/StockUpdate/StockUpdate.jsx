import React, { useState, useEffect, useRef } from 'react';
import StockTextFiled from "../../components/StockUpdate/StockTextFiled";
import StockUpdateTable from "../../components/StockUpdate/StockUpdateTable";

import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchRequesterDetail, fetchRequesterSearch } from "../../components/Requester/RequesterActions.js";
import { FaFileExcel, FaBars } from "react-icons/fa";
import { saveGRN } from '../../Services/Services_09.js';
import { checkAvailable, downloadRequester, downloadStockManualUpdate, fetchAvailableAndCompatabilityQty, fetchProductAndPartcode, fetchRequesterType, fetchStockTableData, fetchStockUpdatePartcode, fetchStockUpdatePartcodeDetails, saveRequester, saveStockEdit, saveStockUpdate } from '../../Services/Services-Rc.js';
import { ContactSupportOutlined } from '@mui/icons-material';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";


const StockUpdate = () => {
    const [formData, setFormData] = useState({
        Location: null,
        batchCode: null,
        partcode: null,
        avilabeQty: 0,
        comments: "",
        stockUpdateType: "",
        faultyQty: ""
    });
    const [requestType, setRequestType] = useState([])
    const [prtcodeDetailsList, setPrtcodeDetailsList] = useState([])
    const [stockTableDtata, setStockTableDtata] = useState([])
    const [partcodeList, setPrtcodeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [downloadDone, setDownloadDone] = useState(false);
    const [requesterDeatil, setRequesterDetail] = useState([]);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState("");
    const userId = sessionStorage.getItem("userId");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmit, setIsSubmit] = useState(true);

    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };

    const debouncedSearch = useDebounce(searchText, 500);


    useEffect(() => {

        fetchStockUpdatePartcode()
            .then(res => setPrtcodeList(res.data || []))
            .catch(err => console.error(err));
    }, []);


    const handleEdit = (row) => {
        setIsEditMode(true);
        setIsSubmit(false);
        setFormData({
            id: row.id,
            avilabeQty: row.availableQty,
            stockUpdateType: { label: row.stockUpdateType, value: row.stockUpdateType },
            partcode: { partcode: row.partcode },       // wrap string into object
            batchCode: { batchCode: row.batchcode },    // wrap string into object
            Location: { Location: row.location, avilabeQty: row.qty || 0 }, // wrap location with available qty
            faultyQty: row.qty || "",
            comments: row.comment || "",
            // avilabeQty: row.qty || 0
        });
    };

    useEffect(() => {
        fetchData(page, perPage, debouncedSearch);
    }, [page, perPage, debouncedSearch]);

    const fetchData = (page, size, search = "") => {
        setLoading(true);
        fetchStockTableData(page, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setStockTableDtata(response.data.content); // use correct state setter
                    // setTotalRows(response.data.totalElements || 0);
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching stock data:", error);
            }).finally(() => {
                setLoading(false);
            });
    };


    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        if (!formData.partcode?.partcode) return;

        console.log("Calling API for:", formData.partcode.partcode);

        fetchStockUpdatePartcodeDetails(formData.partcode.partcode)
            .then(res => setPrtcodeDetailsList(res.data || []))
            .catch(err => console.error("API Error:", err));
    }, [formData.partcode]);


    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.partcode) {
            errors.partcode = " Select partcode";
            isValid = false;
        }

        if (!formData.Location) {
            errors.Location = " Select Location";
            isValid = false;
        }
        if (!formData.batchCode) {
            errors.batchCode = " Select batchCode";
            isValid = false;
        }
        if (!formData.comments) {
            errors.comments = " Select comments";
            isValid = false;
        }
        if (!formData.stockUpdateType) {
            errors.stockUpdateType = " Select stockUpdateType";
            isValid = false;
        }

        if (!formData.faultyQty) {
            errors.faultyQty = " Enter Qty";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    };


    const handleSubmit = () => {
        if (!valiDate()) return;
        setLoading(true);
        const updatedFormData = [
            {
                partcode: formData.partcode?.partcode || formData.partcode,
                batchcode: formData.batchCode?.batchCode || formData.batchCode,
                location: formData.Location?.Location || formData.Location,
                qty: formData.faultyQty,
                stockUpdateType: formData.stockUpdateType?.value || formData.stockUpdateType,
                comment: formData.comments,
                created_by: userId,
            }
        ];

        saveStockUpdate(updatedFormData)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    formClear();
                    // console.log("formdata after submit", formData)
                    // if (typeof handleClear === "function") handleClear();
                } else {
                    setErrorMessage(response.data?.message);
                    setShowErrorPopup(true);

                }
            })
            .catch((error) => {
                const errMsg = error?.response?.data?.message;
                if (errMsg) {
                    setErrorMessage(errMsg);
                    setShowErrorPopup(true);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }


    const handleUpdate = () => {
        if (!valiDate()) return;

        const updatedFormData = [
            {
                partcode: formData.partcode?.partcode || formData.partcode,
                batchcode: formData.batchCode?.batchCode || formData.batchCode,
                location: formData.Location?.Location || formData.Location,
                qty: formData.faultyQty,
                stockUpdateType: formData.stockUpdateType?.value || formData.stockUpdateType,
                comment: formData.comments,
                id: formData.id,
                updated_by: userId,

            }
        ];
        setLoading(true);
        saveStockEdit(updatedFormData)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    formClear();
                    setIsEditMode(false);
                    // console.log("formdata after submit", formData)
                    // if (typeof handleClear === "function") handleClear();
                } else {
                    setErrorMessage(response.data?.message);
                    setShowErrorPopup(true);

                }
            })
            .catch((error) => {
                const errMsg = error?.response?.data?.message;
                if (errMsg) {
                    setErrorMessage(errMsg);
                    setShowErrorPopup(true);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }


    const formClear = () => {
        setFormErrors({});
        setIsEditMode(false);
        setIsSubmit(true);
        setFormData({
            Location: null,
            batchCode: null,
            partcode: null,
            avilabeQty: 0,
            comments: "",
            stockUpdateType: "",
            faultyQty: "",

        });
    }


    const exportToExcel = (search = "") => {
            const userId = sessionStorage.getItem("userName") || "System";
    
            setLoading(true);
    
           
    
             const apiCall = () => {
        if (search?.trim() !== "") {
            return downloadStockManualUpdate(search);
        } else {
            return downloadStockManualUpdate(""); // or another API for no search
        }
    };

           
            apiCall()
                .then(response => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "StockManual Update.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    // setDownloadDone(true);
                })
                .catch((error) => {
                    console.error("Download failed:", error);
                })
                .finally(() => {
                    setLoading(false);
                    setTimeout(() => setDownloadDone(false), 5000);
                });
        };
    
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Manual Stock Update</p>
                </div>
                <StockTextFiled
                    formData={formData}
                    handleChange={handleChange}
                    partcodeList={partcodeList}
                    prtcodeDetailsList={prtcodeDetailsList}
                    setErrorMessage={setErrorMessage}
                    setShowErrorPopup={setShowErrorPopup}
                    formErrors={formErrors}
                    isEditMode={isEditMode}
                // handlePutawayChange={handlePutawayChange}
                // poDropdownOptions={Array.isArray(putawayTicket) ? [...new Set(putawayTicket)] : []}
                />
                <div className="ComCssButton9">
                    {isSubmit &&
                        <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>

                    }
                    <button className='ComCssDeleteButton' onClick={formClear} >Cancel</button>
                    {isEditMode &&
                        <button className='ComCssSubmitButton' onClick={handleUpdate} >UpDate</button>
                    }
                </div>
            </div>
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Requested Tickets</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)} disabled={loading}>
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
                <LoadingOverlay loading={loading} />

                <StockUpdateTable
                    data={stockTableDtata}
                    page={page}
                    perPage={perPage}
                    totalRows={stockTableDtata.length}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                    onEdit={handleEdit}

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
        </div>

    )
}

export default StockUpdate