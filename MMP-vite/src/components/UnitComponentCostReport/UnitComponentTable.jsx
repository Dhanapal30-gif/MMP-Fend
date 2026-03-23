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
    "productname",
    "productgroup",
    "productfamily",
    "dateyear",
    "repairedOk",
    "scrap",
    "totalrepairedQty",
    "pickedqty",
    "issuedqty",
    "totalqty", 
    "averageCostPerUnit"
  
];

const customConfig = {
    productname: { label: "ProductName" },
    productgroup: { label: "ProductGroup" },
    productfamily: { label: "ProductFamily" },
    dateyear: { label: "Date_year" },
    repairedOk: { label: "Repaired Ok" },
    scrap: { label: "Scrap" },
    totalrepairedQty: { label: "Total Repaired Qty" },
    issuedqty: { label: "DTL Qty" },
    pickedqty:{label:"PTL Qty"},
    totalqty:{label:"Total Qty"},
    averageCostPerUnit:{label:"AverageCost Per_Unit"}

}
const UnitComponentTable = ({
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
            receivingdate: formatDateArray(item.receivingdate),
            issuanceDate: formatDateArray(item.issuanceDate),
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

export default UnitComponentTable