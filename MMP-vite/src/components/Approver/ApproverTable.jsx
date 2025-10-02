import React, { useMemo, useState } from "react";
import { TextField } from "@mui/material";
import CommonDataTable from "../../components/Com_Component/CommonDataTable";
import { generateColumns } from "../../components/Com_Component/generateColumns";

const fields = [
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
   "ApprovedL1Qty",  // fixed
  "ApprovedL2Qty",  // fixed
  "Comment",
  "recordstatus"
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
  handleApproverChange, // handler for qty/comment
  formErrors = {}
}) => {
  // Normalize batches
  const normalizedData = useMemo(() => {
  return data.map((row) => ({
    ...row,
    batchCode: row.batches?.map((b) => b.batchCode).join(", "),
    location: row.batches?.map((b) => b.location).join(", "),
    allocatedQty: row.batches?.map((b) => b.allocatedQty).join(", ")
  }));
}, [data]);


  // Select all rows
  const handleGrnSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedGrnRows(data.map((row) => row.id)); // use unique key
    } else {
      setSelectedGrnRows([]);
    }
  };

  // Select one row
  const handleGrnSelect = (rowId) => {
    setSelectedGrnRows((prevSelectedRows) => {
      const isSelected = prevSelectedRows.includes(rowId);
      return isSelected
        ? prevSelectedRows.filter((id) => id !== rowId)
        : [...prevSelectedRows, rowId];
    });
  };const columns = useMemo(() => {
  const qtyField = data.some(row => row.ApprovedL1Qty !== undefined)
    ? "ApprovedL1Qty"
    : "ApprovedL2Qty";

  return generateColumns({
    fields,
    customConfig,
    selectedRows: selectedGrnRows,
    handleSelect: handleGrnSelect,
    handleSelectAll: handleGrnSelectAll,
    customCellRenderers: {
      [qtyField]: (row) => {
        const totalAvailable = row.TotalAvailableQty ?? 0;

        return (
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
        );
      },
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
}, [data, selectedGrnRows, formErrors]);

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
