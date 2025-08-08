import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';

const PTLOpreatoreTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  handleQtyChange,
  pickButton,
  setpickButton
}) => {

  const [pickedRows, setPickedRows] = useState([]);

  const columns = generateColumns({
    fields: [
      "type",
      "productname",
      "boardserialnumber",
      "partcode",
      "partdescription",
      "racklocation",
      "availableqty",
      "RequestedQty",
      "pickingqty",
      "Pick",
      "repairername",
      "reworkername"

    ]
    ,
    customCellRenderers: {
      pickingqty: (row) => (
        <TextField
          type="number"
          value={row.pickingqty || ""}
          onChange={(e) => {
            const inputValue = Number(e.target.value);
            const max = Number(row.availableqty || 0);
            if (inputValue <= max) {
              handleQtyChange(row.selectedid, inputValue);
            }
          }}
          className="invoice-input"
        />
      ),
      Pick: (row) => (
  <div className="ReworkerButton9">
    {!pickedRows.includes(row.id) && pickButton && (
      <button
        style={{ backgroundColor: 'blue', color: 'white' }}
        onClick={() => handlePick(row.id, row.pickingqty)}
      >
        Pick
      </button>
    )}
  </div>
)


    }
  })

  const handlePick = (id, pickingqty) => {
  const formData = [{ id, pickingqty }];

  savePickequest(formData)
    .then((response) => {
      if (response.status === 200 && response.data) {
        setPickedRows(prev => [...prev, id]); 
        // setpickButton(false);
      }
    })
    .catch((error) => {
      console.error("Error saving:", error);
    });
};
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
  )
}

export default PTLOpreatoreTable