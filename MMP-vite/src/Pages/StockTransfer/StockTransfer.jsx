import React, { useState, useEffect, useRef } from 'react';
import StockTransferTextFile from "../../components/StockTransfer/StockTransferTextFile";
import StockTransferTable from "../../components/StockTransfer/StockTransferTable";
import StockRc_DHLAddTable from "../../components/StockTransfer/StockRc_DHLAddTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchRequesterDetail, fetchRequesterSearch } from "../../components/Requester/RequesterActions.js";

import { FaFileExcel, FaBars } from "react-icons/fa";
import { saveGRN } from '../../Services/Services_09.js';
import { checkAvailable, downloadRequester, downloadStockTransfer, fetchAvailableAndCompatabilityQty, fetchProductAndPartcode, fetchRequesterType, fetchRetPartcode, fetchStockTransferAll, fetchTransferPartcode, saveRequester, saveReturning, saveStockTransfer } from '../../Services/Services-Rc.js';
import { ContactSupportOutlined } from '@mui/icons-material';

const StockTransfer = () => {

    const [formData, setFormData] = useState({
        ordertype: "",
        partcode: "",
        inventory_box_no: "",
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
    const [page, setPage] = useState(0);
    const [downloadDone, setDownloadDone] = useState(false);
    const defaultBoxNumber = "MN-05-2025-378"; // initial default
    const [stockTransferDetail, setStockTransferDetail] = useState([]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (!formData.ordertype) return;

        fetchTransferPartcode(formData.ordertype)
            .then(res => setTrnasferPrtcode(res.data || []))
            .catch(err => console.error(err));
    }, [formData.ordertype]);

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
        if (formData.transfertype === 'DHL-RC') {
            if (!formData.trnasferQty) {
                errors.trnasferQty = "Enter Trnasfer Qty";
                isValid = false;
            }
        }
        if (formData.transfertype === 'DHL-RC') {
            if (!formData.comments) {
                errors.comments = "Enter comment";
                isValid = false;
            }
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
                fetchStockAll();
                setFormData({ transfertype: "", ordertype: "", partcode: "" });
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


    const handleAddSubmit = async () => {
        const userName = sessionStorage.getItem("userId") || "System";
        const updatedFormData = tableData.map(row => ({
            ...row,
            createdby: userName,
            modifiedby: userName,
        }));
        try {
            const response = await saveStockTransfer(updatedFormData);

            if (response?.status === 200 && response.data) {
                setSuccessMessage(response.data.message || "Saved successfully");
                setShowSuccessPopup(true);
                setFormData({ transfertype: "", ordertype: "", partcode: "" });
                fetchStockAll();
                setTableData([]); // clear table after save
                setShowTable(false);
            } else {
                setErrorMessage(response?.data?.message || "Unknown error");
                setShowErrorPopup(true);
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || "Network error, please try again";
            setErrorMessage(errMsg);
            setShowErrorPopup(true);
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
        fetchStockAll(page, perPage, debouncedSearch);
    }, [page, perPage, debouncedSearch]);


    const fetchStockAll = (page, size,search="") => {
        fetchStockTransferAll(page, size,search)
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

    const [inventory_box_no, setBoxNumber] = useState("MN-05-2025-378");

    const handleAdd = () => {
        if (!valiDate()) return;
        const currentPartCode = typeof formData.partcode === "object"
            ? formData.partcode.partcode || formData.partcode.label
            : formData.partcode;

        // Get actual boxNumber (from formData or default state)
        const currentBoxNumber = formData.inventory_box_no || inventory_box_no;

        // Check duplicates
        const isDuplicateInBox = tableData.some(item => {
            const itemPartCode = typeof item.partcode === "object"
                ? item.partcode.partcode || item.partcode.label
                : item.partcode;
            return item.boxNumber === currentBoxNumber && itemPartCode === currentPartCode;
        });

        if (isDuplicateInBox) {
            setErrorMessage(`Partcode "${currentPartCode}" already added in Box ${currentBoxNumber}`);
            setShowErrorPopup(true);
            return;
        }
        // Add new row
        const newRow = {
            ...formData,
            partcode: currentPartCode,      // store partcode as string
            inventory_box_no: currentBoxNumber,    // store correct box number
            _id: Date.now() + Math.random()
        };

        setTableData(prev => [...prev, newRow]);
        // Optional: clear partcode field after add
        setFormData(prev => ({ ...prev, partcode: "" }));
    };


    useEffect(() => {
        if (tableData.length > 0) {
            setShowTable(true);
        }
    }, [tableData]);


    const handleClear = () => {
        setFormData({
            ordertype: "",
            transfertype: "",
            partcode: "",
            trnasferQty: "",
            inventory_box_no: defaultBoxNumber, // must have boxNumber
            comments: "",
        })
    }
    const handleCancel = () => {
        setTableData([]);
        setShowTable(false)
    }



    const exportToExcel = (search = "") => {
                const userId = sessionStorage.getItem("userName") || "System";
        
                setLoading(true);
        
               
        
                 const apiCall = () => {
            if (search?.trim() !== "") {
                return downloadStockTransfer(search);
            } else {
                return downloadStockTransfer(""); // or another API for no search
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
                    <p>Stock Transfer</p>
                </div>
                <div className='ComCssButton9'>
                    {(formData.transfertype === 'RC-DHL') && (
                        <button
                            style={{ backgroundColor: 'orange', marginTop: "-50px" }}
                            onClick={() => {
                                // Check if current box has at least one partcode
                                const currentBox = inventory_box_no;
                                const hasPartInCurrentBox = tableData.some(item => item.inventory_box_no === currentBox);
                                if (!hasPartInCurrentBox) {
                                    setErrorMessage(`Add at least one partcode to Box ${currentBox} before creating a new box.`);
                                    setShowErrorPopup(true);
                                    return;
                                }
                                // Generate new box number
                                const parts = inventory_box_no.split("-");
                                const prefix = parts.slice(0, 3).join("-");
                                const number = parseInt(parts[3] || "0") + 1;
                                const newBoxNumber = `${prefix}-${number}`;
                                setBoxNumber(newBoxNumber);
                                handleChange("boxNumber", newBoxNumber); // sync formData
                            }}> AddBox
                        </button>
                    )}

                </div>
                <StockTransferTextFile
                    formData={formData}
                    handleChange={handleChange}
                    formErrors={formErrors}
                    trnasferPrtcode={trnasferPrtcode}
                    inventory_box_no={inventory_box_no}
                />

                <div className="ReworkerButton9">
                    {(formData.transfertype === 'RC-DHL') && (<button className='ComCssSubmitButton' onClick={handleAdd} >ADD</button>)}
                    {(formData.transfertype !== 'RC-DHL') && (<button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>)}
                    <button className='ComCssClearButton' onClick={handleClear} >Clear</button>
                </div>

            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>
                    <StockRc_DHLAddTable
                        data={tableData}
                        page={page}
                        perPage={perPage}
                        totalRows={tableData.length}
                        loading={false}
                        setPage={setPage}
                        setShowTable={setShowTable}
                        setPerPage={setPerPage}
                        setFormData={setFormData}
                        setIsFrozen={setIsFrozen}
                        setTableData={setTableData}
                    />
                    <div className="ComCssButton9">
                        <button className='ComCssSubmitButton' onClick={handleAddSubmit} >Submit</button>
                        <button className='ComCssDeleteButton' onClick={handleCancel}  >Cancel</button>
                    </div>
                </div>
            )}
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