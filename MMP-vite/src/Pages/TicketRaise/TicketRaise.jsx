import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { Autocomplete, TextField } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import "./TicketRaise.css";
import TicketRaiseTable from "../../components/TicketRaise/TicketRaiseTable";
import { downloadTicketRaiseExport, fetchScreenName, fetchTicketRaiseDetail, fetchUserName, saveTicketRaise } from "../../Services/Services-Rc";
import { updateTicketDetail, updateClientStatus } from '../../Services/Services_09';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";

const priorityOptions = [
    { label: "Low",      value: "LOW",      color: "#2e7d32" },
    { label: "Medium",   value: "MEDIUM",   color: "#f9a825" },
    { label: "High",     value: "HIGH",     color: "#ef6c00" },
    { label: "Critical", value: "CRITICAL", color: "#c62828" },
];

// "payment SCREEN" -> "Payment Screen"
const toTitleCase = (str) =>
    String(str || "")
        .trim()
        .toLowerCase()
        .replace(/(^|[\s\-_/(])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());

// Unique, A-Z sorted, Title Case labels (value stays as the original string)
const buildSortedOptions = (items) =>
    [...new Set((items || []).filter(Boolean))]
        .map(item => ({ label: toTitleCase(item), value: item }))
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

const MAX_FILE_MB    = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

// Turn an axios error into a message that explains what actually went wrong
const getErrorMessage = (err, fallback) => {
    console.error(fallback, err);
    const res = err?.response;
    if (!res) return "Cannot reach the server. Check your connection and try again.";
    if (res.status === 413)
        return `File is too large for the server (limit is lower than ${MAX_FILE_MB} MB). Ask the backend team to raise the upload limit.`;
    const data = res.data;
    const serverMsg =
        (typeof data === "string" && data.length < 200 ? data : "") ||
        data?.message || data?.error || "";
    return `${serverMsg || fallback} (error ${res.status})`;
};

const INIT_FORM   = { priority: null, screen: null, escalatedBy: [], description: "", file: null };
const INIT_ERRORS = { priority: "", screen: "", escalatedBy: "", description: "" };

// ── DescriptionField — isolated, no parent re-render on typing ─────────────────
const DescriptionField = memo(({ initialValue, error, descRef }) => {
    const [text, setText] = useState(initialValue || "");
    useEffect(() => {
        setText(initialValue || "");
        descRef.current = initialValue || "";
    }, [initialValue]);
    const handleChange = (e) => {
        const val = e.target.value;
        if (val.length > 200) return;
        setText(val);
        descRef.current = val;
    };
    return (
        <TextField
            label="Describe the issue" multiline rows={3} fullWidth
            placeholder="Start with a type (Bug / Update / New Feature / Clarification), then explain what you need…"
            value={text} onChange={handleChange}
            error={Boolean(error)} helperText={error || `${text.length}/200`}
            FormHelperTextProps={{ sx: { textAlign: error ? "left" : "right", marginRight: 0 } }}
        />
    );
});

// ─────────────────────────────────────────────────────────────────────────────
const TicketRaise = () => {

    const [tableData,     setTableData]     = useState([]);
    const [page,          setPage]          = useState(0);
    const [totalPages,    setTotalPages]    = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [formData, setFormData] = useState(INIT_FORM);
    const [errors,   setErrors]   = useState(INIT_ERRORS);
    const [loading,  setLoading]  = useState(false);
    const [searching, setSearching] = useState(false);   // loader for Search
    const pendingSearchRef = useRef(false);               // search waiting on the [page] effect
    const [apiError, setApiError] = useState("");
    const [success,  setSuccess]  = useState("");

    const [editMode,         setEditMode]         = useState(false);
    const [editTicketnumber, setEditTicketnumber] = useState(null);

    const descRef    = useRef("");
    const filtersRef = useRef({ status: "", priority: "", screen: "", ticketNo: "", clientStatus: "" });   // filters currently applied to the table
    const fileRef   = useRef(null);
    const [descSeed, setDescSeed]           = useState("");
    const [descKey,  setDescKey]            = useState(0);   // bump to force the description box to remount/clear
    const [userDetails, setUserDetails]     = useState([]);
    const [screenDetails, setScreenDetails] = useState([]);

    useEffect(() => {
        if (pendingSearchRef.current) {
            pendingSearchRef.current = false;
            fetchTickets().finally(() => setSearching(false));
        } else {
            fetchTickets();
        }
    }, [page]);
    useEffect(() => { FetchUserName(); }, []);
    useEffect(() => { FetchScreen(); }, []);

    const escalatedByOptions = useMemo(() => buildSortedOptions(userDetails),   [userDetails]);
    const screenOptions      = useMemo(() => buildSortedOptions(screenDetails), [screenDetails]);

    const FetchUserName = async () => {
        try {
            const response = await fetchUserName();
            const data = response.data;
            if (data.table1?.length > 0) setUserDetails(data.table1);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const FetchScreen = async () => {
        try {
            const response = await fetchScreenName();
            const data = response.data;
            if (data.ScreenName?.length > 0) setScreenDetails(data.ScreenName);
        } catch (error) {
            console.error("Error fetching screen details:", error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            alert("Only image or video files are allowed");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            alert(`File size should not exceed ${MAX_FILE_MB} MB`);
            e.target.value = "";
            return;
        }
        handleChange("file", file);
    };

    const removeFile = () => {
        handleChange("file", null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const validate = () => {
        const desc = descRef.current.trim();
        const newErrors = { ...INIT_ERRORS };
        let isValid = true;
        if (!formData.priority)   { newErrors.priority    = "Priority is required.";                  isValid = false; }
        if (!formData.escalatedBy || formData.escalatedBy.length === 0)
                                  { newErrors.escalatedBy = "Please select who escalated the issue."; isValid = false; }
        if (!desc)                { newErrors.description = "Description is required.";               isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const handleEditClick = useCallback((row) => {
        const matchedPriority    = priorityOptions.find(o => o.value === row.priority) || null;
        const matchedEscalatedBy = escalatedByOptions.find(o => o.value === row.escalatedBy) || null;
        const matchedScreen      = screenOptions.find(o => o.value === row.screen) || null;
        descRef.current = row.description || "";
        setDescSeed(row.description || "");
        setDescKey(k => k + 1);
        setFormData({
            priority: matchedPriority,
            screen: matchedScreen,
            escalatedBy: matchedEscalatedBy ? [matchedEscalatedBy] : [],
            file: null,
        });
        setErrors(INIT_ERRORS);
        setApiError("");
        setSuccess("");
        setEditMode(true);
        setEditTicketnumber(row.ticketnumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [escalatedByOptions, screenOptions]);

    const fetchTickets = useCallback(async (
        status   = filtersRef.current.status,
        priority = filtersRef.current.priority,
        screen   = filtersRef.current.screen,
        currentPage = page,
        ticketNo = filtersRef.current.ticketNo,
        clientStatus = filtersRef.current.clientStatus
    ) => {
        try {
            const response = await fetchTicketRaiseDetail(status, priority, screen, currentPage, 10, ticketNo, clientStatus);
            setTableData(response.data.content      || []);
            setTotalPages(response.data.totalPages  || 0);
            setTotalElements(response.data.totalElements || 0);
        } catch (err) { console.error(err); }
    }, [page]);

    const handleSearch = useCallback(({ status = "", priority = "", screen = "", ticketNo = "", clientStatus = "" } = {}) => {
        filtersRef.current = { status, priority, screen, ticketNo, clientStatus };
        setSearching(true);
        if (page === 0) {
            fetchTickets(status, priority, screen, 0, ticketNo, clientStatus).finally(() => setSearching(false));
        } else {
            pendingSearchRef.current = true;  // the [page] effect fetches page 0 and clears the loader
            setPage(0);
        }
    }, [fetchTickets, page]);

    const handleDownload = useCallback(async ({ status = "", priority = "", screen = "", ticketNo = "", clientStatus = "" } = {}) => {
        try {
            const response = await downloadTicketRaiseExport(status, priority, screen, ticketNo, clientStatus);
            const blob = new Blob([response.data], {
                type: response.headers["content-type"] || "application/octet-stream",
            });
            const url         = URL.createObjectURL(blob);
            const a           = document.createElement("a");
            const disposition = response.headers["content-disposition"] || "";
            const match       = disposition.match(/filename="?([^";\n]+)"?/);
            a.download        = match?.[1] || `tickets_${new Date().toISOString().slice(0,10)}.xlsx`;
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to download. Please try again.");
        }
    }, []);

    const handleNextPage = useCallback(() => setPage(p => p + 1), []);
    const handlePrevPage = useCallback(() => setPage(p => p - 1), []);

    const buildPayload = (isEdit = false) => {
        const payload = new FormData();
        if (isEdit) payload.append("ticketnumber", editTicketnumber);
        payload.append("priority",    formData.priority?.value || "");
        payload.append("escalatedBy", formData.escalatedBy?.map(i => i.value).join(",") || "");
        payload.append("description", descRef.current.trim());
        payload.append("screen",      formData.screen?.value || "");

        if (!isEdit) payload.append("createdby", localStorage.getItem("userName"));
        else         payload.append("updatedby", localStorage.getItem("userName"));
        if (formData.file) payload.append("file", formData.file);
        return payload;
    };

    const handleSubmit = async () => {
        setApiError(""); setSuccess("");
        const userName = localStorage.getItem("userName");
        if (!userName) { alert("Please re-login"); return; }
        if (!validate()) return;
        try {
            setLoading(true);
            await saveTicketRaise(buildPayload(false));
            resetForm();
            setSuccess("Ticket raised successfully!");
            fetchTickets();
        } catch (err) {
            setApiError(getErrorMessage(err, "Failed to raise ticket"));
        } finally { setLoading(false); }
    };

    const handleEditSubmit = async () => {
        setApiError(""); setSuccess("");
        const userName = localStorage.getItem("userName");
        if (!userName) { alert("Please re-login"); return; }
        if (!validate()) return;
        try {
            setLoading(true);
            await updateTicketDetail(editTicketnumber, buildPayload(true));
            resetForm();
            setSuccess("Ticket updated successfully!");
            fetchTickets();
        } catch (err) {
            setApiError(getErrorMessage(err, "Failed to update ticket"));
        } finally { setLoading(false); }
    };

    // Client Status popup submit — errors are re-thrown so the popup shows them
    const handleClientRespond = async ({ ticketnumber, clientStatus, unresolvedRemarks = "" }) => {
        const payload = {
            ticketNo: ticketnumber,
            status:   clientStatus,
            username: localStorage.getItem("userName") || "",
            unresolvedRemarks: clientStatus === "UNRESOLVED" ? unresolvedRemarks : "",
        };
        const response = await updateClientStatus(payload);
        setSuccess(response?.data?.message || `Client status updated for ${ticketnumber}`);
        fetchTickets();
    };

    const resetForm = () => {
        descRef.current = "";
        setDescSeed("");
        setDescKey(k => k + 1);
        setFormData(INIT_FORM);
        setErrors(INIT_ERRORS);
        setApiError("");
        setSuccess("");
        setEditMode(false);
        setEditTicketnumber(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const userName = localStorage.getItem("userName");
    const userId   = localStorage.getItem("userId");

    return (
        <div className="TicketRaisedContainer">
            <LoadingOverlay loading={loading || searching} />
            <div className="TicketRaisedInput">

                {/* ── Card header ── */}
                <div className="tr-card-header">
                    <div className="tr-card-icon"><SupportAgentIcon fontSize="small" /></div>
                    <div className="tr-card-titles">
                        <h2 className="tr-card-title">
                            {editMode ? `Edit Ticket #${editTicketnumber}` : "Service Desk"}
                        </h2>
                        <p className="tr-card-subtitle">
                            {editMode
                                ? "Update the details below and save your changes."
                                : "Raise a new ticket and our team will pick it up."}
                        </p>
                    </div>
                    {editMode && <span className="tr-edit-pill">Editing</span>}
                </div>

                <div className="TicketRaisedTexfiled">
                    <ThemeProvider theme={TextFiledTheme}>

                        {/* ══ ROW 1 — three selectors ══ */}
                        <div className="tr-field-row">
                            <div className="tr-field-col">
                                <Autocomplete
                                    options={screenOptions}
                                    value={formData.screen}
                                    getOptionLabel={o => o.label || ""}
                                    isOptionEqualToValue={(o, v) => o.value === v.value}
                                    onChange={(_, v) => handleChange("screen", v)}
                                    renderInput={params => (
                                        <TextField {...params} label="Screen" size="small" fullWidth
                                            error={Boolean(errors.screen)} helperText={errors.screen} />
                                    )}
                                />
                            </div>

                            <div className="tr-field-col">
                                <Autocomplete
                                    options={priorityOptions}
                                    value={formData.priority}
                                    getOptionLabel={o => o.label || ""}
                                    isOptionEqualToValue={(o, v) => o.value === v.value}
                                    onChange={(_, v) => handleChange("priority", v)}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.value}>
                                            <span className="tr-dot" style={{ background: option.color }} />
                                            {option.label}
                                        </li>
                                    )}
                                    renderInput={params => (
                                        <TextField {...params} label="Priority" size="small" fullWidth
                                            error={Boolean(errors.priority)} helperText={errors.priority} />
                                    )}
                                />
                            </div>

                            <div className="tr-field-col">
                                <Autocomplete
                                    multiple filterSelectedOptions
                                    limitTags={2}
                                    options={escalatedByOptions}
                                    value={formData.escalatedBy || []}
                                    getOptionLabel={o => o.label || ""}
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                    onChange={(_, v) => handleChange("escalatedBy", v)}
                                    renderInput={params => (
                                        <TextField {...params} label="Issue Escalated By" size="small" fullWidth
                                            error={Boolean(errors.escalatedBy)} helperText={errors.escalatedBy} />
                                    )}
                                />
                            </div>
                        </div>

                        {/* ══ ROW 2 — description ══ */}
                        <div className="tr-desc-row">
                            <div className="tr-desc-main">
                                <DescriptionField
                                    key={descKey}
                                    initialValue={descSeed}
                                    error={errors.description}
                                    descRef={descRef}
                                />
                            </div>
                        </div>

                        {/* ── Feedback banners ── */}
                        {apiError && (
                            <div className="tr-banner tr-banner--error" role="alert">
                                <ErrorOutlineIcon fontSize="small" /> <span>{apiError}</span>
                            </div>
                        )}
                        {success && (
                            <div className="tr-banner tr-banner--success" role="status">
                                <CheckCircleOutlineIcon fontSize="small" />
                                <span>{success}</span>
                            </div>
                        )}

                    </ThemeProvider>
                </div>

                {/* ── Action bar ── */}
                <div className="tr-action-bar">
                    <div className="tr-attach">
                        <label className="tr-attach-btn">
                            <UploadFileIcon fontSize="small" />
                            <span>Attach file</span>
                            <input
                                ref={fileRef} type="file" hidden
                                accept="image/*,video/*" onChange={handleFileUpload}
                            />
                        </label>
                        {formData.file ? (
                            <span className="tr-file-chip" title={formData.file.name}>
                                <span className="fileName">{formData.file.name}</span>
                                <button type="button" className="tr-file-remove"
                                    onClick={removeFile} aria-label="Remove file">
                                    <CloseIcon style={{ fontSize: 14 }} />
                                </button>
                            </span>
                        ) : (
                            <span className="tr-attach-hint">Image or video · max {MAX_FILE_MB} MB</span>
                        )}
                    </div>

                    <div className="tr-actions">
                        <button className="tr-btn-secondary" onClick={resetForm} disabled={loading}>
                            Cancel
                        </button>
                        <button className="tr-btn-primary"
                            onClick={editMode ? handleEditSubmit : handleSubmit}
                            disabled={loading}>
                            {loading
                                ? (editMode ? "Saving…"     : "Submitting…")
                                : (editMode ? "Save changes" : "Submit Ticket")}
                        </button>
                    </div>
                </div>
            </div>

            <TicketRaiseTable
                tableData={tableData}
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onSearch={handleSearch}
                onDownload={handleDownload}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
                onEdit={handleEditClick}
                onClientRespond={handleClientRespond}
                userName={userName}
                userId={userId}
                screenDetails={screenDetails}
            />
        </div>
    );
};

export default TicketRaise;
