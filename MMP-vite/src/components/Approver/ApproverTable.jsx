import React, { useMemo } from "react";
import { setRef, TextField } from "@mui/material";
import CommonAddDataTable from "../../components/Com_Component/CommonAddDataTable";
import { generateColumns } from "../../components/Com_Component/generateColumns";

const allFields = [
  "rec_ticket_no",
  "requestertype",
  "ordertype",
  "productname",
  "productgroup",
  "productfamily",
  "partcode",
  "partdescription",
  "UOM",
  "componenttype",
  "compatabilitypartcode",
  "inventory_box_no",
  "req_qty",
  "batchCode",
  "location",
  "TotalAvailableQty",
  "ApprovedL1Qty",
  "ApprovedL2Qty",
  "faultySerialNumber",
  "Comment",
  
  "approved_l1",
  "approved_l1_date",
  "Request Date",
"recordstatus",

];

const hideForReturning = [
  "productname",
  "productgroup",
  "productfamily",
  "componenttype",
  "compatabilitypartcode",
  "req_qty",
  "batchCode",
  "location",
  "TotalAvailableQty",
  "UOM",
  "approved_l1",
  "approved_l1_date",
  "inventory_box_no",
  "createdon",
  "ordertype"

];

const hideForRequester = [
  "approved_l1",
  "approved_l1_date",
  "inventory_box_no",
  
  "ordertype"
]
const hideForStock = [
  "productname",
  "productgroup",
  "productfamily",
  "componenttype",
  "compatabilitypartcode",

  "req_qty",
  "batchCode",
  "location",
  "allocatedQty",

  "faultySerialNumber",
  "Comment",



];
const hideForPTL = [
  "productname",
  "productgroup",
  "productfamily",
  "componenttype",
  "compatabilitypartcode",
  "req_qty",
  "batchCode",
  "location",
  "TotalAvailableQty",
  "UOM",
  // "ApprovedL1Qty",
  "ApprovedL2Qty",
  "faultySerialNumber",
  "Comment",
  "approved_l1",
  "approved_l1_date",
  "inventory_box_no",
  "createdon",
  "ordertype"
];
 
const hideApproverFiled = [
  "ApprovedL2Qty",
]

const customConfig = {
  rec_ticket_no: { label: "Rec Ticket No" },
  requestertype: { label: "Requester Type" },
  productname: { label: "Product Name" },
  productgroup: { label: "Product Group" },
  productfamily: { label: "Product Family" },
  partcode: { label: "Part Code" },
  partdescription: { label: "Part Description" },
  UOM: { label: "UOM" },
  componenttype: { label: "Component Usage" },
  compatabilitypartcode: { label: "Compatibility Part Code" },
  req_qty: { label: "Request Qty" },
  batchCode: { label: "Batch Code" },
  location: { label: "Location" },
  TotalAvailableQty: { label: "Available Qty" },
  ApprovedL1Qty: { label: "Approved Qty L1" },
  ApprovedL2Qty: { label: "Approved Qty L2" },
  Comment: { label: "Comment", width: "250px" },
  recordstatus: { label: "Status" },
//   recordstatus: {
//   label: "Status",
//   format: (value) => {
//     if (value === "MSC00003") return "l2_pending";
//     if (value === "MSC00001") return "l1_pending";
//     return value;
//   },
// },

  faultySerialNumber: { label: "Faulty Serial Number" },
  // ComponentUsage: { label: "Component Usage" },
  // recordstatus: { label: "Status" }
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
  formErrors = {},
  setErrorMessage,
  setShowErrorPopup,
  rejectComment
}) => {
  const visibleFields = useMemo(() => {
    if (!data || data.length === 0) return allFields;
    const ticketNo = data[0]?.rec_ticket_no ?? "";
    if (ticketNo.startsWith("RTN")) {
      return allFields.filter((f) => !hideForReturning.includes(f));
    }
    else if (ticketNo.startsWith("PTL")) {
      return allFields.filter((f) => !hideForPTL.includes(f));
    }
    else if (ticketNo.startsWith("4")) {
      return allFields.filter((f) => !hideForRequester.includes(f));
    }
    else if (ticketNo.startsWith("INV")) {
      return allFields.filter((f) => !hideForStock.includes(f));
    }
    // else if (data.some((row) => row.recordstatus === "L1-Pending")) {
    //   return allFields.filter((f) => !hideApproverFiled.includes(f));
    // }
    return allFields;
  }, [data]);

  const normalizedData = useMemo(() => {
    return data.map((row) => ({
      ...row,
      id: row.selectedId, // <-- add this for the table
      batchCode: row.batches?.map((b) => b.batchCode).join(", "),
      location: row.batches?.map((b) => b.location).join(", "),
      allocatedQty: row.batches?.map((b) => b.allocatedQty).join(", "),
    }));
  }, [data]);

  const handleGrnSelectAll = () => {
    if (selectedGrnRows.length === normalizedData.length) {
      setSelectedGrnRows([]); // unselect all
    } else {
      setSelectedGrnRows(normalizedData.map((row) => row.id)); // select all
    }
  };

  const handleGrnSelect = (rowSelectedId) => {
    setSelectedGrnRows((prev) =>
      prev.includes(rowSelectedId)
        ? prev.filter((id) => id !== rowSelectedId)
        : [...prev, rowSelectedId]
    );
  };


  const columns = useMemo(() => {
    return generateColumns({
      fields: visibleFields,
      customConfig,
      selectedRows: selectedGrnRows,
      handleSelect: handleGrnSelect,
      handleSelectAll: handleGrnSelectAll,
      customCellRenderers: {
        ApprovedL1Qty: (row) => {
          if (row.ApprovedL1Qty !== undefined && row.ApprovedL2Qty === undefined) {
            return (
              <TextField
                type="number"
                value={row.ApprovedL1Qty ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && Number(val) > row.TotalAvailableQty) {
                    setErrorMessage("Entered quantity exceeds Req quantity!")
                    setShowErrorPopup(true)
                    return;
                  }
                  handleApproverChange(row.selectedId, "ApprovedL1Qty", val);
                }}
                className="invoice-input"
              />
            );
          }
          if (row.ApprovedL1Qty !== undefined && row.ApprovedL2Qty !== undefined) {
            return (
              <TextField
                type="number"
                value={row.ApprovedL1Qty ?? ""}
                InputProps={{ readOnly: true }}
                className="invoice-input"
              />
            );
          }
          return null;
        },

        ApprovedL2Qty: (row) => {
          if (row.ApprovedL1Qty !== undefined && row.ApprovedL2Qty !== undefined) {
            return (
              <TextField
                type="number"
                value={row.ApprovedL2Qty ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && Number(val) > row.TotalAvailableQty) {
                    // alert("Entered quantity exceeds available quantity!");
                    setErrorMessage("Entered quantity exceeds available quantity!")
                    setShowErrorPopup(true)
                    return;
                  }
                  handleApproverChange(row.selectedId, "ApprovedL2Qty", val);
                }}
                className="invoice-input"
              />
            );
          }
          return null; // hide if L2 doesn't exist
        },

        Comment: (row) => {
          if (!rejectComment) return null; // don't show comment if rejectComment is false
          return (
            <TextField
              placeholder="Enter Comment"
              value={row.Comment ?? ""}
              onChange={(e) => handleApproverChange(row.selectedId, "Comment", e.target.value)}
              className="invoice-input"
            />
          );
        },

      },
    });
  }, [data, selectedGrnRows, formErrors, visibleFields]);

  return (
    <CommonAddDataTable
      columns={columns}
      data={normalizedData}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
    />
  );
};

export default ApproverTable;
