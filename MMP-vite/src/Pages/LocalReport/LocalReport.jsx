import React, { useState, useEffect } from 'react';
import LocalReportTextFiled from "../../components/LocalReport/LocalReportTextFiled";
import LocalReportTbale from "../../components/LocalReport/LocalReportTbale";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { downloadLocalReport, downloadLocalReportFilter, downloadLocalReportSearch, fetchBoardSerialNumber, fetchProduct_Partcode, fetchproductPtl, fetchRepaier, getindiviualDetailFilter, getindiviualDetailFind, getLocalDetailFind, getLocalINdiviual, getLocalMaster, getLocalReport, getLocalReportDetailFilter, savePTLRepaier, savePTLRequest, savePTLStore } from '../../Services/Services_09';
import { fetchProductAndPartcode } from '../../Services/Services-Rc';

const LocalReport = () => {
    const [formData, setFormData] = useState({
        status: "",
        startDate: "",
        endDate: "",
        download: null,
        repairername: "",
        reworkername: "",
        boardserialnumber: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [repaierReworkerData, setRepaierReworkerData] = useState([]);
    const [productNameAndPartcode, setProductNameAndPartcode] = useState([]);
    const [localReportData, setLocalReportData] = useState([]);
    const [downloadDone, setDownloadDone] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    // console.log("formData", formData);

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

    // console.log("userId", userId);

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

      if (
  formData.status === "MSC00004" &&
  (
    (!formData.startDate || !formData.endDate) &&
    !formData.download
  )
) {
    setErrorMessage("Select Start & End Date OR Download")
    setShowErrorPopup(true);
//   errors.startDate = "Select Start & End Date OR Download";
//   errors.endDate = "Select Start & End Date OR Download";
//   errors.download = "Select Download OR Date range";
  isValid = false;
}

        setFormErrors(errors);
        return isValid;
    };

    useEffect(() => {
        fetchRepairName();
        fetchProductName();
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

    const fetchProductName = () => {
        fetchProduct_Partcode()
            .then((response) => {
                setProductNameAndPartcode(response.data);
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
        if (showTable) {
            fetchData(page, perPage, debouncedSearch);
        }
    }, [page, perPage, debouncedSearch]);


    // const fetchData = (page = 1, size = 10, search = "") => {
    //     // console.log("searchfetch", search);
    //     if (search && search.trim() !== "") {
    //         fetchFilterResult(page, size, search);
    //     }
    //     else if (isFilterActive) {
    //         fetchFilterResult();
    //     }
    //     else {
    //         fetchLocalReport(page, size)
    //     }

    // };

    const fetchData = (page = 1, size = 10, search = "") => {
        if (isFilterActive) {
            fetchFilterResult(search);   // ONLY search
        } else if (search?.trim()) {
            fetchfindSearch(page, size, search);
        } else {
            fetchLocalReport(page, size);
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
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            }).finally(() => {
                setLoading(false); // always stop loader
            });
    };

    // console.log("formData", formData);
    const hasAnyFilter = () => {
        return Object.values(formData).some(
            v => v !== null && v !== ""
        );
    };

    const handleFilter = (e) => {
        e.preventDefault();
        if (!valiDate()) return;

        if (!hasAnyFilter() && !searchText?.trim()) {
            setErrorMessage("Please select or enter at least one filter");
            setShowErrorPopup(true);
            return;
        }
        setShowTable(true);
        setIsFilterActive(true);
        fetchFilterResult();

    };
    // const fetchFilterResult = () => {
    //     setLoading(true)
    //     getLocalReportDetailFilter(page - 1, perPage, formData)
    //         .then((response) => {
    //             if (response?.data?.content) {
    //                 setLocalReportData(response.data.content);
    //                 setTotalRows(response.data.totalElements || 0);
    //             }
    //         })
    //         .catch((error) => {
    //             console.error("Error in filter API:", error);
    //         }).finally(() => {
    //         setLoading(false); // always stop loader
    //     });
    // };


    const fetchFilterResult = (search = "") => {
        setLoading(true);
        const payload = {
            ...formData,
            search: search?.trim() || null
        };

        getLocalReportDetailFilter(page - 1, perPage, payload)
            .then(res => {
                setLocalReportData(res.data.content || []);
                setTotalRows(res.data.totalElements || 0);
            })
            .finally(() => setLoading(false));
    };


    const Clear = () => {
        setIsFilterActive(false);
        setSearchText("");
        setShowTable(false);
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
        // if (search?.trim() !== "") {
        //     apiCall = () => downloadLocalReportSearch(search);
        // }
        // else if (isFilterActive) {
        //     apiCall = () => downloadLocalReportFilter(formData);
        // }
        // else {
        //     apiCall = () => downloadLocalReport();
        // }
        const payload = {
            ...formData,
            search: search?.trim() || null
        };
apiCall = () => downloadLocalReportFilter(payload);

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
                    productNameAndPartcode={productNameAndPartcode}
                />

                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleFilter}>Search</button>
                    <button className='ComCssClearButton' onClick={Clear}>Clear</button>
                </div>

            </div>
            {showTable &&
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
            }

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

export default LocalReport