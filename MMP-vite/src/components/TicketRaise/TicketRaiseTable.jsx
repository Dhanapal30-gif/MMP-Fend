import React, { useState, useRef } from 'react';
import { updateTicketDetailDev } from '../../Services/Services_09';

// ── Byte-array → Blob URL helpers ─────────────────────────────────────────────
const parseByteArray = (raw) => {
    if (!raw) return null;
    const nums = String(raw).replace(/\s/g, "").split(",").map(Number);
    const arr = new Uint8Array(nums.length);
    nums.forEach((n, i) => { arr[i] = n < 0 ? n + 256 : n; });
    return arr;
};
const detectMime = (arr) => {
    if (!arr || arr.length < 12) return null;
    if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) return { mime: "image/jpeg", kind: "image" };
    if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) return { mime: "image/png", kind: "image" };
    if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) return { mime: "image/gif", kind: "image" };
    if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 && arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50) return { mime: "image/webp", kind: "image" };
    if (arr[4] === 102 && arr[5] === 116 && arr[6] === 121 && arr[7] === 112) return { mime: "video/mp4", kind: "video" };
    if (arr[0] === 0x1A && arr[1] === 0x45 && arr[2] === 0xDF && arr[3] === 0xA3) return { mime: "video/webm", kind: "video" };
    return null;
};
const toObjectURL = (arr, mime) => URL.createObjectURL(new Blob([arr], { type: mime }));

