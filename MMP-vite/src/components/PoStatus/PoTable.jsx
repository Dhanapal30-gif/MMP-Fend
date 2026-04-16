import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns_checkBox } from '../../components/Com_Component/generateColumns_checkBox';
import { Autocomplete, TextField } from '@mui/material';

const PoTable = ({
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
  searchText = ""
}) => {
  const poStatusChange = [
    { label: "Open", value: "Open" },
    { label: "Manual Close", value: "Manual Close" },
    { label: "Canceled", value: "Canceled" },
    { label: "On Hold", value: "On Hold" }
  ];

  const getOptionObj = (value, options) => {
    return options.find((opt) => opt.value === value) || null;
  };


//   const handleSelectAll = (e) => {
//   if (e.target.checked) {
//     setSelectedRows(data.map((row) => row.poid));
//   } else {
//     setSelectedRows([]);
//   }
// };

//   const handleSelect = (poid, isChecked) => {
//     setSelectedRows((prev) => {
//       if (isChecked) return [...prev, poid];
//       return prev.filter((id) => id !== poid);
//     });
//   };

const handleSelectAll = (e) => {
  if (e.target.checked) {
    setSelectedRows(data.map((row) => row.id)); // ✅ use id
  } else {
    setSelectedRows([]);
  }
};

const handleSelect = (id, isChecked) => {
  setSelectedRows((prev) => {
    if (isChecked) return [...prev, id];
    return prev.filter((val) => val !== id);
  });
};
  const columns = generateColumns_checkBox({
    fields: [
      "ponumber",
      "postingdate",
      "partcode",
      "partdescription",
      "orderqty",
      "recevingQty",
      "grnqty",
      "postatus"
    ],
    customConfig: {
      ponumber: { label: "PO Number" },
      postingdate: { label: "Posting Date", },
      partcode: { label: "PartCode" },
      partdescription: { label: "Part Description" },
      orderqty: { label: "Order Qty" },
      recevingQty: { label: "Receving Qty" },
      grnqty: { label: "GRN Qty" },
      postatus: { label: "Po Status" },
    },
    selectedRows,
    handlePoChange,
    onEdit,
    formErrors,
    handleSelect,
    handleSelectAll,
    customCellRenderers: {
      postatus: (row) => {
        if (row.postatus !== "Closed") {
          return (
            <Autocomplete
              options={poStatusChange}
              getOptionLabel={(option) => option.label}
              value={getOptionObj(row.postatus, poStatusChange)}
              onChange={(e, newValue) =>
                handlePoChange(row.poid, "postatus", newValue?.value || "")
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" size="small"
                  error={!!formErrors[`postatus${row.poid}`]}           // ✅ correct key
                  helperText={formErrors[`postatus${row.poid}`] || ""} // ✅ display message
                />
              )}
              className="invoice-input"
            />
          );
        } else {
          return row.postatus;
        }
      }
    }
  });

  return (
    <CommonDataTable
      columns={columns}
      data={data}
      loading={loading}
      pagination
      paginationServer
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
    />
  );
};

export default PoTable;
