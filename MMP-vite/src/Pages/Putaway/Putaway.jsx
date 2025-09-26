import React, { useState, useEffect, useRef } from 'react';
import PutawayTextFiled from "../../components/Putaway/PutawayTextFiled";
import PutawayDefaultTable from "../../components/Putaway/PutawayDefaultTable";
import './Putaway.css';
import PutawayProcessTable from "../../components/Putaway/PutawayProcessTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";

import { fetchPutawayTicket, fetchPutawayDetail, fetchPutawayPendingDetail, fetchPutawayPartiallyDetail, PutawayProcessDetail } from '../../components/Putaway/PutawayActions.js';
import { FaFileExcel, FaBars } from "react-icons/fa";
import { saveGRN } from '../../Services/Services_09.js';
import { saveLEDRequest, savePutawayRequest } from '../../Services/Services-Rc.js';

const Putaway = () => {
    const [formData, setFormData] = useState({
        RecevingTicketNo: ""
    });
    const [formPutPrecssData, setFormPutPrecssData] = useState({
        RecevingTicketNo: ""
    });
    const [putawayTicket, setPutawayTicket] = useState({});
    const [showMenu, setShowMenu] = useState(false);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [putawayDetail, setPutawayDetail] = useState([]);
    const [putawayPendingDetail, setPutawayPendingDetail] = useState([]);
    const [putawayPartiallyDetail, setPutawayPartiallyDetail] = useState([]);
    const [hiddenButton, setHiddenButton] = useState("");
    const [hiddenPutButton, setHiddenPutButton] = useState(false);

    const [putawayProcessDetail, setPutawayProcessDetail] = useState([])
    const menuRef = useRef(null);
    const [selectedRows1, setSelectedRows1] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isPutProcess, setIsPutProcess] = useState(false)
       const [isUserActive, setIsUserActive] = useState(false)

    const [colourCode, setColourCode] = useState("")
    const [selectedSubmitRows, setSelectedSubmitRows] = useState([]);

    const handleGRNQtyChange = (rowId, field, value) => {
        setPutawayProcessDetail((prev) =>
            prev.map((item) =>
                item.selectedid === rowId ? { ...item, [field]: value } : item
            )
        );
    };

    const handlePutawayChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (field === "RecevingTicketNo") {
            const ticketNo = value ? value.split("-")[0] : "";
            if (onSelectPonumber) {
                onSelectPonumber(ticketNo);
                console.log("ticketNo", ticketNo);
            }
        }
    };

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        fetchPutawayTicket(setPutawayTicket);
        // fetchPutawayDetail(page, perPage, setPutawayDetail, setTotalRows);
    }, []);

    useEffect(() => {
        // fetchPutawayTicket(setPutawayTicket);
        fetchPutawayDetail(page, perPage, setPutawayDetail, setTotalRows);
    }, [page, perPage]);

    const fetchPutawayPending = () => {
        fetchPutawayPendingDetail(page, perPage, setPutawayDetail, setTotalRows)
        setHiddenButton("pending");
    }

    const fetchPutawayPartially = () => {
        fetchPutawayPartiallyDetail(page, perPage, setPutawayDetail, setTotalRows)
        setHiddenButton("partial");
    }

    const fetchPutaway = () => {
        fetchPutawayDetail(page, perPage, setPutawayDetail, setTotalRows);
        setHiddenButton("closed");
    }
    // const fetchPutawayProcessDetail = (formData) => {
    //     return PutawayProcessDetail(formData, setPutawayProcessDetail, setTotalRows);
    // };

    const fetchPutawayProcessDetail = (formData) => {
        return PutawayProcessDetail(formData, (data) => {
            const withIds = data.map((item, index) => ({
                ...item,
                selectedid: item.selectedid ?? item.id ?? index,
                setHiddenPutButton: !!item.user, // hide button if user exists
            }));
        setIsPutProcess(true);

            // 🔹 Derive color based on user (like LED logic)
            const users = withIds
                .map(item => item.user)
                .filter(u => u != null);
            const uniqueUsers = [...new Set(users)];

            // Example mapping: user 1 → green, 2 → blue, etc.
            let colour = null;
            if (uniqueUsers.length) {
                switch (uniqueUsers[0]) {
                    case 1: colour = "green"; break;
                    case 2: colour = "blue"; break;
                    case 3: colour = "red"; break;
                    case 4: colour = "yellow"; break;
                    default: colour = "green";
                }
                        setIsUserActive(true);

            }

            setColourCode(colour);

            setPutawayProcessDetail(withIds);
            setTotalRows(withIds.length);
        });
    };



    useEffect(() => {
        if (formData?.RecevingTicketNo) {
            const ticketNo = formData.RecevingTicketNo.split("-")[0]; // RE00000929
            console.log("Sending to API:", ticketNo);

            fetchPutawayProcessDetail(ticketNo); // ✅ only pass ticketNo
        }
    }, [formData?.RecevingTicketNo]);



    console.log("fromData", formData)
    console.log("putawayProcessDetail", putawayProcessDetail)
    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const valiDate = () => {
        const errors = {};
        let isValid = true;

        selectedRows1.forEach((id) => {
            const item = putawayProcessDetail.find((d) => d.selectedid === id);

            if (!item || item.putQty === undefined || item.putQty === "") {
                errors[`putQty${item?.selectedid}`] = "Enter putQty";
                isValid = false;
            } else if (item.putQty > item.GRNQty) {
                errors[`putQty${item.selectedid}`] = "Put Qty cannot exceed GRN Qty";
                isValid = false;
            }
        });

        setFormErrors(errors);
        return isValid;
    };
    const [submittedIds, setSubmittedIds] = useState([]); // track IDs only

    const handlePut = (e) => {
        e.preventDefault();
        // if (!valiDate()) return;

        if (selectedRows1.length === 0) {
            setErrorMessage("Please select at least one row");
            setShowErrorPopup(true);
            return;
        }

        // Only new rows
        const newSelectedRows = selectedRows1.filter(
            id => !submittedIds.includes(id)
        );

        if (newSelectedRows.length === 0) {
            setErrorMessage("No new rows to submit");
            setShowErrorPopup(true);
            return;
        }

        const filteredData = putawayProcessDetail.filter((row) =>
            newSelectedRows.includes(row.selectedid)
        );

        const submitData = filteredData.map((row) => ({
            Location: row.location,
            Product_Qty: row.GRNQty,
            Product_Code: row.partcode,
            Product_Name: row.partdescription,
            ticketno: row.recevingTicketNo,
        }));

        saveLEDRequest(submitData)
            .then((response) => {
                let colour = "";
                const match = response.data.message?.match(/following (\w+) light/);
                if (match) {
                    colour = match[1]; // "green", "blue", "red", "yellow"
                    setColourCode(colour);
                }
                setSubmittedIds(prev => [...prev, ...newSelectedRows]); // update submitted IDs
                handleSuccessCommon({
                    response,
                    setSuccessMessage,
                    setShowSuccessPopup,
                });
                        setIsUserActive(true);

            })
            .catch((error) => {
                handleErrorCommon({
                    error,
                    setErrorMessage,
                    setShowErrorPopup,
                });
            });
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRows1.length === 0) {
            setErrorMessage("Please select at least one row");
            setShowErrorPopup(true);
            return;
        }

        const username = sessionStorage.getItem("userName") || "System";
        const selectedKeys = new Set(selectedRows1);
        const filteredData = putawayProcessDetail.filter((row) => selectedKeys.has(row.selectedid));

        const submitData = []; // ✅ declare submitData

        filteredData.forEach((row) => {
            const putQtyDetails = row.putQtyDetails || {}; // { loc1: 5, loc2: 10 }

            Object.keys(putQtyDetails).forEach((loc) => {
                const qty = Number(putQtyDetails[loc] || 0);
                if (qty > 0) { // skip zero entries
                    submitData.push({
                        location: loc,
                        putqty: qty,
                        batchcode: row.rcbatchcode,
                        partcode: row.partcode,
                        recevingTicketNo: row.recevingTicketNo,
                        intsysid: row.id,
                        createdby: username,
                    });
                }
            });
        });

        savePutawayRequest(submitData)
            .then((response) => {
                handleSuccessCommon({
                    response,
                    setSuccessMessage,
                    setShowSuccessPopup,
                });
            })
            .catch((error) => {
                handleErrorCommon({
                    error,
                    setErrorMessage,
                    setShowErrorPopup,
                });
            });
    };
    const isPutButtonHidden = putawayProcessDetail.some(row => row.user); // true if any row has user

    const LightIndicator = ({ colour }) => {
        return <span className="blinking" style={{ backgroundColor: colour, color: colour }}></span>;
    };

    // useEffect(() => {
    //     console.log("selectedSubmitRows updated:", selectedSubmitRows);
    // }, [selectedSubmitRows]);
    // console.log("colour", setColourCode)

    return (
        <div className='ComCssContainer'>
            
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Putaway</p>
                </div>
                <PutawayTextFiled
                    formData={formData}
                    handleChange={handleChange}
                    handlePutawayChange={handlePutawayChange}
                    poDropdownOptions={Array.isArray(putawayTicket) ? [...new Set(putawayTicket)] : []}


                />
            </div>
            {isPutProcess && (
                <div className='ComCssTable'>

                    <PutawayProcessTable
                        data={putawayProcessDetail}
                        // putawayProcessDetail={putawayProcessDetail}
                        page={page}
                        perPage={perPage}
                        totalRows={putawayProcessDetail.length}
                        loading={loading}
                        setPage={setPage}
                        setPerPage={setPerPage}
                        selectedRows1={selectedRows1}
                        formErrors={formErrors}
                        setSelectedRows1={setSelectedRows1}
                        setFormPutPrecssData={setFormPutPrecssData}
                        handleGRNQtyChange={handleGRNQtyChange}

                    />
                    {isUserActive && (
                    <p>
                        <LightIndicator colour={colourCode} /> User {colourCode} is active
                    </p>
                    )}
                    <div className='ComCssButton9'>
                        {!isPutButtonHidden && (
                            <button className='ComCssSubmitButton' onClick={handlePut}>
                                PUT
                            </button>
                        )}
                        <button className='ComCssSubmitButton' onClick={handleSubmit}>
                            Submit
                        </button>
                    </div>
                    <h5 className='ComCssTableName'></h5>
                </div>
            )}
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>
                    {hiddenButton === "pending" && "Putaway pending Detail"}
                    {hiddenButton === "partial" && "Putaway Partial Detail"}
                    {hiddenButton === "closed" && "Putaway Closed Detail"}
                    {!hiddenButton && "Putaway Closed Detail"}
                </h5>


                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>

                    <button className="btn btn-light" onClick={() => setShowMenu(!showMenu)}>
                        <FaBars />
                    </button>

                    {showMenu && (
                        <div className="ComCssButtonMenu">
                            <button className='ComCssExportButton' onClick={() => setShowMenu(false)}>
                                <FaFileExcel /> Export
                            </button>
                            {hiddenButton !== "pending" && (
                                <button
                                    className='ComCssPendingButton'
                                    onClick={() => {
                                        fetchPutawayPending();
                                        setShowMenu(false);
                                    }}
                                >
                                    Pending
                                </button>
                            )}
                            {hiddenButton !== "partial" && (
                                <button className='ComCssPariallButton' onClick={() => {
                                    fetchPutawayPartially();
                                    setShowMenu(false);
                                }}>Partial</button>)}
                            {hiddenButton !== "closed" && (
                                <button className='ComCssAllButton' onClick={() => {
                                    fetchPutaway();
                                    setShowMenu(false);
                                }}>Closed</button>)}
                        </div>
                    )}

                    <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
                        <input
                            type="text"
                            className="form-control"
                            style={{ height: "30px", paddingRight: "30px" }}
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {searchText && (
                            <span onClick={() => setSearchText("")}>
                                ✖
                            </span>
                        )}
                    </div>
                </div>

                <PutawayDefaultTable
                    data={putawayDetail}
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
            {/* <CustomDialog
                open={confirmDelete}
                onClose={handleCancel}
                onConfirm={deleteRec}
                title="Confirm"
                message="Are you sure you want to delete this?"
                color="primary"
            /> */}
        </div>
    );
};

export default Putaway;
