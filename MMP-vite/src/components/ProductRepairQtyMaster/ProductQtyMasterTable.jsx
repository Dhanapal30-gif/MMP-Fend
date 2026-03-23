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
    "totalrepairedQty",
    "repairedOk",
    "scrap"
];

const customConfig = {
    productname: { label: "Productname" },
    productgroup: { label: "Productgroup" },
    productfamily: { label: "ProductFamily" },
    dateyear: { label: "Dateyear" },
    totalrepairedQty:{label:"Totalrepaired Qty"},
    repairedOk:{label:"RepairedOk"},
    scrap:"Scrap",
}

const ProductQtyMasterTable = ({
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

export default ProductQtyMasterTable