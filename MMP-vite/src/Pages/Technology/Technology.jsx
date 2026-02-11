import React, { useState, useEffect } from 'react';
import TechnologyTextfIled from "../../components/Technology/TechnologyTextfIled";
import TechnologyTable from "../../components/Technology/TechnologyTable";
import TechnologyDefaultTable from "../../components/Technology/TechnologyDefaultTable";
import { FaFileExcel, FaLeaf } from "react-icons/fa";
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
    const [addButton, setAddButton] = useState(true);
    const [updateButton, setUpdateButton] = useState(false)
    const [isEdit,setIsEdit] =useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    
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

    const handleUpdate = async () => {

        setUpdateButton(true)
        setAddButton(false)
        setLoading(true);
        try {
            // const userName = sessionStorage.getItem("userId") || "System";
            const userName = sessionStorage.getItem("userId") || "System";
            // Determine if formData is a single object or an array
            let payload = Array.isArray(formData)
                ? formData.map((row) => ({ ...row, modifiedby: userName }))
                : [{ ...formData, modifiedby: userName }];

            const response = await saveTechnology(payload);

            if (response?.status === 200 && response.data) {
                const { message } = response.data;
                setSuccessMessage(message || "Saved successfully");
                setShowSuccessPopup(true);
                clear();
                fetchPoDetail();
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || error.message;
            setErrorMessage(errMsg);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!showTable && !valiDate()) return;

        // const userName = sessionStorage.getItem("userName") || "System";
        const userName = localStorage.getItem("userName") || "System";
        const updatedFormData = tableData.map((row) => ({
            ...row,
            createdby: userName,
            modifiedby: userName,
        }));

        saveTechnology(updatedFormData)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    clear();
                    fetchPoDetail();
                } else {
                    setErrorMessage(response.data?.message || "Unknown error");
                    setShowErrorPopup(true);
                    setTableData([]);
                    setShowTable(false);
                }
            })
            .catch((error) => {
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
        setIsEdit(true)
        setShowTable(false)
        setIsFrozen(false)
        setTableData([])
        setFormErrors("");
        setAddButton(true)
        setUpdateButton(false)
        setFormData({
            sui: "",
            partcode: "",
            partdescription: "",
            req_qty: "",
            availbleQty: "",
            rackLocation: "",
        })
    }
    useEffect(() => {
        setPage(1);
    }, [searchText]);

    const filteredData = technologyData.filter(row =>
        Object.values(row).some(value =>
            typeof value === "string" && value.toLowerCase().includes(searchText.toLowerCase())
        )
    );
    const paginatedData = filteredData.slice(
        (page - 1) * perPage,
        page * perPage
    );
    useEffect(() => {
        setTotalRows(filteredData.length); // important!
    }, [filteredData]);

    const filteredVendors = technologyData.filter(v =>
        v.sui?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.partcode?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.partdescription?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.racklocation?.toLowerCase().includes(searchText.toLowerCase())

    );
    const exportToExcel = (searchText = "") => {
        if (searchText && searchText.trim() !== "") {
            if (!Array.isArray(technologyData) || filteredVendors.length === 0) {
                // console.warn("No data to export.");
                return;
            }
            const sheet = XLSX.utils.json_to_sheet(filteredVendors);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Vendors");
            XLSX.writeFile(workbook, "Technology.xlsx");

        } else {
            if (!Array.isArray(technologyData) || technologyData.length === 0) {
                // console.warn("No data to export.");
                return;
            }
            const sheet = XLSX.utils.json_to_sheet(technologyData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Vendors");
            XLSX.writeFile(workbook, "Technology.xlsx");
        }

    };
    const [editingRowId, setEditingRowId] = useState(null);

    const handleEditClick = (row) => {
        setIsEdit(false)
        setUpdateButton(true)
        setAddButton(false)
        // setHandleUploadButton(false)
        // setSelectedRows([]);
        setEditingRowId(row.id);

        setFormData(prev => ({
            ...prev, // keep previous data if missing in row
            id: row.id ?? prev.id ?? "",
            sui: row.sui ?? prev.sui ?? "",
            partcode: row.partcode ?? prev.partcode ?? "",
            partdescription: row.partdescription ?? prev.partdescription ?? "",
            req_qty: row.req_qty ?? prev.req_qty ?? "",
        }));

        setFormErrors({});

        // setData([{ ...row, selectedid: row.id }]);
        setTotalRows(1);
    };

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
                    isEdit={isEdit}

                />

                <div className="ReworkerButton9">
                    {addButton &&
                        <button className='ComCssSubmitButton' onClick={handleAddClick} >ADD</button>
                    }
                    <button className='ComCssClearButton' onClick={clear}>Clear</button>
                    {updateButton &&
                        <button className='ComCssSubmitButton' onClick={handleUpdate} >Update</button>
                    }
                </div>


            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>Technology</h5>

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
                <h5 className='ComCssTableName'>Technology</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)}  >
                        <FaFileExcel /> Export
                    </button>

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
                <TechnologyDefaultTable
                    data={paginatedData}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                    onEdit={handleEditClick}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}

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