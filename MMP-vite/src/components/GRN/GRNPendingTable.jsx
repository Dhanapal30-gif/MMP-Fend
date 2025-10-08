import React from "react";
import { generateColumns } from "../../components/Com_Component/generateColumns";
import CommonDataTable from "../../components/Com_Component/CommonDataTable";
import { FaEdit } from "react-icons/fa";

const GRNPendingTable = ({
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
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelect = (rowkey) => {
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowkey);
      return isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowkey)
        : [...prevSelectedRows, rowkey];
    });
  };

  // 👇 Add openOrderQty field dynamically
  const processedData = data.map((row) => ({
    ...row,
    openOrderQty: (Number(row.recevingQty) || 0) - (Number(row.orderqty) || 0),
  }));

  const customLabels = {
    openOrderQty: "OpenOrder Qty {recevingQty - orderqty}",
  };

  const columns = generateColumns({
    fields: [
      "recevingTicketNo",
      "ponumber",
      "vendorname",
      "postingdate",
      "partcode",
      "partdescription",
      "UOM",
      "TYC",
      "invoiceNo",
      "invoiceDate",
      "receivingDate",
      "recevingQty",
      "orderqty",
      "openOrderQty", // 👈 add new field
      "totalValue",
      "totalValueEuro",
      "unitprice",
      "GRNQty",
      "GRNo",
      "GRDate",
      "GRNComment",

    ],
    // onEdit,
    selectedRows,
    handleSelect,
    handleSelectAll,
    data: processedData,
   
    customLabels,
  });

  return (
    <div>
      <CommonDataTable
        columns={columns}
        data={processedData}
        loading={loading}
        page={page}
        perPage={perPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  );
};

export default GRNPendingTable;
