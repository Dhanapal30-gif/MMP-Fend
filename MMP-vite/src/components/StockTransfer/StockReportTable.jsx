

import { generateColumns } from '../../components/Com_Component/generateColumns';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { FaEdit } from "react-icons/fa";


const StockReportTable = ({
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
  searchText = "",
  setDeletButton
}) => {

  const columns = generateColumns({
    fields: [
      // "select",
      "partcode",
      "location",
      "batchCode",
      "qty"
   
    ],
    data,
   

    customConfig: {
      partcode: { label: "PartCode" },
      location: { label: "Location" },
      batchCode: { label: "BatchCode" },
      qty: { label: "Qty" },
    },
    customCellRenderers: {
    
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

export default StockReportTable;
