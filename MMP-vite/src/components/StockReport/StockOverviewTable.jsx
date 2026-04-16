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
    "componentUsage",
    "unitValue",
    "msdstatus",

    "rcQty",
    "dhlQty",
    "ROWH",

    "overallQty",
    "totalValue",
    "receivingdate",
    "issuanceDate",
];

const customConfig = {
    partcode:{label:"Partcode"},
    partdescription:{label:"PartDescription"},
    componentUsage:{label:"ComponentUsage"},
    uom:{label:"UOM"},
    msdstatus:{label:"MSD Status"},

    rcQty:{label:"RC Stock"},
    dhlQty:{label:"DHL Stock"},
    ROWH:{label:"ROWH Stock"},

    overallQty:{label:"Overall Qty"},
    receivingdate:{label:"Last ReceivingDate"},
    issuanceDate:{label:"Last issuanceDate"},
    unitValue:{label:"Unit Value"},
    totalValue:{label:"Total Value €"}
};

const StockOverviewTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
}) => {

const parseLocationQty = (str = "") => {
    const result = {};

    str.split(",").forEach(item => {
        const [loc, qty] = item.split(":");
        if (!loc || !qty) return;

        const key = loc.trim().toUpperCase();
        const value = Number(qty);

        result[key] = (result[key] || 0) + value;
    });

    return result;
};

  const processedData = React.useMemo(() => {
    return data.map((item) => {
        const locMap = parseLocationQty(item.transferLocation);

        return {
            ...item,
            receivingdate: formatDateArray(item.receivingdate),
            issuanceDate: formatDateArray(item.issuanceDate),

            rcQty: locMap["RC"] || 0,
            dhlQty: locMap["DHL"] || 0,
            ROWH: locMap["ROWH"] || 0,
        };
    });
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
            
        />)
}

export default StockOverviewTable