
import React from "react";
import { TextField } from "@mui/material";
import { generateColumns } from "../../components/Com_Component/generateColumns";
import CommonAddDataTable from "../../components/Com_Component/CommonAddDataTable";

const GRNTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  handleGRNCommentChange,
  selectedRows,
  selectedGrnRows,
  setSelectedGrnRows,
  setSelectedRows,
  onEdit,
  handleGRNQtyChange,
  formErrors,
  setFormErrors
}) => {

  // Function to handle select all rows
  const handleGrnSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedGrnRows(data.map((row) => row.id));
    }
    else {
      setSelectedGrnRows([])
    }
  };

  const handleGrnSelect = (rowkey) => {
    setSelectedGrnRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowkey);
      const updatedRows = isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowkey)
        : [...prevSelectedRows, rowkey];
      return updatedRows;
    });
  };

  const columns = generateColumns({
    fields: [
      "recevingTicketNo", "ponumber", "vendorname", "postingdate",
      "partcode", "partdescription", "UOM", "TYC", "invoiceNo",
      "invoiceDate", "receivingDate", "recevingQty", "orderqty",
      "unitprice", "GRNQty", "GRComments"
    ],
    onEdit,
    showEdit: false,
    selectedRows: selectedGrnRows,
    handleSelect: handleGrnSelect,
    handleSelectAll: handleGrnSelectAll,
    data,
    customConfig: {
      recevingTicketNo: { label: "Ticket No", width: "140px" },
      ponumber: { label: "PO Number", width: "140px" },
      vendorname: { label: "Vendorname", width: "140px" },
      postingdate: { label: "PostingDate", width: "140px" },
      partcode: { label: "Partcode", width: "140px" },
      partdescription: { label: "Partdescription", width: "140px" },
      invoiceNo: { label: "InvoiceNo", width: "140px" },
      invoiceDate: { label: "InvoiceDate", width: "140px" },
      receivingDate: { label: "ReceivingDate", width: "140px" },
      orderqty: { label: "OrderQty", width: "140px" },
      recevingQty: { label: "RecevingQty", width: "140px" },
      unitprice: { label: "Unitprice", width: "140px" },
      GRComments: { label: "Comment", width: "270px", height: "70px" }
    },
    customCellRenderers: {
      GRNQty: (row) => (

        // <TextField
        //   type="number"
        //   placeholder="GRN Qty"
        //   value={row.GRNQty || ""}
        //   onChange={(e) => handleGRNQtyChange(row.selectedid, "GRNQty", e.target.value)}
        //   error={!!formErrors?.[`GRNQty_${row.selectedid}`]}
        //   helperText={formErrors?.[`GRNQty_${row.selectedid}`] || ""}
        //   className="invoice-input"
        // />
        <TextField
          type="number"
          placeholder="GRN Qty"
          value={row.GRNQty || ""}
          onKeyDown={(e) => {
            if (e.key === "-") e.preventDefault(); // block minus
          }}
          onChange={(e) => {
            const value = Number(e.target.value);
            const max = Number(row.recevingQty || 0);
            if (/^\d*\.?\d*$/.test(value) || value === "") {
              if (value <= max) {
                handleGRNQtyChange(row.selectedid, "GRNQty", value);
                // Clear any previous error
                setFormErrors(prev => ({ ...prev, [`GRNQty_${row.selectedid}`]: "" }));
              } else {
                // Show error if exceeds
                setFormErrors(prev => ({ ...prev, [`GRNQty_${row.selectedid}`]: `Cannot exceed ${max}` }));
              }
            }
          }}
          error={!!formErrors?.[`GRNQty_${row.selectedid}`]}
          helperText={formErrors?.[`GRNQty_${row.selectedid}`] || ""}
          className="invoice-input"
        />

      ),
      GRComments: (row) => (
        <TextField
          placeholder="Enter Comment"
          value={row.GRComments || ""}
          onChange={(e) => handleGRNCommentChange(row.selectedid, "GRComments", e.target.value)}

          className="invoice-input"
        />
      ),
    }
  });

  return (
    <CommonAddDataTable
      columns={columns}
      data={data}
      loading={loading}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
    />

  );
};

export default GRNTable;
