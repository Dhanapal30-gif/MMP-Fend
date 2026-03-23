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
    "postingdate",
    "rec_ticket_no",
    "pono",
    "partcode",
    "partdescription",
    "uom",
    "tyc",
    "rcbatchcode",
    "racklocation",
    "vendorname",
    "invoiceno",
    
    "podate",
    "exp_date",
    "currency",
    "unitprice",
    "unitpriceper1qty",
    "totalvalueeuro",
    "orderqty",
    "rec_qty",
    "openorderqty",
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
    rcbatchcode: { label: "Batch Code" },
    racklocation: { label: "Rack Location" },
    vendorname: { label: "Vendor Name" },
    invoiceno: { label: "Invoice No" },
    postingdate: { label: "Posting Date" },
    podate: { label: "PO Date" },
    exp_date: { label: "Exp Date" },
    totalvalueeuro: { label: "Totalvalue  €" },
    openorderqty: { label: "Open Order Qty" },
    rec_qty: { label: "Received Qty" },
    orderqty: { label: "Order Qty" },
    currency:{label:"Currency"},
    unitprice: { label: "Unit Price" },
    grno: { label: "GR No" },
    grdate: { label: "GR Date" },
    receivingdate: { label: "Receiving Date" },
    unitpriceper1qty:{label:"Unitprice  €"}
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