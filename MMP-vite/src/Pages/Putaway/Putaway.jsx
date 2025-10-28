import React, { useState, useEffect, useRef } from 'react';
import PutawayTextFiled from "../../components/Putaway/PutawayTextFiled";
import PutawayDefaultTable from "../../components/Putaway/PutawayDefaultTable";
import './Putaway.css';
import PutawayProcessTable from "../../components/Putaway/PutawayProcessTable";
import PutawayRetProcessTable from "../../components/Putaway/PutawayRetProcessTable";
import PutawayStockTransferTable from "../../components/Putaway/PutawayStockTransferTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchPutawayTicket, fetchPutawayDetail, fetchPutawayPendingDetail, fetchPutawayPartiallyDetail, fetchPutawayAllDetail, PutawayProcessDetail, PutawayReturningProcessDetail, fetchPutawayAllDetailSearch } from '../../components/Putaway/PutawayActions.js';
import { FaFileExcel, FaBars } from "react-icons/fa";
import { deletePutawayTicket, fetchTransferTicket, fetchTransferTicketDetail, putawayProcess, saveLEDRequest, savePutawayRequest, savePutawayRetRequest, savePutawayStockTransferRequest } from '../../Services/Services-Rc.js';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";

const Putaway = () => {
    const [formData, setFormData] = useState({
        RecevingTicketNo: "",
        ReturningTicket: ""
    });
    const [formPutPrecssData, setFormPutPrecssData] = useState({
        RecevingTicketNo: ""
    });
    const [putawayTicket, setPutawayTicket] = useState({});
    const [showMenu, setShowMenu] = useState(false);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [putawayDetail, setPutawayDetail] = useState([]);
    const [hiddenButton, setHiddenButton] = useState("");
    const [recevingPutProcess, setRecevingPutProcess] = useState(false);
    const [returningPutProcess, setReturningPutProcess] = useState(false);
    const [stockTransferPutProcess, setStockTransferPutProcess] = useState(false);
    const [putawayProcessDetail, setPutawayProcessDetail] = useState([])
    const menuRef = useRef(null);
    const [selectedRows1, setSelectedRows1] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isPutProcess, setIsPutProcess] = useState(false)
    const [isUserActive, setIsUserActive] = useState(false)
    const [pageClose, setPageClose] = useState(0);
    const [perPageClose, setPerPageClose] = useState(10);
    const [colourCode, setColourCode] = useState("")
    const [transferTicketNoList, setTransferTicketNoList] = useState([])
    const [showTable, setShowTable] = useState(false)
    const [submittedIds, setSubmittedIds] = useState([]); // track IDs only
    const [rackLocationList, setRackLocationList] = useState([]);
    // const handleGRNQtyChange = (rowId, field, value) => {
    //     setPutawayProcessDetail((prev) =>
    //         prev.map((item) =>
    //             item.selectedid === rowId ? { ...item, [field]: value } : item
    //         )
    //     );
    // };
    const handleGRNQtyChange = (rowId, field, value) => {
        setPutawayProcessDetail(prev =>
            prev.map(row =>
                row.selectedid === rowId ? { ...row, [field]: value } : row
            )
        );
    };

    const handlePutawayChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (field === "RecevingTicketNo") {
            const ticketNo = value ? value.split("-")[0] : "";
            if (onSelectPonumber) {
                onSelectPonumber(ticketNo);
                // console.log("ticketNo", ticketNo);
            }
        }
    };

    // const handleChange = (name, value) => {
    //     setFormData({ ...formData, [name]: value });
    // };
    const handleChange = (name, value) => {
        if (name === "RecevingTicketNo") {
            setFormData({
                ...formData,
                RecevingTicketNo: value || null,
                ReturningTicket: null,
                transferType: null,
                StockTransferTicketNo: null


            });
        } else if (name === "ReturningTicket") {
            setFormData({
                ...formData,
                ReturningTicket: value || null,
                RecevingTicketNo: null,
                transferType: null,
                StockTransferTicketNo: null
            });
        } else if (name === "transferType") {
            setFormData({
                ...formData,
                transferType: value || null,
                RecevingTicketNo: null,
                ReturningTicket: null,
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setShowTable(false);
    };


    useEffect(() => {
        setLoading(true)
        fetchPutawayTicket(setPutawayTicket);
    }, []);

    // useEffect(() => {
    //     fetchPutawayDetail(page, perPage, setPutawayDetail, setTotalRows);
    // }, [page, perPage]);

    const fetchPutawayPending = () => {
        // fetchPutawayPendingDetail(page, perPage, setPutawayDetail, setTotalRows)
        setHiddenButton("pending");
    }

    const fetchPutawayPartially = () => {
        // fetchPutawayPartiallyDetail(page, perPage, setPutawayDetail, setTotalRows)
        setHiddenButton("partial");
    }

    const fetchPutawayAll = async (page, perPage, search = "") => {

        setLoading(true); // start loader
        try {
            if (search && search.trim() !== "") {
                await fetchPutawayAllDetailSearch(page, perPage, search, setPutawayDetail, setTotalRows);
                setHiddenButton("All");
            } else {
                await fetchPutawayAllDetail(page, perPage, setPutawayDetail, setTotalRows);
            }
        } catch (err) {
            console.error("Error fetching putaway data:", err);
        } finally {
            setLoading(false); // stop loader after API finishes
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

    // useEffect(() => {
    //     fetchPutawayAll(page, perPage, debouncedSearch);
    // }, [page, perPage, debouncedSearch]);


    useEffect(() => {
        setLoading(true);
        setPutawayDetail([]); // clear old data

        switch (hiddenButton) {
            case "pending":
                fetchPutawayPendingDetail(page, perPage, (data) => {
                    setPutawayDetail(data);
                    setLoading(false);
                }, setTotalRows);
                break;
            case "partial":
                fetchPutawayPartiallyDetail(page, perPage, (data) => {
                    setPutawayDetail(data);
                    setLoading(false);
                }, setTotalRows);
                break;
            case "closed":
                fetchPutawayDetail(page, perPage, (data) => {
                    setPutawayDetail(data);
                    setLoading(false);
                }, setTotalRows);
                break;
            case "All":
            default:
                fetchPutawayAll(page, perPage, debouncedSearch)
                    .then(() => setLoading(false))
                    .catch(() => setLoading(false));
                break;
        }
    }, [page, perPage, debouncedSearch, hiddenButton]);

    // const fetchPutawayProcessDetail = (formData) => {
    //     return PutawayProcessDetail(formData, setPutawayProcessDetail, setTotalRows);
    // };

    // const fetchPutawayProcessDetail = (formData) => {
    //     return PutawayProcessDetail(formData, (data) => {
    //         const withIds = data.map((item, index) => ({
    //             ...item,
    //             selectedid: item.selectedid ?? item.id ?? index,
    //             setHiddenPutButton: !!item.user, // hide button if user exists
    //         }));
    //     setIsPutProcess(true);

    //         // 🔹 Derive color based on user (like LED logic)
    //         const users = withIds
    //             .map(item => item.user)
    //             .filter(u => u != null);
    //         const uniqueUsers = [...new Set(users)];

    //         // Example mapping: user 1 → green, 2 → blue, etc.
    //         let colour = null;
    //         if (uniqueUsers.length) {
    //             switch (uniqueUsers[0]) {
    //                 case 1: colour = "green"; break;
    //                 case 2: colour = "blue"; break;
    //                 case 3: colour = "red"; break;
    //                 case 4: colour = "yellow"; break;
    //                 default: colour = "green";
    //             }
    //                     setIsUserActive(true);

    //         }

    //         setColourCode(colour);

    //         setPutawayProcessDetail(withIds);
    //         setTotalRows(withIds.length);
    //     });
    // };

    const fetchPutawayProcessDetail = (formData) => {
        return PutawayProcessDetail(formData, (data) => {
            const withIds = data.map((item, index) => ({
                ...item,
                selectedid: item.selectedid ?? item.id ?? index,
                setHiddenPutButton: !!item.user, // hide button if user exists
            }));
            setIsPutProcess(true);
            // 🔹 Derive color based on user (like LED logic)
            const users = withIds
                .map(item => item.user)
                .filter(u => u !== null && u !== undefined);

            const uniqueUsers = [...new Set(users)];
            let colour = null; // ✅ restore variable
            if (uniqueUsers.length > 0) {
                switch (uniqueUsers[0]) {
                    case 1: colour = "green"; break;
                    case 2: colour = "blue"; break;
                    case 3: colour = "red"; break;
                    case 4: colour = "yellow"; break;
                    default: colour = "green";
                }
                setIsUserActive(true);
            } else {
                setIsUserActive(false); // 👈 ensure inactive when null
            }
            setColourCode(colour);
            setPutawayProcessDetail(withIds);
            setTotalRows(withIds.length);
        });
    };

    //Returning Process
    const fetchReturningProcessDetail = (formData) => {
        return PutawayReturningProcessDetail(formData, (data) => {
            const withIds = data.map((item, index) => ({
                ...item,
                selectedid: item.selectedid ?? item.id ?? index,
                setHiddenPutButton: !!item.user, // hide button if user exists
            }));
            setIsPutProcess(true);
            // 🔹 Derive color based on user (like LED logic)
            const users = withIds
                .map(item => item.user)
                .filter(u => u !== null && u !== undefined);
            const uniqueUsers = [...new Set(users)];
            let colour = null; // ✅ restore variable
            if (uniqueUsers.length > 0) {
                switch (uniqueUsers[0]) {
                    case 1: colour = "green"; break;
                    case 2: colour = "blue"; break;
                    case 3: colour = "red"; break;
                    case 4: colour = "yellow"; break;
                    default: colour = "green";
                }
                setIsUserActive(true);
            } else {
                setIsUserActive(false); // 👈 ensure inactive when null
            }
            setColourCode(colour);
            setPutawayProcessDetail(withIds);
            setTotalRows(withIds.length);
        });
    };

    const fetchStockTransferTicketNo = async (formData) => {
        try {
            const response = await fetchTransferTicket(formData);
            const list = Array.isArray(response?.data) ? response.data : [];
            setTransferTicketNoList(list);
            console.log("Fetched list:", list); console.log("setTransferTicketNoList", transferTicketNoList)
        } catch (error) {
            console.error("Error fetching transfer ticket numbers:", error);
            setTransferTicketNoList([]);
        }
    };
    // const fetchStockTransferTicketDetail = async (formData) => {
    //         try {
    //             const response = await fetchTransferTicketDetail(formData);

    //             setTransferTicketNoDetail(response);
    //             console.log("Fetched list:", list); console.log("setTransferTicketNoList", transferTicketNoList)
    //         } catch (error) {
    //             console.error("Error fetching transfer ticket numbers:", error);
    //             // setTransferTicketNoList([]);
    //         }
    //     };

    const fetchStockTransferProcess = async (ticketNo) => {
        try {
            const response = await fetchTransferTicketDetail(ticketNo); // API call
            console.log("API Response:", response);

            // Get transferDetails safely
            const data = Array.isArray(response?.transferDetails)
                ? response.transferDetails
                : Array.isArray(response?.data?.transferDetails)
                    ? response.data.transferDetails
                    : [];
            console.log("Fetched transferDetails:", data);

            if (data.length === 0) {
                setPutawayProcessDetail([]);
                setTotalRows(0);
                console.log("No data available");
                return;
            }

            // Add IDs and flags
            const withIds = data.map((item, index) => ({
                ...item,
                selectedid: item.selectedid ?? item.id ?? index,
                setHiddenPutButton: !!item.user,
            }));

            // Log the full processed data
            console.log("Processed Table Data (withIds):", withIds);

            // Log all Partcodes separately
            const location = Array.isArray(response?.rackLocationList)
                ? response.rackLocationList
                : Array.isArray(response?.data?.rackLocationList)
                    ? response.data.rackLocationList
                    : [];
            console.log("All Partcodes:", location);

            // Update states
            setPutawayProcessDetail(withIds);
            setTotalRows(withIds.length);
            setRackLocationList(location)
            // Process flags
            setIsPutProcess(true);
            setRecevingPutProcess(false);
            setReturningPutProcess(false);

            // Handle active users for color coding
            const users = withIds.map(i => i.user).filter(u => u != null && u !== "");
            const uniqueUsers = [...new Set(users)];
            let colour = null;
            if (uniqueUsers.length > 0) {
                switch (uniqueUsers[0]) {
                    case 1: colour = "green"; break;
                    case 2: colour = "blue"; break;
                    case 3: colour = "red"; break;
                    case 4: colour = "yellow"; break;
                    default: colour = "green";
                }
                setIsUserActive(true);
            } else {
                setIsUserActive(false);
            }
            setColourCode(colour);

        } catch (err) {
            console.error("Error fetching stock transfer detail:", err);
            setPutawayProcessDetail([]);
            setTotalRows(0);
        }
    };

    // useEffect(() => {
    //     if (formData?.RecevingTicketNo) {
    //         const ticketNo = formData.RecevingTicketNo.split("-")[0];
    //         fetchPutawayProcessDetail(ticketNo);
    //         setRecevingPutProcess(true);
    //         setReturningPutProcess(false);
    //     }
    //     else if (formData?.ReturningTicket) {
    //         const ticketNo = formData.ReturningTicket;
    //         fetchReturningProcessDetail(ticketNo);
    //         setRecevingPutProcess(false);
    //         setReturningPutProcess(true)
    //     }
    //     else if (formData?.transferType) {
    //         const stockTransferType = formData.transferType;
    //         fetchStockTransferTicketNo(stockTransferType);
    //         setRecevingPutProcess(false);
    //         setReturningPutProcess(false)
    //         // setStockTransferPutProcess(true)
    //     }
    // }, [formData?.RecevingTicketNo, formData?.ReturningTicket,formData?.transferType]);

    useEffect(() => {
        if (formData?.RecevingTicketNo) {
            const ticketNo = formData.RecevingTicketNo.split("-")[0];
            fetchPutawayProcessDetail(ticketNo);
            setRecevingPutProcess(true);
            setReturningPutProcess(false);
            setStockTransferPutProcess(false);
            setTransferTicketNoList([]);

        }
        else if (formData?.ReturningTicket) {
            const ticketNo = formData.ReturningTicket;
            fetchReturningProcessDetail(ticketNo);
            setRecevingPutProcess(false);
            setReturningPutProcess(true);
            setStockTransferPutProcess(false);
            setTransferTicketNoList([]);


        }
        else if (formData?.StockTransferTicketNo) {
            const transferTicketNo = formData.StockTransferTicketNo;
            fetchStockTransferProcess(transferTicketNo);
            setRecevingPutProcess(false);
            setReturningPutProcess(false);
            setStockTransferPutProcess(true);

        }
    }, [formData?.RecevingTicketNo, formData?.ReturningTicket, formData?.StockTransferTicketNo]);


    useEffect(() => {

        if (formData?.transferType) {
            const stockTransferType = formData.transferType;
            fetchStockTransferTicketNo(stockTransferType);

        }
    }, [formData?.transferType]);

    //     useEffect(() => {

    // }, [formData?.StockTransferTicketNo]);



    console.log("fromData", formData)
    console.log("putawayProcessDetail", putawayProcessDetail)
    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const valiDate = () => {
        const errors = {};
        let isValid = true;

        selectedRows1.forEach((id) => {
            const item = putawayProcessDetail.find((d) => d.selectedid === id);

            if (!item || item.putQty === undefined || item.putQty === "") {
                errors[`putQty${item?.selectedid}`] = "Enter putQty";
                isValid = false;
            } else if (item.putQty > item.GRNQty) {
                errors[`putQty${item.selectedid}`] = "Put Qty cannot exceed GRN Qty";
                isValid = false;
            }
        });
        setFormErrors(errors);
        return isValid;
    };


    const handlePut = (e) => {
        e.preventDefault();
        // if (!valiDate()) return;
        if (selectedRows1.length === 0) {
            setErrorMessage("Please select at least one row");
            setShowErrorPopup(true);
            return;
        }
        // Only new rows
        const newSelectedRows = selectedRows1.filter(
            id => !submittedIds.includes(id)
        );
        if (newSelectedRows.length === 0) {
            setErrorMessage("No new rows to submit");
            setShowErrorPopup(true);
            return;
        }
        const filteredData = putawayProcessDetail.filter((row) =>
            newSelectedRows.includes(row.selectedid)
        );
        let submitData = [];
        if (recevingPutProcess) {
            submitData = filteredData.map((row) => ({
                Location: row.location,
                Product_Qty: row.GRNQty,
                Product_Code: row.partcode,
                Product_Name: row.partdescription,
                ticketno: row.recevingTicketNo,
            }));
        } else if (returningPutProcess) {
            submitData = filteredData.map((row) => ({
                Location: row.location,
                Product_Qty: row.Approved_Qty,
                Product_Code: row.partcode,
                Product_Name: row.partdescription,
                ticketno: row.Rec_ticket_no, // corrected for returning
            }));
        }
        saveLEDRequest(submitData)
            .then((response) => {
                let colour = "";
                const match = response.data.message?.match(/following (\w+) light/);
                if (match) {
                    colour = match[1]; // "green", "blue", "red", "yellow"
                    setColourCode(colour);
                }
                setSubmittedIds(prev => [...prev, ...newSelectedRows]); // update submitted IDs
                handleSuccessCommon({
                    response,
                    setSuccessMessage,
                    setShowSuccessPopup,
                });
                setIsUserActive(true);

            })
            .catch((error) => {
                handleErrorCommon({
                    error,
                    setErrorMessage,
                    setShowErrorPopup,
                });
            });
    };



    const handleSubmituyuyt = (e) => {
        e.preventDefault();
        if (selectedRows1.length === 0) {
            setErrorMessage("Please select at least one row");
            setShowErrorPopup(true);
            return;
        }
        const username = sessionStorage.getItem("userName") || "System";
        const selectedKeys = new Set(selectedRows1);
        const filteredData = putawayProcessDetail.filter((row) => selectedKeys.has(row.selectedid));
        const submitData = [];
        filteredData.forEach((row) => {
            const putQtyDetails = row.putQtyDetails || {};
            Object.keys(putQtyDetails).forEach((loc) => {
                const qty = Number(putQtyDetails[loc] || 0);
                if (qty > 0) {
                    if (recevingPutProcess) {
                        submitData.push({
                            location: loc,
                            putqty: qty,
                            batchcode: row.rcbatchcode,
                            partcode: row.partcode,
                            recevingTicketNo: row.recevingTicketNo,
                            intsysid: row.id,
                            createdby: username,
                        });
                    } else if (returningPutProcess) {
                        submitData.push({
                            location: loc,
                            qty: qty,
                            batchcode: row.batchcode,
                            partcode: row.Partcode,
                            recevingTicketNo: row.Rec_ticket_no,
                            id: row.id,
                            createdby: username,
                        });
                    }
                }
            });
        });

        const apiCall = recevingPutProcess
            ? savePutawayRequest(submitData)
            : savePutawayRetRequest(submitData);

        apiCall
            .then((response) => {
                handleSuccessCommon({
                    response,
                    setSuccessMessage,
                    setShowSuccessPopup,
                });
                setIsPutProcess(false);
                setFormData({ RecevingTicketNo: "" });
                fetchPutawayTicket(setPutawayTicket);
                setSelectedRows1([]);
            })
            .catch((error) => {
                handleErrorCommon({
                    error,
                    setErrorMessage,
                    setShowErrorPopup,
                });
            });
    };

    /////////////////////
    const [locationQty, setLocationQty] = useState({});
    const [editingToLocation, setEditingToLocation] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRows1.length === 0) {
            setErrorMessage("Please select at least one row");
            setShowErrorPopup(true);
            return;
        }
        const username = sessionStorage.getItem("userName") || "System";
        const selectedKeys = new Set(selectedRows1);
        const filteredData = putawayProcessDetail.filter((row) => selectedKeys.has(row.selectedid));
        const submitData = [];
        let hasQty = false; // <- flag to check if any qty > 0

        filteredData.forEach((row) => {
            const putQtyDetails = row.putQtyDetails || {};
            Object.keys(putQtyDetails).forEach((loc) => {
                const qty = Number(putQtyDetails[loc] || 0);
                if (qty > 0) {
                    hasQty = true
                    if (recevingPutProcess) {
                        submitData.push({
                            location: loc,
                            putqty: qty,
                            batchcode: row.rcbatchcode,
                            partcode: row.partcode,
                            recevingTicketNo: row.recevingTicketNo,
                            intsysid: row.id,
                            createdby: username,
                        });
                    } else if (returningPutProcess) {
                        submitData.push({
                            location: loc,
                            qty: qty,
                            batchcode: row.batchcode,
                            partcode: row.Partcode,
                            recevingTicketNo: row.Rec_ticket_no,
                            id: row.id,
                            createdby: username,
                        });
                    }
                    else if (stockTransferPutProcess) {
                        filteredData.forEach((row) => {
                            const rowQtyDetails = row.putQtyDetails || {};
                            const rowToLocDetails = row.toLocationDetails || {};
                            (row.location || []).forEach((loc, idx) => {
                                if (submitData.some(d => d.id === row.id && d.batchcode === (row.batchcode || [])[idx])) return;
                                const batch = (row.batchcode || [])[idx] || "";
                                const qty = Number(rowQtyDetails[loc] || 0);
                                const toLoc = rowToLocDetails[loc] || "";

                                if (qty > 0 && toLoc) {
                                    submitData.push({
                                        editingToLocation: toLoc,
                                        qty: qty,
                                        batchcode: batch,
                                        partcode: row.Partcode,
                                        recevingTicketNo: row.Rec_ticket_no,
                                        id: row.id,
                                        createdby: username,
                                        location: loc,
                                        transferTicketNo: formData.StockTransferTicketNo

                                    });
                                }
                            });
                        });
                    }
                }
            });
        });
        if (!hasQty) {
            setErrorMessage("Please enter quantity for at least one location!");
            setShowErrorPopup(true)
            return;
        }

        const apiCall = recevingPutProcess
            ? savePutawayRequest(submitData)
            : returningPutProcess
                ? savePutawayRetRequest(submitData)
                : savePutawayStockTransferRequest(submitData);


        apiCall
            .then((response) => {
                handleSuccessCommon({
                    response,
                    setSuccessMessage,
                    setShowSuccessPopup,
                });
                setIsPutProcess(false);
                setFormData({ RecevingTicketNo: "" });
                fetchPutawayTicket(setPutawayTicket);
                setSelectedRows1([]);
            })
            .catch((error) => {
                handleErrorCommon({
                    error,
                    setErrorMessage,
                    setShowErrorPopup,
                });
            });
    };

    /////////////////////////////////

    const isPutButtonHidden = putawayProcessDetail.some(row => row.user); // true if any row has user

    const LightIndicator = ({ colour }) => {
        return <span className="blinking" style={{ backgroundColor: colour, color: colour }}></span>;
    };



     const handleDelete = async (ticketNo) => {
    if (!window.confirm(`Are you sure to delete ticket ${ticketNo}?`)) return;

    try {
      await deletePutawayTicket(ticketNo); // call Spring Boot API
      alert(`Ticket ${ticketNo} deleted successfully`);
      // Refresh table data after delete
      setData((prev) => prev.filter(row => row.recevingTicketNo !== ticketNo));
      setTotalRows((prev) => prev - 1);
    } catch (err) {
      console.error(err);
      alert('Failed to delete ticket');
    }
  };


    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Putaway</p>
                </div>
                <PutawayTextFiled
                    formData={formData}
                    handleChange={handleChange}
                    handlePutawayChange={handlePutawayChange}
                    poDropdownOptions={putawayTicket.ReceivingTicket_No}
                    returningOptions={putawayTicket.ReturningTicket_No}
                    transferTicketNoList={transferTicketNoList}
                />
            </div>
            {isPutProcess && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>
                        {recevingPutProcess && "Putaway Process"}
                        {returningPutProcess && "Putaway Returning Process"}
                        {stockTransferPutProcess && "Putaway Stock Transfer Process"}


                    </h5>
                    {
                        recevingPutProcess &&

                        <PutawayProcessTable
                            data={putawayProcessDetail}
                            // putawayProcessDetail={putawayProcessDetail}
                            page={page}
                            perPage={perPage}
                            totalRows={putawayProcessDetail.length}
                            loading={loading}
                            setPage={setPage}
                            setPerPage={setPerPage}
                            selectedRows1={selectedRows1}
                            formErrors={formErrors}
                            setSelectedRows1={setSelectedRows1}
                            setFormPutPrecssData={setFormPutPrecssData}
                            handleGRNQtyChange={handleGRNQtyChange}
                            setErrorMessage={setErrorMessage}
                            setShowErrorPopup={setShowErrorPopup} 
                        />
                    }
                    {returningPutProcess &&
                        <PutawayRetProcessTable
                            data={putawayProcessDetail}
                            // putawayProcessDetail={putawayProcessDetail}
                            page={page}
                            perPage={perPage}
                            totalRows={putawayProcessDetail.length}
                            loading={loading}
                            setPage={setPage}
                            setPerPage={setPerPage}
                            selectedRows1={selectedRows1}
                            formErrors={formErrors}
                            setSelectedRows1={setSelectedRows1}
                            setFormPutPrecssData={setFormPutPrecssData}
                            handleGRNQtyChange={handleGRNQtyChange}

                        />
                    }
                    {stockTransferPutProcess &&
                        <PutawayStockTransferTable
                            data={putawayProcessDetail}
                            // putawayProcessDetail={putawayProcessDetail}
                            page={page}
                            perPage={perPage}
                            totalRows={putawayProcessDetail.length}
                            loading={loading}
                            setPage={setPage}
                            setPerPage={setPerPage}
                            selectedRows1={selectedRows1}
                            formErrors={formErrors}
                            setSelectedRows1={setSelectedRows1}
                            setFormPutPrecssData={setFormPutPrecssData}
                            handleGRNQtyChange={handleGRNQtyChange}
                            rackLocationList={rackLocationList}

                        />
                    }
                    {isUserActive && (
                        <p>
                            <LightIndicator colour={colourCode} /> User {colourCode} is active
                        </p>
                    )}
                    <div className='ComCssButton9'>
                        {!isPutButtonHidden && (
                            <button className='ComCssSubmitButton' onClick={handlePut}>
                                PUT
                            </button>
                        )}
                        <button className='ComCssSubmitButton' onClick={handleSubmit}>
                            Submit
                        </button>
                    </div>
                    <h5 className='ComCssTableName'></h5>
                </div>
            )}
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>
                    {hiddenButton === "pending" && "Putaway pending Detail"}
                    {hiddenButton === "partial" && "Putaway Partial Detail"}
                    {hiddenButton === "closed" && "Putaway Closed Detail"}
                    {!hiddenButton && "Putaway Closed Detail"}
                    {hiddenButton === "All" && "Putaway All Detail"}

                </h5>


                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <div className="d-flex align-items-center gap-2 position-relative">

                        <button className="btn btn-light" onClick={() => setShowMenu(!showMenu)}>
                            <FaBars />
                        </button>

                        {showMenu && (
                            <div className="ComCssButtonMenu">
                                <button className='ComCssExportButton' onClick={() => setShowMenu(false)}>
                                    <FaFileExcel /> Export
                                </button>
                                {hiddenButton !== "pending" && (
                                    <button
                                        className='ComCssPendingButton'
                                        onClick={() => {
                                            fetchPutawayPending(page, perPage, setPutawayDetail, setTotalRows);
                                            setShowMenu(false);
                                        }}
                                    >
                                        Pending
                                    </button>
                                )}
                                {hiddenButton !== "partial" && (
                                    <button className='ComCssPariallButton' onClick={() => {
                                        fetchPutawayPartially(page, perPage, setPutawayDetail, setTotalRows);
                                        setShowMenu(false);
                                    }}>Partial</button>)}
                                {hiddenButton !== "closed" && (
                                    <button className='ComCssCloseButton' onClick={() => {
                                        fetchPutawayDetail(page, perPage, setPutawayDetail, setTotalRows);
                                        setShowMenu(false);
                                    }}>Closed</button>)}
                                {hiddenButton !== "All" && (
                                    <button className='ComCssAllButton' onClick={() => {
                                        fetchPutawayAll(page, perPage, searchText); // use current page & search
                                        setShowMenu(false);
                                    }}>All</button>)}
                            </div>
                        )}
                    </div>
                    <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
                        <input
                            type="text"
                            className="form-control"
                            style={{ height: "30px", paddingRight: "30px" }}
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {searchText && (
                            <span
                                onClick={() => setSearchText("")} style={{
                                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold"
                                }}
                            > ✖
                            </span>
                        )}
                    </div>
                </div>
                <LoadingOverlay loading={loading} />

                <PutawayDefaultTable
                    data={putawayDetail}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                          onDelete={handleDelete} // <-- pass function here

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
            {/* <CustomDialog
                open={confirmDelete}
                onClose={handleCancel}
                onConfirm={deleteRec}
                title="Confirm"
                message="Are you sure you want to delete this?"
                color="primary"
            /> */}
        </div>
    );
};

export default Putaway;
