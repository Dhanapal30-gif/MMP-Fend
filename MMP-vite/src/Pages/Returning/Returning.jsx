import React, { useState, useEffect, useRef } from 'react';
import ReturningTextFiled from "../../components/Returning/ReturningTextFiled";
import ReturningAddTable from "../../components/Returning/ReturningAddTable";
import RequesterDefaultTable from "../../components/Requester/RequesterDefaultTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchRequesterDetail, fetchRequesterSearch } from "../../components/Requester/RequesterActions.js";

import { FaFileExcel, FaBars } from "react-icons/fa";
import { saveGRN } from '../../Services/Services_09.js';
import { checkAvailable, downloadRequester, fetchAvailableAndCompatabilityQty, fetchProductAndPartcode, fetchRequesterType, fetchRetPartcode, saveRequester, saveReturning } from '../../Services/Services-Rc.js';
import { ContactSupportOutlined } from '@mui/icons-material';

const Returning = () => {

    const [formData, setFormData] = useState({
        returningType: "",
        returnQty: ""
    });

    // const userId = sessionStorage.getItem("userId");
    //   const userName = sessionStorage.getItem("userName");
     const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");

    const [formErrors, setFormErrors] = useState({});
    const [returningData, setReturningData] = useState([]);
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
    const [filteredAddData, setFilteredAddData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
        const [addSearchText, setAddSearchText] = useState("");

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


            // console.log("field, value", field, value)
            return { ...prev, [field]: value };
        });
    };

    useEffect(() => {
        if (formData?.returningType) {
            fetchReturningPartcode(userId, formData?.returningType?.value || formData?.returningType);
        }

    }, [userId, formData?.returningType]);
    // console.log("formData", formData)

    const fetchReturningPartcode = async (userId, returningType) => {
        try {
            const response = await fetchRetPartcode(userId, returningType);
            const data = response.data;
            setReturningData(data || []);
            // console.log("Fetched Requester Types:", data)
            // console.log("Requester Types:", data);
        } catch (error) {
            console.error("Error fetching requester types:", error);
        }
    };

    const [filteredData, setFilteredData] = useState(returningData);

    const handleDropdownChange = (field, value) => {
    if (!value) return;

    let selectedRecord;

    if (field === "partcode") {
        selectedRecord = returningData.find(item => item.partcode === value);
    } else if (field === "partdescription") {
        selectedRecord = returningData.find(item => item.partdescription === value);
    } else if (field === "rec_ticket_no") {
        selectedRecord = returningData.find(item => item.rec_ticket_no === value);
    } else if (field === "ordertype") {
        selectedRecord = returningData.find(item => item.ordertype === value);
    } else if (field === "RequesterType") {  // ✅ add this
        selectedRecord = returningData.find(item => item.RequesterType === value);
    }

    if (!selectedRecord) return;

    // always fetch IssueQty by rec_ticket_no
    const ticketRecord = returningData.find(item => item.rec_ticket_no === selectedRecord.rec_ticket_no);

    setFormData(prev => ({
        ...prev,
        partcode: selectedRecord.partcode,
        partdescription: selectedRecord.partdescription,
        rec_ticket_no: selectedRecord.rec_ticket_no,
        ordertype: selectedRecord.ordertype,
        RequesterType: selectedRecord.RequesterType, // ✅ add this
        IssueQty: ticketRecord?.IssueQty ?? 0,  // fetched by ticket no
        returnQty: ""
    }));
};

    const handleReturnQtyChange = (value) => {
        if (value === "") {
            setFormData(prev => ({ ...prev, returnQty: "" }));
            return;
        }
        if (!/^\d+$/.test(value)) return;

        const numValue = Number(value);
        const issueQty = Number(formData.IssueQty) || 0;

        if (numValue > issueQty) return;

        setFormData(prev => ({ ...prev, returnQty: value }));
    };
    useEffect(() => {
        setFilteredData(returningData);
    }, [returningData]);

      const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.returningType) {
            errors.returningType = "select Returning Type";
            isValid = false;
        }
        if (!formData.ordertype) {
            errors.ordertype = "select Order Type";
            isValid = false;
        }
        if (!formData.RequesterType) {
            errors.RequesterType = "select Requester Type";
            isValid = false;
        }
        if (!formData.partcode) {
            errors.partcode = "select Part Code";
            isValid = false;
        }
        
        if (!formData.rec_ticket_no) {
            errors.rec_ticket_no = "Select Rec Ticket No";
            isValid = false;
        }
        if (!formData.returnQty || Number(formData.returnQty) <= 0) {
            errors.returnQty = " Enter Request Qty";
            isValid = false;
        }
        if (!formData.returnQty || Number(formData.comment) <= 0) {
            errors.comment = "Enter comment";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleAdd = () => {
        if (!valiDate()) return;

        setTableData(prev => [
            ...prev,
            {
                ...formData,
                returningType: formData.returningType?.value || formData.returningType || "",
                ordertype: formData.ordertype || "",
                RequesterType: formData.RequesterType || "",
                partcode: formData.partcode || "",
                partdescription: formData.partdescription || "",
                rec_ticket_no: formData.rec_ticket_no || ""
            }
        ]);

        setIsFrozen(true);

        setFormData({
                returningType: formData.returningType?.value || formData.returningType || "",
        });
    };

    useEffect(() => {
        if (tableData.length > 0) {
            setShowTable(true);
        }
    }, [tableData]);

  
   const handleSubmit = async () => {

     if (!userId) {
    alert("Please relogin");
    return;
  }
    try {
        // Prepare updated data
        const updatedFormData = tableData.map(row => ({
            ...row,
            createdby: userId,
            updatedby: userId,     
            createdName: userName,       
        }));

        // Call API
        const response = await saveReturning(updatedFormData);

        if (response.status === 200 && response.data) {
            const { message } = response.data;
            setSuccessMessage(message || "Saved successfully");
            setShowSuccessPopup(true);

            // Clear table and form
            setTableData([]);
            setShowTable(false);
            setIsFrozen(false);
            setFormData({
                requestFor: null,
            });
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

const handleCancel =() =>{
    setTableData([]);
            setShowTable(false);
    setIsFrozen(false);
setReturningData([]);
    setFormData({
        returningType: null,
  ordertype: "",
  RequesterType: null,
  partcode: null,
  partdescription: null,
  rec_ticket_no: null,
  comment: null,
    });
}

useEffect(() => {
  if (!addSearchText) {
    setFilteredAddData(tableData);
  } else {
    const lower = addSearchText.toLowerCase();

    const result = tableData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );

    setFilteredAddData(result);
  }
}, [addSearchText, tableData]);
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Returning</p>
                </div>
                <ReturningTextFiled
                    formData={formData}
                    handleChange={handleChange}
                    // orderTypeOption={orderTypeOption}
                    // requestType={requestType}
                    // requesterType={requesterType}
                    userId={userId}
                    returningData={returningData}
                    handleDropdownChange={handleDropdownChange}
                    isFrozen={isFrozen}
                    filteredData={filteredData}
                    handleReturnQtyChange={handleReturnQtyChange}
                    formErrors={formErrors}
                />
                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleAdd} >ADD</button>
                    {/* <button className='ComCssClearButton'>Clear</button> */}
                </div>

            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>
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

                    <ReturningAddTable
                        data={filteredAddData}
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
                        <button className='ComCssDeleteButton' onClick={handleCancel} >Cancel</button>

                    </div>
                </div>
            )}
        </div>)
}

export default Returning