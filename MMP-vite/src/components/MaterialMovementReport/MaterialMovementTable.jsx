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
    "pono",
    "movementType",
    "materialDocumentNo",
    "postingRefernce",
    "postingdate",
    "transcationQty",
    "amount",
    "comment"
];

const customConfig = {
    partcode:{lable:"partcode"},
    partdescription: { label: "Part Description" },
    uom: { label: "UOM" },
    materialDocumentNo:{label:"Material DocumentNo"},
    pono:{label:"Pono"},
    postingdate:{label:"Posting Date"},
    transcationQty:{label:"Transcation Qty"},
    amount:{label:"Amount"},
    comment:{label:"comment"},
    postingRefernce:{label:"postingRefernce"},
    movementType:{label:"Movement Type"}
}


const MaterialMovementTable =  ({
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

export default MaterialMovementTable