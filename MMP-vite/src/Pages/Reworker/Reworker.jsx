import React, { useState, useEffect } from 'react';
import ReworkerTextFiled from "../../components/Reworker/ReworkerTextFiled";
import ReworkerTable from "../../components/Reworker/ReworkerTable";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import './Reworker.css';

import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchBoardSerialNumber, fetchproductPtl, getLocalMaster, savePTLRepaier, savePTLRequest, savePTLStore, saveReworkerSubmit } from '../../Services/Services_09';


const Reworker = () => {
    const [formData, setFormData] = useState({
        boardserialnumber:"",id:""
    })
    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [ptlRequestData, setPtlRequestData] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [requestButton, setRequestButton] = useState(true);
    const [isFrozen, setIsFrozen] = useState(false);
    const [submitButton, setSubmitButton] = useState(true);
    const [clearButton, setClearButton] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "boardserialnumber") {
            // Allow only digits and max 11 characters
            const digitOnly = value.replace(/\D/g, "").slice(0, 11);
            setFormData((prev) => ({ ...prev, [name]: digitOnly }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleQtyChange = (id, value) => {
        const updatedData = tableData.map(item =>
            item.selectedid === id ? { ...item, pickingqty: value } : item
        );
        setTableData(updatedData);
    };

    const filteredData = tableData.filter(
        (item) => item.boardserialnumber === formData.boardserialnumber
    );

    const handlePoChange = (name, value) => {
        const newData = {
            ...formData,
            [name]: value
        };
        setFormData(newData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetchBoardSerialNumber();
            if (response.status === 200) {
                const fetchBoardDetail = response.data.map((item, idx) => ({
                    ...item,
                    selectedid: item.selectedid ?? idx, // fallback index as unique id
                    RequestedQty: item.pickingqty || 0
                }));
                setTableData(fetchBoardDetail);
            } else {
                console.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    // console.log("tableData", tableData);


    const typeOptions = [...new Set(tableData.map(i => i.type))].map(val => ({ label: val, value: val }));

    const groupOptions = [...new Set(
        tableData.filter(i => i.type === formData.Type).map(i => i.productgroup)
    )].map(val => ({ label: val, value: val }));

    const nameOptions = [...new Set(
        tableData.filter(i => i.type === formData.Type && i.productgroup === formData.ProductGroup)
            .map(i => i.productname)
    )].map(val => ({ label: val, value: val }));

    const serialOptions = [...new Set(
        tableData.filter(i =>
            i.type === formData.Type &&
            i.productgroup === formData.ProductGroup &&
            i.productname === formData.ProductName
        ).map(i => i.boardserialnumber)
    )].map(val => ({ label: val, value: val }));
    const valiDate = () => {
        const errors = {};
        let isValid = true;

        filteredData.forEach((row, index) => {
            if (!row.pickingqty || Number(row.pickingqty) <= 0) {
                errors[`pickingqty${index}`] = "Enter valid pickingqty";
                isValid = false;
            }
        });

        setFormErrors(errors); // if you’re using error state
        return isValid;
    };


    useEffect(() => {
        if (formData.boardserialnumber) {
            setShowTable(true);
        } else {
            setShowTable(false);
        }
    }, [formData.boardserialnumber]);

    // console.log("formData", formData);
    // console.log("table", showTable);

    const handlePTLRequest = (e) => {
        e.preventDefault();
        if (!valiDate()) return;
        const userName = sessionStorage.getItem("userName") || "System";
        const updatedFilteredData = filteredData.map((row) => ({
            ...row,
            modifiedby: userName,
            reworkername: userName
        }));
        // setPtlRequestData(prev => [...prev, filteredData]);
        // console.log("PTL Request Data:", updatedFilteredData);

        savePTLRequest(updatedFilteredData)
            .then((response) => {
                // console.log("RESPONSE:", response);
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    setRequestButton(false)
                    // setTableData([]);
                    // setShowTable(false);
                    // ✅ only call if it exists
                    if (typeof formClear === "function") formClear();
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

    // const handleDone = (e) => {
    //     e.preventDefault();
    //     const updatedFilteredData = filteredData.map((row) => ({
    //         ...row,
    //         modifiedby: userName,
    //         reworkername: userName
    //     }));

   
   const handleSubmit = async () => {
     const payload = filteredData.map(item => ({
       id: item.id,   // use selectedid if that's your row ID
     pickingqty: item.availableqty // match backend field
     }));
   
    //  console.log("payload", payload);
   
     // send payload to API if needed
     try {
       const response = await saveReworkerSubmit(payload);
       setSuccessMessage("API success:", response.message)
       setShowSuccessPopup(true)
       setShowTable(false)
    //    console.log("API success:", response);
     } catch (error) {
       setErrorMessage("Error sending payload:", error)
       setShowErrorPopup(true)
    //    console.error("Error sending payload:", error);
     }
   };
    const handleCancelBoard = () => {
        setIsFrozen(true);
        setSubmitButton(false)
        setClearButton(true);
    }
     const handleClear = () => {
      
        setFormErrors({});
        setShowTable(false);
        setIsFrozen(false);

        setSubmitButton(true);
        setClearButton(false);
        setFormData({
            boardserialnumber: "",
        });
        
    }
    // console.log("PTL Request Data:", filteredData.is_ptlrequest);
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <h5>Reworker</h5>
                </div>

                <ReworkerTextFiled
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    tableData={tableData}
                // formErrors={formErrors} // ✅ Pass this prop
                // handlePoChange={handlePoChange}
                // productOptions={productOptions}
                // setFormData={setFormData}
                // partOptions={partOptions}
                // isFrozen={isFrozen}

                />

            </div>
            <div className='ComCssInputHide7'>
                <div className='ComCssFiledName'>
                    <h5>Reworker</h5>
                </div>
                <ReworkerTextFiled7
                    formData={formData}
                    handleChange={handleChange}
                    typeOptions={typeOptions}
                    groupOptions={groupOptions}
                    nameOptions={nameOptions}
                    serialOptions={serialOptions}
                    handlePoChange={handlePoChange}
                    isFrozen={isFrozen}
                />
            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>

                    <ReworkerTable
                        data={filteredData}
                        page={0}
                        perPage={10}
                        totalRows={filteredData.length}
                        loading={false}
                        setPage={() => { }}
                        setPerPage={() => { }}
                        handleQtyChange={handleQtyChange}
                    />
                    <div className="ReworkerButton9">

                        {
                            filteredData.length > 0 &&
                            (filteredData[0].is_ptlrequest == 2) && (
                                <button style={{ backgroundColor: 'Red' }} onClick={handleCancelBoard}>CancelBoard</button>
                            )
                        }
                        {requestButton &&
                            filteredData.length > 0 &&
                            (filteredData[0].is_ptlrequest === null || filteredData[0].is_ptlrequest === "0") && (
                                <button className='ComCssSubmitButton' onClick={handlePTLRequest}>Request</button>
                            )
                        }
                        {submitButton && (
                            <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>
                        )}
                        {clearButton && (
                            <button className='ComCssClearButton' onClick={handleClear}>Clear</button>
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
        </div>)
}

export default Reworker