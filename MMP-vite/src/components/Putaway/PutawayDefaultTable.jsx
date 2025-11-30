import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";

const PutawayDefaultTable = ({
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
  setShowSuccessPopup,
  onDelete
}) => {

  const columns = generateColumns({
    fields: [
      "Putaway_Delete",
      "recevingTicketNo",
      "partcode",
      "partdescription",
      "UOM",
      "location",
      "ponumber",
      "poDate",
      "vendorname",
      "postingdate",
      "GRDate",
      "recevingQty",
      "grnqty",
      "putqty",
      "grno",
      "status",
    ],
    customConfig: {
      recevingTicketNo: { label: "Receving TicketNo" },
      location: { label: "Location", },
      partcode: { label: "PartCode" },
      partdescription: { label: "Part Description" },
      ponumber: { label: "PO Number" },
      poDate: { label: "PO Date" },
      vendorname: { label: "Vendor Name" },
      postingdate: { label: "Postin Date" },
      recevingQty: { label: "Receving Qty" },
      grnqty: { label: "GRN Qty" },
      putqty: { label: "PUT Qty" },
      grno: { label: "GRN No" },
      status: { label: "Status" },
      createdon: { label: "Create Don" },
    },
    customCellRenderers: {
      // Putaway_Edit: (row) => (
      //   <div style={{ textAlign: "left", marginLeft: "39%", width: "89%" }}>
      //     <button
      //       className="edit-button"
      //       onClick={() => onEdit(row)}
      //       style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
      //     >
      //       <FaEdit />

      //     </button>
      //   </div>
      // ),
      Putaway_Delete: (row) => (
  <div style={{ textAlign: "left", marginLeft: "39%", width: "89%" }}>
    <button
      className="delete-button"
            onClick={() => onDelete(row.recevingTicketNo)} // send ticketNo
      style={{
        display: "inline-flex",
        alignItems: "center",
        // gap: "4px",
        background: "#e31216ff",  // red for delete
        color: "#fff",
        border: "none",
        padding: "5px 7px",
        borderRadius: "7px",
        cursor: "pointer",
        transition: "0.3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#50e748ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#e31216ff")}
    >
      <FaTrash />
    </button>
  </div>
),
    },
  });


  const handlePageChange = (page) => {
    setPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setPage(page);
  };
  return (
    <CommonDataTable
      columns={columns}
      data={data}
      loading={loading}
      pagination
      paginationServer
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
    //   loading={loading}
    //    onChangePage={setPage}
    //             onChangeRowsPerPage={setPerPage}
    //    onPageChange={handlePageChange} // ✅ Correct prop
    // onRowsPerPageChange={handlePerRowsChange}
    />



  )
}

export default PutawayDefaultTable