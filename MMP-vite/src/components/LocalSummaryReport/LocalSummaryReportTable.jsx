

import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";



const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    const day = date.toLocaleString('en-GB', { day: '2-digit' });
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();

    const time = date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return `${day} ${month} ${year} at ${time}`;
};


const fields = [
    "type",
    "productname",
    "boardserialnumber",
    "requestQty",
    "pickedqty",
    "repairername",
    "reworkername",
    "shift",
    "recordstatus",
    "date",
    "repairIntime",
    "repairIntime",
    "rewokerComponentReqtime",
    "ciomppemntissuetime",
    "reworkerouttime",
    "compoentissuancehours",
    "reworkerhours",
    "totalhours",
    

];

const customConfig = {
    type: { label: "Type" },
    productname: { label: "Product Name" },
    boardserialnumber: { label: "Module Serial No" },
    requestQty: { label: "Request Qty" },
    pickedqty: { label: "Picked Qty" },
    repairername: { label: "Repair" },
    reworkername: { label: "Reworker" },
    shift: { label: "Shift" },
    recordstatus: { label: "Status" },
    date: { label: "Date" },
    repairIntime: { label: "Repair In Time" },
    rewokerComponentReqtime: { label: "Reworker Component Req Time" },
    ciomppemntissuetime: { label: "Component Issue Time" },
    reworkerouttime: { label: "Reworker Out Time" },
    compoentissuancehours: { label: "Component Issue Hours" },
    reworkerhours: { label: "Rework Hours" },
    totalhours: { label: "Board Total Hours" },
};


const LocalSummaryReportTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage
}) => {

 const formatHours = (value) => {
    if (!value) return "";

    const [hh, mm] = value.split(":");
    return `${parseInt(hh, 10)}:${mm}`;
};

const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};
const processedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
        ...item,
        repairIntime: formatDateTime(item.repairIntime),
        rewokerComponentReqtime: formatDateTime(item.rewokerComponentReqtime),
        ciomppemntissuetime: formatDateTime(item.ciomppemntissuetime),
        reworkerouttime: formatDateTime(item.reworkerouttime),
        totalhours: formatHours(item.totalhours),
        reworkerhours: formatHours(item.reworkerhours),
        compoentissuancehours: formatHours(item.compoentissuancehours),
          date: formatDate(item.repairIntime),
    }));
}, [data]);

    const columns = React.useMemo(() => generateColumns({ fields, customConfig, data: processedData }), [fields, customConfig, processedData]);

    return (
        // <CommonDataTable
        //     columns={columns}
        //     data={data}
        //     page={page}
        //     pagination
        //     paginationServer
        //     perPage={perPage}
        //     totalRows={totalRows}
        //     loading={loading}
        //     // onPageChange={setPage}
        //       onPageChange={(p) => setPage(p - 1)}   // <-- subtract 1
        //     onPerPageChange={setPerPage}
        // />
    <CommonDataTable
            columns={columns}
            data={processedData}
            page={page}
            perPage={perPage}
            totalRows={totalRows}
            loading={loading}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
        />
        
    )
}

export default LocalSummaryReportTable