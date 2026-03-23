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
    "transationDate",
    "partcode",
    "partdescription",
    "ticketNo",
    
    "fromLocation",
    "transferLocation",

    "transfer_ReqQty",
    "transferQty",
        "batchcode",
    "unitvalue",
    "totalvalue",


];


const customConfig = {
    partcode: { label: "PartCode" },
    partdescription: { label: "Part Description" },
    ticketNo: { label: "Ticket No" },
    transationDate: { label: "Transaction Date" },
    fromLocation: { label: "From Location" },
    transferLocation: { label: "Transfer Location" },
    batchcode: { label: "Batch Code" },
    transfer_ReqQty: { label: "Transfer Req Qty" },
    transferQty: { label: "Transfer Qty" },
    unitvalue: { label: "Unit Value" },
    totalvalue: { label: "Total Value Euro" },

    

}

export const StockReportDetailTable = ({
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
            transationDate: formatDateArray(item.transationDate),
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



export default StockReportDetailTable