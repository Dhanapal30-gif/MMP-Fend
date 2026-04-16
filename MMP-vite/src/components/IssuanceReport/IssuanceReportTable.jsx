import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns'; // make sure this import is correct


const formatDateArray = (arr) => {
    if (!arr || !Array.isArray(arr)) return "";

    const [year, month, day, hour, minute, second] = arr;

    const pad = (n) => String(n ?? 0).padStart(2, "0");

    return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
};



const fields = [
    "createdon",
    "partcode",
    "partdescription",
    "uom",
    "racklocation",
    "tyc",
    "requestertype",
    "productname",
    "productgroup",
    "productfamily",
    "fmsn",
    "nsn",
    "rec_ticket_no",
    "approved_l1_date",
    "approved_l2_date",
    "issuance_date",
    "batchcode",
    "req_qty",
    "issueqty",
    "issueValue",
    "lastUsedDate",
    "issued_comments",

];


const customConfig = {
    partcode: { label: "PartCode" },
    partdescription: { label: "Part Description" },
    uom: { label: "UOM" },
    racklocation: { label: "Rack Location" },
    tyc: { label: "TYC" },
    requestertype: { label: "Component Usage" },
    productname: { label: "Product Name" },
    productgroup: { label: "Product Group" },
    productfamily: { label: "Product Family" },
    fmsn: { label: "Faulty ModuleSerialNo" },
    nsn: { label: "Replacement ModuleSerial No" },
    rec_ticket_no: { label: "Ticket No" },
    approved_l2_date: { label: " Approved_l2_Date" },
    createdon: { label: " Posting Date" },
    req_qty: { label: "Req Qty" },
    issueqty: { label: "Issue Qty" },
    issueValue: { label: "Total Value  €" },
    issuance_date: { label: "Issued Date" },
    batchcode: { label: "Batchcode" },
    issued_comments: { label: "ReciverName" },
    approved_l1_date:{label:"Approved_l1_Date"},
    lastUsedDate:{label:"LastUsed Date"}

}


const IssuanceReportTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
}) => {
    const processedData = React.useMemo(() => {
        return data.map((item) => ({
            ...item,
            approved_l2_date: formatDateArray(item.approved_l2_date),
            createdon: formatDateArray(item.createdon),
            issuance_date: formatDateArray(item.issuance_date),
            grdate: formatDateArray(item.grdate),
            receivingdate: formatDateArray(item.receivingdate),
            approved_l1_date: formatDateArray(item.approved_l1_date),
             lastUsedDate: formatDateArray(item.lastUsedDate),
        }));
    }, [data]);


    const columns = React.useMemo(() => generateColumns({ fields, customConfig, data: processedData }), [fields, customConfig, processedData]);


    return (
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

export default IssuanceReportTable