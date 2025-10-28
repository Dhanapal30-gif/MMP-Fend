import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReworkerTextFiled from "../../components/Reworker/ReworkerTextFiled";
import ReworkerTable from "../../components/Reworker/ReworkerTable";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import './Reworker.css';

import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchBoardSerialNumber, fetchproductPtl, getLocalMaster, savePTLRepaier, savePTLRequest, savePTLStore, saveReworkerSubmit } from '../../Services/Services_09';
import { fetchSearchBoard } from '../../Services/Services-Rc';
import ReworkerTypeBasedhide from "../../components/Reworker/ReworkerTypeBasedhide";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";


const Reworker = () => {
    const [formData, setFormData] = useState({
        boardserialnumber: "", id: ""
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
    const [doneButton, setdoneButton] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [submitButton, setSubmitButton] = useState(false);
    const [clearButton, setClearButton] = useState(false);
    const [boardFetch, setBoardFetch] = useState([])


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



    const handleSearchClick = (searchTerm) => {
        // const searchTerm = formData.searchBoardserialNumber; // ✅ get search input value
        console.log("formData", formData)
        if (!searchTerm) {
            console.warn("Please enter a module serial number.");
            setErrorMessage("Please enter a module serial number.");
            setShowErrorPopup(true);
            return;
        }

        fetchSearchBoard(searchTerm)
            .then((response) => {
                const data = response.data; // directly use response.data
                if (data && data.length > 0) {
                    //   setTableData(data);
                    const fetchBoardDetail = data.map(item => ({
                        ...item,
                        selectedid: item.id,   // Use unique id from API
                        RequestedQty: item.pickingqty || 0,
                    }));
                    setBoardFetch(fetchBoardDetail);
                    //   setBoardFetch(data)
                    fetchData();
                    //   setFormData({ ...formData, ...data[0] });
                } else {
                    console.warn("No content found:", data);
                    setErrorMessage("No record found for this serial number.");
                    setShowErrorPopup(true);
                }
            })
            .catch((error) => {
                console.error("Error fetching board data:", error);
                setErrorMessage("Error fetching board details.");
                setShowErrorPopup(true);
            });
    };


    // const handleQtyChange = (id, value) => {
    //     const updatedData = boardFetch.map(item =>
    //         item.selectedid === id ? { ...item, pickingqty: value } : item
    //     );
    //     setBoardFetch(updatedData);
    // };

    const handleQtyChange = (id, value) => {
    const updatedData = boardFetch.map(item =>
        item.id === id ? { ...item, pickingqty: value } : item
    );
    setBoardFetch(updatedData);
};


    // console.log("boradeedr", boardFetch)
    // const filteredData = tableData.filter(
    //     (item) => item.boardserialnumber === formData.boardserialnumber
    // );
    const filteredData = useMemo(() => {
        return tableData.filter(
            (item) => item.boardserialnumber === formData.boardserialnumber
        );
    }, [tableData, formData.boardserialnumber]);


    const handlePoChange = (field, value) => {
        if (field === "Type") {
            setFormData(prev => ({
                ...prev,
                Type: value,
                ProductGroup: "",
                ProductName: "",
                boardserialnumber: "",
                searchBoardserialNumber: ""
            }));
        } else if (field === "ProductGroup") {
            setFormData(prev => ({
                ...prev,
                ProductGroup: value,
                ProductName: "",
                boardserialnumber: ""
            }));
        } else if (field === "ProductName") {
            setFormData(prev => ({
                ...prev,
                ProductName: value,
                boardserialnumber: ""
            }));
        } else if (field === "boardserialnumber") {
            setFormData(prev => ({ ...prev, boardserialnumber: value }));

            const searchTerm = value; // ✅ use the current input value
            handleSearchClick(searchTerm);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    // const fetchData = async () => {
    //     try {
    //         const response = await fetchBoardSerialNumber();
    //         if (response.status === 200) {
    //             const fetchBoardDetail = response.data.map((item, idx) => ({
    //                 ...item,
    //                 selectedid: item.selectedid ?? idx, // fallback index as unique id
    //                 RequestedQty: item.pickingqty || 0
    //             }));
    //             setTableData(fetchBoardDetail);
    //         } else {
    //             console.error("Failed to fetch data");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching data:", error);
    //     }
    // };


    const fetchData = useCallback(async () => {
        try {
            const response = await fetchBoardSerialNumber();
            if (response.status === 200) {
                // const fetchBoardDetail = response.data.map((item, idx) => ({
                //     ...item,
                //     selectedid: item.selectedid ?? idx,
                //     RequestedQty: item.pickingqty || 0,
                // }));
                // setBoardFetch(fetchBoardDetail);
                setTableData(response.data)
            }
        } catch (error) {
            console.error(error);
        }
    }, []);

    // const typeOptions = [...new Set(tableData.map(i => i.type))].map(val => ({ label: val, value: val }));
const typeOptions = [...new Set(tableData.map(i => i.type).filter(v => v && v.trim() !== ''))]
  .sort()
  .map(val => ({ label: val, value: val }));

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

        boardFetch.forEach((row, index) => {
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
        const updatedFilteredData = boardFetch.map((row) => ({
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
                    setdoneButton(true)
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

    const handleSubmit = async () => {
        setLoading(true);

        const payload = boardFetch.map(item => ({
            id: item.id,   // use selectedid if that's your row ID
            pickingqty: item.availableqty // match backend field
        }));

        try {
            const response = await saveReworkerSubmit(payload);
            setSuccessMessage("Request Sent to Repaier")
            setShowSuccessPopup(true)
            setShowTable(false)
            setFormData({
                Type: ""
            })
            fetchData();
            //    console.log("API success:", response);
        } catch (error) {
            setErrorMessage("Error sending payload:", error)
            setShowErrorPopup(true)
            //    console.error("Error sending payload:", error);
        } finally {
            setLoading(false);
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
                    // tableData={tableData}
                    // setTableData={setTableData}
                    boardFetch={boardFetch}
                    setBoardFetch={setBoardFetch}
                    errorMessage={errorMessage}
                    showErrorPopup={showErrorPopup}
                    setShowErrorPopup={setShowErrorPopup}
                    setErrorMessage={setErrorMessage}
                // formErrors={formErrors} // ✅ Pass this prop
                // handlePoChange={handlePoChange}
                // productOptions={productOptions}
                // setFormData={setFormData}
                // partOptions={partOptions}
                // isFrozen={isFrozen}

                />
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
            {/* <div className='ComCssInputHide7'>
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
            </div> */}
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>Board Detail</h5>

                    {(boardFetch[0]?.type === 'Soldring' || boardFetch[0]?.type === 'Desoldring' || boardFetch[0]?.type === 'Track change' || boardFetch[0]?.type === 'Reflow') ? (
                        <ReworkerTypeBasedhide
                            data={boardFetch}
                            page={0}
                            perPage={10}
                            totalRows={boardFetch.length}
                            loading={false}
                            setPage={() => { }}
                            setPerPage={() => { }}
                            handleQtyChange={handleQtyChange}
                            doneButton={doneButton}
                            setdoneButton={setdoneButton}
                            setBoardFetch={setBoardFetch}
                            fetchData={fetchData}
                            setSuccessMessage={setSuccessMessage}
                            setShowSuccessPopup={setShowSuccessPopup}
                            setRequestButton={setRequestButton}
                            setSubmitButton={setSubmitButton}
                        />
                    ) : (
                        <>
                            <LoadingOverlay loading={loading} />

                            <ReworkerTable
                                data={boardFetch}
                                page={0}
                                perPage={10}
                                totalRows={boardFetch.length}
                                loading={false}
                                setPage={() => { }}
                                setPerPage={() => { }}
                                handleQtyChange={handleQtyChange}
                                doneButton={doneButton}
                                setdoneButton={setdoneButton}
                                setBoardFetch={setBoardFetch}
                                fetchData={fetchData}
                                setSuccessMessage={setSuccessMessage}
                                setShowSuccessPopup={setShowSuccessPopup}
                                setRequestButton={setRequestButton}
                                setSubmitButton={setSubmitButton}

                            />
                        </>
                    )}


                    <div className="ReworkerButton9">

                        {
                            boardFetch.length > 0 &&
                            (boardFetch[0].is_ptlrequest == 2) && (
                                <button style={{ backgroundColor: 'Red' }} onClick={handleCancelBoard}>CancelBoard</button>
                            )
                        }
                        {
                            boardFetch.length > 0 &&
                            (boardFetch[0]?.type === 'Soldring' || boardFetch[0]?.type === 'Desoldring' || boardFetch[0]?.type === 'Track change' || boardFetch[0]?.type === 'Reflow') && (
                                <button style={{ backgroundColor: 'Red' }} onClick={handleCancelBoard}>CancelBoard</button>
                            )
                        }
                        {/* {requestButton &&
                            boardFetch.length > 0 &&
                            (boardFetch[0].is_ptlrequest === null || boardFetch[0].is_ptlrequest === "0") && boardFetch[0]?.type !== 'Soldring' && boardFetch[0]?.type !== 'Desoldring' || boardFetch[0]?.type === 'Track change' || boardFetch[0]?.type === 'Reflow' && (
                                <button className='ComCssSubmitButton' onClick={handlePTLRequest}>Request</button>
                            )
                        } */}

                        {requestButton &&
                            boardFetch.length > 0 &&
                            (
                                (
                                    (boardFetch[0].is_ptlrequest === null || boardFetch[0].is_ptlrequest === "0") &&
                                    boardFetch[0]?.type !== 'Soldring' &&
                                    boardFetch[0]?.type !== 'Desoldring'
                                ) ||
                                boardFetch[0]?.type === 'Track change' ||
                                boardFetch[0]?.type === 'Reflow'
                            ) && (
                                <button className='ComCssSubmitButton' onClick={handlePTLRequest}>Request</button>
                            )
                        }

                        {boardFetch.some(item => item.checkSubmit === "1") && (
                            <button className='ComCssSubmitButton' onClick={handleSubmit}>
                                Submit
                            </button>
                        )}

                        {submitButton && boardFetch.some(item => item.checkSubmit !== "1") && (
                            <button className='ComCssSubmitButton' onClick={handleSubmit}>
                                Submit
                            </button>
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