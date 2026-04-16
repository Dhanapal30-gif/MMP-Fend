import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { FaEdit } from "react-icons/fa";

const formatDateArray = (arr) => {
  if (!arr || !Array.isArray(arr)) return "";
  const [year, month, day] = arr;
  const pad = (n) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
};

const fields = [
  "productname",
  "productgroup",
  "productfamily",
  "dateyear",
  "totalRepairedQty"
];

const customConfig = {
  productname: { label: "Product Name" },
  productgroup: { label: "Product Group" },
  productfamily: { label: "Product Family" },
  dateyear: { label: "Date Year" },
  totalRepairedQty: { label: "Total Repaired Qty" },
  repairedOk: { label: "Repaired Ok" },
  scrap: { label: "Scrap" }
};

const ProductQtyMasterTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  onEdit,
}) => {

  const processedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      receivingdate: formatDateArray(item.receivingdate),
      issuanceDate: formatDateArray(item.issuanceDate),
    }));
  }, [data]);

  const columns = React.useMemo(() => {
    const baseColumns = generateColumns({
      fields,
      customConfig,
      data: processedData
    });

    return [
     
      {
        name: "Edit",
        selector: (row) => row.id,
        cell: (row) => (
          <button className="edit-button" onClick={() => onEdit(row)}>
            <FaEdit />
          </button>
        ),
        width: "80px",
        center: true,
      } 
      ,
       ...baseColumns,
    ];
  }, [processedData, onEdit]);

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
  );
};

export default ProductQtyMasterTable;