import React, { useMemo } from "react";
import { TextField } from "@mui/material";
import CommonDataTable from "../../components/Com_Component/CommonDataTable";
import { generateColumns } from "../../components/Com_Component/generateColumns";

const allFields = [
  "rec_ticket_no",
  "requestertype",
  "productname",
  "productgroup",
  "productfamily",
  "partcode",
  "partdescription",
  "UOM",
  "componentType",
  "compatabilitypartcode",
  "req_qty",
  "batchCode",
  "location",
  "allocatedQty",
  "ApprovedL1Qty",
  "ApprovedL2Qty",
  "Comment",
  "recordstatus"
];

// 🔹 hide these for Returning-L1
const hideForReturning = [
  "productname",
  "productgroup",
  "productfamily",
  "componentType",
  "compatabilitypartcode",
  "req_qty",
  "batchCode",
  "location",
  "allocatedQty",
  "UOM",
];

const customConfig = {
  rec_ticket_no: { label: "Rec Ticket No" },
  requestertype: { label: "Requester Type" },
  productname: { label: "Product Name" },
  productgroup: { label: "Product Group" },
  productfamily: { label: "Product Family" },
  partcode: { label: "Part Code" },
  partdescription: { label: "Part Description" },
  UOM: { label: "UOM" },
  componentType: { label: "Component Type" },
  compatabilitypartcode: { label: "Compatibility Part Code" },
  req_qty: { label: "Request Qty" },
  batchCode: { label: "Batch Code" },
  location: { label: "Location" },
  allocatedQty: { label: "Allocated Qty" },
  ApprovedL1Qty: { label: "Approved Qty L1" },
  ApprovedL2Qty: { label: "Approved Qty L2" },
  Comment: { label: "Comment", width: "250px" },
  recordstatus: { label: "Status" }
};

const ApproverTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  setSelectedGrnRows,
  selectedGrnRows,
  handleApproverChange,
  formErrors = {}
}) => {
  // 🔑 decide fields dynamically
  const visibleFields = useMemo(() => {
    if (!data || data.length === 0) return allFields;
    const ticketNo = data[0]?.rec_ticket_no ?? "";
     if (ticketNo.startsWith("RTN")) {
    return allFields.filter(f => !hideForReturning.includes(f));
  }

    return allFields;
  }, [data]);

  // normalize batches
  const normalizedData = useMemo(() => {
    return data.map((row) => ({
      ...row,
      batchCode: row.batches?.map((b) => b.batchCode).join(", "),
      location: row.batches?.map((b) => b.location).join(", "),
      allocatedQty: row.batches?.map((b) => b.allocatedQty).join(", ")
    }));
  }, [data]);

  // select all
  const handleGrnSelectAll = (e) => {
    setSelectedGrnRows(e.target.checked ? data.map((row) => row.id) : []);
  };

  // select single
  const handleGrnSelect = (rowId) => {
    setSelectedGrnRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  // generate columns
  const columns = useMemo(() => {
    const qtyField = data.some((r) => r.ApprovedL1Qty !== undefined)
      ? "ApprovedL1Qty"
      : "ApprovedL2Qty";

    return generateColumns({
      fields: visibleFields, // ✅ use dynamic fields
      customConfig,          // ✅ use your config
      selectedRows: selectedGrnRows,
      handleSelect: handleGrnSelect,
      handleSelectAll: handleGrnSelectAll,
      customCellRenderers: {
        [qtyField]: (row) => (
          <TextField
            type="number"
            placeholder="Qty"
            value={row[qtyField] ?? ""}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val > row.TotalAvailableQty) val = row.TotalAvailableQty;
              handleApproverChange(row.selectedId, qtyField, val);
            }}
            error={!!formErrors?.[`${qtyField}${row.selectedId}`]}
            helperText={formErrors?.[`${qtyField}${row.selectedId}`] || ""}
            className="invoice-input"
          />
        ),
        Comment: (row) => (
          <TextField
            placeholder="Enter Comment"
            value={row.Comment || ""}
            onChange={(e) =>
              handleApproverChange(row.selectedId, "Comment", e.target.value)
            }
            className="invoice-input"
          />
        )
      }
    });
  }, [data, selectedGrnRows, formErrors, visibleFields]);

  return (
    <CommonDataTable
      columns={columns}
      data={normalizedData}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      onPageChange={setPage}
      onRowsPerPageChange={setPerPage}
    />
  );
};

export default ApproverTable;
