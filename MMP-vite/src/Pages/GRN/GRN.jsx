import React, { useState, useEffect } from 'react'
import "./GRN.css"
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { fetchPendingGrn, fetchGRNDetail, fetchfind, download, fetchfindPo, deleteRec } from '../../components/GRN/GrnAction';
import GRNTextField from "../../components/GRN/GRNTextField";
import "../../components/Com_Component/COM_Css.css"
import GRNTable from "../../components/GRN/GRNTable";
import GRNDefaultTable from "../../components/GRN/GRNDefaultTable";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { deleteRecDetail, saveGRN, updateGRNDetail } from '../../Services/Services_09.js';
import { FaFileExcel, FaBars } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { green } from '@mui/material/colors';
import { FaTimesCircle } from "react-icons/fa";

const GRN = () => {
    const [formData, setFormData] = useState({ ponumber: "", partcode: "", recevingTicketNo: "", grnNumber: "", grnDate: "" });
    const [GRNPen, setGRNPen] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editingRowId, setEditingRowId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [searchText, setSearchText] = useState("");
    const [poOptions, setPoOptions] = useState([]);
    const [partOptions, setPartOptions] = useState([]);
    const [ticketOptions, setTicketOptions] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [pagePen, setPagePen] = useState(1);
    const [perPagePen, setPerPagePen] = useState(10);
    const [pageClose, setPageClose] = useState(1);
    const [perPageClose, setPerPageClose] = useState(10);
    const [showMenu, setShowMenu] = useState(false);
    const [totalCloseRows, setTotalCloseRows] = useState(0);
    const [gRNCloseData, setGRNCloseData] = useState([]);
    const [filteredGRNpen, setFilteredGRNpen] = useState([]);
    const [isPendingView, setIsPendingView] = useState(false);
    const [ponumberEdit, setPonumberEdit] = useState([])
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleGrnChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleChange = (name, value) => {
        const actualValue = value?.label || value; // support both raw string and { label }
        setFormData(prev => ({ ...prev, [name]: actualValue }));
    };

    useEffect(() => {
        fetchPendingGrn(setGRNPen, setShowErrorPopup);
    }, []);

    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.grnNumber) {
            errors.grnNumber = "Please Enter grnNumber";
            isValid = false;
        }
        if (!formData.grnDate) {
            errors.grnDate = "Please Enter grnDate";
            isValid = false;
        }
        selectedRows.forEach((id) => {
            const item = data.find((d) => d.selectedid === id);
            if (item && (item.GRNQty === undefined || item.GRNQty === "")) {
                errors[`GRNQty_${item.selectedid}`] = "Enter GRN Qty";
                isValid = false;
            }
        });
        setFormErrors(errors);
        return isValid;
    };

    console.log("selectedRows", selectedRows)
    console.log("groupedData", groupedData)

    const handleGRNQtyChange = (selectedid, field, value) => {
        setData((prev) =>
            prev.map((item) =>
                item.selectedid === selectedid ? { ...item, [field]: value } : item
            )
        );
    };

    useEffect(() => {
        if (isEditMode) return; // ❌ Skip when in edit mode

        const { recevingTicketNo, ponumber, partcode } = formData;

        const filtered = GRNPen
            .filter(item => {
                return (
                    (!recevingTicketNo || item.recevingTicketNo === recevingTicketNo) &&
                    (!ponumber || item.ponumber === ponumber) &&
                    (!partcode || item.partcode === partcode)
                );
            })
            .map(item => {
                const originalIndex = GRNPen.findIndex(grnItem => grnItem === item);
                return {
                    ...item,
                    id: originalIndex,
                    selectedid: originalIndex,
                };
            });

        setData(filtered);
        setTotalRows(filtered.length);
        setFormErrors({});
    }, [formData.recevingTicketNo, formData.ponumber, formData.partcode, GRNPen, isEditMode]);

    //////////////////////////////////////////////////////////////////

    useEffect(() => {
        const { ponumber, partcode, recevingTicketNo } = formData;
        // poOptions - filter ignoring ponumber filter itself
        const poFiltered = GRNPen.filter(item => {
            return (
                (!recevingTicketNo || item.recevingTicketNo === recevingTicketNo) &&
                (!partcode || item.partcode === partcode)
            );
        });

        // partOptions - filter ignoring partcode filter itself
        const partFiltered = GRNPen.filter(item => {
            return (
                (!recevingTicketNo || item.recevingTicketNo === recevingTicketNo) &&
                (!ponumber || item.ponumber === ponumber)
            );
        });

        // ticketOptions - filter ignoring recevingTicketNo filter itself
        const ticketFiltered = GRNPen.filter(item => {
            return (
                (!ponumber || item.ponumber === ponumber) &&
                (!partcode || item.partcode === partcode)
            );
        });

        setPoOptions([...new Set(poFiltered.map(i => i.ponumber).filter(Boolean))].map(val => ({ label: val })));
        setPartOptions([...new Set(partFiltered.map(i => i.partcode).filter(Boolean))].map(val => ({ label: val })));
        setTicketOptions([...new Set(ticketFiltered.map(i => i.recevingTicketNo).filter(Boolean))].map(val => ({ label: val })));

    }, [formData, GRNPen]);

    const handleGrnAction = (e) => {
        e.preventDefault();

        if (!valiDate()) return;

        const formatDateTime = (dateStr) =>
            dateStr ? new Date(dateStr).toISOString().split('Z')[0] : null;

        const username = sessionStorage.getItem("userName") || "System";

        if (!isEditMode) {
            if (selectedRows.length === 0) {
                setErrorMessage("Please select at least one row");
                setShowErrorPopup(true);
                return;
            }

            const selectedKeys = new Set(selectedRows);
            const filteredData = data.filter((row) => selectedKeys.has(row.selectedid));

            const submitData = filteredData.map((row) => ({
                ...row,
                ponumber: row.ponumber,
                partcode: row.partcode,
                GRNo: formData.grnNumber,
                grnDate: formatDateTime(formData.grnDate),
                invoiceDate: formatDateTime(formData.invoiceDate),
                postingdate: formatDateTime(formData.postingdate),
                receivingDate: formatDateTime(formData.receivingDate),
                GRNQty: Number(row.GRNQty),
                createdby: username,
                updatedby: username,
            }));

            saveGRN(submitData)
                .then((response) => {
                    handleSuccessCommon({
                        response,
                        setSuccessMessage,
                        setShowSuccessPopup,
                        afterSuccess: () => {
                            setFormData({});
                            setSelectedRows([]);
                            setIsEditMode(false);
                            fetchPendingGrn();
                        },
                    });
                })
                .catch((error) => {
                    handleErrorCommon({
                        error,
                        setErrorMessage,
                        setShowErrorPopup,
                    });
                });
        } else {
            const updateData = {
                ...formData,
                id: formData.id,
                grnDate: formatDateTime(formData.grnDate),
                GRNQty: Number(data[0].GRNQty), // 
                grnNumber: formData.grnNumber,
                //   invoiceDate: formatDateTime(formData.invoiceDate),
                //   postingdate: formatDateTime(formData.postingdate),
                //   receivingDate: formatDateTime(formData.receivingDate),
                updatedby: username,
            };

            updateGRNDetail(formData.id, updateData)
                .then((response) => {
                    handleSuccessCommon({
                        response,
                        setSuccessMessage,
                        setShowSuccessPopup,
                        afterSuccess: () => {
                            setFormData({});
                            setSelectedRows([]);
                            setIsEditMode(false);
                            fetchPendingGrn();
                        },
                    });
                })
                .catch((error) => {
                    handleErrorCommon({
                        error,
                        setErrorMessage,
                        setShowErrorPopup,
                    });
                });
        }
    };


    console.log("data", data)
    const formClear = () => {
        setFormData({});
        setSelectedRows([]);
        setIsEditMode(false);

    }



    const filteredGRNclose = gRNCloseData.filter((row) =>
        Object.values(row).some(
            (value) =>
                value?.toString().toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const fetchFindData = (page = 1, size = 10, search = "") => {
        if (isPendingView) return; //  Prevent any API call in pending mode

        console.log("searchfetch", search);

        if (search && search.trim() !== "") {
            fetchfind(setGRNCloseData, setTotalCloseRows, page, size, search);
        } else {
            fetchGRNDetail(setGRNCloseData, setTotalCloseRows, page, size);
        }
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
        if (!isPendingView) {
            fetchFindData(pageClose, perPageClose, debouncedSearch);
        }
    }, [pageClose, perPageClose, debouncedSearch, isPendingView]);


    const grnPendding = () => {
        const startIndex = (pagePen - 1) * perPagePen;
        const endIndex = startIndex + perPagePen;
        return filteredGRNpen.slice(startIndex, endIndex);

    };
    useEffect(() => {
        const filtered = GRNPen.filter((row) =>
            Object.values(row).some(
                (value) =>
                    value?.toString().toLowerCase().includes(searchText.toLowerCase())
            )
        );
        setFilteredGRNpen(filtered);
    }, [searchText, GRNPen]);


    const exportToExcel = (search = "") => {
        download(search)
    }

    const handleEditClick = (row) => {
        fetchfindPo(setPonumberEdit, setTotalRows, row.ponumber);
        setIsPendingView(false);
        setSelectedRows([]);
        setEditingRowId(row.id);
        setFormData({
            ponumber: row.ponumber,
            partcode: row.partcode,
            recevingTicketNo: row.recevingTicketNo,
            grnNumber: row.ponumber,
            grnDate: row.GRDate,
            id: row.id,
        });
        setIsEditMode(true);

        setData([{ ...row, id: row.id, selectedid: row.id }]);
        setTotalRows(1);
        setFormErrors({});
    };

    const handleCancel = () => {
        setSelectedRows([]);
        setConfirmDelete(false);
    };
    const deleteRec = async () => {   
     try {
       setConfirmDelete(false);
       console.log("Selected rows to delete:", selectedRows); // ✅ Add this
   
       const res = await deleteRecDetail(selectedRows); // selectedDeleteRows must be array or ID(s)
   
       setSuccessMessage(res.data.message || "Deleted successfully");
       setShowSuccessPopup(true);
       setSelectedRows([]);
       fetchPendingGrn();
   
     } catch (error) {
       const msg = error?.response?.data?.message || "Delete failed";
    
     }
   };
    const onDeleteClick = () => {
        setConfirmDelete(true);
    };
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <h5>GRN</h5>
                </div>
                <GRNTextField formData={formData} setFormData={setFormData} handleChange={handleChange}
                    poOptions={poOptions} partOptions={partOptions} ticketOptions={ticketOptions}
                    showFields={["partcode", "GRN Status", "ponumber", "recevingTicketNo"]} />
            </div>
            {(isEditMode || formData.ponumber || formData.partcode || formData.recevingTicketNo) && data.length > 0 && (
                <div className='RecevingInputHide'>
                    <GRNTextField formData={formData} setFormData={setFormData} handleChange={handleChange} showFields={["grnNumber", "grnDate"]} handleGrnChange={handleGrnChange} formErrors={formErrors} />
                    <div className='GRNTable'>
                        <GRNTable
                            data={data}
                            page={page}
                            perPage={perPage}
                            totalRows={totalRows}
                            loading={loading}
                            setPage={setPage}
                            setPerPage={setPerPage}
                            selectedRows={selectedRows}
                            setSelectedRows={setSelectedRows}
                            handleGRNQtyChange={handleGRNQtyChange}
                            formErrors={formErrors}
                            isEditMode={isEditMode}
                            editingRowId={editingRowId}
                        />
                        <div className='ComCssButton9'>
                            
                            <div className="ComCssButton9">
                                {!isEditMode && (
                                    <button style={{ backgroundColor: 'green' }} onClick={handleGrnAction}>
                                        Submit
                                    </button>
                                )}

                                {isEditMode && (
                                    <button style={{ backgroundColor: 'orange' }} onClick={handleGrnAction}>
                                        Update
                                    </button>
                                )}


                                <button onClick={formClear}>Clear</button>
                            </div>



                        </div>

                    </div>
                </div>
            )}

            <div className='ComCssTable'>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <div className="d-flex align-items-center gap-2 position-relative">

                        <button className="btn btn-light" onClick={() => setShowMenu(!showMenu)}>
                            <FaBars />
                        </button>

                        {isPendingView && (
                            <FaTimesCircle
                                onClick={() => setIsPendingView(false)}
                                className="comCloseIcon"
                                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                            />
                        )}


                        {showMenu && (
                            <div className='ComTableMenu'>
                                <button className="btn btn-info w-100 mb-2" onClick={() => exportToExcel(searchText)}>
                                    Export
                                </button>
                                {!isPendingView && (
                                    <button
                                        className="btn btn-warning w-100 mb-2"
                                        onClick={() => setIsPendingView(true)}
                                    >
                                        Pending
                                    </button>)}
                                {/* <button className="btn btn-outline-warning w-100 mb-2">pending</button> */}

                            </div>
                        )}
                    </div>
                    
                    <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
                        <input type="text" className="form-control" style={{ height: "30px", paddingRight: "30px" }} placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
                        />

                        {searchText && (
                            <span
                                onClick={() => setSearchText("")} style={{
                                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold"
                                }}
                            > ✖
                            </span>
                        )}


                    </div>

                </div>

                {isPendingView ? (
                    <GRNDefaultTable
                        data={grnPendding()}
                        page={pagePen}
                        perPage={perPagePen}
                        totalRows={filteredGRNpen.length}
                        loading={loading}
                        setPage={setPagePen}
                        setPerPage={setPerPagePen}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}

                    />
                ) : (
                    <GRNDefaultTable
                        data={filteredGRNclose}
                        page={pageClose}
                        perPage={perPageClose}
                        totalRows={totalCloseRows}
                        loading={loading}
                        setPage={setPageClose}
                        setPerPage={setPerPageClose}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        onEdit={handleEditClick}
                        isEditMode={isEditMode}

                    />

                )}
{selectedRows.length > 0 && !isEditMode && (

                        <div className="ComCssButton9">

                            <button style={{ backgroundColor: 'Red' }} onClick={onDeleteClick}>
                                delete
                            </button>
                                <button onClick={formClear}>Clear</button>

                        </div>
                    )}
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
                onConfirm={deleteRec}
                title="Confirm"
                message="Are you sure you want to delete this?"
                color="primary"
            />
        </div>
    )
}
export default GRN