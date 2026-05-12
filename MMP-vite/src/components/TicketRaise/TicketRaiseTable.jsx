import React, { useState, useRef } from 'react';

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
    if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF)
        return { mime: "image/jpeg", kind: "image" };
    if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47)
        return { mime: "image/png", kind: "image" };
    if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38)
        return { mime: "image/gif", kind: "image" };
    if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46
        && arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50)
        return { mime: "image/webp", kind: "image" };
    if (arr[4] === 102 && arr[5] === 116 && arr[6] === 121 && arr[7] === 112)
        return { mime: "video/mp4", kind: "video" };
    if (arr[0] === 0x1A && arr[1] === 0x45 && arr[2] === 0xDF && arr[3] === 0xA3)
        return { mime: "video/webm", kind: "video" };
    return null;
};

const toObjectURL = (arr, mime) => {
    const blob = new Blob([arr], { type: mime });
    return URL.createObjectURL(blob);
};

// ── Badge config ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
    OPEN:        { bg: "#e8f5e9", color: "#2e7d32", dot: "#43a047" },
    IN_PROGRESS: { bg: "#fff8e1", color: "#f57f17", dot: "#ffc107" },
    CLOSED:      { bg: "#fce4ec", color: "#b71c1c", dot: "#e53935" },
};

