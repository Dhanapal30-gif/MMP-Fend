import { generateColumns } from '../../components/Com_Component/generateColumns';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { FaEdit } from "react-icons/fa";


const PTLTable = ({
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
  handlePoChange,
  formErrors,
  formData,
  handleChange,
  searchText = ""
}) => {


  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]); // Unselect all
    } else {
      setSelectedRows(data); // Select all
    }
  };

  const handleSelect = (row) => {
    setSelectedRows((prev) => {
      const exists = prev.find((r) => r.partcode === row.partcode);
      if (exists) {
        return prev.filter((r) => r.partcode !== row.partcode);
      } else {
        return [...prev, row];
      }
    });
  };


  const columns = generateColumns({
    fields: [
      // "select",
      "edit",
      "partcode",
      "partdescription",
      "rohsstatus",
      "msdstatus",
      "technology",
      "racklocation",
      "unitprice",
      "customduty",
      "quantity",
      "catmovement",
      "MOQ",
      "TRQty"
    ],
    data,
    selectedRows,
    handleSelect,
    handleSelectAll,
    onEdit,

    customConfig: {
      partcode: { label: "PartCode" },
      partdescription: { label: "Part Description" },
      rohsstatus: { label: "Rohs Status" },
      msdstatus: { label: "Msdstatus" },

      technology: { label: "Technology" },
      racklocation: { label: "Rack Location" },
      unitprice: { label: "Unitprice" },
      customduty: { label: "CustomDuty" },
      quantity: { label: "Quantity" },
      catmovement: { label: "Cat Movement" }
    },
    customCellRenderers: {
      select: (row) => (
  <div style={{ paddingLeft: '15px' }}>
    <input
      type="checkbox"
      checked={Array.isArray(selectedRows) && selectedRows.some(r => r.partcode === row.partcode)}
      onChange={() => handleSelect(row)}
    />
  </div>
),

      edit: (row) => (
        <button className="edit-button" onClick={() => onEdit(row)}>
          <FaEdit />
        </button>
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

export default PTLTable;
