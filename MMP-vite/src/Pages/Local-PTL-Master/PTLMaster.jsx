import React, { useState, useEffect } from 'react';
import PTLTextfiled from "../../components/Local-PTL-Master/PTLTextfiled";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { downloadLocalMaster, downloadSearchLocalMaster, getLocalkMasterSearch, getLocalMaster, savePTLStore } from '../../Services/Services_09';

import PTLTable from "../../components/Local-PTL-Master/PTLTable";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { deleteLocalMaster } from '../../Services/Services-Rc';

const PTLMaster = () => {

    const [formData, setFormData] = useState({
        partcode: "", partdescription: "", rohsstatus: "", msdstatus: "",
        technology: "", racklocation: "", unitprice: "", customduty: "",
        quantity: "", catmovement: "", MOQ: "", TRQty: "",

    });

    const [localStore, setLocalStore] = useState({});

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [putawayDetail, setPutawayDetail] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [downloadDone, setDownloadDone] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [deletButton, setDeletButton] = useState();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    // console.log("formData", formData);


    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.partcode) {
            errors.partcode = "Please Enter Partcode";
            isValid = false;
        }
        if (!formData.quantity) {
            errors.quantity = "Please Enter quantity";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valiDate()) return;
        setLoading(true);

        const createdby = sessionStorage.getItem("userName") || "System";
        const updatedby = sessionStorage.getItem("userName") || "System";

        const submitData = {
            ...formData,
            createdby,
            updatedby,
            quantity: formData.quantity || null,
            TRQty: formData.TRQty || null,
        };

        savePTLStore(submitData)
            .then((response) => {
                handleSuccessCommon({
                    response,
                    setSuccessMessage,
                    setShowSuccessPopup,
                    afterSuccess: () => {
                        handleClear();
                        setSelectedRows([]);
                        fetchPTLDetail();
                    },
                });
            })
            .catch((error) => {
                handleErrorCommon({
                    error,
                    setErrorMessage,
                    setShowErrorPopup,
                });
            }).finally(() => {
                setLoading(false);
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
    const debouncedSearch = useDebounce(searchText, 500); // delay in ms

    useEffect(() => {
        fetchData(page, perPage, debouncedSearch);
    }, [page, perPage, debouncedSearch])

    const fetchData = (page = 1, size = 10, search = "") => {
        // console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            fetchfindSearch(page, size, search);

        } else {
            fetchPTLDetail(page, perPage);
        }
    }

    const fetchPTLDetail = (page = 1, size = 10) => {
        setLoading(true);
        getLocalMaster(page - 1, size)
            .then((response) => {
                setLocalStore(response.data.content || []);
                setTotalRows(response.data.totalElements || 0);
                // console.log('fetchPodetail', response.data);
            }).catch((error) => {
                console.error("Error fetching PTL details:", error);
            })
            .finally(() => setLoading(false)); // ✅ stop loading after completion
    };

    const fetchfindSearch = (page = 1, size = 10, search = "") => {
        setLoading(true);
        getLocalkMasterSearch(page - 1, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setLocalStore(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
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
    const handleEdit = (row) => {
        setFormData({ ...row });
        setIsEditMode(true);
    };
    const exportToExcel = (search = "") => {
        setDownloadDone(false);
        setDownloadProgress(null);
        setLoading(true);

        const apiCall = search?.trim() !== "" ? downloadSearchLocalMaster : downloadLocalMaster;

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
                link.setAttribute("download", "PTLMaster.xlsx");
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
    const handleClear = () => {
        setFormData({
            partcode: "", partdescription: "", rohsstatus: "", msdstatus: "",
            technology: "", racklocation: "", unitprice: "", customduty: "",
            quantity: "", catmovement: "", MOQ: "", TRQty: "",
        });
        setIsEditMode(false);
        setFormErrors({});
    }
    useEffect(() => {
        console.log("selectedrows", selectedRows)
    }, [selectedRows])
    // console.log("setLocalStore", localStore);


    const onDeleteClick = () => {
        setConfirmDelete(true);
    };
    // console.log("fpoprmdata",formData)

    const handleCancel = () => {
        setSelectedRows([]);
        setConfirmDelete(false);
        setDeletButton(false);
        // setHandleSubmitButton(true)

    };

    const handleDelete = async () => {
        setConfirmDelete(false);
        try {
            const modifiedby = sessionStorage.getItem("userId") || "System";
            await deleteLocalMaster(selectedRows,modifiedby);
            setSuccessMessage("Data successfullly deleted");
            setShowSuccessPopup(true);
            setSelectedRows([]);
            // setHandleSubmitButton(true);
            setDeletButton(false);
            fetchData(page, perPage);
        } catch (error) {
            setErrorMessage(`Delete error: ${error?.message || error}`);
            setShowErrorPopup(true);
        }

    }
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>PTL Master</p>
                </div>

                <PTLTextfiled
                    formData={formData}
                    handleChange={handleChange}
                    formErrors={formErrors} // ✅ Pass this prop

                />
                <div className="ComCssButton9">

                    {!isEditMode && (
                        <button className='ComCssSubmitButton' onClick={handleSubmit} >
                            Submit
                        </button>)}
                    {isEditMode && (

                        <button className='ComCssUpdateButton' onClick={handleSubmit} >
                            Update
                        </button>
                    )}
                    <button className='ComCssClearButton' onClick={handleClear} > Clear </button>
                    {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}   >Delete</button>}

                </div>
            </div>
            <div className='ComCssTable'>

                <h5 className='ComCssTableName'>PTL Master Detail</h5>
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

                <PTLTable
                    data={localStore}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    onEdit={handleEdit} // 👈 This is the important line
                    setDeletButton={setDeletButton}
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
            <CustomDialog
                open={confirmDelete}
                onClose={handleCancel}
                onConfirm={handleDelete}
                title="Confirm"
                message="Are you sure you want to delete this?"
                color="primary"
            />
        </div>

    )
}

export default PTLMaster