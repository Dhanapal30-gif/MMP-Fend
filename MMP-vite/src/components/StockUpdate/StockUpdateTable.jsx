import { generateColumns } from '../../components/Com_Component/generateColumns';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { FaEdit } from "react-icons/fa";


const StockUpdateTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
    onEdit
}) => {


    const columns = generateColumns({
        fields: [
            "Edit",
            "stockUpdateType",
            "partcode",
            "partdescription",
            "batchcode",
            "location",
            "availableQty",
            "qty",
            "comment",
            "createdby",
            "createdon",
        ],
        data,

        onEdit,

        customConfig: {
            stockUpdateType: { label: "Stock UpdateType" },
            partcode: { label: "Partcode" },
            partdescription: { label: "Partdescription" },
            batchcode: { label: "Batchcode" },
            location: { label: "Location" },
            availableQty: { label: "Available Qty" },
            qty: { label: "Qty" },
            comment: { label: "Comment" },
            createdby: { label: "Createdby" },
            createdon: { label: "Createdon" },
        },
        customCellRenderers: {
    Edit: (row) => (
        row.editMode === "1" ? (
            <button className="edit-button" onClick={() => onEdit(row)}>
                <FaEdit />
            </button>
        ) : null // hide button if editMode is 0
    )
}
    });
    return (
        <CommonDataTable
            columns={columns}
            data={data}
            loading={loading}
            page={page}
            perPage={perPage}
            totalRows={totalRows}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
        />
    );
};

export default StockUpdateTable;
