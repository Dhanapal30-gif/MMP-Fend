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
    "componentUsage",
    "uom",
    "msdstatus",
    "transferLocation",
    "qty",

    "overallQty",
    "receivingdate",
    "issuanceDate",
    

];

const customConfig = {

    partcoe:{label:"Partcode"},
    partdescription:{label:"PartDescription"},
    componentUsage:{label:"ComponentUsage"},
    uom:{label:"UOM"},
    msdstatus:{label:"MSD Status"},
    transferLocation:{label:"Location"},
    qty:{label:"Qty"},
    nonRcQty:{label:"Total NonRcQty"},
    overallQty:{label:"Overall Qty"},
    receivingdate:{label:"Last ReceivingDate"},
    issuanceDate:{label:"Last issuanceDate"}

   

}


const StockOverviewTable = ({
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
            // postingdate: formatDateArray(item.postingdate),
            // podate: formatDateArray(item.podate),
            // exp_date: formatDateArray(item.exp_date),
            // grdate: formatDateArray(item.grdate),
            // receivingdate: formatDateArray(item.receivingdate),
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
        />)
}

export default StockOverviewTable