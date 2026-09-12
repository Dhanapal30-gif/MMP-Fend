import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";

const STATUS_STYLES = {
  "Approver 1 Pending": { bg: "#fdf1d9", color: "#c9820b" },
  "Approver 2 Pending": { bg: "#fdf1d9", color: "#c9820b" },
  Issuance: { bg: "#e1f6e6", color: "#1f9d4a" },
  "Delivery Pending": { bg: "#fdf1d9", color: "#c9820b" },
  "Issuance Pending": { bg: "#fdf1d9", color: "#c9820b" },
};

const StatusPill = ({ status }) => {
  const style =
    STATUS_STYLES[status] || {
      bg: "#fdf1d9",
      color: "#c9820b",
    };

  return (
    <span
      className="rr-status-pill"
      style={{
        background: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
};

const formatCreatedOn = (createdOn) => {
  if (!Array.isArray(createdOn) || createdOn.length < 3) {
    return "-";
  }

  const [year, month, day, hour = 0, minute = 0] = createdOn;

  const date = new Date(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SelectedRequestDetails = ({ requests = [] }) => {
  const [ticketFilter, setTicketFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  // FILTER
  // FILTER ALL COLUMNS
const filteredData = useMemo(() => {
  const searchValue = ticketFilter.trim().toLowerCase();

  if (!searchValue) {
    return requests;
  }

  return requests.filter((row) => {
    const requestNo = String(row.recTicketNo || "").toLowerCase();
    const requestedBy = String(row.createdBy || "").toLowerCase();
    const status = String(row.statusLabel || "").toLowerCase();
    const date = formatCreatedOn(row.createdOn).toLowerCase();

    return (
      requestNo.includes(searchValue) ||
      requestedBy.includes(searchValue) ||
      status.includes(searchValue) ||
      date.includes(searchValue)
    );
  });
}, [requests, ticketFilter]);

  // PAGINATION
  const totalPages = Math.ceil(
    filteredData.length / ITEMS_PER_PAGE
  );

  const paginatedData = useMemo(() => {
    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredData.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredData, currentPage]);

  // SEARCH
  const handleTicketFilter = (value) => {
    setTicketFilter(value);
    setCurrentPage(1);
  };

  // ==============================
  // EXPORT EXCEL
  // ==============================
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert("No request details available to export.");
      return;
    }

    const excelData = filteredData.map((row) => ({
      "Request No.": row.recTicketNo || "-",
      "Requested By": row.createdBy || "-",
      Status: row.statusLabel || "-",
      Date: formatCreatedOn(row.createdOn),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 22 },
      { wch: 25 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Recent Requests"
    );

    XLSX.writeFile(
      workbook,
      "Recent_Request_Details.xlsx"
    );
  };

  return (
    <div className="request-details-card recent-requests-card">

      {/* HEADER */}
      <div className="rr-header">

        <h3 className="request-details-title">
          Recent Requests
        </h3>

        <div className="rr-header-actions">

          {/* SEARCH */}
          {/* SEARCH ALL COLUMNS */}
<div className="rr-ticket-filter">

  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="11"
      cy="11"
      r="7"
      stroke="#708199"
      strokeWidth="1.8"
    />

    <path
      d="M21 21L16.65 16.65"
      stroke="#708199"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>

  <input
    type="text"
    placeholder="Search..."
    value={ticketFilter}
    onChange={(e) =>
      handleTicketFilter(e.target.value)
    }
  />

</div>

          {/* EXCEL EXPORT */}
          <button
            type="button"
            className="rr-export-btn"
            onClick={handleExportExcel}
            title="Export Excel"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 4H14V20H4V4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              <path
                d="M14 8H20V20H14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              <path
                d="M7 8L11 12L7 16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M11 8L7 12L11 16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>Export</span>
          </button>

        </div>
      </div>

      {/* TABLE */}
      <table className="rr-table">

        <thead>
          <tr>
            <th>Request No.</th>
            <th>Requested By</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>

          {paginatedData.length === 0 ? (

            <tr>
              <td
                colSpan={4}
                className="rr-empty"
              >
                {ticketFilter
                  ? `No requests match "${ticketFilter}"`
                  : "No pending requests"}
              </td>
            </tr>

          ) : (

            paginatedData.map((row, index) => (

              <tr
                key={`${row.recTicketNo}-${index}`}
              >

                <td className="rr-request-no">
                  {row.recTicketNo}
                </td>

                <td>
                  {row.createdBy}
                </td>

                <td>
                  <StatusPill
                    status={row.statusLabel}
                  />
                </td>

                <td>
                  {formatCreatedOn(row.createdOn)}
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (

        <div className="rr-pagination">

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                (page) => page - 1
              )
            }
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) => page + 1
              )
            }
          >
            Next
          </button>

        </div>

      )}

      {/* CSS */}
      <style>{`

        .recent-requests-card {
          display: flex;
          flex-direction: column;
        }

        .rr-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .rr-header .request-details-title {
          margin: 0;
        }

        .rr-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rr-ticket-filter {
          height: 32px;
          min-width: 150px;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #d5dfeb;
          border-radius: 7px;
          padding: 0 10px;
          background: #ffffff;
        }

        .rr-ticket-filter input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 12px;
          color: #344964;
          width: 100%;
        }

        .rr-ticket-filter input::placeholder {
          color: #9aa6b8;
        }

        .rr-export-btn {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 11px;
          border: 1px solid #d5dfeb;
          border-radius: 7px;
          background: #ffffff;
          color: #217346;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .rr-export-btn:hover {
          background: #f1f8f3;
          border-color: #b8d8c1;
        }

        .rr-empty {
          text-align: center;
          color: #8a96a8;
          font-size: 12px;
          padding: 18px 8px !important;
        }

        .rr-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-top: 4px;
        }

        .rr-table thead th {
          text-align: left;
          padding: 10px 8px;
          font-size: 12px;
          font-weight: 700;
          color: #38455c;
          border-bottom: 1px solid #edf1f6;
        }

        .rr-table tbody td {
          padding: 12px 8px;
          color: #344964;
          border-bottom: 1px solid #f2f5f9;
          white-space: nowrap;
        }

        .rr-table tbody tr:last-child td {
          border-bottom: none;
        }

        .rr-request-no {
          color: #1d3150;
          font-weight: 500;
        }

        .rr-status-pill {
          display: inline-block;
          padding: 3px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }

        .rr-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #edf1f6;
        }

        .rr-pagination button {
          border: 1px solid #d5dfeb;
          background: #ffffff;
          color: #344964;
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 11px;
          cursor: pointer;
        }

        .rr-pagination button:hover:not(:disabled) {
          background: #f5f8fc;
        }

        .rr-pagination button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .rr-pagination span {
          font-size: 11px;
          color: #708199;
          min-width: 80px;
          text-align: center;
        }

        @media (max-width: 600px) {

          .rr-header {
            align-items: stretch;
          }

          .rr-header-actions {
            width: 100%;
          }

          .rr-ticket-filter {
            flex: 1;
          }

          .rr-export-btn span {
            display: none;
          }

          .rr-table {
            font-size: 12px;
          }

          .rr-table thead th,
          .rr-table tbody td {
            padding: 8px 6px;
          }

        }

      `}</style>

    </div>
  );
};

export default SelectedRequestDetails;