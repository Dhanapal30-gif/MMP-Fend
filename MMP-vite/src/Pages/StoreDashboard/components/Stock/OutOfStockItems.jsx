import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";

const ITEMS_PER_PAGE = 5;

const OutOfStockItems = ({ items = [] }) => {

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ================================
  // SEARCH
  // ================================
  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return items;
    }

    return items.filter((item) =>
      String(item.partCode || "")
        .toLowerCase()
        .includes(value)
    );
  }, [items, search]);

  // ================================
  // PAGINATION
  // ================================
  const totalPages = Math.ceil(
    filteredItems.length / ITEMS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ================================
  // SEARCH CHANGE
  // ================================
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // ================================
  // EXPORT EXCEL
  // ================================
  const handleExport = () => {

    const exportData = filteredItems.map((item) => ({
      "Part Code": item.partCode || "-",
      "Description": item.description || "-",
      "Available Qty": 0,
      // "UOM": item.uom || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Out Of Stock Items"
    );

    XLSX.writeFile(
      workbook,
      "Out_Of_Stock_Items.xlsx"
    );
  };

  return (
    <div className="dashboard-panel stock-table-panel">

      <div className="stock-table-card">

        {/* ================================
            HEADER
        ================================= */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            gap: "10px",
          }}
        >

          <h3 className="section-title">
            Out of Stock Items
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >

            {/* SEARCH */}
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search Part Code..."
              style={{
                height: "34px",
                padding: "0 10px",
                border: "1px solid #d1d5db",
                borderRadius: "5px",
                outline: "none",
                fontSize: "13px",
                width: "180px",
              }}
            />

            {/* EXPORT */}
            <button
              type="button"
              onClick={handleExport}
              disabled={filteredItems.length === 0}
              style={{
                height: "34px",
                padding: "0 14px",
                border: "none",
                borderRadius: "5px",
                cursor:
                  filteredItems.length === 0
                    ? "not-allowed"
                    : "pointer",
                background:
                  filteredItems.length === 0
                    ? "#d1d5db"
                    : "#198754",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Export
            </button>

          </div>

        </div>

        {/* ================================
            TABLE
        ================================= */}
        <table className="stock-table">

          <thead>
            <tr>
              <th>Part Code</th>
              <th>Description</th>
              <th>Available Qty</th>
              {/* <th>UOM</th> */}
            </tr>
          </thead>

          <tbody>

            {paginatedItems.map((item) => (
              <tr key={item.partCode}>

                <td>
                  {item.partCode}
                </td>

                <td>
                  {item.description}
                </td>

                <td className="zero-stock">
                  0
                </td>
{/* 
                <td>
                  {item.uom}
                </td> */}

              </tr>
            ))}

            {paginatedItems.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="empty-table"
                >
                  {search
                    ? "No matching part code found"
                    : "No out of stock items"}
                </td>
              </tr>
            )}

          </tbody>

        </table>

        {/* ================================
            PAGINATION
        ================================= */}
        {filteredItems.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              fontSize: "13px",
            }}
          >

            <span>
              Showing{" "}
              {startIndex + 1}
              {" - "}
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                filteredItems.length
              )}
              {" of "}
              {filteredItems.length}
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={currentPage === 1}
                style={{
                  padding: "5px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  background:
                    currentPage === 1
                      ? "#f3f4f6"
                      : "#ffffff",
                  cursor:
                    currentPage === 1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Previous
              </button>

              <span
                style={{
                  padding: "5px 10px",
                  fontWeight: "600",
                }}
              >
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                  )
                }
                disabled={
                  currentPage === totalPages
                }
                style={{
                  padding: "5px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  background:
                    currentPage === totalPages
                      ? "#f3f4f6"
                      : "#ffffff",
                  cursor:
                    currentPage === totalPages
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Next
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default OutOfStockItems;