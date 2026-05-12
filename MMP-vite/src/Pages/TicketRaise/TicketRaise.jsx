import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import "./TicketRaise.css";
import TicketRaiseTable from "../../components/TicketRaise/TicketRaiseTable";

import { fetchTicketRaiseDetail, saveTicketRaise } from "../../Services/Services-Rc";

const priorityOptions = [
    { label: "Low",      value: "LOW"      },
    { label: "Medium",   value: "MEDIUM"   },
    { label: "High",     value: "HIGH"      },
    { label: "Critical", value: "CRITICAL"  },
];

const escalatedByOptions = [
    { label: "Kumaran",  value: "Kumaran"  },
    { label: "Dhanapal", value: "Dhanapal" },
    { label: "Praveen",  value: "Praveen"  },
];

const INIT_FORM   = { priority: null, escalatedBy: null, description: "", file: null };
const INIT_ERRORS = { priority: "",   escalatedBy: "",   description: "" };

const TicketRaise = () => {

    // ── Table state ───────────────────────────────────────────────────────────
    const [tableData,     setTableData]     = useState([]);
    const [page,          setPage]          = useState(0);
    const [totalPages,    setTotalPages]    = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchText,    setSearchText]    = useState("");

    // ── Form state ────────────────────────────────────────────────────────────
    const [formData,      setFormData]      = useState(INIT_FORM);
    const [errors,        setErrors]        = useState(INIT_ERRORS);
    const [loading,       setLoading]       = useState(false);
    const [apiError,      setApiError]      = useState("");
    const [success,       setSuccess]       = useState(false);

    // ── Edit state ────────────────────────────────────────────────────────────
    const [editMode,      setEditMode]      = useState(false);   // true when editing a row
    const [editTicketNo,  setEditTicketNo]  = useState(null);    // ticketNo being edited

    // ── Fetch on page change ──────────────────────────────────────────────────
    useEffect(() => { fetchTickets(); }, [page]);

    // ── Form handlers ─────────────────────────────────────────────────────────
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert("File size should be less than 2 MB"); return; }
        handleChange("file", file);
    };

    const validate = () => {
        const newErrors = { ...INIT_ERRORS };
        let isValid = true;
        if (!formData.priority)           { newErrors.priority    = "Priority is required.";                  isValid = false; }
        if (!formData.escalatedBy)        { newErrors.escalatedBy = "Please select who escalated the issue."; isValid = false; }
        if (!formData.description.trim()) { newErrors.description = "Description is required.";               isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    // ── Edit icon click: populate form with row data ───────────────────────────
    const handleEditClick = (row) => {
        // Map the row values back to option objects
        const matchedPriority    = priorityOptions.find(o => o.value === row.priority)    || null;
        const matchedEscalatedBy = escalatedByOptions.find(o => o.value === row.escalatedBy) || null;

        setFormData({
            priority:    matchedPriority,
            escalatedBy: matchedEscalatedBy,
            description: row.description || "",
            file:        null,               // file can't be pre-filled from server
        });

        setErrors(INIT_ERRORS);
        setApiError("");
        setSuccess(false);
        setEditMode(true);
        setEditTicketNo(row.ticketNo);       // store the ticketNo for the PUT call

        // Scroll the form into view smoothly
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Submit (create) ───────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setApiError(""); setSuccess(false);
        const userName = localStorage.getItem("userName");
        if (!userName) { alert("Please re-login"); return; }
        if (!validate()) return;
        try {
            setLoading(true);
            const payload = new FormData();
            payload.append("priority",    formData.priority?.value    || "");
            payload.append("escalatedBy", formData.escalatedBy?.value || "");
            payload.append("description", formData.description.trim());
            payload.append("createdby",   userName);
            if (formData.file) payload.append("file", formData.file);
            await saveTicketRaise(payload);
            setSuccess(true);
            setFormData(INIT_FORM);
            setErrors(INIT_ERRORS);
            fetchTickets();
        } catch (err) {
            setApiError(err?.response?.data?.message || "Failed to raise ticket");
        } finally {
            setLoading(false);
        }
    };

    // ── Edit submit (update) ──────────────────────────────────────────────────
    const handleEditSubmit = async () => {
        setApiError(""); setSuccess(false);
        const userName = localStorage.getItem("userName");
        if (!userName) { alert("Please re-login"); return; }
        if (!validate()) return;
        try {
            setLoading(true);
            const payload = new FormData();
            payload.append("ticketNo",    editTicketNo);
            payload.append("priority",    formData.priority?.value    || "");
            payload.append("escalatedBy", formData.escalatedBy?.value || "");
            payload.append("description", formData.description.trim());
            payload.append("updatedby",   userName);
            if (formData.file) payload.append("file", formData.file);

            // Call your update API — adjust the import in Services-Rc accordingly
            await updateTicketRaise(payload);

            setSuccess(true);
            resetForm();
            fetchTickets();
        } catch (err) {
            setApiError(err?.response?.data?.message || "Failed to update ticket");
        } finally {
            setLoading(false);
        }
    };

    // ── Reset form & exit edit mode ───────────────────────────────────────────
    const resetForm = () => {
        setFormData(INIT_FORM);
        setErrors(INIT_ERRORS);
        setApiError("");
        setSuccess(false);
        setEditMode(false);
        setEditTicketNo(null);
    };

    const handleCancel = () => resetForm();

    // ── Fetch tickets ─────────────────────────────────────────────────────────
    const fetchTickets = async (overrideSearch) => {
        try {
            const q        = overrideSearch !== undefined ? overrideSearch : searchText;
            const response = await fetchTicketRaiseDetail(q, page, 10);
            setTableData(response.data.content      || []);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
        }
    };

    // ── Pagination handlers ───────────────────────────────────────────────────
    const handleSearch   = (overrideSearch) => { setPage(0); fetchTickets(overrideSearch); };
    const handleNextPage = () => { if (page + 1 < totalPages) setPage(p => p + 1); };
    const handlePrevPage = () => { if (page > 0)              setPage(p => p - 1); };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="TicketRaisedContainer">

            {/* ── Form panel ── */}
            <div className="TicketRaisedInput">

                {/* Title changes based on mode */}
                <div className="ComCssFiledName">
                    <p>{editMode ? `Edit Ticket — #${editTicketNo}` : "Ticket Raise"}</p>
                </div>

                <div className="TicketRaisedTexfiled">
                    <ThemeProvider theme={TextFiledTheme}>

                        <Autocomplete
                            options={priorityOptions}
                            value={formData.priority}
                            getOptionLabel={o => o.label || ""}
                            onChange={(_, v) => handleChange("priority", v)}
                            renderInput={params => (
                                <TextField {...params} label="Priority" size="small" fullWidth
                                    error={Boolean(errors.priority)} helperText={errors.priority} />
                            )}
                        />

                        <Autocomplete
                            options={escalatedByOptions}
                            value={formData.escalatedBy}
                            getOptionLabel={o => o.label || ""}
                            onChange={(_, v) => handleChange("escalatedBy", v)}
                            renderInput={params => (
                                <TextField {...params} label="Issue Escalated By" size="small" fullWidth
                                    error={Boolean(errors.escalatedBy)} helperText={errors.escalatedBy} />
                            )}
                        />

                        <TextField
                            label="Description" multiline rows={3} fullWidth
                            value={formData.description}
                            onChange={e => {
                                if (e.target.value.length <= 200)
                                    handleChange("description", e.target.value);
                            }}
                            error={Boolean(errors.description)}
                            helperText={errors.description || `${formData.description.length}/200`}
                        />

                        <div className="uploadSection">
                            <Button
                                variant="contained" component="label" size="small"
                                startIcon={<UploadFileIcon />}
                                sx={{ textTransform: "none", borderRadius: "8px",
                                      height: "38px", minWidth: "170px", boxShadow: "none" }}
                            >
                                Upload File
                                <input type="file" hidden accept="image/*,video/*"
                                    onChange={handleFileUpload} />
                            </Button>
                            {formData.file && (
                                <p className="fileName">{formData.file.name}</p>
                            )}
                        </div>

                        {apiError && <p className="apiError">{apiError}</p>}
                        {success  && (
                            <p className="apiSuccess">
                                {editMode ? "Ticket updated successfully!" : "Ticket raised successfully!"}
                            </p>
                        )}

                    </ThemeProvider>
                </div>

                <div className="ComCssButton9">
                    {/* Button label: "Edit" in edit mode, "Submit" otherwise */}
                    <button
                        className="ComCssSubmitButton"
                        onClick={editMode ? handleEditSubmit : handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (editMode ? "Updating…" : "Submitting…") : (editMode ? "Edit" : "Submit")}
                    </button>
                    <button className="ComCssDeleteButton" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </button>
                </div>
            </div>

            {/* ── Tickets table — pass handleEditClick down ── */}
            <TicketRaiseTable
                tableData={tableData}
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                searchText={searchText}
                setSearchText={setSearchText}
                onSearch={handleSearch}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
                onEdit={handleEditClick}       
            />

        </div>
    );
};

export default TicketRaise;
