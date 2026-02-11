import React, { useState, useEffect } from 'react';
import LocalndindividualReportCom from "../../components/LocalndindividualReport/LocalndindividualReportCom";
import LocalReportIndiviualTable from "../../components/LocalndindividualReport/LocalReportIndiviualTable";
import { FaFileExcel } from "react-icons/fa";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { downloadIndiviualReport, downloadLocalIndiviualReportFilter, downloadLocalIndiviualReportSearch, fetchProduct_Partcode, getindiviualDetailFilter, getindiviualDetailFind, getLocalINdiviual, } from '../../Services/Services_09';
import "./Localindivual.css";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { downloadSearchProduct } from '../../Services/Services';
const LocalndindividualReport = () => {

    const [formData, setFormData] = useState({
        status: "",
        startDate: "",
        endDate: "",
        download: null,
        partcode:"",
        productname:"",
        boardserialnumber:""
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
    const [productNameAndPartcode, setProductNameAndPartcode] = useState([]);   
    const [clearButton, setClearButton] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [indiviualReport, setIndiviualReport] = useState([])
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [downloadDone, setDownloadDone] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    

    // console.log("formData", formData);
    const handlePoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === "" ? null : value   // ✅ avoid setting download: ""
        }));
    };


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
    // const userId = sessionStorage.getItem("userName");
    const userId = localStorage.getItem("userName");
    // const userRole = sessionStorage.getItem("userRole");
const userRole = JSON.parse(localStorage.getItem("userRole"));

    // console.log("userId", userId);


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
           if (showTable) {
        fetchData(userId, page, perPage, debouncedSearch);
           }
    }, [userId, page, perPage, debouncedSearch]);

        useEffect(() => {
            fetchProductName();
        }, []);


         const fetchProductName = () => {
                fetchProduct_Partcode()
                    .then((response) => {
                        setProductNameAndPartcode(response.data);
                    })
                    .catch((error) => {
                        // console.error("Error fetching receiving data:", error);
                    })
            };
    const fetchData = (userId, page = 1, size = 10, search = "") => {
                    fetchFilterResult(search);

        // console.log("searchfetch", search);
        // if (search && search.trim() !== "") {
        //     fetchfindSearch(userId, page, size, search);
        // }
        // else if (isFilterActive) {
        //     fetchFilterResult();
        // }
        // else {
        //     fetchIndiviualDetail(userId, page, size);
        // }
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
        setLoading(true)
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
            }).finally(() => {
            setLoading(false); // always stop loader
        });
    };


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
    const fetchFilterResult = (search = "") => {
        setLoading(true)
        const payload = {
            ...formData,
            search: search?.trim() || null
        };
        getindiviualDetailFilter(page - 1, perPage, userId,userRole, payload)
            .then((response) => {
                if (response?.data?.content) {
                    setIndiviualReport(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                }
            })
            .catch((error) => {
                console.error("Error in filter API:", error);
            }).finally(() => {
                setLoading(false); // always stop loader
            });
    };

    
    const Clear = () => {
        setIsFilterActive(false);
        setSearchText("");
        fetchData(userId, page, perPage, debouncedSearch);
setShowTable(false);
        setFormData({
            status: "",
            startDate: "",
            endDate: "",
            download: null
        })
    };
    const exportToExcel = (search = "") => {
        setDownloadDone(false);
        setDownloadProgress(null);
        setLoading(true);
        const payload = {
            ...formData,
            search: search?.trim() || null
        };
        let apiCall;  // Declare here
        // const apiCall = search?.trim() !== "" ? downloadSearchProduct : downloadLocalIndiviual;
        // if (search?.trim() !== "") {
        //     apiCall = () => downloadLocalIndiviualReportSearch(search, userId);
        // }
        // else if (isFilterActive) {
        //     apiCall = () => downloadLocalIndiviualReportFilter(formData, userId);
        // }
        // else {
        //     apiCall = () => downloadIndiviualReport(userId);
        // }
apiCall = () => downloadLocalIndiviualReportFilter(payload,userId,userRole);
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
                link.setAttribute("download", "LocalIndiviualReport.xlsx");
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
                    <p>Local individual Report</p>

                </div>
                <LocalndindividualReportCom
                    formData={formData}
                    setFormData={setFormData}
                    handlePoChange={handlePoChange}
                    handleInputChange={handleInputChange}
                    isFrozen={isFrozen}
                    formErrors={formErrors}
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
                <LoadingOverlay loading={loading} />

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

export default LocalndindividualReport