const PRIORITY_STYLES = {
    LOW:      { bg: "#e3f2fd", color: "#1565c0" },
    MEDIUM:   { bg: "#fff3e0", color: "#e65100" },
    HIGH:     { bg: "#fbe9e7", color: "#bf360c" },
    CRITICAL: { bg: "#f3e5f5", color: "#6a1b9a" },
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const ImageIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const VideoIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="16" rx="3" />
        <polygon points="22 8 16 12 22 16 22 8" fill="currentColor" stroke="none" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// ── Edit (pencil) Icon ────────────────────────────────────────────────────────
const EditSvgIcon = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

// ── MediaCell ─────────────────────────────────────────────────────────────────
const MediaCell = ({ fileData }) => {
    const [modalUrl,  setModalUrl]  = useState(null);
    const [mediaKind, setMediaKind] = useState(null);
    const urlRef = useRef(null);

    const handleOpen = () => {
        const arr  = parseByteArray(fileData);
        const info = detectMime(arr);
        if (!arr || !info) return;
        const url = toObjectURL(arr, info.mime);
        urlRef.current = url;
        setMediaKind(info.kind);
        setModalUrl(url);
    };

    const handleClose = () => {
        setModalUrl(null);
        setMediaKind(null);
        if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    };

    if (!fileData) return <span className="tt-cell-empty">—</span>;

    const arr     = parseByteArray(fileData);
    const info    = detectMime(arr);
    const isVideo = info?.kind === "video";

    return (
        <>
            <button
                className={`tt-media-btn ${isVideo ? "tt-media-btn--video" : "tt-media-btn--image"}`}
                onClick={handleOpen}
                title={isVideo ? "Play video" : "View image"}
            >
                {isVideo ? <VideoIcon /> : <ImageIcon />}
                <span>{isVideo ? "Video" : "Image"}</span>
            </button>

            {modalUrl && (
                <div className="tt-modal-backdrop" onClick={handleClose}>
                    <div className="tt-modal-box" onClick={e => e.stopPropagation()}>
                        <button className="tt-modal-close" onClick={handleClose}>
                            <CloseIcon />
                        </button>
                        <div className="tt-modal-label">
                            {isVideo ? <VideoIcon /> : <ImageIcon />}
                            <span>{isVideo ? "Video Attachment" : "Image Attachment"}</span>
                        </div>
                        {mediaKind === "image"
                            ? <img  src={modalUrl} alt="attachment" className="tt-modal-media" />
                            : <video src={modalUrl} controls autoPlay className="tt-modal-media" />
                        }
                    </div>
                </div>
            )}
        </>
    );
};

// ── Badges ────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const s = STATUS_STYLES[status] || { bg: "#f5f5f5", color: "#777", dot: "#aaa" };
    return (
        <span className="tt-badge" style={{ background: s.bg, color: s.color }}>
            <span className="tt-badge-dot" style={{ background: s.dot }} />
            {status?.replace("_", " ")}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const p = PRIORITY_STYLES[priority] || { bg: "#f5f5f5", color: "#777" };
    return (
        <span className="tt-priority" style={{ background: p.bg, color: p.color }}>
            {priority}
        </span>
    );
};

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS = [
    { key: "ticketId",    label: "#",            width: "5%"  },
    { key: "priority",    label: "Priority",     width: "9%"  },
    { key: "status",      label: "Status",       width: "11%" },
    { key: "escalatedBy", label: "Escalated By", width: "13%" },
    { key: "description", label: "Description",  width: "25%" },
    { key: "createdby",   label: "Created By",   width: "12%" },
    { key: "createddate", label: "Date",         width: "10%" },
    { key: "file_data",   label: "Attachment",   width: "9%"  },
    { key: "action",      label: "Action",       width: "6%"  },  // ← new column
];

// ── TicketsTable (exported) ───────────────────────────────────────────────────
const TicketTable = ({
    tableData     = [],
    page          = 0,
    totalPages    = 0,
    totalElements = 0,
    searchText    = "",
    setSearchText,
    onSearch,
    onPrev,
    onNext,
    onEdit,        // ← new prop received from TicketRaise.jsx
}) => {
    return (
        <>
            {/* Keyframes + edit button styles */}
            <style>{`
                @keyframes tt-fade-in  { from{opacity:0}         to{opacity:1} }
                @keyframes tt-scale-in { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }

                .tt-edit-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: 1.5px solid #c5cae9;
                    border-radius: 6px;
                    background: #f5f6ff;
                    color: #3949ab;
                    cursor: pointer;
                    transition: background 0.18s, border-color 0.18s, transform 0.15s, color 0.18s;
                    padding: 0;
                }
                .tt-edit-btn:hover {
                    background: #3949ab;
                    border-color: #3949ab;
                    color: #fff;
                    transform: scale(1.1);
                    box-shadow: 0 2px 8px rgba(57,73,171,0.25);
                }
                .tt-edit-btn:active { transform: scale(0.95); }
            `}</style>

            <div className="tt-wrapper">

                {/* ── Header bar ── */}
                <div className="tt-header">
                    <div className="tt-header-info">
                        <h5 className="tt-title">Ticket Board</h5>
                        <p className="tt-subtitle">{totalElements} ticket{totalElements !== 1 ? "s" : ""} total</p>
                    </div>

                    <div className="tt-search-row">
                        <div className="tt-search-wrap">
                            <span className="tt-search-icon"><SearchIcon /></span>
                            <input
                                className="tt-search-input"
                                type="text"
                                placeholder="Search tickets…"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && onSearch()}
                            />
                            {searchText && (
                                <span className="tt-search-clear"
                                    onClick={() => { setSearchText(""); onSearch(""); }}>
                                    ×
                                </span>
                            )}
                        </div>
                        <button className="tt-search-btn" onClick={onSearch}>Search</button>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="tt-scroll">
                    <table className="tt-table">
                        <thead>
                            <tr className="tt-thead-row">
                                {COLUMNS.map(col => (
                                    <th key={col.key} className="tt-th" style={{ width: col.width }}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {tableData.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS.length} className="tt-empty">
                                        <div className="tt-empty-inner">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                                stroke="#c5cae9" strokeWidth="1.5">
                                                <rect x="2" y="3" width="20" height="14" rx="3" />
                                                <line x1="8" y1="21" x2="16" y2="21" />
                                                <line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                            <span>No tickets found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : tableData.map((row, idx) => (
                                <tr key={row.ticketId ?? idx}
                                    className={`tt-row ${idx % 2 === 1 ? "tt-row--alt" : ""}`}>

                                    {/* # */}
                                    <td className="tt-td tt-td--id">#{row.ticketId ?? "—"}</td>

                                    {/* Priority */}
                                    <td className="tt-td">
                                        {row.priority
                                            ? <PriorityBadge priority={row.priority} />
                                            : <span className="tt-cell-empty">—</span>}
                                    </td>

                                    {/* Status */}
                                    <td className="tt-td">
                                        {row.status
                                            ? <StatusBadge status={row.status} />
                                            : <span className="tt-cell-empty">—</span>}
                                    </td>

                                    {/* Escalated By */}
                                    <td className="tt-td tt-td--name">{row.escalatedBy || "—"}</td>

                                    {/* Description */}
                                    <td className="tt-td tt-td--desc" title={row.description}>
                                        {row.description || "—"}
                                    </td>

                                    {/* Created By */}
                                    <td className="tt-td tt-td--name">{row.createdby || "—"}</td>

                                    {/* Date */}
                                    <td className="tt-td tt-td--date">
                                        {row.createddate
                                            ? new Date(row.createddate).toLocaleDateString()
                                            : "—"}
                                    </td>

                                    {/* Attachment */}
                                    <td className="tt-td">
                                        <MediaCell fileData={row.file_data} />
                                    </td>

                                    {/* ── Action: Edit icon ── */}
                                    <td className="tt-td" style={{ textAlign: "center" }}>
                                        <button
                                            className="tt-edit-btn"
                                            title={`Edit ticket #${row.ticketId}`}
                                            onClick={() => onEdit && onEdit(row)}
                                        >
                                            <EditSvgIcon />
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                <div className="tt-pagination">
                    <span className="tt-page-info">
                        Page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong>
                    </span>
                    <div className="tt-page-btns">
                        <button
                            className="tt-page-btn"
                            onClick={onPrev}
                            disabled={page === 0}
                        >
                            ← Prev
                        </button>
                        <button
                            className={`tt-page-btn tt-page-btn--next`}
                            onClick={onNext}
                            disabled={page + 1 >= totalPages}
                        >
                            Next →
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
};

export default TicketTable;
