import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';

const formatDateArray = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length < 6) return "";
  const [year, month, day, hour, minute, second] = arr;
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
};

const fields = ["partcode", "partdescription", "racklocation", "putawayqty", "createdby", "createddate"];

const customConfig = {
  partcode: { label: "Part Code" ,width: "10px",},
  partdescription: { label: "Part Description", width: "379px" },
  racklocation: { label: "Rack Location", width: "150px" },
  putawayqty: { label: "Putaway Qty", width: "130px" },
  createdby: { label: "Created By", width: "120px" },
  createddate: { label: "Created Date", width: "180px" },
};
const LocalPutawayDetailTable =
({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
}) => {
      // console.log("data",data)

  const processedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      createddate: formatDateArray(item.createddate),
    }));
  }, [data]);


  const columns = React.useMemo(() => generateColumns({ fields, customConfig, data: processedData }), [fields, customConfig, processedData]);

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
}

export default LocalPutawayDetailTable