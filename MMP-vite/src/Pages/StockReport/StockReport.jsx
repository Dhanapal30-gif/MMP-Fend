import React, { useState, useEffect } from 'react';
import { downloadPartcodeStock, downloadStock, getStockDetais, getStockPartcodeDetais } from '../../Services/Services_09';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { FaFileExcel } from "react-icons/fa";
import StockReportTable from "../../components/StockTransfer/StockReportTable";

const StockReport = () => {

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [localStore, setLocalStore] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("DEFAULT"); // DEFAULT | PARTCODE
    const [stockPartcodeButton,setStockPartcodeButton] = useState(true)
    const [stockLocationButton,setStockLocationButton] = useState(false)


    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };
    const debouncedSearch = useDebounce(searchText, 500); // delay in ms

    // useEffect(() => {
    //     fetchStockData(page, perPage, debouncedSearch);
    // }, [page, perPage, debouncedSearch])



    // useEffect(() => {
    //     if (mode === "PARTCODE") {
    //         fetchStockPartcodeData(page, perPage, debouncedSearch);
    //     } else {
    //         fetchStockData(page, perPage, debouncedSearch);
    //     }
    // }, [page, perPage, debouncedSearch, mode]);


    useEffect(() => {
        if (mode === "PARTCODE") {
            fetchStockPartcodeData(page, perPage, debouncedSearch);
        } else {
            fetchStockData(page, perPage, debouncedSearch);
        }
    }, [page, perPage, debouncedSearch, mode]);

    
    const fetchStockData = (page = 1, size = 10, search = "") => {
        setLoading(true);
        getStockDetais(page - 1, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setLocalStore(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                    setStockLocationButton(false)
                    setStockPartcodeButton(true)
                    setMode("DEFAULT")
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };

    const fetchStockPartcodeData = (page = 1, size = 10, search = "") => {
        setLoading(true);
        getStockPartcodeDetais(page - 1, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setLocalStore(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                    setStockLocationButton(true)
                    setStockPartcodeButton(false)
                    
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };

    const exportToExcel = (search = "") => {
        setLoading(true);

          const apiCall =
    mode !== "PARTCODE"
      ? downloadStock
      : downloadPartcodeStock;

  apiCall(search, {
    onDownloadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
    },
  })
        
            .then((response) => {
                const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "StockReport.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                console.error("Download failed:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };



    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Stock Report</p>
                </div>

                <div className="ReworkerButton9">
                    {/* <button className='ComCssSubmitButton'   onClick={() => fetchStockPartcodeData(page, perPage, debouncedSearch)}  >Stock-Partcode</button> */}
                    {stockPartcodeButton &&
                        <button
                            className="ComCssSubmitButton"
                            onClick={() => {
                                setMode("PARTCODE");
                                fetchStockPartcodeData(1, perPage, debouncedSearch);
                                setPage(1);
                            }}
                        >
                            Stock-Partcode
                        </button>
                    }
                    {stockLocationButton && 
                        <button className='ComCssClearButton' onClick={() => { { fetchStockData(1, perPage, debouncedSearch) } }}>Stock-Location </button>
                    }
                </div>
            </div>
            <div className='ComCssTable'>
                {mode == "PARTCODE" &&
                    <h5 className='ComCssTableName'>Stock - Partcode wise Detail</h5>}
                {mode !== "PARTCODE" &&
                    <h5 className='ComCssTableName'>Stock -Location wise Detail</h5>
                }
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)} disabled={loading}>
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
                <LoadingOverlay loading={loading} />

                <StockReportTable
                    data={localStore}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    mode={mode}
                    setPage={setPage}
                    setPerPage={setPerPage}


                />
            </div>
        </div>
    )
}

export default StockReport