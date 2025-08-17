import React, { useState, useEffect } from 'react';
import LocalReportTextFiled from "../../components/LocalReport/LocalReportTextFiled";
import LocalReportTbale from "../../components/LocalReport/LocalReportTbale";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { downloadLocalReport, downloadLocalReportFilter, downloadLocalReportSearch, fetchBoardSerialNumber, fetchproductPtl, fetchRepaier, getindiviualDetailFilter, getindiviualDetailFind, getLocalDetailFind, getLocalINdiviual, getLocalMaster, getLocalReport, getLocalReportDetailFilter, savePTLRepaier, savePTLRequest, savePTLStore } from '../../Services/Services_09';

const LocalReport = () => {
    const [formData, setFormData] = useState({
        status: "",
        startDate: "",
        endDate: "",
        download: null,
        repairername: "",
        reworkername: ""
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
    const [downloadProgress, setDownloadProgress] = useState(null);

    console.log("formData", formData);

    const handlePoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === "" ? null : value
        }));
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedForm = {
            ...formData,
            [name]: value,
        };

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

    const debouncedSearch = useDebounce(searchText, 500);
    const userId = sessionStorage.getItem("userId");

    console.log("userId", userId);

    const valiDate = () => {
        const errors = {};
        let isValid = true;

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

    useEffect(() => {
        fetchRepairName();
    }, []);

    const fetchRepairName = () => {
        fetchRepaier()
            .then((response) => {
                setRepaierReworkerData(response.data);
            })
            .catch((error) => {
                // console.error("Error fetching receiving data:", error);
            })
    };

    const RepaierNameOptions = [...new Set(repaierReworkerData
        .filter(i => i.type?.toLowerCase() === "repairer")
        .map(i => i.name?.toLowerCase())
    )].sort().map(val => ({ label: val, value: val }));

    const ReworkerNameOptions = [...new Set(repaierReworkerData
        .filter(i => i.type?.toLowerCase() === "reworker")
        .map(i => i.name?.toLowerCase())
    )].sort().map(val => ({ label: val, value: val }));

    useEffect(() => {
        fetchData(page, perPage, debouncedSearch);
    }, [page, perPage, debouncedSearch]);


    const fetchData = (page = 1, size = 10, search = "") => {
        console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            fetchfindSearch(page, size, search);
        }
        else if (isFilterActive) {
            fetchFilterResult();
        }
        else {
            fetchLocalReport(page, size)
        }
    };

    const fetchLocalReport = (page = 1, size = 10) => {
        setLoading(true);
        getLocalReport(page - 1, size)
            .then((response) => {
                if (response?.data?.content) {
                    setLocalReportData(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching receiving data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchfindSearch = (page = 1, size = 10, search = "") => {
        setLoading(true)
        getLocalDetailFind(page - 1, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setLocalReportData(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                    setLoading(false)
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            });
    };

    console.log("formData", formData);

    const handleFilter = (e) => {
        e.preventDefault();
        if (!valiDate()) return;

        setIsFilterActive(true);
        fetchFilterResult();

    };
    const fetchFilterResult = () => {
        getLocalReportDetailFilter(page - 1, perPage, formData)
            .then((response) => {
                if (response?.data?.content) {
                    setLocalReportData(response.data.content);
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
        fetchData(page, perPage, debouncedSearch);
        setFormData({
            status: "",
            startDate: "",
            endDate: "",
            download: null,
            repairername: "",
            reworkername: ""
        })
    };
    const exportToExcel = (search = "") => {
        setDownloadDone(false);
        setDownloadProgress(null);
        setLoading(true);
        let apiCall;  // Declare here
        // const apiCall = search?.trim() !== "" ? downloadSearchProduct : downloadLocalIndiviual;
        if (search?.trim() !== "") {
            apiCall = () => downloadLocalReportSearch(search);
        }
        else if (isFilterActive) {
            apiCall = () => downloadLocalReportFilter(formData);
        }
        else {
            apiCall = () => downloadLocalReport();
        }

        apiCall(search, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setDownloadProgress(percent);
            },
        })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "LocalReport.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
                setDownloadDone(true);
            })
            .catch((error) => {
                console.error("Download failed:", error);
            })
            .finally(() => {
                setLoading(false);
                setTimeout(() => setDownloadDone(false), 5000); // Reset "Done" after 3s
            });
    };

    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Local Report</p>
                </div>
                <LocalReportTextFiled
                    formData={formData}
                    setFormData={setFormData}
                    handlePoChange={handlePoChange}
                    handleInputChange={handleInputChange}
                    isFrozen={isFrozen}
                    formErrors={formErrors}
                    RepaierNameOptions={RepaierNameOptions}
                    ReworkerNameOptions={ReworkerNameOptions}
                />

                <div className="ReworkerButton9">
                    <button style={{ backgroundColor: 'green' }} onClick={handleFilter}>Search</button>
                    <button style={{ backgroundColor: 'blue' }} onClick={Clear}>Clear</button>
                </div>

            </div>
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Report Detail</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)} disabled={loading}>
                        {loading
                            ? downloadProgress !== null
                                ? `Downloading... ${downloadProgress}%`
                                : "Downloading..."
                            : downloadDone
                                ? "✅ Done"
                                : (
                                    <>
                                        <FaFileExcel /> Export
                                    </>
                                )}
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

              <>
  <LoadingOverlay loading={loading} />

  <LocalReportTbale
    data={localReportData}
    page={page}
    perPage={perPage}
    totalRows={totalRows}
    setPage={setPage}
    setPerPage={setPerPage}
  />
</>
            </div>
        </div>)
}

export default LocalReport