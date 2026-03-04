import React, { useState, useEffect } from 'react';

import MaterialMovementTextFiled from "../../components/MaterialMovementReport/MaterialMovementTextFiled";
import MaterialMovementTable from "../../components/MaterialMovementReport/MaterialMovementTable";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { downloadMovementReportFilter, downloadReceivingReportFilter, fetchPartcodeReport, getMovementReportDetailFilter, getRecevingReportDetailFilter } from '../../Services/Services_09';
import { downloadLocalReport, downloadLocalReportFilter, downloadLocalReportSearch, fetchBoardSerialNumber, fetchProduct_Partcode, fetchproductPtl, fetchRepaier, getindiviualDetailFilter, getindiviualDetailFind, getLocalDetailFind, getLocalINdiviual, getLocalMaster, getLocalReport, getLocalReportDetailFilter, savePTLRepaier, savePTLRequest, savePTLStore } from '../../Services/Services_09';

const MaterialMovementReport = () => {


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
    partcode: [],   // 👈 MUST be array
    startDate: null,
    endDate: null
});


    useEffect(() => {
        fetchPartcodeList();

    }, []);

    const fetchPartcodeList = () => {
        fetchPartcodeReport()
            .then((response) => {

                setPartcodeList(response.data.partList);   // ✅ correct

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

    const handlePoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === "" ? null : value
        }));
    };
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

       if (!formData.movementType) {
            errors.movementType = "Please Select movementType";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
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
    setLoading(true);

    const payload = {
        ...formData,
        partcode: Array.isArray(formData.partcode)
            ? formData.partcode
            : [],   // 👈 FIX HERE
        search: search?.trim() || null
    };

    getMovementReportDetailFilter(page - 1, perPage, payload)
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

    // ✅ Ensure partcode is always an array
    const payload = {
        ...formData,
        partcode: Array.isArray(formData.partcode) ? formData.partcode : [],
        search: search?.trim() || null
    };

    downloadMovementReportFilter(payload, {
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
        link.setAttribute("download", "MovementReport.xlsx");
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
        setTimeout(() => setDownloadDone(false), 5000);
    });
};



    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Material Movement Report</p>
                </div>

<MaterialMovementTextFiled
                    partcodeList={partcodeList}
                    formData={formData}
                    setFormData={setFormData}
                    
                    handleInputChange={handleInputChange}
                    formErrors={formErrors}
                    handlePoChange={handlePoChange}
                    
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
                                    <MaterialMovementTable
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
        </div>
    )
}

export default MaterialMovementReport