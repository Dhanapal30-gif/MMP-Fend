import React, { useState, useEffect, useRef } from 'react';
import IssuanceTextFiled from "../../components/Issuance/IssuanceTextFiled";
import IssuanceShowTable from "../../components/Issuance/IssuanceShowTable";
import IssuanceTable from "../../components/Issuance/IssuanceTable";
import { downloadIssuance, downloadPTLIssuance, fetchIssueTicketList, fetchpickTicketDetails, getIssuanceData, getPTLIssuanceData, saveDeliver, saveIssue, saveLEDRequest } from '../../Services/Services-Rc';
import ApproverTable from "../../components/Approver/ApproverTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { savePtlDeliver, savePtlIssue } from '../../Services/Services_09';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { FaFileExcel, FaBars } from "react-icons/fa";

const Issuance = () => {

    const [formData, setFormData] = useState({
        approverL1TicketL1: "",
        requestedTicket: "",
        deliverTicket: "",
        Comments: "",
        issueTicket: "",
        newSerialNumber: ""
    });


    const [requestTicketList, setRequestedTicketList] = useState([]);
    const [deliverTicketList, setDeliverTicketList] = useState([]);
    const [issueTicketList, setIssueTicketList] = useState([]);
    const [pickTicketData, setPickTicketData] = useState([]);
    const [ptlTicketList, setPtlTicketList] = useState([]);
    const [ptlDeliveryTicketList, setPtlDeliveryTicketList] = useState([]);
    const [ptlIssueTicketList, setPtlIssueTicketList] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [selectedGrnRows, setSelectedGrnRows] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isUserActive, setIsUserActive] = useState(false)
    const [colourCode, setColourCode] = useState("")
    const [hidePutButton, setHidePutButton] = useState(false)
    const [hideDeliverButton, setHideDeliverButton] = useState(false)
    const [hideIssueButton, setHideIssueButton] = useState(false)
    const [loading, setLoading] = useState(false);
    const [hiddenButton, setHiddenButton] = useState("");
    const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [addSearchText, setAddSearchText] = useState("");
    const [filteredAddData, setFilteredAddData] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [activeTicketType, setActiveTicketType] = useState("DTL"); // default



    const buildTicketNo = (type, value) => {
        if (!value) return "";
        return `${type}-${value}`;
    };
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (
            (field === "requestedTicket" ||
                field === "deliverTicket" ||
                field === "issueTicket") &&
            !value
        ) {
            setShowTable(false);
            setPickTicketData([]);
            return;
        }
        if (field === "category" && value) {
            fetchRequestedTickets(value);
        }

        if (field === "requestedTicket" && value) {
            // console.log("value", field)
            setActiveTable("requestedTicket");
            //  fetchPickTicketDetail(`pickTicketNo-${value}`);
            const ticket = buildTicketNo("pickTicketNo", value);
            fetchPickTicketDetail(ticket);
            // fetchPickTicketDetail(value);
            setTableData([]);
            setShowTable(false)
            setHideDeliverButton(false);
            setHideIssueButton(false)
        }
        if (field === "deliverTicket" && value) {
            // console.log("value", field)
            setActiveTable("deliverTicket");
            // fetchPickTicketDetail(`deliverTicketNo-${value}`);

            const ticket = buildTicketNo("deliverTicketNo", value);
            fetchPickTicketDetail(ticket);

            // fetchPickTicketDetail(value);
            setTableData([]);
            setShowTable(false)
            setHideDeliverButton(true);
            setHideIssueButton(false)
        }
        if (field === "issueTicket" && value) {
            setActiveTable("issueTicket");
            // fetchPickTicketDetail(`issueTicketNo-${value}`);
            const ticket = buildTicketNo("issueTicketNo", value);
            fetchPickTicketDetail(ticket);
            // fetchPickTicketDetail(value);
            setTableData([]);
            setShowTable(false)
            setHideIssueButton(true);
            setHideDeliverButton(false)
        }
        //         if (field === "requestedTicket") setActiveTable("requestedTicket");
        // if (field === "deliverTicket") setActiveTable("deliverTicket");
        // if (field === "issueTicket") setActiveTable("issueTicket");

    };
    const fetchPutawayPending = () => {
        setPage(0); // reset to first page
        setTotalRows(0);
        setHiddenButton("pending");
    }
    const fetchPutawayClose = () => {
        setPage(0); // reset to first page
        setTotalRows(0);
        setHiddenButton("closed");
        setDonwloadCosed(true);
    }
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const fetchRequestedTickets = async (category) => {

        try {
            const response = await fetchIssueTicketList(category);
            const data = response.data;
            // console.log("Approver Types:", response.data);
            setRequestedTicketList(response.data.requestedTicketList || []);
            setDeliverTicketList(response.data.deliverTicketList || []);
            setIssueTicketList(response.data.issueTicketList || []);
            setPtlTicketList(response.data.ptlTicketList || []);
            setPtlDeliveryTicketList(response.data.ptlDeliveryTicketList || []);
            setPtlIssueTicketList(response.data.ptlIssueTicketList || []);
        } catch (error) {
            console.error("Error fetching requester types:", error);
        }

    };

    const handleGRNQtyChange = (rowId, field, value) => {
        setPickTicketData((prev) =>
            prev.map((item) =>
                item.selectedid === rowId ? { ...item, [field]: value } : item
            )
        );
    };
    const fetchPickTicketDetail = async (ticketNo) => {
        setLoading(true);
        if (!ticketNo) return;

        try {
            const response = await fetchpickTicketDetails(ticketNo);
            const data = response.data;
            // console.log("Pick ticket details:", data);
            setPickTicketData(data || []);
            // set state here if needed
            setShowTable(true);
            setHidePutButton(true);
            const users = data
                .map(item => item.LEDUserId)
                .filter(u => u != null);
            const uniqueUsers = [...new Set(users)];

            // Example mapping: user 1 → green, 2 → blue, etc.
            let colour = null;
            if (uniqueUsers.length && uniqueUsers[0] !== 0) {
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

            // console.log("setisUserActiveFetch", isUserActive)
            // console.log("setColourCodeFetch", colourCode)

        } catch (error) {
            console.error("Error fetching requester types:", error);
        }
        finally {
            setLoading(false); // <-- make sure loading is turned off
        }
    };

    const tableTitleMap = {
        requestedTicket: "Pick List",
        deliverTicket: "Delivery List",
        issueTicket: "Issue List",
        pickResponse: "Delivery List"

    };
    const getTableTitle = () => tableTitleMap[activeTable] || "";

    const [activeTable, setActiveTable] = useState("");

    // const getTableTitle = () => {
    //   if (formData.issueTicket) return tableTitleMap.issueTicket;
    //   if (formData.deliverTicket) return tableTitleMap.deliverTicket;
    //   if (formData.requestedTicket) return tableTitleMap.requestedTicket;
    //   return "";
    // };
    const handlePut = (e) => {
        e.preventDefault();
        setLoading(true);
        let ticketno = pickTicketData[0]?.rec_ticket_no; // ✅ assign from first row
        const submitData = pickTicketData.flatMap(row => {

            if (row.batches && row.batches.length > 0) {
                return row.batches.map(bq => ({
                    Location: bq.location,
                    Product_Qty: bq.allocatedQty,
                    Product_Code: row.partcode,
                    Product_Name: row.partdescription,
                    ticketno: row.rec_ticket_no,
                    savePickIssuance: "issuance"
                }));
            }
            return [{
                Location: null,                // no batch → null
                Product_Qty: null,             // no batch → null
                Product_Code: row.partcode,
                Product_Name: row.partdescription,
                ticketno: row.rec_ticket_no,
                savePickIssuance: "issuance"
            }];
        });
        saveLEDRequest(submitData)
            .then((response) => {
                const match = response.data.message?.match(/following (\w+) light/);
                if (match) {
                    const colour = match[1]; // green, blue, etc.
                    setColourCode(colour);
                    setIsUserActive(true); // set here
                    if (ticketno?.startsWith("PTL")) {
                        fetchRequestedTickets("PTL");
                    } else {
                        fetchRequestedTickets("DTL");
                    }
                    setActiveTable("pickResponse");
                    setHideDeliverButton(true)
                    setHidePutButton(false)
                    setSuccessMessage(response.data.message)
                    setShowSuccessPopup(true)
                    // isPutButtonHidden(false)
                } else {
                    if (ticketno?.startsWith("PTL")) {
                        fetchRequestedTickets("PTL");
                    } else {
                        fetchRequestedTickets("DTL");
                    }
                    const ticketNoSubmitted = submitData[0].ticketno;

                    setFormData(prev => ({ ...prev, deliverTicket: ticketNoSubmitted }));

                    setIsUserActive(false);
                    setHideDeliverButton(true)
                    setHidePutButton(false)
                    setSuccessMessage(response.data.message)
                    setShowSuccessPopup(true)
                }
            })

            .catch((error) => {
                // alert(error.response?.data?.message || "Something went wrong!");
                setErrorMessage(error.response?.data?.message || "Something went wrong!");
                setShowErrorPopup(true);
            }).finally(() => {
                setLoading(false);
            });
    };

    const isPutButtonHidden = pickTicketData.some(row => row.LEDUserId); // true if any row has user
    const LightIndicator = ({ colour }) => {
        return <span className="blinking" style={{ backgroundColor: colour, color: colour }}></span>;
    };


    //     const handleDliver = (e) => {
    //         e.preventDefault();

    //         const submitData = pickTicketData.flatMap(row => {
    //             if (row.batchesQty && row.batchesQty.length > 0) {
    //                 return row.batchesQty.map(bq => ({ recTicketNo: row.rec_ticket_no }));
    //             }
    //             return [{ recTicketNo: row.rec_ticket_no }];
    //         });
    //         if(recTicketNo.startswith("PTL")){
    // savePtlDeliver(submitData)
    //         }else{
    //         saveDeliver(submitData)
    //         }
    //             .then((response) => {
    //                 alert(response.data.message)
    //                 const match = response.data.message;
    //                 fetchRequestedTickets("DTL")
    //                 setHideDeliverButton(false)
    //                 setHidePutButton(false)
    //                 setHideIssueButton(true)

    //             })
    //             .catch((error) => {
    //                 alert(error.response?.data?.message || "Something went wrong!");

    //             });
    //     };

    const handleDliver = (e) => {
        e.preventDefault();
        // console.log("deliver clicked");
        let ticketno;
        // Check all rows have qty entered
        const allRowsHaveQty = pickTicketData.every(row => {
            if (!row.batchesQty || row.batchesQty.length === 0) return false;
            return true;
            //  return row.batchesQty.every(bq => Number(bq.qty || 0) > 0);
        });

        // console.log("pickTicketData", pickTicketData);

        //    const allRowsHaveQty = pickTicketData.length > 0 &&
        // pickTicketData.every((row, rowIndex) => {
        //     return row.batchesQty.every((bq, batchIndex) => {
        //         const valid = bq.savedQty !== null &&
        //                       bq.savedQty !== "" &&
        //                       !isNaN(bq.savedQty) &&
        //                       Number(bq.savedQty) > 0;
        //         if (!valid) {
        //             console.log("Invalid qty at row", rowIndex, "batch", batchIndex, bq);
        //         }
        //         return valid;
        //     });
        // });


        if (!allRowsHaveQty) {
            setErrorMessage("Please enter quantity for all rows before delivering!");
            setShowErrorPopup(true);
            return;
        }

        const submitData = pickTicketData.flatMap(row => {
            if (row.batchesQty && row.batchesQty.length > 0) {
                return row.batchesQty.map(bq => ({ recTicketNo: row.rec_ticket_no, productName: row.productname }));
            }
            ticketno = row.rec_ticket_no;
            return [{ recTicketNo: row.rec_ticket_no }];
        });

        ticketno = pickTicketData[0]?.rec_ticket_no;

        setLoading(true);
        if (ticketno && ticketno.startsWith("PTL")) {
            savePtlDeliver(submitData)
                .then((response) => {
                    // alert(response.data.message);
                    setSuccessMessage(response.data.message);
                    setShowSuccessPopup(true)
                    fetchRequestedTickets("PTL");
                    setHideDeliverButton(false);
                    setHidePutButton(false);
                    setHideIssueButton(true);
                })
                .catch((error) => {
                    alert(error.response?.data?.message || "Something went wrong!");
                });
        } else {
            saveDeliver(submitData)
                .then((response) => {
                    // alert(response.data.message);
                    setSuccessMessage(response.data.message)
                    setShowSuccessPopup(true)
                    fetchRequestedTickets("DTL");
                    setHideDeliverButton(false);
                    setHidePutButton(false);
                    setHideIssueButton(true);

                    const ticketNoSubmitted = submitData[0].recTicketNo;

                    setFormData(prev => ({ ...prev, issueTicket: ticketNoSubmitted }));

                })
                .catch((error) => {
                    alert(error.response?.data?.message || "Something went wrong!");
                }).finally(() => {
                    setLoading(false); // <-- fixed .finally usage
                });
        }
    };

    // const handleIssue = (e) => {
    //     e.preventDefault();
    //     let recTicketNo;
    //     const submitData = pickTicketData.flatMap(row => {
    //         if (row.batchesQty && row.batchesQty.length > 0) {
    //             return row.batchesQty.map(bq => ({ recTicketNo: row.rec_ticket_no }));
    //         }
    //         recTicketNo = row.rec_ticket_no;
    //         return [{ recTicketNo: row.rec_ticket_no }];
    //     });

    //     if (recTicketNo && recTicketNo.startsWith("PTL")) {
    //         savePtlIssue(submitData)
    //             .then((response) => {
    //                 // alert(response.data.message);
    //                 setSuccessMessage(response.data.message);
    //                 setShowSuccessPopup(true)
    //                 fetchRequestedTickets("PTL");
    //                 setHideDeliverButton(false);
    //                 setHidePutButton(false);
    //                 setHideIssueButton(true);
    //                 setPickTicketData([]);
    //                 setShowTable(false);

    //             })
    //             .catch((error) => {
    //                 alert(error.response?.data?.message || "Something went wrong!");
    //             });
    //     } else {
    //         const submitDataWithExtras = submitData.map(item => ({
    //             ...item,
    //             nsn: formData.newSerialNumber,
    //             issued_comments: formData.Comments
    //         }));
    //         saveIssue(submitDataWithExtras)
    //             .then((response) => {
    //                 // alert(response.data.message);
    //                 setSuccessMessage(response.data.message);
    //                 setShowSuccessPopup(true);
    //                 fetchRequestedTickets("DTL");
    //                 setHideDeliverButton(false);
    //                 setHidePutButton(false);
    //                 setHideIssueButton(true);
    //                 setPickTicketData([]);
    //                 setShowTable(false);
    //                 w
    //             })
    //             .catch((error) => {
    //                 alert(error.response?.data?.message || "Something went wrong!");
    //             });
    //     }
    // };


    const handleIssue = (e) => {
        e.preventDefault();
        setLoading(true);
        let recTicketNo;
        const submitData = pickTicketData.flatMap(row => {
            if (row.batchesQty && row.batchesQty.length > 0) {
                return row.batchesQty.map(bq => ({
                    recTicketNo: row.rec_ticket_no,
                    partcode: row.partcode,
                    batchCode: bq.batchCode,
                    issue_qty: bq.savedQty,
                    location: bq.location
                }));
            }
            recTicketNo = row.rec_ticket_no;
            return [{
                recTicketNo: row.rec_ticket_no,
                partcode: row.partcode    
            }];
        });

        recTicketNo = pickTicketData[0]?.rec_ticket_no;
        
        // console.log("recTicketNo", recTicketNo);
        // console.log("recTicketNo", recTicketNo);
        if (recTicketNo && recTicketNo.startsWith("PTL")) {
            savePtlIssue(submitData)
                .then((response) => {
                    setSuccessMessage(response.data.message);
                    setShowSuccessPopup(true);
                    fetchRequestedTickets("PTL");
                    setHideDeliverButton(false);
                    setHidePutButton(false);
                    setHideIssueButton(true);
                    setPickTicketData([]);
                    setShowTable(false);
                    fetchData();
                })
                .catch((error) => {
                    alert(error.response?.data?.message || "Something went wrong!");
                });
        } else {
            const submitDataWithExtras = submitData.map(item => ({
                ...item,
                nsn: formData.newSerialNumber,
                issued_comments: formData.Comments
            }));
            saveIssue(submitDataWithExtras)
                .then((response) => {
                    setSuccessMessage(response.data.message);
                    setShowSuccessPopup(true);
                    fetchRequestedTickets("DTL");
                    setHideDeliverButton(false);
                    setHidePutButton(false);
                    setHideIssueButton(true);
                    setPickTicketData([]);
                    setShowTable(false);
                    fetchData();
                })
                .catch((error) => {
                    alert(error.response?.data?.message || "Something went wrong!");
                }).finally(() => {
                    setLoading(false); // <-- fixed .finally usage
                });
        }
    };


    // const useDebounce = (value, delay) => {
    //     const [debouncedValue, setDebouncedValue] = useState(value);
    //     useEffect(() => {
    //         const handler = setTimeout(() => setDebouncedValue(value), delay);
    //         return () => clearTimeout(handler);
    //     }, [value, delay]);
    //     return debouncedValue;
    // };

    // const debouncedSearch = useDebounce(searchText, 500);
    // useEffect(() => {
    //     fetchIssueData(page, perPage, debouncedSearch);
    // }, [page, perPage, debouncedSearch]);

    //  const fetchIssueData = async (page, perPage , search = "") => {
    //     setLoading(true); // start loader
    //     try {
    //             await fetchfindSearch(page, perPage, search);
    //     } catch (err) {
    //         console.error("Error fetching putaway data:", err);
    //     } finally {
    //         setLoading(false); // stop loader after API finishes
    //     }
    // };

    const [issuanceData, setIssuanceData] = useState();

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
    //     fetchData(page, perPage, debouncedSearch);
    //     setHiddenButton("PTL")
    // }, [page, perPage, debouncedSearch]);

    useEffect(() => {
    if (activeTicketType === "DTL") {
        fetchData(page, perPage, debouncedSearch);
    } else if (activeTicketType === "PTL") {
        fetchptlData(page, perPage, debouncedSearch);
    }
}, [page, perPage, debouncedSearch, activeTicketType]);


    const fetchData = (page = 0, size = 10, search = "") => {
        setLoading(true);
        getIssuanceData(page, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setIssuanceData(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };


    const fetchptlData = (page = 0, size = 10, search = "") => {
        setLoading(true);
        getPTLIssuanceData(page, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setIssuanceData(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                    setHiddenButton("PTL")
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };

    useEffect(() => {
        if (!addSearchText) {
            setFilteredAddData(pickTicketData);
        } else {
            const lower = addSearchText.toLowerCase();

            const result = pickTicketData.filter((row) =>
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(lower)
                )
            );

            setFilteredAddData(result);
        }
    }, [addSearchText, pickTicketData]);

    const exportToExcel = (search = "") => {
        const userId = sessionStorage.getItem("userName") || "System";

        // setDownloadDone(false);
        // setDownloadProgress(null);
        setLoading(true);

        let apiCall;

        // apiCall = () => downloadIssuance(search);

         apiCall =
        activeTicketType === "DTL"
            ? () => downloadIssuance(search)
            : () => downloadPTLIssuance(search);
        // Call apiCall without arguments, since it’s already a function returning a Promise
        apiCall()
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "IssuanceReport.xlsx");
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
                // setTimeout(() => setDownloadDone(false), 5000);
            });
    };


    const getCurrentTicketNo = () => {
        if (activeTable === "issueTicket" && formData.issueTicket)
            return `issueTicketNo-${formData.issueTicket}`;
        if (activeTable === "deliverTicket" && formData.deliverTicket)
            return `deliverTicketNo-${formData.deliverTicket}`;
        if (activeTable === "requestedTicket" && formData.requestedTicket)
            return `pickTicketNo-${formData.requestedTicket}`;
        return "";
    };


    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Issuance</p>
                </div>
                <IssuanceTextFiled
                    formData={formData}
                    handleChange={handleChange}
                    requestTicketList={requestTicketList}
                    deliverTicketList={deliverTicketList}
                    issueTicketList={issueTicketList}
                    pickTicketData={pickTicketData}
                    ptlTicketList={ptlTicketList}
                    ptlDeliveryTicketList={ptlDeliveryTicketList}
                    ptlIssueTicketList={ptlIssueTicketList}
                />

            </div>
            {showTable && (
                <div className='ComCssTable'>
                    {/* <h5 className='ComCssTableName'>Issue List</h5> */}
                    <h5 className='ComCssTableName'>{getTableTitle()}</h5>

                    <div
                        className="d-flex justify-content-end align-items-center mb-3"
                        style={{ marginTop: "9px", display: "flex" }}>
                        <div style={{ position: "relative", width: "200px" }}>
                            <input
                                type="text" className="form-control" style={{ height: "30px", paddingRight: "30px" }}
                                placeholder="Search..." value={addSearchText}
                                onChange={(e) => setAddSearchText(e.target.value)}
                            />
                            {searchText && (
                                <span onClick={() => setAddSearchText("")}
                                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold", }}> ✖
                                </span>
                            )}
                        </div>
                    </div>
                    <IssuanceShowTable
                        data={filteredAddData}
                        page={page}
                        perPage={perPage}
                        totalRows={tableData.length}
                        // loading={false}
                        loading={loading}
                        setPage={setPage}
                        setShowTable={setShowTable}
                        setPerPage={setPerPage}
                        setFormData={setFormData}
                        formData={formData}
                        setTableData={setTableData}
                        handleGRNQtyChange={handleGRNQtyChange}
                        setSuccessMessage={setSuccessMessage}
                        setShowSuccessPopup={setShowSuccessPopup}
                        setShowErrorPopup={setShowErrorPopup}
                        setLoading={setLoading}
                        setErrorMessage={setErrorMessage}
                        formErrors={formErrors}
                        fetchPickTicketDetail={fetchPickTicketDetail}
                        // ticketNo={formData.issueTicket || formData.deliverTicket || formData.requestedTicket}
                        ticketNo={
                            activeTable === "issueTicket"
                                ? `issueTicketNo-${formData.issueTicket}`
                                : activeTable === "deliverTicket"
                                    ? `deliverTicketNo-${formData.deliverTicket}`
                                    : `pickTicketNo-${formData.requestedTicket}`
                        }

                    //    ticketNo={getCurrentTicketNo()}

                    />
                    {isUserActive && (
                        <p>
                            <LightIndicator colour={colourCode} /> User {colourCode} is active
                        </p>
                    )}
                    <div className="ComCssButton9">
                        {hidePutButton && !isPutButtonHidden && (
                            <button className='ComCssSubmitButton' onClick={handlePut} >Pick</button>
                        )}
                        {hideDeliverButton && (
                            <button className='ComCssSubmitButton' onClick={handleDliver} >Deliver</button>
                        )}
                        {/* <button className='ComCssSubmitButton' onClick={handleDliver} >Deliver</button> */}

                        {hideIssueButton && (
                            <button className='ComCssSubmitButton' onClick={handleIssue} >Issue</button>
                        )}
                            {/* <button className='ComCssSubmitButton' onClick={handleIssue} >Reject</button> */}

                    </div>
                </div>
            )}
            <div className='ComCssTable'>
                {/* <h5 className='ComCssTableName'>Issued Tickets</h5> */}
                
                <h5 className='ComCssTableName'>
                    {activeTicketType === "DTL" && "DTL Issued Tickets"}
                    {activeTicketType === "PTL" && "PTL Issued Tickets"}
                </h5><div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-light" onClick={() => setShowMenu(!showMenu)}>
                        <FaBars />
                    </button>

                    {showMenu && (
                        <div className="ComCssButtonMenu">
                            <button className="ComCssExportButton" onClick={() => exportToExcel(searchText)} disabled={loading}>
                                <FaFileExcel />  </button>
                            {activeTicketType !== "DTL" && (
                                <button
                                    className='ComCssPendingButton'
                                    onClick={() => {
                                        setActiveTicketType("DTL");
                                        fetchData(page, perPage, debouncedSearch);
                                        setShowMenu(false);
                                    }}
                                >
                                    DTL
                                </button>
                            )}
                            {activeTicketType !== "PTL" && (
                                <button
                                    className='ComCssPariallButton'
                                    onClick={() => {
                                        setActiveTicketType("PTL");
                                        fetchptlData(page, perPage, debouncedSearch);
                                        setShowMenu(false);
                                    }}
                                >
                                    PTL
                                </button>
                            )}
                        </div>

                    )}
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
                <IssuanceTable
                    data={issuanceData}
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

export default Issuance