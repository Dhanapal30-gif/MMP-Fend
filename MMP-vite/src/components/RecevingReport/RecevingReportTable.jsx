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
    "rec_ticket_no",
    "pono",
    "partcode",
    "partdescription",
    "uom",
    "tyc",
    "racklocation",
    "vendorname",
    "invoiceno",
    "postingdate",
    "podate",
    "exp_date",
    "totalvalue",
    "rec_qty",
    "grno",
    "grdate",
    "receivingdate",

];

const customConfig = {

    rec_ticket_no: { label: "Receiving Ticket No" },
    pono: { label: "PO Number" },
    partcode: { label: "PartCode" },
    partdescription: { label: "Part Description" },
    uom: { label: "UOM" },
    tyc: { label: "TYC" },
    racklocation: { label: "Rack Location" },
    vendorname: { label: "Vendor Name" },
    invoiceno: { label: "Invoice No" },
    postingdate: { label: "Posting Date" },
    podate: { label: "PO Date" },
    exp_date: { label: "Exp Date" },
    totalvalue: { label: "Total Value" },
    rec_qty: { label: "Received Qty" },
    grno: { label: "GR No" },
    grdate: { label: "GR Date" },
    receivingdate: { label: "Receiving Date" },


}

const RecevingReportTable = ({
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

export default RecevingReportTable