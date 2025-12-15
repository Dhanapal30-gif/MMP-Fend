import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { FaEdit } from "react-icons/fa";
import { TextField } from "@mui/material";
const LocalPutawayTicketTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  selectedRows,
  formErrors,
setData,handleQtyChange
}) => {
   
 
  

  const columns = [
        { name: "ReqticketNo", selector: (row) => row.ptlreqticketno, sortable: true, wrap: true },
    { name: "Part Code", selector: (row) => row.partcode, sortable: true, wrap: true },
    { name: "Part Description", selector: (row) => row.partdescription, wrap: true },
    { name: "Rack Location", selector: (row) => row.racklocation, wrap: true },
    // { name: "Putaway Qty", selector: (row) => row.requestQty, wrap: true },
      {
  name: "Putaway Qty",
  cell: (row, rowIndex) => (  // get rowIndex from DataTable
    <TextField
      type="number"
      placeholder="Put Qty"
      value={row.requestQty || ""}
      onChange={(e) => {
        const value = Number(e.target.value);
        const max = Number(row.approved1_qty || 0);
        handleQtyChange(rowIndex, value); // pass rowIndex and value
      }}
      error={Boolean(formErrors?.[`requestQty_${row.id}`])}
      helperText={formErrors?.[`requestQty_${row.id}`] || ""}
      size="small"
      style={{ width: "117px" }}
      className="invoice-input"
    />
  ),
  ignoreRowClick: true,
  allowOverflow: true,
  wrap: true
},

     { name: "Approved Qty", selector: (row) => row.approved1_qty, wrap: true },
          { name: "Approved Qty", selector: (row) => row.approved1_qty, wrap: true },
    { name: "Issuance_date", selector: (row) => row.issuance_date, wrap: true },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#1976d2",
        color: "white",
        fontWeight: "bold",
        fontSize: "14px",
        whiteSpace: "nowrap",
      },
    },
    rows: {
      style: {
        minHeight: "45px",
        fontSize: "13px",
      },
    },
    cells: {
      style: {
        padding: "8px",
        whiteSpace: "normal",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
    table: {
      style: {
        borderRadius: "8px",
        overflow: "hidden",
      },
    },
  };

  return (
    <CommonDataTable
      columns={columns}
      data={data}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      pagination
      paginationServer
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      customStyles={customStyles}
    />
  );
};

export default LocalPutawayTicketTable;


