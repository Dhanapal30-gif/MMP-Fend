import React, { useState, useEffect, useRef } from 'react';

import IssuanceTextFiled from "../../components/Issuance/IssuanceTextFiled";
import IssuanceShowTable from "../../components/Issuance/IssuanceShowTable";
import { fetchIssueTicketList, fetchpickTicketDetails, saveDeliver, saveIssue, saveLEDRequest } from '../../Services/Services-Rc';
import ApproverTable from "../../components/Approver/ApproverTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { savePtlDeliver, savePtlIssue } from '../../Services/Services_09';

const Issuance = () => {

    const [formData, setFormData] = useState({
        approverL1TicketL1: "",
        requestedTicket: "",
        deliverTicket: "",
        issueTicket: ""
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


    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        console.log("formdat", formData)

        // if (field === "category" && value === "DTL") {
        //     fetchRequestedTickets(value);
        // }
        if (field === "category" && value) {
            fetchRequestedTickets(value);
        }

        if (field === "requestedTicket" && value) {
            console.log("value", field)
            fetchPickTicketDetail(value);
            setTableData([]);
            setShowTable(false)
            setHideDeliverButton(false);

        }
        if (field === "deliverTicket" && value) {
            console.log("value", field)
            fetchPickTicketDetail(value);
            setTableData([]);
            setShowTable(false)
            setHideDeliverButton(true);

        }
        if (field === "issueTicket" && value) {
            console.log("value", field)
            fetchPickTicketDetail(value);
            setTableData([]);
            setShowTable(false)
            setHideIssueButton(true);
        }
        // if (["requestedTicket", "deliverTicket", "issueTicket"].includes(field)) {
        //                 console.log("value", field)

        //     if (value) {
        //         fetchPickTicketDetail(value);
        //         setShowTable(true);
        //     } else {
        //         setShowTable(false);
        //     }
        //     // Deliver button logic
        //     setHideDeliverButton(field === "deliverTicket" ? !value : true);
        // }
    };



    const fetchRequestedTickets = async (category) => {
        try {
            const response = await fetchIssueTicketList(category);
            const data = response.data;
            console.log("Approver Types:", response.data);
            setRequestedTicketList(response.data.requestedTicketList || []);
            setDeliverTicketList(response.data.deliverTicketList || []);
            setIssueTicketList(response.data.issueTicketList || []);
            setPtlTicketList(response.data.ptlTicketList || []);
            setPtlDeliveryTicketList(response.data.ptlDeliveryTicketList || []);
            setPtlIssueTicketList(response.data.ptlIssueTicketList || []);
            // console.log("delivertivketlist",response.data.requestedTicketList)

            // console.log("setRequestedTicketList", requestTicketList);
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
        if (!ticketNo) return;

        try {
            const response = await fetchpickTicketDetails(ticketNo);
            const data = response.data;
            console.log("Pick ticket details:", data);
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

            console.log("setisUserActiveFetch", isUserActive)
            console.log("setColourCodeFetch", colourCode)

        } catch (error) {
            console.error("Error fetching requester types:", error);
        }
    };
    const handlePut = (e) => {
        e.preventDefault();

        const submitData = pickTicketData.flatMap(row => {
            if (row.batchesQty && row.batchesQty.length > 0) {
                return row.batchesQty.map(bq => ({
                    Location: bq.location,
                    Product_Qty: bq.savedQty,
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
                    fetchRequestedTickets("DTL")
                    setHideDeliverButton(true)
                    setHidePutButton(false)
                    // isPutButtonHidden(false)
                } else {
                    setIsUserActive(false);
                }
                //     // fetchRequestedTickets(category);
                //  //   setSubmittedIds(prev => [...prev, ...newSelectedRows]);
                //     handleSuccessCommon({
                //         response,
                //         setSuccessMessage,
                //         setShowSuccessPopup,
                //     });
            })

            .catch((error) => {
                alert(error.response?.data?.message || "Something went wrong!");

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
        let ticketno;

        const submitData = pickTicketData.flatMap(row => {
            if (row.batchesQty && row.batchesQty.length > 0) {
                return row.batchesQty.map(bq => ({ recTicketNo: row.rec_ticket_no }));
            }
            ticketno = row.rec_ticket_no;
            return [{ recTicketNo: row.rec_ticket_no }];
        });
        if (ticketno && ticketno.startsWith("PTL")) {
            savePtlDeliver(submitData)
                .then((response) => {
                    // alert(response.data.message);
                    setSuccessMessage(response.data.message);
                    setShowSuccessPopup(true)
                    fetchRequestedTickets("DTL");
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
                })
                .catch((error) => {
                    alert(error.response?.data?.message || "Something went wrong!");
                });
        }
    };

    const handleIssue = (e) => {
        e.preventDefault();
        let recTicketNo;
        const submitData = pickTicketData.flatMap(row => {
            if (row.batchesQty && row.batchesQty.length > 0) {
                return row.batchesQty.map(bq => ({ recTicketNo: row.rec_ticket_no }));
            }
            recTicketNo = row.rec_ticket_no;
            return [{ recTicketNo: row.rec_ticket_no }];
        });

        if (recTicketNo && recTicketNo.startsWith("PTL")) {
            savePtlIssue(submitData)
                .then((response) => {
                    // alert(response.data.message);
                    setSuccessMessage(response.data.message);
                    setShowSuccessPopup(true)
                    fetchRequestedTickets("DTL");
                    setHideDeliverButton(false);
                    setHidePutButton(false);
                    setHideIssueButton(true);
                    setPickTicketData([]);

                })
                .catch((error) => {
                    alert(error.response?.data?.message || "Something went wrong!");
                });
        } else {
            saveIssue(submitData)
                .then((response) => {
                    // alert(response.data.message);
                    setSuccessMessage(response.data.message);
                    setShowSuccessPopup(true);
                    fetchRequestedTickets("DTL");
                    setHideDeliverButton(false);
                    setHidePutButton(false);
                    setHideIssueButton(true);
                    setPickTicketData([]);
                    setShowTable(false);
w
                })
                .catch((error) => {
                    alert(error.response?.data?.message || "Something went wrong!");
                });
        }
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
                    <h5 className='ComCssTableName'>Issue List</h5>

                    <IssuanceShowTable
                        data={pickTicketData}
                        page={page}
                        perPage={perPage}
                        totalRows={tableData.length}
                        loading={false}
                        setPage={setPage}
                        setShowTable={setShowTable}
                        setPerPage={setPerPage}
                        setFormData={setFormData}
                        setTableData={setTableData}
                        handleGRNQtyChange={handleGRNQtyChange}
                        setSuccessMessage={setSuccessMessage}
                        setShowSuccessPopup={setShowSuccessPopup}
                        setShowErrorPopup={setShowErrorPopup}
                        setErrorMessage={setErrorMessage}
                        formErrors={formErrors}
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

                        {hideIssueButton && (
                            <button className='ComCssSubmitButton' onClick={handleIssue} >Issue</button>
                        )}

                    </div>
                </div>
            )}
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