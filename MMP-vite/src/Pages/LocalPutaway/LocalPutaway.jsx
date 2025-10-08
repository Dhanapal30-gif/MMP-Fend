import React, { useState, useEffect } from 'react';
// import putawayTextFile from "../../components/LocalPutaway/putawayTextFile";
import LocalPutawayDetailTable from "../../components/LocalPutaway/LocalPutawayDetailTable";
import PutawayTextFiled from "../../components/LocalPutaway/PutawayTextFiled";

import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { downloadLocal, downloadSearchLocal, fetchBoardSerialNumber, fetchproductPtl, fetchPTLPutaway, fetchPutaway, getindiviualDetailFilter, getindiviualDetailFind, getLocalINdiviual, getLocalMaster, getLocalPutaway, getLocalPutawaySearch, savePTLRepaier, savePTLRequest, savePTLStore, savePutaway, savePutLocation } from '../../Services/Services_09';
const LocalPutaway = () => {
    const [formData, setFormData] = useState({
        partcode: "",
        partdescription: "",
        racklocation: "",
        availableQuantity: "",
        quantity: "",
        createdby: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [ptldata, setPTLData] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [requestButton, setRequestButton] = useState(true);
    const [isFrozen, setIsFrozen] = useState(false);
    const [submitButton, setSubmitButton] = useState(false);
    const [putButton, setPutButton] = useState(false);
    const [clearButton, setClearButton] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [indiviualReport, setIndiviualReport] = useState([])
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [responseOk, setResponseOk] = useState(false)
    const [putawayTableData, setPutawayTableData] = useState([])
      const [downloadDone, setDownloadDone] = useState(false);
      const [downloadProgress, setDownloadProgress] = useState(null);
    
    // console.log("ptldata", ptldata);
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


        setFormData(updatedForm);
    };

    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.partcode) {
            errors.partcode = "Please select partcode";
            isValid = false;
        }

        if (!formData.quantity) {
            errors.quantity = "Please select quantity";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
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


    useEffect(() => {
        fetchData();

    }, []);
    useEffect(() => {
        fetchPutawayDetailTable(page, perPage, debouncedSearch);

    }, [page, perPage, debouncedSearch]);

    const fetchPutawayDetailTable = (page = 1, size = 10, search = "") => {
        // console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            fetchfindSearch(page, size, search);
        }
        else {
            fetchPutawayDetail(page, size);
        }

    };
    const fetchData = () => {
        fetchPTLPutaway()
            .then((response) => {
                setPTLData(response.data);
            })
            .catch((error) => {
                // console.error("Error fetching receiving data:", error);
            })
    };

    const fetchPutawayDetail = (page = 1, size = 10) => {
        getLocalPutaway(page - 1, size)
            .then((response) => {
                setPutawayTableData(response.data.content);
                setTotalRows(response.data.totalElements)
            })
            .catch((error) => {
                // console.error("Error fetching receiving data:", error);
            })
    };

    const fetchfindSearch = (page = 1, size = 10, search = "") => {
        getLocalPutawaySearch(page - 1, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setPutawayTableData(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            });
    };
    // console.log("putawayTable", putawayTableData)

    const handleSubmit = (e) => {
        e.preventDefault();
        const modifiedby = sessionStorage.getItem("userName") || "System";
        const updatedFormData = {
            ...formData,
            modifiedby,
        };
        savePutaway(updatedFormData)
            .then((response) => {
                // fetchMainMaster(page, perPage);
              setSuccessMessage(response.data.message || "Masterdata Added Successfully");
    setShowSuccessPopup(true);
     formClear();
                setSubmitButton(false);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        setShowErrorPopup(true)
                        setErrorMessage("Product already exists")
                    } else {
                        setErrorMessage("Something went wrong");
                        setShowErrorPopup(true);
                    }
                }
            });
    }

    const handlePut = (e) => {
        e.preventDefault();
        if (!valiDate()) return;
        const createdby = sessionStorage.getItem("userName") || "System";
        const updatedFormData = {
            ...formData,
            createdby,
        };
        savePutLocation(updatedFormData)
            .then((response) => {
                // fetchMainMaster(page, perPage);
                // setShowSuccessPopup(true);
                // setSuccessMessage("Masterdata Added Successfully")
                setSubmitButton(true);
                setPutButton(false)
               
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        setShowErrorPopup(true)
                        setErrorMessage("Product already exists")
                    } else {
                        setErrorMessage("Something went wrong");
                        setShowErrorPopup(true);
                    }
                }
            });
    }
    // console.log("formdata", formData)

    useEffect(() => {
        if (formData.quantity) {
            setPutButton(true);
        }
    }, [formData.quantity]);

    const formClear = () => {
        setFormData({
            partcode: "",
            partdescription: "",
            racklocation: "",
            availableQuantity: "",
            quantity: ""
        })
    }
    const exportToExcel = (search = "") => {
        setDownloadDone(false);
        setDownloadProgress(null);
        setLoading(true);
    
        const apiCall = search?.trim() !== "" ? downloadSearchLocal : downloadLocal;
    
        apiCall(search, {
          onDownloadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDownloadProgress(percent);
          },
        })
          .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "LocalPutaway.xlsx");
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
                    <p>Putaway</p>

                </div>

                <PutawayTextFiled
                    ptldata={ptldata}
                    formData={formData}
                    setFormData={setFormData}
                    handlePoChange={handlePoChange}
                    handleInputChange={handleInputChange}
                    isFrozen={isFrozen}
                    formErrors={formErrors}

                />
                <div className="ReworkerButton9">
                    <button className='ComCssClearButton' onClick={formClear} >Clear</button>

                    {submitButton &&
                        <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>
                    }
                    {formData.quantity &&
                        <button className='ComCssUpdateButton' onClick={handlePut}>Put</button>
                    }


                </div>


            </div>
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Putaway Detail</h5>
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
                <LocalPutawayDetailTable
                    data={putawayTableData}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}

                />

            </div>
            <CustomDialog
                open={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Success"
                message={successMessage}
                severity="success"
                color="primary"
            />
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

export default LocalPutaway