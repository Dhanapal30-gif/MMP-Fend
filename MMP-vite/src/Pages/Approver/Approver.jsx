import React, { useState, useEffect, useRef } from 'react';

import ApproverTextFiled from "../../components/Approver/ApproverTextFiled";
import { fetchApproverTicket, fetchApproverTicketDetails, saveApproverTickets, saveAReturningpproverTickets, saveStockApproverTickets } from '../../Services/Services-Rc';
import ApproverTable from "../../components/Approver/ApproverTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { tr } from 'date-fns/locale';
import { ownerDocument } from '@mui/material';
import { savePtlApproverTickets } from '../../Services/Services_09';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";

const Approver = () => {

    const [formData, setFormData] = useState({
        approverL1TicketL1: "",
        requesterType: ""
    });

    const userId = sessionStorage.getItem("userId");
    const [approverTicketsL1, setApproverTicketsL1] = useState([]);
    const [approverTicketsL2, setApproverTicketsL2] = useState([]);
    const [approverReturningTicketsL1, setApproverReturningTicketsL1] = useState([]);
    const [approverReturningTicketsL2, setApproverReturningTicketsL2] = useState([]);
    const [ptlRequesterTickets, setPtlRequesterTickets] = useState([]);
    const [stockTransferTicketsL1, setStockTransferTicketsL1] = useState([]);
    const [stockTransferTicketsL2, setStockTransferTicketsL2] = useState([]);

    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [approveTicketDetail, setApproveTicketDetail] = useState([])
    const [selectedGrnRows, setSelectedGrnRows] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [requesterApproveButton, setRequesterApproveButton] = useState(false);
    const [returningApproveButton, setReturningApproveButton] = useState(false);
    const [ptlRequestApproveButton, setPtlRequestApproveButton] = useState(false);
    const [stockRequestApproveButton, setStockRequestApproveButton] = useState(false);
    const [rejectComment, setRejecComment] = useState(false)

    useEffect(() => {
        fetchApproverTicktes(userId);   // pass it here
    }, [userId]);
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    useEffect(() => {
    if (formData.rec_ticket_no) {
        setRejecComment(false);      // ✅ reset reject mode
        setSelectedGrnRows([]);      // optional but recommended
        setFormErrors({});           // clear old errors
    }
}, [formData.rec_ticket_no]);


    const fetchApproverTicktes = async (userId) => {
        try {
            const response = await fetchApproverTicket(userId);
            const data = response.data;
            // console.log("Approver Types:", response.data);
            setApproverTicketsL1(response.data.approverL1Tickets || []);
            setApproverTicketsL2(response.data.approverL2Tickets || []);
            setApproverReturningTicketsL1(response.data.returningApproverL1Tickets || []);
            setApproverReturningTicketsL2(response.data.returningApproverL2Tickets || []);
            setPtlRequesterTickets(response.data.ptlOpreatorTicket || []);
            setStockTransferTicketsL1(response.data.l1StockTickets || []);
            setStockTransferTicketsL2(response.data.l2StockTickets || []);

        } catch (error) {
            console.error("Error fetching requester types:", error);
        }
    };

    // console.log("formdata", formData.rec_ticket_no)
    useEffect(() => {
        const fetchApproverTicketDetail = async () => {
            if (formData.rec_ticket_no) {
                setLoading(true); // start loader

                try {
                    const response = await fetchApproverTicketDetails(formData.rec_ticket_no);
                    const data = response.data;
                    setApproveTicketDetail(data);
                    setTotalRows(data.length)
                    if (data[0]?.rec_ticket_no?.startsWith("RTN")) {
                        setReturningApproveButton(true);
                        setRequesterApproveButton(false);
                        setPtlRequestApproveButton(false);
                        setStockRequestApproveButton(false);
                    } else if (data[0]?.rec_ticket_no?.startsWith("PTL")) {
                        setPtlRequestApproveButton(true)
                        setReturningApproveButton(false);
                        setRequesterApproveButton(false);
                        setStockRequestApproveButton(false);

                    } else if (data[0]?.rec_ticket_no?.startsWith("INV")) {
                        setStockRequestApproveButton(true)
                        setPtlRequestApproveButton(false)
                        setReturningApproveButton(false);
                        setRequesterApproveButton(false);
                    }
                    else {
                        setRequesterApproveButton(true);
                        setReturningApproveButton(false);
                        setPtlRequestApproveButton(false);
                        setStockRequestApproveButton(false);

                    } setShowTable(true);
                    // setSelectedGrnRows([])
                } catch (error) {
                    console.error("Error fetching requester types:", error);
                } finally {
                    setLoading(false); // stop loader in both success & error
                }
            }
        };
        fetchApproverTicketDetail();
    }, [formData.rec_ticket_no]);

    const handleGRNQtyChange = (selectedId, field, value) => {
        setApproveTicketDetail(prev =>
            prev.map(row =>
                row.selectedId === selectedId ? { ...row, [field]: value } : row
            )
        );
    };


    // const valiDate = (selectedData) => {
    //     const errors = {};
    //     let isValid = true;

    //     selectedData.forEach((row) => {
    //         const qtyField = row.ApprovedL1Qty !== undefined ? "ApprovedL1Qty" : "ApprovedL2Qty";
    //         if (!row[qtyField] || row[qtyField] === 0) {
    //             errors[`${qtyField}${row.selectedId}`] = "Enter quantity";
    //             isValid = false;
    //         }
    //     });

    //     setFormErrors(errors);
    //     return isValid;
    // };


    // const valiDate = (selectedData) => {
    //     const errors = {};
    //     let isValid = true;

    //     selectedData.forEach((row) => {
    //         const qtyField = row.ApprovedL1Qty !== undefined ? "ApprovedL1Qty" : "ApprovedL2Qty";
    //         if (!row[qtyField] || row[qtyField] === 0) {
    //             errors[`${qtyField}${row.selectedId}`] = "Enter quantity";
    //             isValid = false;
    //         }
    //         setErrorMessage("Enter Qty")
    //         setShowErrorPopup(true)
    //     });

    //     if (rejectComment) {
    //         selectedData.forEach((row) => {
    //             const commentField = "Comment"; // match your row field
    //             if (!row[commentField] || row[commentField].trim() === "") {
    //                 errors[`${commentField}${row.selectedId}`] = "Enter comment";
    //                 isValid = false;
    //             }
    //         });

    //         if (!isValid) {
    //             setErrorMessage("Enter comment");
    //             setShowErrorPopup(true);
    //         }
    //     }

    //     // if(rejectComment){
    //     //     const rejectComm=re=ownerDocu
    //     // }

    //     setFormErrors(errors);
    //     return isValid;
    // };


    const valiDate = (selectedData) => {
        const errors = {};
        let isValid = true;

        selectedData.forEach((row) => {
            const qtyField = row.ApprovedL1Qty !== undefined ? "ApprovedL1Qty" : "ApprovedL2Qty";
            if (!row[qtyField] || row[qtyField] === 0) {
                errors[`${qtyField}${row.selectedId}`] = "Enter quantity";
                isValid = false;
            }
        });

        if (!isValid) {
            setErrorMessage("Enter Qty");
            setShowErrorPopup(true);
        }
        if (rejectComment) {
            selectedData.forEach((row) => {
                const commentField = "Comment";
                if (!row[commentField] || row[commentField].trim() === "") {
                    errors[`${commentField}${row.selectedId}`] = "Enter comment";
                    isValid = false;
                }
            });

            if (!isValid) {
                setErrorMessage("Enter comment");
                setShowErrorPopup(true);
            }
        }
        setFormErrors(errors);
        return isValid;
    };


    const valiDateComment = (selectedData) => {
        const errors = {};
        let isValid = true;



        selectedData.forEach((row) => {
            const commentField = "Comment";
            if (!row[commentField] || row[commentField].trim() === "") {
                errors[`${commentField}${row.selectedId}`] = "Enter comment";
                isValid = false;
            }
        });

        if (!isValid) {
            setErrorMessage("Enter comment");
            setShowErrorPopup(true);
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async () => {
        setLoading(true); // start loader
        try {
            if (selectedGrnRows.length === 0) {
                setErrorMessage("Please select at least one row before submitting!")
                setShowErrorPopup(true)
                return;
            }
            const selectedData = approveTicketDetail.filter(row =>
                selectedGrnRows.includes(row.selectedId) // or row.id
            );

            if (!valiDate(selectedData)) return;
            // console.log("Selected Data:", selectedData);
            const payload = selectedData.map(row => ({
                requestTicketNo: row.rec_ticket_no,
                partCode: row.partcode,
                approved1_qty: Number(row.ApprovedL1Qty) || 0,
                approved2_qty: Number(row.ApprovedL2Qty) || 0,
                requestQty: Number(row.req_qty) || 0,
                Comment: row.Comment || "",
                createdby: userId,
                recordstatus: row.recordstatus
            }));
            console.log("Payload to send:", payload);
            await saveApproverTickets(payload);
            setSuccessMessage("Submitted successfully!")
            setShowSuccessPopup(true)
            // alert("Submitted successfully!");
            setShowTable(false);
            setTableData([])
            setFormData({
                approverL1TicketL1: "",
                requesterType: ""
            })
            setSelectedGrnRows([]);
            fetchApproverTicktes(userId);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!")
            // console.error("Error submitting data:", error);
        } finally {
            setLoading(false); // stop loader in all cases
        }
    };

    const handleReturningApprove = async () => {
        setLoading(true)
        try {
            if (selectedGrnRows.length === 0) {
                setErrorMessage("Please select at least one row before submitting!")
                setShowErrorPopup(true)
                return;
            }
            const selectedData = approveTicketDetail.filter(row =>
                selectedGrnRows.includes(row.selectedId)
            );
            if (!valiDate(selectedData)) return;

            const payload = selectedData.map(row => ({
                returningTicketNo: row.rec_ticket_no,
                partcode: row.partcode,
                approved1_qty: row.ApprovedL1Qty || 0,
                approved2_qty: row.ApprovedL2Qty || 0,
                comments: row.Comment || "",
                createdby: userId,
                recordstatus: row.recordstatus
            }));

            // console.log("Payload to send:", payload);
            await saveAReturningpproverTickets(payload);
            setSuccessMessage("Submitted successfully!")
            setShowSuccessPopup(true)
            setShowTable(false);
            setTableData([])
            setFormData({
                approverL1TicketL1: "",
                requesterType: ""
            })
            fetchApproverTicktes(userId);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!")
            // console.error("Error submitting data:", error);
        } finally {
            setLoading(false); // stop loader in all cases
        }
    }

    const handlePTLApprove = async () => {
        setLoading(true)
        try {
            if (selectedGrnRows.length === 0) {
                setErrorMessage("Please select at least one row before submitting!")
                setShowErrorPopup(true)
                return;
            }
            const selectedData = approveTicketDetail.filter(row =>
                selectedGrnRows.includes(row.selectedId)
            );
            if (!valiDate(selectedData)) return;

            const payload = selectedData.map(row => ({
                ptlreqticketno: row.rec_ticket_no,
                partcode: row.partcode,
                approved1_qty: row.ApprovedL1Qty || 0,
                rejected_comments: row.Comment || "",
                createdby: userId,
                recordstatus: row.recordstatus
            }));
            // console.log("Payload to send:", payload);

            await savePtlApproverTickets(payload);
            setSuccessMessage("Submitted successfully!")
            setShowSuccessPopup(true)
            setShowTable(false);
            setTableData([])
            setFormData({
                approverL1TicketL1: "",
                requesterType: ""
            })
            fetchApproverTicktes(userId);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!")
            // console.error("Error submitting data:", error);
        } finally {
            setLoading(false); // stop loader in all cases
        }
    }

    const handleStockApprove = async () => {
        setLoading(true); // start loader
        try {
            if (selectedGrnRows.length === 0) {
                setErrorMessage("Please select at least one row before submitting!")
                setShowErrorPopup(true)
                return;
            }
            const selectedData = approveTicketDetail.filter(row =>
                selectedGrnRows.includes(row.selectedId) // or row.id
            );

            if (!valiDate(selectedData)) return;
            // console.log("Selected Data:", selectedData);
            const payload = selectedData.map(row => ({
                rtn: row.rec_ticket_no,
                partcode: row.partcode,
                approved1_qty: Number(row.ApprovedL1Qty) || 0,
                approved2_qty: Number(row.ApprovedL2Qty) || 0,
                transferqty: Number(row.req_qty) || 0,
                Comment: row.Comment || "",
                createdby: userId,
                recordstatus: row.recordstatus
            }));
            // console.log("Payload to send:", payload);
            await saveStockApproverTickets(payload);
            setSuccessMessage("Submitted successfully!")
            setShowSuccessPopup(true)
            // alert("Submitted successfully!");
            setShowTable(false);
            setTableData([])
            setFormData({
                approverL1TicketL1: "",
                requesterType: ""
            })
            fetchApproverTicktes(userId);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!")
            // console.error("Error submitting data:", error);
        } finally {
            setLoading(false); // stop loader in all cases
        }
    };

    const handleReject = async () => {

        try {
            if (selectedGrnRows.length === 0) {
                setErrorMessage("Please select at least one row before submitting!");
                setShowErrorPopup(true);
                return;
            }
            setRejecComment(true);
            const selectedData = approveTicketDetail.filter(row =>
                selectedGrnRows.includes(row.selectedId)
            );

            if (!selectedData.length) return; // safety check

            if (!valiDateComment(selectedData)) return;

            const ticketNo = selectedData[0]?.rec_ticket_no || "";
            let payload = []
            // console.log("Selected Data:", selectedData);

            if (ticketNo.startsWith("PTL")) {
                payload = selectedData.map(row => ({
                    ptlreqticketno: row.rec_ticket_no,
                    partcode: row.partcode,
                    recordstatus: "MSC00005",
                    requestQty: row.req_qty || 0,
                      reject_comments: row.Comment || ""
                }))
            } else {
                payload = selectedData.map(row => ({
                    requestTicketNo: row.rec_ticket_no,
                    partCode: row.partcode,
                    recordstatus: "MSC00005",
                      reject_comments: row.Comment || "",
                    requestQty: row.req_qty || 0,
                }))
            }
            // console.log("Payload to send:", payload);

            if (ticketNo.startsWith("RTN")) {
                await saveAReturningpproverTickets(payload);
            } else if (ticketNo.startsWith("PTL")) {
                await savePtlApproverTickets(payload);
            } else {
                await saveApproverTickets(payload);
            }

            setSuccessMessage("Rejected successfully!");
            setShowSuccessPopup(true);
            setShowTable(false);
            setTableData([]);
            fetchApproverTicktes(userId);
            setFormData({
                approverL1TicketL1: "",
                requesterType: ""
            })
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };


    // console.log("Selected GRN Rows:", selectedGrnRows);

    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Approver</p>
                </div>
                <ApproverTextFiled
                    formData={formData}
                    approverTicketsL1={approverTicketsL1}
                    handleChange={handleChange}
                    approverTicketsL2={approverTicketsL2}
                    approverReturningTicketsL1={approverReturningTicketsL1}
                    approverReturningTicketsL2={approverReturningTicketsL2}
                    ptlRequesterTickets={ptlRequesterTickets}
                    stockTransferTicketsL1={stockTransferTicketsL1}
                    stockTransferTicketsL2={stockTransferTicketsL2}

                />
            </div>

            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>Approval List</h5>
                    <LoadingOverlay loading={loading} />

                    <ApproverTable
                        data={approveTicketDetail}
                        page={page}
                        perPage={perPage}
                        totalRows={tableData.length}
                        loading={false}
                        setPage={setPage}
                        setShowTable={setShowTable}
                        setPerPage={setPerPage}
                        setFormData={setFormData}
                        setTableData={setTableData}
                        selectedGrnRows={selectedGrnRows}   // <-- current selection
                        setSelectedGrnRows={setSelectedGrnRows} // <-- setter function
                        handleApproverChange={handleGRNQtyChange} // qty/comment change handler
                        formErrors={formErrors}
                        setErrorMessage={setErrorMessage}
                        setShowErrorPopup={setShowErrorPopup}
                        rejectComment={rejectComment}
                    />
                    <div className="ComCssButton9">
                        
                        {!rejectComment && requesterApproveButton && <button className='ComCssRequesterApproveButton' onClick={handleSubmit} >Approve</button>}
                        {!rejectComment && returningApproveButton && <button className='ComCssReturningApproveButton' onClick={handleReturningApprove} >Approve</button>}
                        {!rejectComment && ptlRequestApproveButton && <button className='ComCssPTLApproveButton' onClick={handlePTLApprove} >Approve</button>}
                        {!rejectComment && stockRequestApproveButton && <button className='ComCssStockApproveButton' onClick={handleStockApprove} >Approve</button>}

                        {/* <button className='ComCssSubmitButton' onClick={handleSubmit}  >Approve</button> */}
                        <button className='ComCssDeleteButton' onClick={handleReject}>Reject</button>
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
export default Approver