import React, { useState, useEffect, useRef } from 'react';
import RequesterTextFiled from "../../components/Requester/RequesterTextFiled";
import RequesterAddTable from "../../components/Requester/RequesterAddTable";
import RequesterDefaultTable from "../../components/Requester/RequesterDefaultTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import {fetchRequesterDetail,fetchRequesterSearch  } from "../../components/Requester/RequesterActions.js";

import { FaFileExcel, FaBars } from "react-icons/fa";
import { saveGRN } from '../../Services/Services_09.js';
import { checkAvailable, downloadRequester,  fetchAvailableAndCompatabilityQty, fetchProductAndPartcode, fetchRequesterType,  saveRequester } from '../../Services/Services-Rc.js';
import { ContactSupportOutlined } from '@mui/icons-material';

const Requester = () => {
    const [formData, setFormData] = useState({
        requestFor: null,
        requesterType: "",
        orderType: null,
        productName: null,
        partCode: null,
        availableQty: "",
        partDescription: null,
        requestQty: "",
        compatibilityPartCode: "",
        faultySerialNumber: "",
        faultyUnitModuleSerialNo: "",
        requestercomments: "",
        compatibilityPartCode: "",
        faultySerialNumber: "",
        faultyUnitModuleSerialNo: ""

    });

    const [requestType, setRequestType] = useState([])
    const [requesterType, setRequesterType] = useState([])
    const [productandPartcode, setPproductandPartcode] = useState([])
    const [compatibilityData, setCompatibilityData] = useState([]);
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
    const [requesterDeatil, setRequesterDetail]=useState([]);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
        const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [downloadProgress, setDownloadProgress] = useState(null);


    const orderTypeOption = [
        { label: "Repair", value: "Repair" },
        { label: "Project", value: "Project" },
    ];
    const requestTypeOption = [
        { label: "Submodule", value: "Submodule" },
        { label: "others", value: "others" },
        { label: "ThermalGel", value: "ThermalGel" },
    ];

    const availbleqty = compatibilityData?.[0]?.Availbleqty ?? "0";
    const compAvailbleQty = compatibilityData?.[0]?.compatabilityQty ?? "0";
    console.log("availbleqtrtyy", availbleqty)

    const handleChange = (field, value) => {
        setFormData((prev) => {
            if (field === "requestFor" && value === "Material Request") {
                return {
                    ...prev,
                    requestFor: value,
                    orderType: "Repair",
                };
            } else if (field === "requestFor") {
                return { ...prev, requestFor: value, orderType: null };
            } else if (field === "productName") {
                return {
                    ...prev,
                    productName: value,
                    productGroup: value ? value.productgroup : "",   // clear if null
                    productFamily: value ? value.productfamily : "",// clear if null
                    partCode: "",          // clear part code
                    partDescription: "",   // clear part description
                    compatibilityPartCode: ""
                };
            }
            else if (field === "requestQty") {
                if (value === "") return { ...prev, requestQty: "" };
                if (!/^\d+$/.test(value)) return prev;

                const numValue = Number(value);

                // normalize both qtys
                const compQty = Number(compAvailbleQty) || 0;
                const availQty = Number(availbleqty) || 0;

                // priority: compQty > 0 ? compQty : availQty
                const maxQty = compQty > 0 ? compQty : availQty;

                if (numValue === 0 || numValue > maxQty) return prev;

                return { ...prev, requestQty: value };
            }


            console.log("field, value", field, value)
            return { ...prev, [field]: value };
        });
    };

    const compatability = (compatibilityData || [])
        .filter(item => item.compatabilityPartcode) // remove undefined
        .map(item => ({
            compatibilityPartCode: item.compatabilityPartcode,
            compatibilityAvailableQty: item.compatabilityQty
        }));

    console.log("compatabilitylengthRequester", compatability.length);

    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.requestFor) {
            errors.requestFor = "Please Select requestFor";
            isValid = false;
        }
        if (!formData.orderType) {
            errors.orderType = "Please Select orderType";
            isValid = false;
        }
        if (!formData.requesterType) {
            errors.requesterType = "Please Select requesterType";
            isValid = false;
        }
        if (!formData.productName) {
            errors.productName = "Please Select productName";
            isValid = false;
        }

        if (!formData.partCode) {
            errors.partCode = "Please Select partCode";
            isValid = false;
        }
        if (!formData.partCode?.partdescription) {
            errors.partDescription = "Please Select partDescription";
            isValid = false;
        }
        if (!formData.requestQty) {
            errors.requestQty = "Please Select requestQty";
            isValid = false;
        }
        //         if (formData.partCode) {
        //     if (formData.compatibilityAvailableQty) {
        //         if (!formData.requestQty) {
        //             errors.requestQty = "Please enter requestQty for compatibility part";
        //             isValid = false;
        //         }
        //     } else {
        //         if (!formData.requestQty) {
        //             errors.requestQty = "Please enter requestQty";
        //             isValid = false;
        //         }
        //     }
        // }

        if (!formData.requestercomments) {
            errors.requestercomments = "Please Select requestercomments";
            isValid = false;
        }
        if (compatability.length >= 1 && !formData.compatibilityPartCode) {
            errors.compatibilityPartCode = "Please Select compatibilityPartCode";
            isValid = false;
        }
        if (formData.requesterType === "Submodule" && !formData.faultySerialNumber) {
            errors.faultySerialNumber = "Please Select faultySerialNumber";
            isValid = false;
        }
        if (formData.requesterType === "Submodule" && !formData.faultyUnitModuleSerialNo) {
            errors.faultyUnitModuleSerialNo = "Please Select faultyUnitModuleSerialNo";
            isValid = false;
        }
        // if (!formData.Quantity) {
        //     errors.Quantity = "Please Enter Quantity";
        //     isValid = false;
        // }

        setFormErrors(errors);
        return isValid;
    };
    const userId = sessionStorage.getItem("userId");

    // console.log("requestType", requestType)
    // console.log("productandPartcode", productandPartcode)


    useEffect(() => {
        if (userId && userId.toLowerCase() !== "admin") {
            FetchrequetserType(userId);   // pass it here
        }
    }, [userId]);

    useEffect(() => {
        if (formData?.orderType) {
            fetchProductPartcode(userId, formData?.orderType?.value || formData?.orderType);
        }

    }, [userId, formData?.orderType])
    console.log("formData.partCode", formData.availableQty);
    useEffect(() => {
        if (formData?.partCode) {
            const partCodeValue = typeof formData.partCode === "object" ? formData.partCode.partcode : formData.partCode;
            fetchAvailableCompatability(partCodeValue)
        }
    }, [formData?.partCode]);

    //FetchRequesterType
    const FetchrequetserType = async (userId) => {
        try {
            const response = await fetchRequesterType(userId);
            const data = response.data;
            // console.log("Fetched Requester Types:", data)

            // data is an array, not a single object
            if (data.length > 0) {

                setRequestType(
                    data
                        .flatMap(item => item.requestType.split(",")) // split each string
                        .filter(v => v) // remove empty strings
                );
                // Split comma-separated values into array
                setRequesterType(
                    data
                        .flatMap(item => item.requesterType.split(",")) // split each string
                        .filter(v => v) // remove empty strings
                );
            }


            // console.log("Requester Types:", data);
        } catch (error) {
            console.error("Error fetching requester types:", error);
        }
    };



    //Fetchpartcode and productname 
    const fetchProductPartcode = async (userId, orderType) => {
        try {
            const response = await fetchProductAndPartcode(userId, orderType);
            const data = response.data;
            // console.log("Fetched Requester Types:", data)
            setPproductandPartcode(data)

            // console.log("Requester Types:", data);
        } catch (error) {
            console.error("Error fetching requester types:", error);
        }
    };


    //Fetch Available And CompatabilityQty
    const fetchAvailableCompatability = async (partCode) => {
        try {
            setLoading(true); // start loading
            setCompatibilityData([]);
            const response = await fetchAvailableAndCompatabilityQty(partCode);
            const data = response.data;
            if (!data || data.length === 0) {
                setErrorMessage("Dont have qty and Compatability Partcode");
                setShowErrorPopup(true);
            } else {
                setCompatibilityData(data);

                // optionally set availableQty if you want the first item's availableQty
                setFormData(prev => ({
                    ...prev,
                    availableQty: data[0]?.availableQty || 0,
                }));
            }

            // console.log("fetchAvailableAndCompatabilityQty", data.length);
        } catch (error) {
            console.error("Error fetching compatibility data:", error);
        } finally {
            setLoading(false); // stop loading
        }
    };

    const [check, setcheck] = useState(false);
    const checkAvilability = async (partcodeQtyMap) => {
        try {
            setLoading(true);
            const response = await checkAvailable(partcodeQtyMap);
            console.log("Availability response:", response.data);
            if (response.data?.success === false && response.data.insufficientParts?.length > 0) {
                // Extract all failing partCodes
                const partCodes = response.data.insufficientParts
                    .map(item => `${item.partCode} (${item.error})`) // include error message
                    .join(", "); // separate by comma

                setErrorMessage(partCodes);
                setShowErrorPopup(true);
            }
            setcheck(true);
            return true;
        } catch (error) {
            console.error("Error fetching availability:", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        if (!valiDate()) return;
        const currentPartCode = typeof formData.partCode === "object"
            ? formData.partCode.partcode || formData.partCode.label
            : formData.partCode;

        if (tableData.some(item => {
            const itemPartCode = typeof item.partCode === "object"
                ? item.partCode.partcode || item.partCode.label
                : item.partCode;
            return itemPartCode === currentPartCode;
        })) {
            setErrorMessage("Partcode Already Added");
            setShowErrorPopup(true);
            return;
        }



        setTableData(prev => [...prev, {
            ...formData,
            productName: formData.productName.productname,
            partCode: formData.partCode.partcode,
            partDescription: formData.partCode.partdescription
        }]);
        setIsFrozen(true);
        setFormData(prev => ({
            RecevingTicketNo: "",
            requestFor: formData.requestFor,
            requesterType: formData.requesterType,
            orderType: formData.orderType.value,
            productName: prev.productName,
            productGroup: prev.productGroup || prev.productName?.productgroup || "",
            productFamily: prev.productFamily || prev.productName?.productfamily || "",
            partCode: null,
            partDescription: null,
            requestQty: "",                // reset for new entry
            compatibilityPartCode: null,    // reset
            faultySerialNumber: "",       // reset
            faultyUnitModuleSerialNo: "",// reset
            requestercomments: "",
        }));

        setCompatibilityData([]);

        // setShowTable(true);
    }
    const formClear = () => {
        setFormData(prev => {
            console.log("isFrozen in formClear:", isFrozen);
            if (isFrozen == true) {
                // preserve frozen fields like productName and productGroup
                return {
                    requestFor: formData.requestFor,
                    requesterType: formData.requesterType,
                    orderType: formData.orderType,
                    productName: prev.productName,
                    productGroup: prev.productName?.productgroup || "",
                    productFamily: prev.productFamily || prev.productName?.productfamily || "",

                    partCode: null, partDescription: null, requestQty: "", compatibilityPartCode: "", faultySerialNumber: "",
                    faultyUnitModuleSerialNo: "", requestercomments: "",
                };
            } else {
                return {
                    requestFor: null, requesterType: "", orderType: null, productName: null, productGroup: "", partCode: null,
                    partDescription: null, requestQty: "", compatibilityPartCode: "", faultySerialNumber: "", faultyUnitModuleSerialNo: "", requestercomments: "",
                };
            }
        });

        setFormErrors({});
    };

    useEffect(() => {
        if (tableData.length > 0) {
            setShowTable(true);
        }
    }, [tableData]);

    useEffect(() => {
        fetchRequester();
    }, [page, perPage]);

    const cancelTableData = () => {
        setTableData([]);
        setShowTable(false);
        setIsFrozen(false);
        setFormData({
            requestFor: null, requesterType: "", orderType: null, productName: null,
            productGroup: "", partCode: null, partDescription: null, requestQty: "", compatibilityPartCode: "", faultySerialNumber: "", faultyUnitModuleSerialNo: "", requestercomments: "",
        })
    }


    //     const checkAvailable = (partcodeQtyMap) => {
    //   return axios.post(checkAvailableQty, partcodeQtyMap); // POST with body
    // };

    const handleSubmit = async () => {
        const partcodeQtyMap = tableData.map(item => {
            if (item.compatibilityPartCode) {
                return {
                    partCode: item.compatibilityPartCode,
                    requestQty: item.requestQty
                };
            } else {
                return {
                    partCode: item.partCode,
                    requestQty: item.requestQty
                };
            }
        });

        console.log("check:", check);

        const availability = await checkAvilability(partcodeQtyMap);
        console.log("availability result:", availability);
        const userName = sessionStorage.getItem("userName") || "System";

        if (availability === true) {
            let updatedFormData = {};
            updatedFormData = tableData.map((row) => ({
                ...row,
                createdby: userName,
                modifiedby: userName,
            }));

            saveRequester(updatedFormData)
                .then((response) => {
                    // console.log("RESPONSE:", response);
                    if (response.status === 200 && response.data) {
                        const { message } = response.data;
                        setSuccessMessage(message || "Saved successfully");
                        setShowSuccessPopup(true);
                        setTableData([]);
                        setShowTable(false);
                        setIsFrozen(false);
                        // if (typeof handleClear === "function") handleClear();
                    } else {
                        setErrorMessage(response.data?.message || "Unknown error");
                        setShowErrorPopup(true);
                        setTableData([]);
                        setShowTable(false);
                    }
                })
                .catch((error) => {
                    // console.log("ERROR:", error);
                    const errMsg = error?.response?.data?.message || "Network error, please try again";
                    setErrorMessage(errMsg);
                    setShowErrorPopup(true);
                });
        }
    };

 const fetchRequester = () => {
            const userId = sessionStorage.getItem("userName") || "System";

        fetchRequesterDetail(page, perPage,userId, setRequesterDetail, setTotalRows);
        // setHiddenButton("closed");
    }

     const fetchfindSearch = (page, size, search) => {
        // console.log("searchfetch", search);
            // setLoading(true)
                        const userId = sessionStorage.getItem("userName") || "System";
fetchRequesterSearch(page, userId, perPage, setRequesterDetail, search, setTotalRows);

        };

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
                fetchData(page, perPage, debouncedSearch);
            }, [page, perPage, debouncedSearch]);
        

 const fetchData = (page = 1, size = 10, search = "") => {
        // console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            fetchfindSearch(page, size, search);
        }
        // else if (isFilterActive) {
        //     fetchFilterResult();
        // }
        else {
            fetchRequester(page, size)
        }
    };
