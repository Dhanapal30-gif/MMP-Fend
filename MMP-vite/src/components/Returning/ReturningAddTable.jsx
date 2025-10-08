import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { FaTimesCircle } from "react-icons/fa";

const fields = [
    "returningType",
    "ordertype",
    "RequesterType",
    "partcode",
    "partdescription",
    "rec_ticket_no",
    "returnQty",
        "comment",

];

const customConfig = {
    returningType: { label: "Returning Type" },
    ordertype: { label: "OrderType" },
    RequesterType: { label: "RequesterType" },
    partcode: { label: "partcode" },
    partdescription: { label: "Part Description" },
        rec_ticket_no: { label: "ReQ_ticket_no" },
                returnQty: { label: "Return Qty" },

        comment: { label: "Comment" },

};

const ReturningAddTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
    setTableData
}) => {

    const handleRemoveRow = (index) => {
        const updated = [...data];
        updated.splice(index, 1);
        setTableData(updated);
    };
const cancelColumn = {
    name: "Cancel",       // header text stays
    cell: (row, index) => (
        <FaTimesCircle
            onClick={() => handleRemoveRow(index)}
            style={{
                color: "red",
                fontSize: "20px",
                cursor: "pointer",
                transition: "transform 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    minWidth: '80px',     // ensures full header text is visible
};


    // Generate columns and prepend Cancel column manually
    const columns = React.useMemo(() => {
        const genCols = generateColumns({ fields, customConfig });
        return [cancelColumn, ...genCols];
    }, [fields, customConfig]);

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
            data={normalizedData}
            page={page}
            perPage={perPage}
            totalRows={totalRows}
            loading={loading}
            onPageChange={setPage}
            onRowsPerPageChange={setPerPage}
        />
    );
};

export default ReturningAddTable;
