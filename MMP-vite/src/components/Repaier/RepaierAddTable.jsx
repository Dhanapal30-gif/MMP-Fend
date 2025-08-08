import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';

const RepaierAddTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
}) => {
  const columns = generateColumns({
    fields: [
      "productname",
      "boardserialnumber",
      "type",
      "partcode",
      "partdescription",
      "racklocation",
      "availableqty",
      "pickingqty"
    ]
  });

  return (
    <CommonDataTable
      columns={columns}
      data={data}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      onPageChange={setPage}
      onRowsPerPageChange={setPerPage}
    />
  );
};

export default RepaierAddTable;
