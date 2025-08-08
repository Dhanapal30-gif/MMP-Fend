import React, { useState, useEffect } from 'react';
import LocalndindividualReportCom from "../../components/LocalndindividualReport/LocalndindividualReportCom";
import LocalReportIndiviualTable from "../../components/LocalndindividualReport/LocalReportIndiviualTable";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";

import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchBoardSerialNumber, fetchproductPtl, getindiviualDetailFilter, getindiviualDetailFind, getLocalINdiviual, getLocalMaster, savePTLRepaier, savePTLRequest, savePTLStore } from '../../Services/Services_09';
import "./Localindivual.css";
const LocalndindividualReport = () => {

    const [formData, setFormData] = useState({
        status: "",
        startDate: "",
        endDate: "",
        download: null,
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

    console.log("formData", formData);
    const handlePoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === "" ? null : value   // ✅ avoid setting download: ""
        }));
    };


    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     handlePoChange(name, value);
    // };
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedForm = {
            ...formData,
            [name]: value,
        };

        // Reset download if either StartDate or EndDate changes
        if (name === "startDate" || name === "endDate") {
            updatedForm.download = null;
        }

        setFormData(updatedForm);
    };


    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };

    const debouncedSearch = useDebounce(searchText, 500); // delay in ms
    const userId = sessionStorage.getItem("userId");

    console.log("userId", userId);


    const valiDate = () => {
        const errors = {};
        let isValid = true;

        // If either date is selected, but the other is missing
        if (formData.startDate && !formData.endDate) {
            errors.endDate = "Please Select EndDate";
            isValid = false;
        }
        if (!formData.startDate && formData.endDate) {
            errors.startDate = "Please Select StartDate";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    //     useEffect(() => {
    //   if (userId) {
    //     fetchIndiviualDetail(page, perPage, userId,);
    //   }
    // }, [page, perPage, userId]);
    useEffect(() => {
        fetchData(userId, page, perPage, debouncedSearch);
    }, [userId, page, perPage, debouncedSearch]);

    const fetchData = (userId, page = 1, size = 10, search = "") => {
        console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            fetchfindSearch(userId, page, size, search);
        } else if (isFilterActive) {
            fetchFilterResult();
        }
        else {
            fetchIndiviualDetail(userId, page, size);
        }
    };

    const fetchIndiviualDetail = (userId, page = 1, size = 10) => { 
            setLoading(true); // <-- start loading
        getLocalINdiviual(page - 1, size, userId)
            .then((response) => {
                if (response?.data?.content) {
                    setIndiviualReport(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching receiving data:", error);
            })
      .finally(() => {
            setLoading(false); // <-- stop loading
        });
        };

    const fetchfindSearch = (userId, page = 1, size = 10, search = "") => {
        getindiviualDetailFind(page - 1, size, userId, search)
            .then((response) => {
                if (response?.data?.content) {
                    setIndiviualReport(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            });
    };

    const handleFilter = (e) => {
        e.preventDefault();
        if (!valiDate()) return;

        setIsFilterActive(true); // triggers filter in useEffect
        fetchFilterResult();     // directly call API

    };
    const fetchFilterResult = () => {
        getindiviualDetailFilter(page - 1, perPage, userId, formData)
            .then((response) => {
                if (response?.data?.content) {
                    setIndiviualReport(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                }
            })
            .catch((error) => {
                console.error("Error in filter API:", error);
            });
    };

    const Clear = () => {
        setIsFilterActive(false);
        setSearchText("");
                fetchData(userId, page, perPage, debouncedSearch);

        setFormData({
            status: "",
            startDate: "",
            endDate: "",
            download: null
        })
    };
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Local individual Report</p>

                </div>
                <LocalndindividualReportCom
                    formData={formData}
                    setFormData={setFormData}
                    handlePoChange={handlePoChange}
                    handleInputChange={handleInputChange}
                    isFrozen={isFrozen}
                    formErrors={formErrors}

                />

                <div className="ReworkerButton9">

                    <button style={{ backgroundColor: 'green' }} onClick={handleFilter}>Search</button>
                    <button style={{ backgroundColor: 'green' }} onClick={Clear}>Clear</button>

                </div>
            </div>
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Report Detail</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)} >
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
                
                <LocalReportIndiviualTable
                    data={indiviualReport}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}

                />
      

            </div>
        </div>

    )
}

export default LocalndindividualReport