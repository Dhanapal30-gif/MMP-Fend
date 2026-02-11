import React, { useState, useEffect } from 'react';

import IssuanceReportTextFiled from "../../components/IssuanceReport/IssuanceReportTextFiled";
import IssuanceReportTable from "../../components/IssuanceReport/IssuanceReportTable";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { downloadReceivingReportFilter, fetchPartcodeReport, getIssuanceReportDetailFilter, getRecevingReportDetailFilter } from '../../Services/Services_09';
import { downloadLocalReport, downloadLocalReportFilter, downloadLocalReportSearch, fetchBoardSerialNumber, fetchProduct_Partcode, fetchproductPtl, fetchRepaier, getindiviualDetailFilter, getindiviualDetailFind, getLocalDetailFind, getLocalINdiviual, getLocalMaster, getLocalReport, getLocalReportDetailFilter, savePTLRepaier, savePTLRequest, savePTLStore } from '../../Services/Services_09';

const IssuanceReport = () => {

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

        getIssuanceReportDetailFilter(page - 1, perPage, payload)
            .then(res => {
                setRecevingReportDetail(res.data.content || []);
                setTotalRows(res.data.totalElements || 0);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Issuance Report</p>
                </div>
                <IssuanceReportTextFiled
                    partcodeList={partcodeList}
                    formData={formData}
                    setFormData={setFormData}
                    componentUsageList={componentUsageList}
                    handleInputChange={handleInputChange}
                    formErrors={formErrors}
                    handlePoChange={handlePoChange}
                />
                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleFilter}>Search</button>
                    {/* <button className='ComCssClearButton' onClick={Clear}>Clear</button> */}
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
                        <IssuanceReportTable
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

export default IssuanceReport