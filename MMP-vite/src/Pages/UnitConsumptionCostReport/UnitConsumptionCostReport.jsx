import React, { useState, useEffect } from 'react';
import UnitConsumptionTextfiled from "../../components/UnitComponentCostReport/UnitConsumptionTextfiled";
import UnitComponentTable from "../../components/UnitComponentCostReport/UnitComponentTable";
import ReworkerTextFiled7 from "../../components/Reworker/ReworkerTextFiled7";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { downloadStockOverviewReportFilter, fetchPartcodeReport, fetchTransferLocation, getStockReportDetailFilter, getStockReportOverViewFilter, getUnitcompoenentDetailFilter, } from '../../Services/Services_09';
import { getProductAndPartcode } from '../../Services/Services';

const UnitConsumptionCostReport = () => {


    const [partcodeList, setPartcodeList] = useState([]);
    const [componentUsageList, setComponentUsageList] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [productDetail, setProductDetail] = useState([]);
    const [componentUsage, setComponentUsage] = useState([]);
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
    const [stockReportDetail, setStockReportDetail] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [unitReportDetail, setUnitReportDetail] = useState([]);

    const [formData, setFormData] = useState({
        productname: "",
        // dateyear:""


    });

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
    const hasAnyFilter = () => {
        return Object.values(formData).some(
            v => v !== null && v !== ""
        );
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

    const fetchPartAndProduct = () => {
        getProductAndPartcode()
            .then((response) => {

                const data = response.data;
                setComponentUsage(data.ComponentUsage || []);
                setProductDetail(data.ProductDetail || []);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };

    useEffect(() => {
        fetchPartAndProduct();
    }, [])


    useEffect(() => {
        if (isFilterActive) {
            fetchFilterResult();
        }
    }, [page, perPage]); // ✅ re-fetch when page or size changes

    const handleFilter = (e) => {
        e.preventDefault();
        // if (!valiDate()) return;
        // const isValid = valiDate();
        // if (!isValid) return; // stop if invalid
        // if (!hasAnyFilter() && !searchText?.trim()) {
        //     setErrorMessage("Please select or enter at least one filter");
        //     setShowErrorPopup(true);
        //     return;
        // }
        setShowTable(true);
        setIsFilterActive(true);
        fetchFilterResult();

    };

    // const fetchFilterResult = (search = "") => {

    //     setLoading(true)
    //     const payload = {
    //         ...formData,
    //         // issuanceType: formData.componentUsage === "PTL" ? "PTL" : "DTL",
    //         search: search?.trim() || null
    //     };

    //     getUnitcompoenentDetailFilter(page - 1, perPage, payload)
    //         .then(res => {
    //             // use content array directly
    //             setUnitReportDetail(res.data?.content || []);
    //             // setTotalRows(res.data?.content?.length || 0);
    //             setTotalRows(res.data?.totalElements || 0);
    //         })
    //         .finally(() => setLoading(false));
    // };





    const fetchFilterResult = (search = "") => {
    setLoading(true);
    const payload = {
        ...formData,
        search: search?.trim() || null
    };

    getUnitcompoenentDetailFilter(page - 1, perPage, payload)
        .then(res => {
            setUnitReportDetail(res.data?.content || []);
            setTotalRows(res.data?.totalElements || 0); // ✅ fix here
        })
        .finally(() => setLoading(false));
};

    const formClear = () => {
        setFormData({
            productname: "",

        })
        setShowTable(false);

    }
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Unit Component Consumption Cost</p>
                </div>

                <UnitConsumptionTextfiled
                    productDetail={productDetail}
                    componentUsage={componentUsage}
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    formErrors={formErrors}
                    handlePoChange={handlePoChange}

                />
                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleFilter} >Search</button>
                    <button className='ComCssClearButton' onClick={formClear} >Clear</button>
                </div>
            </div>
            {showTable &&
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>Report Detail</h5>
                    {/* <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
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
                                </div> */}
                    <>
                        <LoadingOverlay loading={loading} />
                        <UnitComponentTable
                            data={unitReportDetail}
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

export default UnitConsumptionCostReport