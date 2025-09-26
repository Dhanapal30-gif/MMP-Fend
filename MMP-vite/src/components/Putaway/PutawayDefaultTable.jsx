import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";

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
  setpickButton,
  setSuccessMessage,
  setShowSuccessPopup
}) => {

      const columns = generateColumns({
        fields: [
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
    
        ]
        
    
      })   
       
          
           
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