import React from "react";
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

  const handleSelect = (rowKey) => {
    setSelectedRows((prev) =>
      prev.includes(rowKey)
        ? prev.filter((id) => id !== rowKey)
        : [...prev, rowKey]
    );
  };

  // ❌ Removed generateColumns()
  // ✅ Manual column config
  const columns = [
  {
    name: "Select",
    width: "80px",
    center: true,
    cell: (row) => (
      <input
        type="checkbox"
        checked={selectedRows.includes(row.id)}
        onChange={() => handleSelect(row.id)}
        style={{ width: "16px",marginLeft:"10px", height: "14px" }}
      />
    ),
  },
  {
    name: "Edit",
    selector: (row) => row.id,
    cell: (row) => (
      <button className="edit-button" onClick={() => onEdit(row)}>
        <FaEdit />
      </button>
    ),
    width: "60px",
    center: true,
  },
  { name: "SUI", selector: (row) => row.sui, sortable: true,wrap: true, },
  { name: "Part Code", selector: (row) => row.partcode, sortable: true },
  { name: "Board Serial Number", selector: (row) => row.partdescription,wrap: true, },
  { name: "Rack Location", selector: (row) => row.racklocation,wrap: true, },
  { name: "Available Qty", selector: (row) => row.availableqty },
  { name: "Requested Qty", selector: (row) => row.req_qty },
];


  // 🎨 Custom Style
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#1976d2",
        color: "white",
              whiteSpace: "nowrap",

      },
    },
    rows: {
      style: {
        minHeight: "45px",
      },
    },
    cells: {
      style: {
        padding: "8px",
         whiteSpace: "normal", // allow wrapping
      },
    },
    table: {
      style: {
        borderRadius: "8px",
        overflow: "hidden",
      },
    },
  };

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
      customStyles={customStyles}
    />
  );
};

export default TechnologyDefaultTable;

/* 
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
  const handleSelect = (rowkey) => {
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowkey);
      return isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowkey)
        : [...prevSelectedRows, rowkey];
    });
  };
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
    handleSelect,
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
*/



