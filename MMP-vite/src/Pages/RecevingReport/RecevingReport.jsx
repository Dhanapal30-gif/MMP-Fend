import React, { useState, useEffect } from 'react';

import RecevingReportTextfiled from "../../components/RecevingReport/RecevingReportTextfiled";
import RecevingReportTable from "../../components/RecevingReport/RecevingReportTable";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { downloadReceivingReportFilter, fetchPartcodeReport, getRecevingReportDetailFilter } from '../../Services/Services_09';
import { downloadLocalReport, downloadLocalReportFilter, downloadLocalReportSearch, fetchBoardSerialNumber, fetchProduct_Partcode, fetchproductPtl, fetchRepaier, getindiviualDetailFilter, getindiviualDetailFind, getLocalDetailFind, getLocalINdiviual, getLocalMaster, getLocalReport, getLocalReportDetailFilter, savePTLRepaier, savePTLRequest, savePTLStore } from '../../Services/Services_09';

const RecevingReport = () => {


    const [partcodeList, setPartcodeList] = useState([]);
    const [componentUsageList, setComponentUsageList] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [ponumberList, setPonumberList] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [downloadDone, setDownloadDone] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [recevingReportDetail, setRecevingReportDetail] = useState([]);

    const [formData, setFormData] = useState({
        partcode: "",
        componentUsage: "",
        ponumber: "",
        partcode: "",
        startDate: "",
        endDate: "",
        download: null,

    });


    useEffect(() => {
        fetchPartcodeList();

    }, []);

    const fetchPartcodeList = () => {
        fetchPartcodeReport()
            .then((response) => {

                setPartcodeList(response.data.partList);   // ✅ correct

                const uniqueComponentUsage = [
                    ...new Set(response.data.partList.map(item => item.componentUsage))
                ];
                const uniquePono = [
                    ...new Set(response.data.poList.map(item => item.pono))
                ];
                setPonumberList(uniquePono);
                setComponentUsageList(uniqueComponentUsage);

                setPoList(response.data.poList); // if needed
            })
            .catch((error) => { });
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


    const handlePoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === "" ? null : value
        }));
    };


    const Clear = () => {
        // setIsFilterActive(false);
        setSearchText("");
        setShowTable(false);
        // fetchData(page, perPage, debouncedSearch);
        setFormData({
            partcode: "",
            componentUsage: "",
            ponumber: "",
            startDate: "",
            endDate: "",
            download: null,

        })
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
    const userId = localStorage.getItem("userId");

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

            (!formData.startDate || !formData.endDate) &&
            !formData.download
        ) {
            setErrorMessage("Select Start & End Date OR Download")
            setShowErrorPopup(true);

            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
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
            setErrorMessage("Please select or enter at least one filter");
            setShowErrorPopup(true);
            return;
        }
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

        getRecevingReportDetailFilter(page - 1, perPage, payload)
            .then(res => {
                setRecevingReportDetail(res.data.content || []);
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
        apiCall = () => downloadReceivingReportFilter(payload);

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
                link.setAttribute("download", "ReceivingReport.xlsx");
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

    // console.log("compoentUsag", componentUsageList)
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Receving Report</p>
                </div>
                <RecevingReportTextfiled
                    partcodeList={partcodeList}
                    formData={formData}
                    setFormData={setFormData}
                    componentUsageList={componentUsageList}
                    handleInputChange={handleInputChange}
                    formErrors={formErrors}
                    handlePoChange={handlePoChange}
                    ponumberList={ponumberList}
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
                        <RecevingReportTable
                            data={recevingReportDetail}
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
        </div>
    )
}

export default RecevingReport