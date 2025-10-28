




import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';

const PoTableReSummary = ({
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
  handleGRNQtyChange,
  formErrors
}) => {
  const columns = generateColumns({
    fields: [
      "ponumber",
      "postingdate",
      "partcode",
      "partdescription",
      "recevingTicketNo",
      "GRNo",
      "GRDate",
      "recevingQty",
      "GRNQty"
    ],
    customConfig: {
      ponumber: { label: "PO Number" },
      postingdate: { label: "Posting Date", },
      partcode: { label: "PartCode" },
      partdescription: { label: "Part Description" },
      recevingTicketNo: { label: "Receving TicketNo" },
      recevingQty: { label: "Receving Qty" },
      GRNQty: { label: "GRN Qty" },
      GRDate: { label: "GRN Date" },
      GRNo: { label: "GRN No" },
    },
    selectedRows,
    handleGRNQtyChange,
    onEdit,
    formErrors
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
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
    />
  );
};

export default PoTableReSummary;
