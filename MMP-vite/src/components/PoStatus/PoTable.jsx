import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
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


const handleSelectAll = (e) => {
  if (e.target.checked) {
    setSelectedRows(data.map((row) => row.id)); // ✅ use selectedid
  } else {
    setSelectedRows([]);
  }
};

// const handleSelect = (rowId, checked) => {
//   if (checked) {
//     setSelectedRows((prev) => [...prev, rowId]);
//   } else {
//     setSelectedRows((prev) => prev.filter((id) => id !== rowId));
//   }
// };

const handleSelect = (poid, isChecked) => {
  setSelectedRows((prev) => {
    if (isChecked) return [...prev, poid];
    return prev.filter((id) => id !== poid);
  });
};

  const columns = generateColumns({
    fields: [
      "ponumber",
      "postingdate",
      "partcode",
      "partdescription",
      "orderqty",
      "recevingQty",
      "GRNQty",
      "postatus"
    ],
    selectedRows,
    handlePoChange,
    onEdit,
    formErrors,
    handleSelect,
    handleSelectAll,
    customCellRenderers: {
      postatus: (row) => {
        if (row.postatus !== "Close") {
          return (
            <Autocomplete
              options={poStatusChange}
              getOptionLabel={(option) => option.label}
              value={getOptionObj(row.postatus, poStatusChange)}
              onChange={(e, newValue) =>
                handlePoChange(row.Poid, "postatus", newValue?.value || "")
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" size="small" 
                error={!!formErrors[`postatus${row.Poid}`]}           // ✅ correct key
      helperText={formErrors[`postatus${row.Poid}`] || ""} // ✅ display message
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
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
    />
  );
};

export default PoTable;
