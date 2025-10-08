import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";

const StockTransferTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
}) => {
const fields = [
    "RTN",
    "TransferType",
    "OrderType",
    "Partcode",
    "TransferQty",
    "Inventory_BoxNo",
    "RecordStatus"

];
    // Generate columns and prepend Cancel column manually
    const columns = React.useMemo(() => {
        return generateColumns({ fields });
    }, [fields]);

    // Flatten {label, value} objects
    const normalizedData = React.useMemo(() => {
        return data.map(row => {
            const newRow = { ...row };
            Object.keys(newRow).forEach(key => {
                if (typeof newRow[key] === "object" && newRow[key] !== null) {
                    newRow[key] = newRow[key].label ?? JSON.stringify(newRow[key]);
                }
            });
            return newRow;
        });
    }, [data]);


    return (
        <CommonDataTable
    columns={columns}
    data={normalizedData} // ✅ flattened
    page={page}
    perPage={perPage} // ✅ 10
    totalRows={totalRows} // total rows from backend
    loading={loading}
    onPageChange={setPage}
    onRowsPerPageChange={setPerPage}
/>
)
}
export default StockTransferTable