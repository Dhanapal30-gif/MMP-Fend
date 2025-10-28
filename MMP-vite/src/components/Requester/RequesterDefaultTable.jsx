import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";


const fields = [
    "requestTicketNo",
    "requesterType",
    "requestFor",
    "orderType",
    "productName",
    "productGroup",
    "productFamily",
    "partCode",
    "partDescription",
    "UOM",
    "typeOfComponents",
    "componanetUsage",
    "compatibilityPartcode",
    "requestQty",
    "approved1Qty",
    "approved2Qty",
    "faultySerialNo",
    "faultyUnitModuleSerialNo",
    "status"
];

const customConfig = {
    requestTicketNo: { label: "Request TicketNo" },
    requesterType: { label: "RequesterType" },
    requestFor: { label: "Request For" },
    orderType: { label: "Order Type" },
    productName: { label: "Product Name" },
    productGroup: { label: "Product Group" },
    productFamily: { label: "Product Family" },
    partCode: { label: "PartCode" },
    partDescription: { label: "PartDescription" },
    UOM: { label: "UOM" },
    typeOfComponents: { label: "TypeOf Components" },
    componanetUsage: { label: "ComponanetUsage" },
    compatibilityPartcode: { label: "Compatibility Partcode" },
    requestQty: { label: "Request Qty" },
    approved1Qty: { label: "Approved1Qty" },
    approved2Qty: { label: "Approved2Qty" },
    faultySerialNo: { label: "Faulty SerialNo" },
    faultyUnitModuleSerialNo: { label: "Faulty UnitModule SerialNo" },

};


const RequesterDefaultTable = ({
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
            onPageChange={setPage}
            onPerPageChange={setPerPage}

        />)
}

export default RequesterDefaultTable