// ── Badge config ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
    OPEN: { bg: "#e8f5e9", color: "#2e7d32", dot: "#43a047" },
    IN_PROGRESS: { bg: "#fff8e1", color: "#f57f17", dot: "#ffc107" },
    CLOSED: { bg: "#fce4ec", color: "#b71c1c", dot: "#e53935" },
    COMPLETED: { bg: "#e3f2fd", color: "#1565c0", dot: "#1e88e5" },
    PENDING: { bg: "#fff3e0", color: "#e65100", dot: "#fb8c00" },
    HOLD:        { bg: "#f3e5f5", color: "#6a1b9a", dot: "#ab47bc" },
};
const PRIORITY_STYLES = {
    LOW: { bg: "#e3f2fd", color: "#1565c0" },
    MEDIUM: { bg: "#fff3e0", color: "#e65100" },
    HIGH: { bg: "#fbe9e7", color: "#bf360c" },
    CRITICAL: { bg: "#f3e5f5", color: "#6a1b9a" },
};
const STATUS_OPTIONS = [
    { label: "All Status", value: "" },
    { label: "Open", value: "OPEN" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Pending", value: "Pending" },
    { label: "Hold", value: "HOLD" },
    
];
const PRIORITY_OPTIONS = [
    { label: "All Priority", value: "" },
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
    { label: "Critical", value: "CRITICAL" },
];
const CATEGORIES = [
    { value: "Bug", label: "Bug", icon: "🐛" },
    { value: "New Feature", label: "New Feature", icon: "📈" },
    { value: "Update", label: "Update", icon: "🔄" },
    { value: "Clarification", label: "Clarification", icon: "❓" },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const ImageIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);
const VideoIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="16" height="16" rx="3" /><polygon points="22 8 16 12 22 16 22 8" fill="currentColor" stroke="none" /></svg>);
const CloseIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const EditSvgIcon = () => (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
const MessagePlusIcon = () => (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="10" y1="11" x2="14" y2="11" /></svg>);
const SearchBtnIcon = () => (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const ResetIcon = () => (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.95" /></svg>);
const ChevronIcon = () => (<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>);

// ── Download icon ─────────────────────────────────────────────────────────────
const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

// ── MediaCell ─────────────────────────────────────────────────────────────────
const MediaCell = ({ fileData }) => {
    const [modalUrl, setModalUrl] = useState(null);
    const [mediaKind, setMediaKind] = useState(null);
    const urlRef = useRef(null);
    const handleOpen = () => { const arr = parseByteArray(fileData); const info = detectMime(arr); if (!arr || !info) return; const url = toObjectURL(arr, info.mime); urlRef.current = url; setMediaKind(info.kind); setModalUrl(url); };
    const handleClose = () => { setModalUrl(null); setMediaKind(null); if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; } };
    if (!fileData) return <span style={{ color: '#aaa' }}>—</span>;
    const arr = parseByteArray(fileData); const info = detectMime(arr); const isVideo = info?.kind === "video";
    return (<><button className="tt-media-btn" onClick={handleOpen}>{isVideo ? <VideoIcon /> : <ImageIcon />}<span>{isVideo ? "Video" : "Image"}</span></button>{modalUrl && (<div className="tt-modal-backdrop" onClick={handleClose}><div className="tt-modal-box" onClick={e => e.stopPropagation()}><button className="tt-modal-close" onClick={handleClose}><CloseIcon /></button><div className="tt-modal-label">{isVideo ? <VideoIcon /> : <ImageIcon />}<span>{isVideo ? "Video Attachment" : "Image Attachment"}</span></div>{mediaKind === "image" ? <img src={modalUrl} alt="attachment" className="tt-modal-media" /> : <video src={modalUrl} controls autoPlay className="tt-modal-media" />}</div></div>)}</>);
};

const StatusBadge = ({ status }) => { const s = STATUS_STYLES[status] || { bg: "#f5f5f5", color: "#777", dot: "#aaa" }; return <span className="tt-badge" style={{ background: s.bg, color: s.color }}><span className="tt-badge-dot" style={{ background: s.dot }} />{status?.replace("_", " ")}</span>; };
const PriorityBadge = ({ priority }) => { const p = PRIORITY_STYLES[priority] || { bg: "#f5f5f5", color: "#777" }; return <span className="tt-priority" style={{ background: p.bg, color: p.color }}>{priority}</span>; };



// ── Response Popup ────────────────────────────────────────────────────────────
const ResponsePopup = ({ ticket, onClose, onSubmit, userName, userId }) => {
    const [selectedCat, setSelectedCat] = useState(ticket.issueCategory || null);
    // const [commitDate, setCommitDate] = useState(ticket.commitmentDate || "");
    const [commitDate, setCommitDate] = useState(
        normalizeDate(ticket.commitmentDate)
    );
    const [remarks, setRemarks] = useState(ticket.remarks || "");
    const [completed, setCompleted] = useState(ticket.status === "CLOSED");
   const [Hold, setHold] = useState(ticket.status === "HOLD");
    const [errors, setErrors] = useState({});

    const handleClear = () => { setSelectedCat(ticket.issueCategory || null); setCommitDate(normalizeDate(ticket.commitmentDate)); setRemarks(ticket.remarks || ""); setCompleted(ticket.status === "CLOSED"); setHold(ticket.status === "Hold"); setErrors({}); };
    // const handleSubmit = async () => {
    //     const newErrors = {};
    //     if (!selectedCat) newErrors.cat = "Please select a category";
    //     if (!commitDate) newErrors.date = "Please select a commitment date";
    //     if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    //     const params = new URLSearchParams();
    //     params.append("ticketnumber", ticket.ticketnumber); params.append("issueCategory", selectedCat); params.append("commitmentDate", commitDate); params.append("remarks", remarks.trim()); params.append("devcreatedby", userName); params.append("status",         status); 
    //      onSubmit({ ticketnumber: ticket.ticketnumber, issueCategory: selectedCat,
    //            commitmentDate: commitDate, remarks: remarks.trim(),
    //            devcreatedby: userName, status });
    //     await updateTicketDetailDev(ticket.ticketnumber, params);
    //     onClose();
    // };

    const handleSubmit = async () => {
    const newErrors = {};
    if (!selectedCat) newErrors.cat = "Please select a category";
        if (!Hold && !commitDate) newErrors.date = "Please select a commitment date"; // ← only required if NOT Hold
    // if (!commitDate) newErrors.date = "Please select a commitment date";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const status = completed ? "COMPLETED" : Hold ? "HOLD" : "In Progress";  // ← ADD THIS

    const params = new URLSearchParams();
    params.append("ticketnumber", ticket.ticketnumber);
    params.append("issueCategory", selectedCat);
    params.append("commitmentDate", commitDate);
    params.append("remarks", remarks.trim());
    params.append("devcreatedby", userName);
    params.append("status", status);

    onSubmit({ ticketnumber: ticket.ticketnumber, issueCategory: selectedCat,
               commitmentDate: commitDate, remarks: remarks.trim(),
               devcreatedby: userName, status });

    await updateTicketDetailDev(ticket.ticketnumber, params);
    onClose();
};

    return (
        <div className="rp-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="rp-card">
                <div className="rp-header"><div className="rp-header-left"><div className="rp-icon-wrap">💬</div><div><p className="rp-title">Ticket Response</p><span className="rp-tkt-id"># {ticket.ticketnumber}</span></div></div><button className="rp-close" onClick={onClose}><CloseIcon /></button></div>
                <div className="rp-body">
                    <div className="rp-field"><label className="rp-label rp-required">Issue Category</label><div className={`rp-cat-grid${errors.cat ? " err" : ""}`}>{CATEGORIES.map(cat => (<div key={cat.value} className={`rp-cat-chip${selectedCat === cat.value ? " selected" : ""}`} onClick={() => { setSelectedCat(cat.value); setErrors(e => ({ ...e, cat: null })); }}><span className="rp-cat-icon">{cat.icon}</span>{cat.label}</div>))}</div>{errors.cat && <p className="rp-err-msg">{errors.cat}</p>}</div>
                    <div className="rp-field"><label className="rp-label rp-required">Commitment Date</label><input type="date" className={`rp-input${errors.date ? " err" : ""}`} value={commitDate} onChange={e => { setCommitDate(e.target.value); setErrors(er => ({ ...er, date: null })); }} />{errors.date && <p className="rp-err-msg">{errors.date}</p>}</div>
                    <div className="rp-field" style={{ marginBottom: 0, marginTop: 14 }}><label className="rp-label">Mark as Completed</label><label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", border: `1.5px solid ${completed ? "#3949ab" : "#e0e0e0"}`, borderRadius: 8, background: completed ? "#e8eaff" : "#fafafa", cursor: "pointer", transition: "all 0.16s", userSelect: "none", width: "fit-content" }}><input
    type="checkbox"
    checked={completed}
    onChange={e => {
        setCompleted(e.target.checked);
        if (e.target.checked) setHold(false); // ← uncheck Hold
    }}
    style={{ width: 16, height: 16, accentColor: "#3949ab", cursor: "pointer" }}
/><span style={{ fontSize: 13, fontWeight: completed ? 600 : 400, color: completed ? "#3949ab" : "#424242" }}>{completed ? "✅ Marked as Completed" : "Mark this ticket as completed"}</span></label></div>
                    <div className="rp-field" style={{ marginBottom: 0, marginTop: 14 }}><label className="rp-label">Mark as Hold</label><label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", border: `1.5px solid ${Hold ? "#3949ab" : "#e0e0e0"}`, borderRadius: 8, background: Hold ? "#e8eaff" : "#fafafa", cursor: "pointer", transition: "all 0.16s", userSelect: "none", width: "fit-content" }}><input
    type="checkbox"
    checked={Hold}
    onChange={e => {
        setHold(e.target.checked);
        if (e.target.checked) setCompleted(false); // ← uncheck Completed
    }}
    style={{ width: 16, height: 16, accentColor: "#3949ab", cursor: "pointer" }}
/><span style={{ fontSize: 13, fontWeight: Hold ? 600 : 400, color: Hold ? "#3949ab" : "#424242" }}>{Hold ? "✅ Marked as Hold" : "Mark this ticket as hold"}</span></label></div>

                    <div className="rp-field" style={{ marginBottom: 0 }}><label className="rp-label">Remarks</label><textarea className="rp-textarea" placeholder="Add remarks or additional context…" value={remarks} onChange={e => setRemarks(e.target.value)} rows={4} /></div>
                </div>
                <div className="rp-footer"><button className="rp-btn-clear" onClick={handleClear}>🗑 Clear</button><button className="rp-btn-submit" onClick={handleSubmit}>✈ Submit</button></div>
            </div>
        </div>
    );
};
const normalizeDate = (val) => {
    if (!val) return "";
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    if (Array.isArray(val) && val.length >= 3) {          // Java [YYYY, MM, DD]
        const [y, m, d] = val;
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    try { return new Date(val).toISOString().slice(0, 10); } catch (_) { }
    return "";
};
// ─────────────────────────────────────────────────────────────────────────────
// TicketRaiseTable
// ─────────────────────────────────────────────────────────────────────────────
const TicketRaiseTable = ({
    tableData = [], page = 0, totalPages = 0, totalElements = 0,
    onSearch,       // ({ status, priority }) => void
    onDownload,     // ({ status, priority }) => void  ← new
    onPrev, onNext, onEdit, userName, userId, onRespond,  screenDetails = [] ,
}) => {
    const [popupRow, setPopupRow] = useState(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [downloading, setDownloading] = useState(false);
const [filterScreen, setFilterScreen] = useState("");

    const COLUMNS = [
        { key: "ticketnumber", label: "TKT-NO", width: "120px" },
        { key: "screen", label: "Screen", width: "160px" },
        { key: "priority", label: "Priority", width: "120px" },
        { key: "issueCategory", label: "Issue Category", width: "150px" },
        { key: "status", label: "Status", width: "130px" },
        { key: "escalatedBy", label: "Escalated By", width: "130px" },
        { key: "description", label: "Description", width: "220px" },
        { key: "createdby", label: "Created By", width: "130px" },
        { key: "createddate", label: "Created Date", width: "133px" },
        { key: "commitmentDate", label: "Commitment Date", width: "133px" },
        { key: "closedDate", label: "Closed Date", width: "133px" },
        { key: "file_data", label: "Attachment", width: "90px" },
        { key: "action", label: "Edit", width: "60px" },
        // { key: "response", label: "Response", width: "110px" },
        ...(userId === "876040319"
            ? [{ key: "response", label: "Response", width: "110px" }]
            : [])
    ];


    const handleSearch = () => {
        onSearch && onSearch({ status: filterStatus, screen: filterScreen, priority: filterPriority  });
    };

    const handleReset = () => {
        setFilterStatus("");
        setFilterPriority("");
         setFilterScreen("");
        onSearch && onSearch({ status: "", screen: "", priority: "" });
    };

    // ── Download: pass active filters (or empty = all data) ──────────────────
    const handleDownload = async () => {
        if (!onDownload) return;
        setDownloading(true);
        try {
            await onDownload({ status: filterStatus, priority: filterPriority , screen: filterScreen });
        } finally {
            setDownloading(false);
        }
    };

    const activeCount = [filterStatus, filterPriority,filterScreen].filter(Boolean).length;

    return (
        <>
            <style>{`
                @keyframes tt-fade-in  {from{opacity:0}to{opacity:1}}
                @keyframes tt-scale-in {from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
                @keyframes rp-fade     {from{opacity:0}to{opacity:1}}
                @keyframes rp-slide    {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes dl-spin     {to{transform:rotate(360deg)}}

                .tt-wrapper{background:#fff;border-radius:12px;border:1px solid #e0e0e0;overflow:hidden;font-family:inherit;}

                /* ── Filter bar ── */
                .tt-filter-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:14px 20px;border-bottom:1px solid #eeeeee;background:linear-gradient(135deg,#f0f2ff 0%,#fafbff 100%);}
                .tt-filter-left{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
                .tt-filter-right{display:flex;align-items:center;gap:8px;}
                .tt-filter-label{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;}

                /* ── Divider between search and download ── */
                .tt-filter-divider{width:1px;height:28px;background:#e2e8f0;margin:0 2px;}

                /* ── Select ── */
                .tt-select-wrap{position:relative;display:inline-flex;align-items:center;}
                .tt-select{appearance:none;-webkit-appearance:none;border:1.5px solid #e2e8f0;border-radius:9px;padding:7px 34px 7px 12px;font-size:13px;font-weight:500;color:#374151;background:#fff;cursor:pointer;outline:none;min-width:148px;transition:border-color .15s,box-shadow .15s,background .15s;}
                .tt-select:focus{border-color:#3949ab;box-shadow:0 0 0 3px rgba(57,73,171,.1);}
                .tt-select:hover{border-color:#94a3b8;background:#f8faff;}
                .tt-select--active{border-color:#3949ab;background:#eef0ff;color:#3949ab;font-weight:600;}
                .tt-select-chevron{position:absolute;right:10px;pointer-events:none;color:#94a3b8;display:flex;align-items:center;}

                /* ── Search button ── */
                .tt-filter-search-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border:none;border-radius:9px;background:linear-gradient(135deg,#1a237e,#3949ab);color:#fff;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:opacity .15s,transform .12s,box-shadow .15s;box-shadow:0 3px 10px rgba(57,73,171,.35);}
                .tt-filter-search-btn:hover{opacity:.92;box-shadow:0 5px 14px rgba(57,73,171,.45);transform:translateY(-1px);}
                .tt-filter-search-btn:active{transform:scale(.97);}

                /* ── Download button ── */
                .tt-download-btn{
                    display:inline-flex;align-items:center;gap:6px;
                    padding:8px 16px;border-radius:9px;font-size:13px;font-weight:600;
                    cursor:pointer;white-space:nowrap;
                    border:1.5px solid #16a34a;
                    background:linear-gradient(135deg,#f0fdf4,#dcfce7);
                    color:#15803d;
                    transition:all .16s;
                    box-shadow:0 2px 8px rgba(22,163,74,.15);
                }
                .tt-download-btn:hover:not(:disabled){
                    background:linear-gradient(135deg,#16a34a,#15803d);
                    color:#fff;border-color:#15803d;
                    box-shadow:0 4px 12px rgba(22,163,74,.35);
                    transform:translateY(-1px);
                }
                .tt-download-btn:active{transform:scale(.97);}
                .tt-download-btn:disabled{opacity:.6;cursor:not-allowed;}
                .tt-download-btn--loading svg{animation:dl-spin .8s linear infinite;}

                /* ── Reset button ── */
                .tt-filter-reset-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border:1.5px solid #e2e8f0;border-radius:9px;background:#fff;color:#64748b;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;transition:all .15s;}
                .tt-filter-reset-btn:hover{border-color:#94a3b8;background:#f8faff;color:#374151;}

                .tt-filter-badge{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#e53935;color:#fff;font-size:10px;font-weight:700;margin-left:2px;}

                .tt-info-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-bottom:1px solid #eeeeee;background:#1a237e;}
                .tt-title{font-size:15px;font-weight:600;color:white;}
                .tt-subtitle{font-size:12px;color:white;}

.tt-scroll{overflow-x:auto;overflow-y:auto;max-height:480px;-webkit-overflow-scrolling:touch;}
                .tt-table{width:100%;border-collapse:collapse;min-width:700px;}
                .tt-thead-row th{position:sticky;top:0;z-index:2;}
.tt-th{padding:10px 12px;font-size:11px;font-weight:600;color:#1a237e;text-align:left;white-space:nowrap;background:#fafafa;border-bottom:1px solid #eeeeee;letter-spacing:.05em;text-transform:uppercase;position:sticky;top:0;z-index:3;}
                .tt-td{padding:10px 12px;font-size:13px;color:black;border-bottom:1px solid #f5f5f5;vertical-align:middle;}
                .tt-row:last-child .tt-td{border-bottom:none;}
                .tt-row--alt{background:#fafafa;}
                .tt-row:hover{background:#f5f6ff;}
.tt-td--desc{
    max-width:220px;
    white-space:normal;
    word-break:break-word;
    line-height:1.5;
}
                .tt-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;}
                .tt-badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
                .tt-priority{display:inline-block;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;}

                .tt-media-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #e0e0e0;background:#fafafa;color:#757575;transition:background .15s;}
                .tt-media-btn:hover{background:#f0f2ff;border-color:#b3c0f7;color:#3949ab;}

                .tt-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9998;display:flex;align-items:center;justify-content:center;animation:tt-fade-in .18s ease;}
                .tt-modal-box{background:#fff;border-radius:12px;padding:24px;max-width:90vw;max-height:90vh;position:relative;animation:tt-scale-in .2s ease;}
                .tt-modal-close{position:absolute;top:12px;right:12px;border:none;background:#f5f5f5;border-radius:50%;width:30px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
                .tt-modal-close:hover{background:#eee;}
                .tt-modal-label{display:flex;align-items:center;gap:8px;font-size:13px;color:#757575;margin-bottom:14px;}
                .tt-modal-media{max-width:80vw;max-height:70vh;border-radius:8px;display:block;}

                .tt-edit-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1.5px solid #c5cae9;border-radius:6px;background:#f5f6ff;color:#3949ab;cursor:pointer;transition:background .18s,border-color .18s,transform .15s,color .18s;padding:0;}
                .tt-edit-btn:hover{background:#3949ab;border-color:#3949ab;color:#fff;transform:scale(1.1);box-shadow:0 2px 8px rgba(57,73,171,0.25);}
                .tt-edit-btn:active{transform:scale(0.95);}

                .tt-resp-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #b3c0f7;background:#f0f2ff;color:#3949ab;transition:background .18s,color .18s;white-space:nowrap;}
                .tt-resp-btn:hover{background:#3949ab;color:#fff;border-color:#3949ab;}

                .tt-empty{text-align:center;padding:48px 20px;}
                .tt-empty-inner{display:flex;flex-direction:column;align-items:center;gap:10px;color:#bdbdbd;font-size:13px;}

                .tt-pagination{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-top:1px solid #eeeeee;flex-wrap:wrap;gap:8px;}
                .tt-page-info{font-size:13px;color:#9e9e9e;}
                .tt-page-btns{display:flex;gap:6px;}
                .tt-page-btn{padding:6px 14px;border:1px solid #e0e0e0;border-radius:8px;background:#fafafa;font-size:13px;cursor:pointer;color:#424242;transition:background .15s;}
                .tt-page-btn:not(:disabled):hover{background:#f0f2ff;border-color:#b3c0f7;color:#3949ab;}
                .tt-page-btn:disabled{opacity:.4;cursor:not-allowed;}

                /* ── Response popup ── */
                .rp-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;animation:rp-fade 0.18s ease;}
                .rp-card{background:#fff;border-radius:16px;border:1px solid #e0e0e0;width:100%;max-width:460px;box-shadow:0 8px 40px rgba(0,0,0,.18);animation:rp-slide .22s ease;overflow:hidden;}
                .rp-header{padding:18px 20px 14px;border-bottom:1px solid #eeeeee;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0f2ff 0%,#fafbff 100%);}
                .rp-header-left{display:flex;align-items:center;gap:12px;}
                .rp-icon-wrap{width:42px;height:42px;border-radius:10px;background:#e8eaff;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
                .rp-title{font-size:15px;font-weight:600;color:#1a1a2e;margin:0;}
                .rp-tkt-id{display:inline-block;font-size:11px;font-weight:500;color:#3949ab;background:#e8eaff;padding:2px 9px;border-radius:20px;margin-top:4px;}
                .rp-close{width:28px;height:28px;border-radius:6px;background:#f5f5f5;border:1px solid #e0e0e0;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#757575;flex-shrink:0;}
                .rp-close:hover{background:#eee;}
                .rp-body{padding:20px;}
                .rp-field{margin-bottom:18px;}
                .rp-label{display:block;font-size:11px;font-weight:600;color:#757575;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;}
                .rp-required::after{content:" *";color:#e53935;}
                .rp-cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
                .rp-cat-chip{display:flex;align-items:center;gap:8px;padding:10px 13px;border-radius:8px;border:1.5px solid #e0e0e0;cursor:pointer;font-size:13px;color:#424242;background:#fafafa;transition:all .16s;user-select:none;}
                .rp-cat-chip:hover{border-color:#b3c0f7;background:#f0f2ff;}
                .rp-cat-chip.selected{border-color:#3949ab;background:#e8eaff;color:#3949ab;font-weight:600;}
                .rp-cat-icon{font-size:18px;}
                .rp-input,.rp-textarea{width:100%;border:1.5px solid #e0e0e0;border-radius:8px;padding:9px 13px;font-size:13px;font-family:inherit;background:#fafafa;color:#1a1a2e;outline:none;transition:border-color .15s;box-sizing:border-box;}
                .rp-input:focus,.rp-textarea:focus{border-color:#3949ab;background:#fff;box-shadow:0 0 0 3px rgba(57,73,171,.1);}
                .rp-input.err{border-color:#e53935;}
                .rp-textarea{resize:vertical;min-height:80px;line-height:1.5;}
                .rp-err-msg{font-size:11px;color:#e53935;margin-top:5px;}
                .rp-footer{padding:14px 20px;border-top:1px solid #eeeeee;display:flex;gap:10px;justify-content:flex-end;background:#fafafa;}
                .rp-btn-clear{padding:8px 18px;border:1.5px solid #e0e0e0;border-radius:8px;background:#fff;color:#757575;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .15s;}
                .rp-btn-clear:hover{background:#f5f5f5;border-color:#bdbdbd;}
                .rp-btn-submit{padding:8px 22px;border:none;border-radius:8px;background:#3949ab;color:#fff;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .18s,transform .1s;}
                .rp-btn-submit:hover{background:#303f9f;}
                .rp-btn-submit:active{transform:scale(0.97);}
            `}</style>

            {popupRow && (
                <ResponsePopup ticket={popupRow} onClose={() => setPopupRow(null)}
                    onSubmit={payload => onRespond && onRespond(payload)} userName={userName} />
            )}

            <div className="tt-wrapper">

                {/* ══ FILTER BAR ══ */}
                <div className="tt-filter-bar">
                    <div className="tt-filter-left">
                        <span className="tt-filter-label">Filter by</span>

                        <div className="tt-select-wrap">
                            <select className={`tt-select${filterStatus ? " tt-select--active" : ""}`}
                                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <span className="tt-select-chevron"><ChevronIcon /></span>
                        </div>

                        <div className="tt-select-wrap">
                            <select className={`tt-select${filterPriority ? " tt-select--active" : ""}`}
                                value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <span className="tt-select-chevron"><ChevronIcon /></span>
                        </div>

                        <div className="tt-select-wrap">
    <select
        className={`tt-select${filterScreen ? " tt-select--active" : ""}`}
        value={filterScreen}
        onChange={(e) => setFilterScreen(e.target.value)}
    >
        <option value="">All Screens</option>

        {screenDetails?.map((item, index) => (
    <option key={index} value={item}>
        {item}
    </option>
))}
    </select>

    <span className="tt-select-chevron">
        <ChevronIcon />
    </span>
</div>
                    </div>

                    <div className="tt-filter-right">
                        {activeCount > 0 && (
                            <button className="tt-filter-reset-btn" onClick={handleReset}>
                                <ResetIcon /> Reset
                            </button>
                        )}

                        <button className="tt-filter-search-btn" onClick={handleSearch}>
                            <SearchBtnIcon /> Search
                            {activeCount > 0 && <span className="tt-filter-badge">{activeCount}</span>}
                        </button>

                        {/* ── Divider ── */}
                        <span className="tt-filter-divider" />

                        {/* ── Download button ── */}
                        <button
                            className={`tt-download-btn${downloading ? " tt-download-btn--loading" : ""}`}
                            onClick={handleDownload}
                            disabled={downloading}
                            title={activeCount > 0
                                ? `Download filtered data (${filterStatus || "all"} / ${filterPriority || "all"})`
                                : "Download all tickets"}
                        >
                            <DownloadIcon />
                            {downloading ? "Downloading…" : (activeCount > 0 ? "Download Filtered" : "Download All")}
                        </button>
                    </div>
                </div>

                {/* ══ INFO BAR ══ */}
                <div className="tt-info-bar">
                    <div>
                        <h5 className="tt-title">Ticket Details</h5>
                        <p className="tt-subtitle">
                            {totalElements} Ticket{totalElements !== 1 ? "s" : ""} Total
                            {filterStatus && <> · Status: <strong>{filterStatus.replace("_", " ")}</strong></>}
                            {filterPriority && <> · Priority: <strong>{filterPriority}</strong></>}
                        </p>
                    </div>
                </div>

                {/* ══ TABLE ══ */}
                <div className="tt-scroll">
                    <table className="tt-table">
                        <thead>
                            <tr className="tt-thead-row">
                                {COLUMNS.map(col => (
                                    <th key={col.key} className="tt-th" style={{ width: col.width }}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.length === 0 ? (
                                <tr><td colSpan={COLUMNS.length} className="tt-empty"><div className="tt-empty-inner">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c5cae9" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="3" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                    <span>No tickets found</span>
                                </div></td></tr>
                            ) : tableData.map((row, idx) => (
                                <tr key={row.ticketnumber ?? idx} className={`tt-row ${idx % 2 === 1 ? "tt-row--alt" : ""}`}>
                                    <td className="tt-td" style={{ fontWeight: 500, fontSize: 12 }}>{row.ticketnumber ?? "—"}</td>
                                     <td className="tt-td">{row.screen || "—"}</td>
                                    <td className="tt-td">{row.priority ? <PriorityBadge priority={row.priority} /> : <span style={{ color: "#aaa" }}>—</span>}</td>
                                    <td className="tt-td">{row.issueCategory || "—"}</td>
                                    <td className="tt-td">{row.status ? <StatusBadge status={row.status} /> : <span style={{ color: "#aaa" }}>—</span>}</td>
                                    <td className="tt-td">{row.escalatedBy || "—"}</td>
                                    <td className="tt-td tt-td--desc" title={row.description}>{row.description || "—"}</td>
                                   
                                    <td className="tt-td">{row.createdby || "—"}</td>
                                    <td className="tt-td" style={{ whiteSpace: "nowrap" }}>
                                        {row.createddate
                                            ? Array.isArray(row.createddate)
                                                ? new Date(row.createddate[0], row.createddate[1] - 1, row.createddate[2]).toLocaleDateString()
                                                : new Date(row.createddate).toLocaleDateString()
                                            : "—"}

                                    </td>
                                    <td className="tt-td" style={{ whiteSpace: "nowrap" }}>
                                        {row.commitmentDate
                                            ? Array.isArray(row.commitmentDate)
                                                ? new Date(row.commitmentDate[0], row.commitmentDate[1] - 1, row.commitmentDate[2]).toLocaleDateString()
                                                : new Date(row.commitmentDate).toLocaleDateString()
                                            : "—"}
                                            

                                    </td>
                                    <td className="tt-td" style={{ whiteSpace: "nowrap" }}>

                                    {row.closedDate
                                            ? Array.isArray(row.closedDate)
                                                ? new Date(row.closedDate[0], row.closedDate[1] - 1, row.closedDate[2]).toLocaleDateString()
                                                : new Date(row.closedDate).toLocaleDateString()
                                            : "—"}
                                            </td>
                                    <td className="tt-td"><MediaCell fileData={row.file_data} /></td>
                                    {/* <td className="tt-td" style={{textAlign:"center"}}>
                                        <button className="tt-edit-btn" onClick={()=>onEdit&&onEdit(row)}><EditSvgIcon/></button>
                                    </td> */}
                                    {/* {row.status === "OPEN" ? (
                                        <button
                                            className="tt-edit-btn"
                                            onClick={() => onEdit && onEdit(row)}
                                        >
                                            <EditSvgIcon />
                                        </button>
                                    ) : (
                                        <span>_</span>
                                    )} */}

                                    <td className="tt-td" style={{ textAlign: "center" }}>
                                        {row.status === "OPEN" ? (
                                            <button
                                                className="tt-edit-btn"
                                                onClick={() => onEdit && onEdit(row)}
                                            >
                                                <EditSvgIcon />
                                            </button>
                                        ) : (
                                            <span>—</span>
                                        )}
                                    </td>

                                    {userId === "876040319" && (
                                        <td className="tt-td" style={{ textAlign: "center" }}>
                                            <button className="tt-resp-btn" onClick={() => setPopupRow(row)}>
                                                <MessagePlusIcon /> Respond
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ══ PAGINATION ══ */}
                <div className="tt-pagination">
                    <span className="tt-page-info">Page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong></span>
                    <div className="tt-page-btns">
                        <button className="tt-page-btn" onClick={onPrev} disabled={page === 0}>← Prev</button>
                        <button className="tt-page-btn" onClick={onNext} disabled={page + 1 >= totalPages}>Next →</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TicketRaiseTable;
