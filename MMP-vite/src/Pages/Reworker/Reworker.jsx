import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReworkerTextFiled from "../../components/Reworker/ReworkerTextFiled";
import ReworkerTable from "../../components/Reworker/ReworkerTable";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import './Reworker.css';

import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchBoardSerialNumber, fetchproductPtl, getLocalMaster, saveDoneRequest, savePTLRepaier, savePTLRequest, savePTLStore, saveReworkerSubmit } from '../../Services/Services_09';
import { cancelReworkerBoard, fetchSearchBoard } from '../../Services/Services-Rc';
import ReworkerTypeBasedhide from "../../components/Reworker/ReworkerTypeBasedhide";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { Type } from 'lucide-react';


const Reworker = () => {
    const [formData, setFormData] = useState({
        boardserialnumber: "", id: ""
    })
    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
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
    const [selectedGrnRows, setSelectedGrnRows] = useState([]);
    const [doneSelectButton, setDoneSelectButton] = useState(false);
    const [searchScanText, setSearchScanText] = useState('');
    const [boardType, setBoardType]=useState([]);
    const [boardTypeDropdown, setBoardTypeDropdown]=useState(false);
const [typeList, setTypeList] = useState([]); // dropdown types

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

    // console.log("selectedGrnRows", selectedGrnRows)

    const fullData = boardFetch;

    const handleDoneClick = () => {
        if (selectedGrnRows.length === 0) return; // nothing selected

        const selectedRowsData = boardFetch.filter(row =>
            selectedGrnRows.includes(row.id)
        );

        setLoading(true);

        saveDoneRequest(selectedRowsData)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    setSuccessMessage(response.data.message || "Saved successfully");
                    setShowSuccessPopup(true);
                    setSubmitButton(true);
                    // setRequestButton(true);

                    // ✅ Mark rows as done so checkboxes hide
                    setBoardFetch(prev =>
                        prev.map(row =>
                            selectedGrnRows.includes(row.id)
                                ? { ...row, is_done: 1 }
                                : row
                        )
                    );

                    // ✅ Clear selection so "select all" checkbox resets
                    setSelectedGrnRows([]);
                    
                }
            })
            .catch(err => console.error(err))
            .finally(() => {
                setLoading(false);
            });
    };
    React.useEffect(() => {
        // Remove any previously selected rows that are now done
        setSelectedGrnRows(prev =>
            prev.filter(id => !boardFetch.find(row => row.id === id && row.is_done === 1))
        );
    }, [boardFetch]);

    const handleSearchClick = (searchTerm,type) => {

        if (!searchTerm) {
            setErrorMessage("Please enter a module serial number.");
            setShowErrorPopup(true);
            return;
        }

        // setTableData([]);
        
       
        fetchSearchBoard(searchTerm,type)
            .then((response) => {
                const data = response.data; // directly use response.data
                if (data && data.length > 0) {
                    //   setTableData(data);
                    const fetchBoardDetail = data.map(item => ({
                        ...item,
                        selectedid: item.id,   // Use unique id from API
                        RequestedQty: item.pickingqty || 0,
                        // isFrozen: item.is_ptlrequest === "1"  // freeze if API says 1
                        // type:item.type
                    }));
                    setBoardFetch(fetchBoardDetail);
                    setTotalRows(fetchBoardDetail.length)
                    //   setBoardFetch(data)
                    // fetchData();
                    //   setFormData({ ...formData, ...data[0] });
                } else {
                    // console.warn("No content found:", data);
                    setErrorMessage("No record found for this serial number.");
                    setShowErrorPopup(true);
                }
            })
            .catch((error) => {
                // console.error("Error fetching board data:", error);
                setErrorMessage("Error fetching board details.");
                setShowErrorPopup(true);
            });
    };


