import React, { useState, useEffect } from 'react';
import TechnologyTextfIled from "../../components/Technology/TechnologyTextfIled";
import TechnologyTable from "../../components/Technology/TechnologyTable";
import TechnologyDefaultTable from "../../components/Technology/TechnologyDefaultTable";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { downloadLocalReport, downloadLocalReportFilter, downloadLocalReportSearch, fetchBoardSerialNumber, fetchproductPtl, fetchRepaier, fetchTechnology, getindiviualDetailFilter, getindiviualDetailFind, getLocalDetailFind, getLocalINdiviual, getLocalMaster, getLocalReport, getLocalReportDetailFilter, getPartcode, savePTLRepaier, savePTLRequest, savePTLStore, saveTechnology } from '../../Services/Services_09';
import * as XLSX from "xlsx";

const Technology = () => {
    const [formData, setFormData] = useState({
        sui: "",
        partcode: "",
        partdescription: "",
        req_qty: "",
        availbleQty: "",     // use this spelling everywhere
        rackLocation: "",    // capital L, everywhere
    });
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
    const [isFrozen, setIsFrozen] = useState(false);
    const [submitButton, setSubmitButton] = useState(true);
    const [clearButton, setClearButton] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [indiviualReport, setIndiviualReport] = useState([])
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [repaierReworkerData, setRepaierReworkerData] = useState([]);
    const [localReportData, setLocalReportData] = useState([]);
    const [downloadDone, setDownloadDone] = useState(false);
    const [localMasterPartcode, setLocalMasterPartcode] = useState([]);
    const [technologyData, setTechnologyData] = useState([])
    const [downloadProgress, setDownloadProgress] = useState(null);
    const handlePoChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedForm = {
            ...formData,
            [name]: value,
        };


        setFormData(updatedForm);
    };
    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.sui && !isFrozen) {
            errors.sui = "Please Select sui";
            isValid = false;
        }
        if (!formData.partcode) {
            errors.partcode = "Please Select Partcode";
            isValid = false;
        }
        if (!formData.partdescription) {
            errors.partdescription = "Please Select partdescription";
            isValid = false;
        }
        if (!formData.rackLocation) {
            errors.rackLocation = "Please Select rackLocation";
            isValid = false;
        }

        if (!formData.req_qty) {
            errors.req_qty = "Please Select req_qty";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    };

    // console.log("formdata", formData)

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!showTable && !valiDate()) return;

        const userName = sessionStorage.getItem("userName") || "System";

        const updatedFormData = tableData.map((row) => ({
            ...row,
            createdby: userName,
            modifiedby: userName,
        }));

        saveTechnology(updatedFormData)
            .then((response) => {
                // console.log("RESPONSE:", response);
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    setTableData([]);
                    setShowTable(false);
                    setIsFrozen(false);
                    // ✅ only call if it exists
                    if (typeof handleClear === "function") handleClear();
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

    };
    useEffect(() => {
        fetchLocalMasterPartcode();
        fetchPoDetail(page, perPage);

    }, []);
    const fetchLocalMasterPartcode = async () => {
        setLoading(true);
        try {
            const response = await getPartcode();
            setLocalMasterPartcode(response.data);
        } catch (error) {
            // console.error("Error fetching vendors", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchPoDetail = (page = 1, size = 10) => {
        fetchTechnology(page - 1, size)
            .then((response) => {
                setTechnologyData(response.data.content || []);
                setTotalRows(response.data.totalElements || 0);
                // console.log('fetchPodetail', response.data);
            })
    }
    const handleAddClick = () => {
        if (!valiDate()) return;
  if (tableData.some(item => item.partcode === formData.partcode)) {
setErrorMessage("Partcode Already Added")
setShowErrorPopup(true);
    return;
    }
        // console.log("Before adding, tableData:", tableData);
        setTableData(prev => {
            const newData = [...prev, { ...formData }];
            // console.log("After adding, new data:", newData);
            return newData;
        });
        setIsFrozen(true);
        setFormData(prev => ({
            ...prev,

            partcode: "",
            partdescription: "",
            racklocation: "",
            availbleQty: "",
            req_qty: "",

        }));
    };
    useEffect(() => {
        if (tableData.length > 0) {
            setShowTable(true);
        }
    }, [tableData]);
    // console.log("showTable:", showTable);
    // console.log("tableData:", tableData);
    const clear = () => {
        setShowTable(false)
        setIsFrozen(false)
        setTableData([])
        setFormErrors("");
        setFormData({
            sui: "",
            partcode: "",
            partdescription: "",
            req_qty: "",
            availbleQty: "",
            rackLocation: "",
        })
    }
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Technology</p>
                </div>
                <div className='ComCssUpload'>
                    <input type="file" accept=".xlsx, .xls" id="fileInput" style={{ display: 'none' }} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>
                    <button > Excel Format Download </button>
                </div>
                <TechnologyTextfIled
                    formData={formData}
                    setFormData={setFormData}
                    handlePoChange={handlePoChange}
                    handleInputChange={handleInputChange}
                    formErrors={formErrors}
                    localMasterPartcode={localMasterPartcode}
                    isFrozen={isFrozen}

                />

                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleAddClick} >ADD</button>
                    <button className='ComCssClearButton' onClick={clear}>Clear</button>
                </div>

            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>

                    <TechnologyTable
                        data={tableData}
                        setTableData={setTableData}
                        page={page}
                        perPage={perPage}
                        totalRows={tableData.length}
                        loading={false}
                        setPage={setPage}
                        setShowTable={setShowTable}
                        setPerPage={setPerPage}
                        setFormData={setFormData}
                        setIsFrozen={setIsFrozen}
                    />
                    <div className="ComCssButton9">
                        <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>

                    </div>
                </div>
            )}
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>ADD Board</h5>

                <TechnologyDefaultTable
                    data={technologyData}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                // selectedRows={selectedRows}
                // setSelectedRows={setSelectedRows}

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
        </div>)
}

export default Technology