const exportToExcel = (search = "") => {
                const userId = sessionStorage.getItem("userName") || "System";

    setDownloadDone(false);
    setDownloadProgress(null);
    setLoading(true);

    let apiCall;

    if (search?.trim() !== "") {
               apiCall = () => downloadRequester(userId,search);
           }
 else {
            apiCall = () => downloadRequester(userId,search);
        }

    // Call apiCall without arguments, since it’s already a function returning a Promise
    apiCall()
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "LocalReport.xlsx");
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
            setTimeout(() => setDownloadDone(false), 5000);
        });
};

    

    console.log("search", searchText)
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Requester</p>
                </div>
                <RequesterTextFiled
                    formData={formData}
                    handleChange={handleChange}
                    orderTypeOption={orderTypeOption}
                    requestType={requestType}
                    requesterType={requesterType}
                    userId={userId}
                    requestTypeOption={requestTypeOption}
                    productandPartcode={productandPartcode}
                    compatibilityData={compatibilityData}
                    isFrozen={isFrozen}
                    formErrors={formErrors}
                // handlePutawayChange={handlePutawayChange}
                // poDropdownOptions={Array.isArray(putawayTicket) ? [...new Set(putawayTicket)] : []}
                />


                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleAdd} >ADD</button>
                    <button className='ComCssClearButton' onClick={formClear} >Clear</button>
                </div>
            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>

                    <RequesterAddTable
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
                        <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>
                        <button className='ComCssDeleteButton' onClick={cancelTableData} >Cancel</button>

                    </div>
                </div>
            )}

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
                <RequesterDefaultTable
                    data={requesterDeatil}
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
        </div>
    )

}

export default Requester