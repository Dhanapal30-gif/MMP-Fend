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
    "locationName",
    "createdby",
    // "createdon",
    "updatedby",
    // "updatedon",

];

const customConfig = {
    locationName: { label: "LocationName" },
    createdby: { label: "Createdby" },
    createdon: { label: "Createdon" },
    updatedby: { label: "Updatedby" },
    updatedon: { label: "ipdatedon" }
}


const LocationMasterTable = ({
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

export default LocationMasterTable