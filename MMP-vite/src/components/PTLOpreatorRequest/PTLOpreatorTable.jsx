
import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";


const fields = [
    "ptlreqticketno",
    "partcode",
    "partdescription",
    "requestQty",
    "status"
];

const customConfig = {
    ptlreqticketno: { label: "Request TicketNo" },
    partcode: { label: "PartCode" },
    partdescription: { label: "Part Description" },
    requestQty: { label: "Request Qty" },
    status: { label: "Status" },

};


const PTLOpreatorTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
}) => {
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

export default PTLOpreatorTable