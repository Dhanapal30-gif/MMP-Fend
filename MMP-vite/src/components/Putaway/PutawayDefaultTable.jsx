import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";
import { FaEdit } from "react-icons/fa";

const PutawayDefaultTable =({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  handleQtyChange,
  formData,
  pickButton,
    onEdit,
  setpickButton,
  setSuccessMessage,
  setShowSuccessPopup
}) => {

     const columns = generateColumns({
  fields: [
    "Putaway_Edit",
    "recevingTicketNo",
    "partcode",
    "partdescription",
    "UOM",
    "location",
    "ponumber",
    "poDate",
    "vendorname",
    "postingdate",
    "recevingQty",
    "GRNQty",
    "putqty",
    "GRNo",
    "GRNQty",
    "Status",
    "createdon"
  ],
  customCellRenderers: {
   Putaway_Edit: (row) => (
      <div style={{ textAlign: "left",marginLeft:"39%", width: "89%" }}>
        <button
          className="edit-button"
          onClick={() => onEdit(row)}
          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <FaEdit />
          
        </button>
      </div>
    ),
  },
});

          
           
  return (
<CommonDataTable
      columns={columns}
      data={data}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      onPageChange={setPage}
      onRowsPerPageChange={setPerPage}
    />  )
}

export default PutawayDefaultTable