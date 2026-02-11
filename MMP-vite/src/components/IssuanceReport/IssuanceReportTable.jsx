import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns'; // make sure this import is correct


const formatDateArray = (arr) => {
    if (!arr || !Array.isArray(arr)) return "";

    const [year, month, day] = arr;

    const pad = (n) => String(n).padStart(2, "0");

    return `${year}-${pad(month)}-${pad(day)}`;
};


const fields = [
    "partcode",
    "partdescription",
    "uom",
    "racklocation",
    "uom",
    "tyc",
    "racklocation",
    "requestertype",
    "productname",
    "productgroup",
    "fmsn",
    "nsn",
    "rec_ticket_no",
    "approved_l2_date",
    "createdon",
    "req_qty",
    "issueqty",
    "issueValue"

];


const customConfig = {
    partcode: { label: "PartCode" },
    partdescription: { label: "Part Description" },
    uom: { label: "UOM" },
    racklocation: { label: "Rack Location" },
    tyc: { label: "TYC" },
    requestertype: { label: "Requester Type" },
    productname: { label: "Product Name" },
    productgroup: { label: "Product Group" },
    fmsn: { label: "FMSN" },
    nsn: { label: "NSN" },
    rec_ticket_no: { label: "Rec Ticket No" },
    approved_l2_date: { label: "Approved L2 Date" },
    createdon: { label: "Created On" },
    req_qty: { label: "Req Qty" },
    issueqty: { label: "Issue Qty" },
    issueValue: { label: "Issue Value" }
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
            postingdate: formatDateArray(item.postingdate),
            podate: formatDateArray(item.podate),
            exp_date: formatDateArray(item.exp_date),
            grdate: formatDateArray(item.grdate),
            receivingdate: formatDateArray(item.receivingdate),
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