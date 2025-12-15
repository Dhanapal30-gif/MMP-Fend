

import React from 'react'
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumnshidecheckbox } from '../../components/Com_Component/generateColumnshidecheckbox';
import { TextField } from "@mui/material";
import { saveDoneRequest } from '../../Services/Services_09';

const ManualRcRequestTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  handleQtyChange,
  fetchData,
  setSuccessMessage,
  setShowSuccessPopup,
  setRequestButton,
  doneButton,
  setdoneButton,
  setSelectedGrnRows,
  selectedGrnRows,

  setBoardFetch,
  setSubmitButton,
  setLoading
}) => {

  const columns = generateColumnshidecheckbox({
          fields: [
              "rackID",
              "userId",
  "Location",
  "Product_Code",
  
  "Product_Qty",
  "ticketno",
   "updatedDatetime"         
  
          ],
          customConfig: {
              rackID: { label: "Rack Name" },
              Product_Code: { label: "Partcode" },
              Product_Qty: { label: "RequestQty" },
              ticketno: { label: "TicketNo" },
              updatedDatetime: { label: "CreateDate" },
            
  
          },
           data,  

          customCellRenderers: {
  updatedDatetime: (row) => {
    if (!row.updatedDatetime) return "-";

    // if backend sends array: [yyyy,MM,dd,hh,mm,ss,nano]
    if (Array.isArray(row.updatedDatetime)) {
      const [y, m, d, h, min, s] = row.updatedDatetime;
      return `${d}-${m}-${y} ${h}:${min}:${s}`;
    }

    // if backend sends number/string
    const date = new Date(row.updatedDatetime);
    return isNaN(date) ? row.updatedDatetime : date.toLocaleString();
  }
}

      })
        const paginatedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return data.slice(start, end);
}, [data, page, perPage]);

  return (
    <CommonDataTable
      columns={columns}
      data={paginatedData}
      page={page}
      perPage={perPage}
      totalRows={data.length}  // full count
      loading={loading}
      onPageChange={setPage}       // ✅ correct
      onPerPageChange={setPerPage} // ✅ correct
    />)

}

export default ManualRcRequestTable