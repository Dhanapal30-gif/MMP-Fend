import React, { useState, useEffect, useRef } from 'react';
import LocalSummaryReportText from "../../components/LocalSummaryReport/LocalSummaryReportText";
import LocalSummaryReportTable from "../../components/LocalSummaryReport/LocalSummaryReportTable";
import RequesterDefaultTable from "../../components/Requester/RequesterDefaultTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchRequesterDetail, fetchRequesterSearch } from "../../components/Requester/RequesterActions.js";
import { FaFileExcel, FaBars } from "react-icons/fa";
import { downloadLocalSummaryReportFilter, getLocalSummaryReportDetailFilter, saveGRN } from '../../Services/Services_09.js';
import { checkAvailable, downloadRequester, fetchAvailableAndCompatabilityQty, fetchProductAndPartcode, fetchRequesterType, fetchReworkerName, saveRequester } from '../../Services/Services-Rc.js';
import { ContactSupportOutlined } from '@mui/icons-material';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";

const LocalSummaryReport = () => {
    const [formData, setFormData] = useState({

    });
    const [formErrors, setFormErrors] = useState({});
    const [requestType, setRequestType] = useState([])
    const [requesterType, setRequesterType] = useState([])
    const [productandPartcode, setPproductandPartcode] = useState([])
    const [compatibilityData, setCompatibilityData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [downloadDone, setDownloadDone] = useState(false);
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [requesterDeatil, setRequesterDetail] = useState([]);
    const [ReworkerNameList, setReworkerNameList] = useState([]);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [reportDetail, setReportDetail] = useState(null);

    const shifyOption = [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" },
    ];

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formClear = () => {
        setFormData({
            reworkername:"",
            shift:"",
            startDate:"",
            endDate:"",
        });
        setFormErrors({});
        setShowTable(false)
    }
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };

    const debouncedSearch = useDebounce(searchText, 500);
    useEffect(() => {
        fetchReworkerNameList();
    }, [])

    const fetchReworkerNameList = async () => {
        try {
            const response = await fetchReworkerName();
            setReworkerNameList(response.data || []);
        } catch (error) {
            console.error("Error fetching requester details:", error);
        }
    };

    const hasAnyFilter = () => {
        return Object.values(formData).some(
            v => v !== null && v !== ""
        );
    };


    useEffect(() => {
        if (showTable) {
            fetchData(page, perPage, debouncedSearch);
        }
    }, [page, perPage, debouncedSearch]);


    const fetchData = (page = 1, size = 10, search = "") => {

        fetchFilterResult(search);   // ONLY search

    };

    const handleFilter = (e) => {
        e.preventDefault();
        // if (!valiDate()) return;

        if (!hasAnyFilter() && !searchText?.trim()) {
            setErrorMessage("Please select at least one filter");
            setShowErrorPopup(true);
            return;
        }
        setSearchText("");
        setShowTable(true);
        setIsFilterActive(true);
        fetchFilterResult();

    };

    const fetchFilterResult = (search = "") => {
        setLoading(true);
        const payload = {
            ...formData,
            search: search?.trim() || null
        };

        getLocalSummaryReportDetailFilter(page, perPage, payload)
            .then(res => {
                setReportDetail(res.data.content || []);
                setTotalRows(res.data.totalElements || 0);
            })
            .finally(() => setLoading(false));
    };

    const exportToExcel = (search = "") => {
            setDownloadDone(false);
            setDownloadProgress(null);
            setLoading(true);
            let apiCall;
    
            const payload = {
                ...formData,
                search: search?.trim() || null
            };
            apiCall = () => downloadLocalSummaryReportFilter(payload);
    
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
                    link.setAttribute("download", "LocalSummaryReport.xlsx");
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
                    <p>LocalSummary Report</p>
                </div>
                <LocalSummaryReportText
                    formData={formData}
                    handleChange={handleChange}
                    shifyOption={shifyOption}
                    formErrors={formErrors}
                    ReworkerNameList={ReworkerNameList}
                // handlePutawayChange={handlePutawayChange}
                // poDropdownOptions={Array.isArray(putawayTicket) ? [...new Set(putawayTicket)] : []}
                />
                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleFilter} >Search</button>
                    <button className='ComCssClearButton' onClick={formClear} >Clear</button>
                </div>
            </div>
            {showTable &&
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>Requested Tickets</h5>
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
                    <LoadingOverlay loading={loading} />

                    <LocalSummaryReportTable
                        data={reportDetail}
                        page={page}
                        perPage={perPage}
                        totalRows={totalRows}
                        loading={loading}
                        setPage={setPage}
                        setPerPage={setPerPage}

                    />
                </div>
            }

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

export default LocalSummaryReport