import React from "react";
import { generateColumns } from "../../components/Com_Component/generateColumns";
import CommonDataTable from "../../components/Com_Component/CommonDataTable";
import { FaEdit } from "react-icons/fa";

const TechnologyDefaultTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  selectedRows,
  setSelectedRows,
  onEdit,
}) => {
  const columns = generateColumns({
    fields: [
      "Edit",
      "sui",
      "partcode",
      "partdescription",
      "racklocation",
      "availableqty",
      "req_qty"

    ],
    customConfig: {
      sui: { label: "SUI" },
      partcode: { label: "partCode" },
      partdescription: { label: "Board Serial Number", }, // ✅ this works
      racklocation: { label: "ReackLocation" },
      availableqty: { label: "Available Qty" },
      req_qty: { label: "Requested Qty" },



    },
    // onEdit,
    selectedRows,
    // handleSelect,
    // handleSelectAll,
    // data: processedData,
    customCellRenderers: {
      Edit: (row) => (
        <button className="edit-button" onClick={() => onEdit(row)}>
          <FaEdit />
        </button>
      ),
    },
    // customLabels,
  });
  return (
    <div>
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
    </div>)
}

export default TechnologyDefaultTable