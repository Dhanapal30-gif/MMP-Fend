

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
      "partdescription",
      "componentusage",
      "storage_location_transfer",
      "location",
       "qty",
      "batchCode",
       "unitprice",    
      "total_value",
    ],
    data,
   

    customConfig: {
      partcode: { label: "PartCode" },
      partdescription: { label: "Part Description" },
      componentusage: { label: "Component Usage" },
      storage_location_transfer:{label:"Storage location"},
      location: { label: "Rack Location" },
      batchCode: { label: "BatchCode" },
      qty: { label: "Qty" },
      total_value: { label: "Total Value  €" },
      unitprice: { label: "Unit Value €" },
      
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
