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
    "productname",
    "productgroup",
    "productfamily",
    "componentUsage",
    // "requestTime",
    // "approved_l1_date",
    // "approved_l2_date",
    // "issuance_date",
    "approver_1_TAT",
    "approver_2_TAT",
    "storeTAT",
    "overallTAT",
];


const customConfig = {
  productname: { label: "Product Name" },
  productgroup: { label: "Product Group" },
  productfamily: { label: "Product Family" },
  componentUsage: { label: "Component Usage" },
  requestTime: { label: "Request Time" },
  approved_l1_date: { label: "Approver 1 Date" },
  approved_l2_date: { label: "Approver 2 Date" },
  issuance_date: { label: "Issuance Date" },
  approver_1_TAT: { label: "Approver 1 TAT" },
  approver_2_TAT: { label: "Approver 2 TAT" },
  storeTAT: { label: "Store TAT" },
  overallTAT: { label: "Overall TAT" },
};



const IssuanceTatTable = ({
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
            // approved_l1_date: formatDateArray(item.approved_l2_date),
            // approved_l2_date: formatDateArray(item.approved_l2_date),
           // requestTime: formatDateArray(item.requestTime),
            // issuance_date: formatDateArray(item.issuance_date),
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

export default IssuanceTatTable