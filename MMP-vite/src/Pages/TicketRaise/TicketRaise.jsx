import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Autocomplete, TextField, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import "./TicketRaise.css";
import TicketRaiseTable from "../../components/TicketRaise/TicketRaiseTable";
import { downloadTicketRaiseExport, fetchScreenName, fetchTicketRaiseDetail, fetchUserName, saveTicketRaise } from "../../Services/Services-Rc";
import { updateTicketDetail } from '../../Services/Services_09';

const priorityOptions = [
    { label: "Low",      value: "LOW"      },
    { label: "Medium",   value: "MEDIUM"   },
    { label: "High",     value: "HIGH"      },
    { label: "Critical", value: "CRITICAL"  },
];

const INIT_FORM   = { priority: null,screen:"", escalatedBy: null, description: "", file: null};
const INIT_ERRORS = { priority: "", screen:"", escalatedBy: "", description: "" };

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
            label="Description" multiline rows={2} fullWidth
            value={text} onChange={handleChange}
            error={Boolean(error)} helperText={error || `${text.length}/200`}
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
    const [apiError, setApiError] = useState("");
    const [success,  setSuccess]  = useState(false);

    const [editMode,         setEditMode]         = useState(false);
    const [editTicketnumber, setEditTicketnumber] = useState(null);

    const descRef            = useRef("");
    const [descSeed, setDescSeed]       = useState("");
    const [userDetails, setUserDetails] = useState([]);
    const [screenDetails, setScreenDetails] = useState([]);

    useEffect(() => { fetchTickets(); }, [page]);
    useEffect(() => { FetchUserName(); }, []);
    useEffect(() => { FetchScreen(); }, []);

    const escalatedByOptions = userDetails.map(item => ({ label: item, value: item }));
    const screenOptions = screenDetails.map(item => ({ label: item, value: item }));
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
        if (file.size > 2 * 1024 * 1024) { alert("File size should be less than 2 MB"); return; }
        handleChange("file", file);
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
        const matchedScreen =
        screenOptions.find(o => o.value === row.screen) || null;
        descRef.current = row.description || "";
        setDescSeed(row.description || "");
        setFormData({ priority: matchedPriority, screen: matchedScreen, escalatedBy: matchedEscalatedBy ? [matchedEscalatedBy] : [], file: null});
        setErrors(INIT_ERRORS);
        setApiError("");
        setSuccess(false);
        setEditMode(true);
        setEditTicketnumber(row.ticketnumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [escalatedByOptions , screenOptions]);

    const fetchTickets = useCallback(async (status = "", priority = "",screen = "" , currentPage = page) => {
        try {
            const response = await fetchTicketRaiseDetail(status, priority,  screen, currentPage, 10);
            setTableData(response.data.content      || []);
            setTotalPages(response.data.totalPages  || 0);
            setTotalElements(response.data.totalElements || 0);
        } catch (err) { console.error(err); }
    }, [page]);

    const handleSearch = useCallback(({ status = "", priority = "" , screen = "" } = {}) => {
        setPage(0);
        fetchTickets(status, priority, screen, 0);
    }, [fetchTickets]);

    const handleDownload = useCallback(async ({ status = "", priority = "" , screen = "" } = {}) => {
        try {
            const response = await downloadTicketRaiseExport(status, priority, screen);
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
        // payload.append("createddate", formData.createddate || "");
        payload.append("screen", formData.screen?.value || "");

        if (!isEdit) payload.append("createdby", localStorage.getItem("userName"));
        else         payload.append("updatedby", localStorage.getItem("userName"));
        if (formData.file) payload.append("file", formData.file);
        return payload;
    };

    const handleSubmit = async () => {
        setApiError(""); setSuccess(false);
        const userName = localStorage.getItem("userName");
        if (!userName) { alert("Please re-login"); return; }
        if (!validate()) return;
        try {
            setLoading(true);
            await saveTicketRaise(buildPayload(false));
            setSuccess(true);
            resetForm();
            fetchTickets();
        } catch (err) {
            setApiError(err?.response?.data?.message || "Failed to raise ticket");
        } finally { setLoading(false); }
    };

    const handleEditSubmit = async () => {
        setApiError(""); setSuccess(false);
        const userName = localStorage.getItem("userName");
        if (!userName) { alert("Please re-login"); return; }
        if (!validate()) return;
        try {
            setLoading(true);
            await updateTicketDetail(editTicketnumber, buildPayload(true));
            setSuccess(true);
            resetForm();
            fetchTickets();
        } catch (err) {
            setApiError(err?.response?.data?.message || "Failed to update ticket");
        } finally { setLoading(false); }
    };

    const resetForm = () => {
        descRef.current = "";
        setDescSeed("");
        setFormData(INIT_FORM);
        setErrors(INIT_ERRORS);
        setApiError("");
        setSuccess(false);
        setEditMode(false);
        setEditTicketnumber(null);
    };

    const userName = localStorage.getItem("userName");
    const userId   = localStorage.getItem("userId");

    return (
        <div className="TicketRaisedContainer">
            <div className="TicketRaisedInput">

                {/* ── Title ── */}
                <div className="ComCssFiledName">
                    <p>{editMode ? `Edit Ticket — #${editTicketnumber}` : "Service Desk"}</p>
                </div>

                <div className="TicketRaisedTexfiled">
                    <ThemeProvider theme={TextFiledTheme}>

                        {/* ══ ROW 1 — 3 fields side by side ══ */}
                        <div className="tr-field-row">

                            {/* Priority */}
                            <div className="tr-field-col">
                                <Autocomplete
                                    options={screenOptions}
                                    value={formData.screen}
                                    getOptionLabel={o => o.label || ""}
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
                                    onChange={(_, v) => handleChange("priority", v)}
                                    renderInput={params => (
                                        <TextField {...params} label="Priority" size="small" fullWidth
                                            error={Boolean(errors.priority)} helperText={errors.priority} />
                                    )}
                                />
                            </div>

                            {/* Escalated By */}
                            <div className="tr-field-col">
                                <Autocomplete
                                    multiple filterSelectedOptions
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

                            {/* Created Date */}
                            {/* <div className="tr-field-col">
                                <TextField
                                    label="Created Date" type="datetime-local"
                                    size="small" fullWidth
                                    value={formData.createddate}
                                    onChange={e => handleChange("createddate", e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </div> */}
                        </div>

                        {/* ══ ROW 2 — Description (full width, unchanged) ══ */}
                        <DescriptionField
                            initialValue={descSeed}
                            error={errors.description}
                            descRef={descRef}
                        />

                        {/* ══ ROW 3 — File upload ══ */}
                        {/* <div className="uploadSection">
                            <Button
                                variant="contained" component="label" size="small"
                                startIcon={<UploadFileIcon />}
                                sx={{ textTransform:"none", borderRadius:"8px",
                                      height:"38px", minWidth:"170px", boxShadow:"none" }}>
                                Upload File
                                <input type="file" hidden accept="image/*,video/*" onChange={handleFileUpload} />
                            </Button>
                            {formData.file && <p className="fileName">{formData.file.name}</p>}
                        </div> */}
                        {/* ══ ROW 3 — File upload + Notes ══ */}
<div className="uploadSection">
    <div className="uploadBtn">
        {/* <Button
            variant="contained" component="label" size="small"
            startIcon={<UploadFileIcon />}
            sx={{ textTransform:"none", borderRadius:"8px",
                  height:"38px", minWidth:"170px", boxShadow:"none" }}>
            Upload File
            <input type="file" hidden accept="image/*,video/*" onChange={handleFileUpload} />
        </Button>
        {formData.file && <p className="fileName">{formData.file.name}</p>} */}
    </div>

  <div className="noteSection">
    <p className="noteTitle">Note:</p>

    <p className="noteItem">
        <span className="noteKey bug">Bug</span> → Issue in the existing process
    </p>

    <p className="noteItem">
        <span className="noteKey update">Update</span> → Improvement in the existing process
    </p>

    <p className="noteItem">
        <span className="noteKey feature">New Feature</span> → Addition of a new functionality
    </p>

    <p className="noteItem">
        <span className="noteKey clarification">Clarification</span> → Need clarification on the existing process
    </p>
</div>
</div>

                        {apiError && <p className="apiError">{apiError}</p>}
                        {success  && (
                            <p className="apiSuccess">
                                {editMode ? "Ticket updated successfully!" : "Ticket raised successfully!"}
                            </p>
                        )}

                    </ThemeProvider>
                </div>

                {/* ── Buttons ── */}
                <div className="ComCssButton9">
                    <Button
            variant="contained" component="label" size="small"
            startIcon={<UploadFileIcon />}
            sx={{ textTransform:"none", borderRadius:"8px",
                  height:"31px", minWidth:"130px",marginTop:"9px", boxShadow:"none" }}>
            Upload File
            <input type="file" hidden accept="image/*,video/*" onChange={handleFileUpload} />
        </Button>
        {formData.file && <p className="fileName">{formData.file.name}</p>}
                    <button className="ComCssSubmitButton"
                        onClick={editMode ? handleEditSubmit : handleSubmit}
                        disabled={loading}>
                        {loading
                            ? (editMode ? "Updating…" : "Submitting…")
                            : (editMode ? "Edit"       : "Submit")}
                    </button>
                    <button className="ComCssDeleteButton" onClick={resetForm} disabled={loading}>
                        Cancel
                    </button>
                    
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
                userName={userName}
                userId={userId}
                screenDetails={screenDetails}
                
            />
        </div>
    );
};

export default TicketRaise;
