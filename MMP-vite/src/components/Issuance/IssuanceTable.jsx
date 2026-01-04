import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";


const fields = [
  "recTicketNo",
  "requestertype",
  "requestfor",
  "ordertype",
  "productname",
 
  "partcode",
  "partdescription",
  "reqQty",
  "approvedL2",
  "approved2Qty",
  "fsn",
  "fmsn",
  "issuedQty",
  "status",
  "newSerialNumber"
];

const customConfig = {
  recTicketNo: { label: "Request TicketNo" },
  requestertype: { label: "RequesterType" },
  requestfor: { label: "Request For" },
  ordertype: { label: "Order Type" },
  productname: { label: "Product Name" },
  // productGroup: { label: "Product Group" },
  // productFamily: { label: "Product Family" },
  partcode: { label: "PartCode" },
  partdescription: { label: "PartDescription" },
  reqQty: { label: "Request Qty" },
  approvedL2:{lable: "Approved_l2"},
  approved2Qty: { label: "Approved2Qty" },
  fsn: { label: "Faulty SerialNo" },
  fmsn: { label: "Faulty UnitModule SerialNo" },
  issuedQty:{label:"issueQty"},
    status: { label: "Status"}   ,
    newSerialNumber: { label: "New Serial Number"}

};


const IssuanceTable = ({
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

  //  const columns = generateColumns({
  //         fields: [
  //           "requestTicketNo",
  //           "requesterType",
  //           "requestFor",
  //           "orderType",
  //           "productName",
  //           "productGroup",
  //           "productFamily",
  //           "partCode",
  //           "partDescription",
  //           "UOM",
  //           "typeOfComponents",
  //           "componanetUsage",
  //           "compatibilityPartcode",
  //           "requestQty",
  //           "approved1Qty",
  //           "approved2Qty",
  //           "faultySerialNo",
  //           "faultyUnitModuleSerialNo"

  //         ]


  //       })   
  // Generate columns and prepend Cancel column manually
  const columns = React.useMemo(() => {
    return generateColumns({ fields, customConfig });
  }, [fields, customConfig]);

  // Flatten {label, value} objects
  const normalizedData = React.useMemo(() => {
    return data.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        if (typeof newRow[key] === "object" && newRow[key] !== null) {
          newRow[key] = newRow[key].label ?? JSON.stringify(newRow[key]);
        }
      });
      return newRow;
    });
  }, [data]);


  return (
    <CommonDataTable
      columns={columns}
      data={data}
      page={page}
      pagination
      paginationServer
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      // onPageChange={setPage}
      onPageChange={(p) => setPage(p - 1)}   // <-- subtract 1

      onPerPageChange={setPerPage}

    />)
}

export default IssuanceTable