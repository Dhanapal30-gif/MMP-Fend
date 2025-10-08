import React, { useState, useEffect, useRef } from 'react';

import ApproverTextFiled from "../../components/Approver/ApproverTextFiled";
import { fetchApproverTicket, fetchApproverTicketDetails, saveApproverTickets, saveAReturningpproverTickets } from '../../Services/Services-Rc';
import ApproverTable from "../../components/Approver/ApproverTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";

const Approver = () => {

    const [formData, setFormData] = useState({
        approverL1TicketL1: "",
        requesterType: ""
    });

    const userId = sessionStorage.getItem("userId");

    const [requesterType, setRequesterType] = useState([]);
    const [recTicketNo, setRecTicketNo] = useState([]);
    const [requesterId, setRequesterId] = useState([]);
    const [approverTicketsL1, setApproverTicketsL1] = useState([]);
    const [approverTicketsL2, setApproverTicketsL2] = useState([]);
        const [approverReturningTicketsL1, setApproverReturningTicketsL1] = useState([]);
            const [approverReturningTicketsL2, setApproverReturningTicketsL2] = useState([]);
        const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [approveTicketDetail, setApproveTicketDetail] = useState([])
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedGrnRows, setSelectedGrnRows] = useState([]);
    const [approvedQty, setApproverQty] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [requesterApproveButton, setRequesterApproveButton]= useState(false);
    const [returningApproveButton, setReturningApproveButton]= useState(false);
    useEffect(() => {

        fetchApproverTicktes(userId);   // pass it here

    }, [userId]);



    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const fetchApproverTicktes = async (userId) => {
        try {
            const response = await fetchApproverTicket(userId);
            const data = response.data;
            console.log("Approver Types:", response.data);
            setApproverTicketsL1(response.data.approverL1Tickets || []);
            setApproverTicketsL2(response.data.approverL2Tickets || []);
            setApproverReturningTicketsL1(response.data.returningApproverL1Tickets || []);
            setApproverReturningTicketsL2(response.data.returningApproverL2Tickets || []);
        } catch (error) {
            console.error("Error fetching requester types:", error);
        }
    };

    console.log("formdata", formData.rec_ticket_no)

    useEffect(() => {
        const fetchApproverTicketDetail = async () => {
            if (formData.rec_ticket_no) {
                try {
                    const response = await fetchApproverTicketDetails(formData.rec_ticket_no);
                    const data = response.data;
                    setApproveTicketDetail(data);
         if (data[0]?.rec_ticket_no?.startsWith("RTN")) {
                setReturningApproveButton(true);
                                setRequesterApproveButton(false);

            } else {
                setRequesterApproveButton(true);
                                setReturningApproveButton(false);

            }             setShowTable(true);
                    setSelectedGrnRows([])
                } catch (error) {
                    console.error("Error fetching requester types:", error);
                }
            }
        };

        fetchApproverTicketDetail();
    }, [formData.rec_ticket_no]);


    // const handleGRNQtyChange = (selectedid, field, value) => {
    //     setApproveTicketDetail((prev) =>
    //         prev.map((item) =>
    //             item.id === selectedid ? { ...item, [field]: value } : item
    //         )
    //     );
    // };
// const handleGRNQtyChange = (selectedid, field, value) => {
//   setApproveTicketDetail((prev) =>
//     prev.map((item) =>
//       item.selectedId === selectedid ? { ...item, [field]: value } : item
//     )
//   );
// };

const handleGRNQtyChange = (selectedId, field, value) => {
  setApproveTicketDetail(prev =>
    prev.map(row =>
      row.selectedId === selectedId ? { ...row, [field]: value } : row
    )
  );
};


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

  setFormErrors(errors);
  return isValid;
};



    const handleSubmit = async () => {
        try {
            if (selectedGrnRows.length === 0) {
                // alert("Please select at least one row before submitting!");
                setErrorMessage("Please select at least one row before submitting!")
                setShowErrorPopup(true)
                return;
            }

            const selectedData = approveTicketDetail.filter(row =>
                selectedGrnRows.includes(row.selectedid) // or row.id
            );
                    if (!valiDate(selectedData)) return;

console.log("Selected Data:", selectedData);
            const payload = selectedData.map(row => ({
                requestTicketNo: row.rec_ticket_no,
                partCode: row.partcode,
               
                approved1_qty: row.ApprovedL1Qty || 0,
                approved2_qty: row.ApprovedL2Qty || 0,
                Comment: row.Comment || "",
                createdby: userId,
                recordstatus: row.recordstatus
            }));

            console.log("Payload to send:", payload);

            await saveApproverTickets(payload);
            alert("Submitted successfully!");
            setShowTable(false);
            setTableData([])
            setFormData({
                approverL1TicketL1: "",
                requesterType: ""
            })
            fetchApproverTicktes(userId);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!")
            console.error("Error submitting data:", error);
        }
    };


    const handleReturningApprove = async () => {
try {
            if (selectedGrnRows.length === 0) {
                setErrorMessage("Please select at least one row before submitting!")
                setShowErrorPopup(true)
                return;
            }

            const selectedData = approveTicketDetail.filter(row =>
                selectedGrnRows.includes(row.selectedid) 
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

            console.log("Payload to send:", payload);

            await saveAReturningpproverTickets(payload);
            alert("Submitted successfully!");
            setShowTable(false);
            setTableData([])
            setFormData({
                approverL1TicketL1: "",
                requesterType: ""
            })
            fetchApproverTicktes(userId);
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong!")
            console.error("Error submitting data:", error);
        }
    }
    
    const handleReject = async () => {
        try {
            if (selectedGrnRows.length === 0) {
                // alert("Please select at least one row before submitting!");
                setErrorMessage("Please select at least one row before submitting!")
                setShowErrorPopup(true)
                return;
            }

            // const selectedData = approveTicketDetail.filter(row =>
            //     selectedGrnRows.includes(row.selectedid) // or row.id
            // );
              const selectedData = approveTicketDetail.filter(row =>
    selectedGrnRows.includes(row.selectedId)
);


// console.log("Selected Data:", selectedData);
            const payload = selectedData.map(row => ({
                     requestTicketNo: row.rec_ticket_no,
                partCode: row.partcode,
                recordstatus:"MSC00005",
            }));

            console.log("Payload to send:", payload);

            await saveApproverTickets(payload);
            alert("rejected successfully!");
            setShowTable(false)

            setTableData([])
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    };

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

                />
            </div>

            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>

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

                    />
                    <div className="ComCssButton9">
                        {requesterApproveButton &&  <button className='ComCssSubmitButton' onClick={handleSubmit} >Approve</button>}
                        {returningApproveButton && <button onClick={handleReturningApprove} >Approve</button>}
                        {/* <button className='ComCssSubmitButton' onClick={handleSubmit}  >Approve</button> */}
                        <button className='ComCssDeleteButton'  onClick={handleReject}>Reject</button>

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