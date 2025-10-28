import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns'; // make sure this import is correct



const formatDateArray = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length < 6) return "";
  const [year, month, day, hour, minute, second] = arr;
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
};


const fields = [
  "type",
  "productname",
  "boardserialnumber",
  "partcode",
  "partdescription",
  "racklocation",
  "pickingqty",
  "pickedqty",
  "repairername",
  "reworkername",
  "recordstatus",
  "createddate",
  "startdate",
  "RepairerComponentReqTime",
  "componentIssueTime",
  "enddate",
  "repairercomments",
];


const customConfig = {
  type: { label: "Reworker Type" , width: "120px" },
  productname: { label: "Product Name" ,width: "120px" },
  boardserialnumber: { label: "Module Serial Number" , width: "170px"},
  partcode: { label: "PartCode" },
  partdescription: { label: "Part Description" ,width: "190px"},
  racklocation: { label: "RackLocation"    },
  pickingqty: { label: "Request Qty" },
  pickedqty: { label: "Picked Qty" },
  repairername: { label: "Repairer Name" },
  reworkername: { label: "Reworker Name" },
  recordstatus: { label: "Status" },
  createddate: { label: "Repair Date",width: "170px" },
  startdate: { label: "Repairer Intime",width: "170px" },
  RepairerComponentReqTime: { label: "Repairer Component Req Time",width: "170px" },
  componentIssueTime: { label: "component Issue Time",width: "170px" },
    ptl_op_st_date: { label: "PTL Opretaor Start ",width: "170px" },
  ptl_op_end_date: { label: "PTL Opreator Close",width: "170px" },

  enddate: { label: "Reworker Out Time",width: "170px" },
  repairercomments: { label: "Comments" },
};

const LocalReportTbale = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
}) => {
     const processedData = React.useMemo(() => {
        return data.map((item) => ({
          ...item,
          createddate: formatDateArray(item.createddate),
          startdate: formatDateArray(item.startdate),
          ptl_op_st_date: formatDateArray(item.ptl_op_st_date),
          ptl_op_end_date: formatDateArray(item.ptl_op_end_date),
          enddate: formatDateArray(item.enddate),
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
    />  )
}

export default LocalReportTbale