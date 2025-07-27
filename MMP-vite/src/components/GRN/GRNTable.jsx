
import React from "react";
import { TextField } from "@mui/material";
import { generateColumns } from "../../components/Com_Component/generateColumns";
import CommonDataTable from "../../components/Com_Component/CommonDataTable";

const GRNTable = ({
  data=[],
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
    formErrors, 

}) => {

  // Function to handle select all rows
const handleSelectAll=(e)=>{
  if(e.target.checked){
    setSelectedRows(data.map((row)=>row.id));
  }
  else{
    setSelectedRows([])
  }
};


const handleSelect = (rowkey) => {
  setSelectedRows((prevSelectedRows) => {
    const isRowSelected = prevSelectedRows.includes(rowkey);
    const updatedRows = isRowSelected
      ? prevSelectedRows.filter((key) => key !== rowkey)
      : [...prevSelectedRows, rowkey];
    return updatedRows;
  });
};

  const columns = generateColumns({
    fields: [
       "recevingTicketNo", "ponumber", "vendorname", "postingdate",
      "partcode", "partdescription", "UOM", "TYC", "invoiceNo",
      "invoiceDate", "receivingDate", "recevingQty", "orderqty",
      "unitprice", "GRNQty","Comment"
    ],
    
    onEdit,
    showEdit: false,
    selectedRows,
    handleSelect,
    handleSelectAll,
  data, 
    customConfig: {
      recevingTicketNo: { label: "Ticket No", width: "140px" },
      Comment: { label: "Comment", width: "270px",height:"70px"}
    },
 customCellRenderers: {
  GRNQty: (row) => (
    
    <TextField
      type="number"
      placeholder="GRN Qty"
      value={row.GRNQty || ""}
      
      onChange={(e) => handleGRNQtyChange(row.selectedid, "GRNQty", e.target.value)}
    error={!!formErrors?.[`GRNQty_${row.selectedid}`]} 
    helperText={formErrors?.[`GRNQty_${row.selectedid}`] || ""}
      className="invoice-input"
    />
  ),
  Comment: (row) => (
    <TextField
      placeholder="Enter Comment"
      value={row.Comment || ""}
      onChange={(e) => handleGRNQtyChange(row.selectedid, "Comment", e.target.value)}
      
      className="invoice-input"
    />
  ),
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

export default GRNTable;