//    useEffect(() => {
//   console.log("TABLE DATA:", boardFetch);
// }, [boardFetch]);

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
                searchBoardserialNumber: "",
                
                
            }));
            setSearchScanText("");
            setBoardTypeDropdown(false);
            setBoardType([]);
        } else if (field === "ProductGroup") {
            setFormData(prev => ({
                ...prev,
                ProductGroup: value,
                ProductName: "",
                boardserialnumber: "",
                
            }));
            setSearchScanText("");
        } else if (field === "ProductName") {
            setFormData(prev => ({
                ...prev,
                ProductName: value,
                boardserialnumber: ""
            }));
            setSearchScanText("");
        } else if (field === "boardserialnumber") {
            setFormData(prev => ({ ...prev, boardserialnumber: value }));
            setSearchScanText("");
            const searchTerm = value; // ✅ use the current input value
            handleSearchClick(searchTerm,formData.Type);
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

        if (isFrozen) {
            if (!formData.ReworkerComments || formData.ReworkerComments.trim() === "") {
                errors.ReworkerComments = "Reworker Comments is required";
                isValid = false;
            }
        }


        setFormErrors(errors); // if you’re using error state
        return isValid;
    };


    const cancelValiDate = () => {
        const errors = {};
        let isValid = true;
        if (isFrozen) {
            if (!formData.ReworkerComments || formData.ReworkerComments.trim() === "") {
                errors.ReworkerComments = "Reworker Comments is required";
                isValid = false;
            }
        }
        setFormErrors(errors); // if you’re using error state
        return isValid;
    };

    const allRowsDone =
        boardFetch.length > 0 &&
        boardFetch.every(row => row.is_done === 1);


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
        const userName = sessionStorage.getItem("userName");
        const updatedFilteredData = boardFetch.map((row) => ({
            ...row,
            modifiedby: userName,
            reworkername: userName
        }));
        // setPtlRequestData(prev => [...prev, filteredData]);
        // console.log("PTL Request Data:", updatedFilteredData);

        setLoading(true);
        savePTLRequest(updatedFilteredData)
            .then((response) => {
                // console.log("RESPONSE:", response);
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    setRequestButton(false)
                    setdoneButton(true)
                    // setIsFrozen(true);
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
            }).
            finally(() => {
                setLoading(false);
            });
    }
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    const handleCancel = () => {
        setConfirmSubmit(false);
    };
    const onSubmitClick = () => {
        setConfirmSubmit(true);

    };
    const handleSubmit = async () => {
        setLoading(true);
        setConfirmSubmit(false);
        const reworkername = sessionStorage.getItem("userName")

        const payload = boardFetch.map(item => ({
            id: item.id,   // use selectedid if that's your row ID
            pickingqty: item.availableqty, // match backend field
            reworkername,
            productname: item.productname,
            boardSerialNo: item.boardserialnumber,
            type: item.type
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
            setSearchScanText("");
            setRequestButton(true);
            setBoardTypeDropdown([]);
            //    console.log("API success:", response);
        } catch (error) {
            const msg =
        error?.response?.data?.message || "Something went wrong";

            setErrorMessage(msg)
            setShowErrorPopup(true)
            //    console.error("Error sending payload:", error);
        } finally {
            setLoading(false);
        }
    };

   const handleCancelBoard = async () => {
  try {
    setIsFrozen(true);
    setSubmitButton(false);
    setClearButton(true);

    const isValid = cancelValiDate();
    if (!isValid) {
      console.warn("Validation failed. Cannot cancel.");
      return;
    }

    const payload = [
      ...new Set(boardFetch.map(item => item.boardserialnumber))
    ].map(boardSerialNo => ({ boardSerialNo }));

    const res = await cancelReworkerBoard(payload);

    if (res?.data?.success) {
      setSuccessMessage(res.data.message);
      setShowSuccessPopup(true);
      setShowTable(false);
      setFormData({ Type: "" });
      fetchData();
      setIsFrozen(false)
    } else {
      console.error("Cancel failed:", res?.data?.message);
    }

  } catch (error) {
    console.error("Cancel board failed:", error?.response?.data?.message || error.message);
  }
};

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

    // const showRequest =
    //     requestButton &&
    //     boardFetch.length > 0 &&
    //     // boardFetch[0].is_ptlrequest === "0" &&
    //     (boardFetch[0]?.is_ptlrequest === "0" || !boardFetch[0]?.is_ptlrequest) &&
    //     (
    //         ['Trackchange', 'Reflow'].includes(boardFetch[0]?.type) ||
    //         !['Soldring', 'Desoldring','Thermal GEL'].includes(boardFetch[0]?.type)
    //     );

//         const showRequest =
//   Boolean(requestButton) &&
//   boardFetch?.length > 0 &&
//   (boardFetch[0]?.is_ptlrequest === "0" ||  boardFetch[0]?.is_ptlrequest == null) &&
//   ['Rework','SUI','RND','BGA'].includes(boardFetch[0]?.type);


const showRequest =
  requestButton === true &&
  Array.isArray(boardFetch) &&
  boardFetch.length > 0 &&
  boardFetch[0]?.is_ptlrequest == null && // null or undefined only
  ['REWORK', 'SUI', 'RND', 'BGA'].includes(
    (boardFetch[0]?.type || '').trim().toUpperCase()
  );

//   console.log("requestButton", requestButton);

    //  console.log("boardFetch.RequestedQty", boardFetch[1]?.RequestedQty);

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
                    setLoading={setLoading}
                    setSearchScanText={setSearchScanText}
                    searchScanText={searchScanText}
                    setRequestButton={setRequestButton}
                    setSelectedGrnRows={setSelectedGrnRows}
                    setBoardType={setBoardType}
                    setBoardTypeDropdown={setBoardTypeDropdown}
                    boardType={boardType}
                    boardTypeDropdown={boardTypeDropdown}
                    setTypeList={setTypeList}
                    typeList={typeList}
                    setShowTable={setShowTable}
                    setTableData={setTableData}
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
                    formErrors={formErrors}
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

                    {(boardFetch[0]?.type === 'Soldring' || boardFetch[0]?.type === 'Desoldring' || boardFetch[0]?.type === 'Trackchange' || boardFetch[0]?.type === 'Swap' || boardFetch[0]?.type === 'Reflow' || boardFetch[0]?.type === 'Thermal GEL') ? (
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
                             selectedGrnRows={selectedGrnRows}   // <-- current selection
                                setSelectedGrnRows={setSelectedGrnRows} // <-- setter function

                        />
                    ) : (
                        <>
                            <LoadingOverlay loading={loading} />

                            <ReworkerTable
                                data={boardFetch}
                                page={page}
                                perPage={perPage}
                                setPerPage={setPerPage}
                                totalRows={totalRows}
                                loading={false}
                                // setPage={() => { }}
                                // setPerPage={() => { }}
                                setPage={setPage}
                                handleQtyChange={handleQtyChange}
                                doneButton={doneButton}
                                setdoneButton={setdoneButton}
                                setBoardFetch={setBoardFetch}
                                fetchData={fetchData}
                                setSuccessMessage={setSuccessMessage}
                                setShowSuccessPopup={setShowSuccessPopup}
                                setRequestButton={setRequestButton}
                                setSubmitButton={setSubmitButton}
                                isFrozen={isFrozen}
                                setLoading={setLoading}
                                selectedGrnRows={selectedGrnRows}   // <-- current selection
                                setSelectedGrnRows={setSelectedGrnRows} // <-- setter function

                            />
                        </>
                    )}


                    <div className="ReworkerButton9">

                        {/* {
                            boardFetch.length > 0 &&
                            (boardFetch[0].is_ptlrequest == 2) && (
                                <button style={{ backgroundColor: 'Red' }} onClick={handleCancelBoard}>CancelBoard</button>
                            )
                        }
                        {
                           
                            (boardFetch[0]?.type === 'Soldring' || boardFetch[0].is_ptlrequest == 2 || boardFetch[0]?.type === 'Desoldring' || boardFetch[0]?.type === 'Track change' || boardFetch[0]?.type === 'Reflow') ||   boardFetch[0]?.type === 'Rework' && (
                                <button style={{ backgroundColor: 'Red' }} onClick={handleCancelBoard}>CancelBoard</button>
                            )
                        } */}
                        {
                            boardFetch.length > 0 &&
                            (
                                boardFetch[0].is_ptlrequest == 2 ||
                                ['Soldring', 'SUI', "RND", 'Desoldring','BGA', 'Trackchange', 'Reflow', 'Rework', 'Thermal GEL'].includes(boardFetch[0]?.type)
                            ) && (
                                <button style={{ backgroundColor: 'Red' }} onClick={handleCancelBoard}>CancelBoard</button>
                            )
                        }

                        {/* {requestButton &&
                            boardFetch.length > 0 &&
                            (boardFetch[0].is_ptlrequest === null || boardFetch[0].is_ptlrequest === "0") && boardFetch[0]?.type !== 'Soldring' && boardFetch[0]?.type !== 'Desoldring' || boardFetch[0]?.type === 'Track change' || boardFetch[0]?.type === 'Reflow' && (
                                <button className='ComCssSubmitButton' onClick={handlePTLRequest}>Request</button>
                            )
                        } */}
                        {/* 
                        {requestButton &&
                            boardFetch.length > 0 &&
                            (
                                (
                                    (boardFetch[0].is_ptlrequest === null || boardFetch[0].is_ptlrequest === "0") &&
                                    boardFetch[0]?.type !== 'Soldring' &&
                                    boardFetch[0]?.type !== 'Desoldring'
                                ) ||
                                boardFetch[0]?.type === 'Trackchange' ||
                                boardFetch[0]?.type === 'Reflow'
                            ) && (
                                <button className='ComCssSubmitButton' onClick={handlePTLRequest}>Request</button>
                            )
                        } */}
                        {showRequest && (
                            <button className='ComCssSubmitButton' onClick={handlePTLRequest}>Request</button>
                        )}

                        {/* {boardFetch.some(item => item.checkSubmit === "1") && (
                            <button className='ComCssSubmitButton' onClick={handleSubmit}>
                                Submit
                            </button>
                        )}

                        {submitButton && boardFetch.some(item => item.checkSubmit !== "1") && (
                            <button className='ComCssSubmitButton' onClick={handleSubmit}>
                                Submit
                            </button>
                        )} */}

                        {allRowsDone && (
                            <button className="ComCssSubmitButton" onClick={onSubmitClick}>
                                Submit
                            </button>
                        )}
                        {clearButton && (
                            <button className='ComCssClearButton' onClick={handleClear}>Clear</button>
                        )}
                        {selectedGrnRows.length > 0 && (

                            <button className='ComCssSubmitButton' onClick={handleDoneClick}>
                                Done
                            </button>
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
            <CustomDialog
                open={confirmSubmit}
                onClose={handleCancel}
                onConfirm={handleSubmit}
                title="Confirm"
                message="Are you sure you want to Submit this?"
                color="primary"
            />
        </div>)
}

export default Reworker