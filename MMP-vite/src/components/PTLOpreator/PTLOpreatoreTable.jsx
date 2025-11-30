import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";
import { WidthFull } from '@mui/icons-material';

const PTLOpreatoreTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  handleQtyChange,
  formData,
  pickButton,
  setpickButton,
  setSuccessMessage,
  setShowSuccessPopup
}) => {

  const [pickedRows, setPickedRows] = useState([]);
  const [editedQty, setEditedQty] = useState({}); // { rowId: qty }

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

    ],
    customConfig: {
      type: { label: "Reworker Type" },
      productname: { label: "Product Name", },
      partcode: { label: "partCode" },
      boardserialnumber: { label: "Board Serial Number", }, // ✅ this works
      racklocation: { label: "ReackLocation" },
      availableqty: { label: "Available Qty" },
      RequestedQty: { label: "Requested Qty" },
      pickingqty: { label: "Picking Qty" },
      pickedqty: { label: "Picked Qty" },
      repairername: { label: "Repairer Name" },
      reworkername: { label: "Reworker Name" },


    },

    // customCellRenderers: {
    //   pickingqty: (formData) => (
    //     <TextField
    //       type="number"
    //       value={editedQty[formData.selectedid] ?? formData.pickingqty ?? ""}
    //       onChange={(e) => {
    //         const inputValue = Number(e.target.value);
    //         const max = Number(row.availableqty || 0);
    //         if (inputValue <= max) {
    //           setEditedQty(prev => ({ ...prev, [row.selectedid]: inputValue }));
    //           handleQtyChange(row.selectedid, inputValue); // update main state too if needed
    //         }
    //       }}
    //       inputProps={{
    //     min: 0,
    //     max: row.availableqty,
    //     style: { width: "80px", textAlign: "center" }
    //   }}
    //       className="invoice-input"
    //     />
    //   ),
    //   Pick: (row) => (
    //     <div className="ReworkerButton9">
    //       {pickButton && (
    //         pickedRows.includes(row.id) ? (
    //           <span style={{ color: 'green', fontWeight: 'bold', }}>Done</span>
    //         ) : (
    //           <button
    //             style={{
    //               backgroundColor: 'blue',
    //               color: 'white',
    //               marginTop: '19px'
    //             }}
    //             onClick={() =>
    //               handlePick(
    //                 editedQty[row.selectedid] ?? row.pickingqty,
    //                 row.racklocation,
    //                 row.partcode,
    //                 row.partdescription,
    //                 row.id
    //               )
    //             }
    //           >
    //             Pick
    //           </button>
    //         )
    //       )}

    //     </div>

    //   )
    // }
    customCellRenderers: {
      pickingqty: (row) => (
        <TextField
          type="number"
          value={editedQty[row.selectedid] ?? row.pickingqty ?? ""}
          onChange={(e) => {
            const inputValue = Number(e.target.value);
            const max = Number(row.availableqty || 0);
            if (inputValue <= max) {
              setEditedQty(prev => ({ ...prev, [row.selectedid]: inputValue }));
              handleQtyChange(row.selectedid, inputValue);
            }
          }}
          inputProps={{
            min: 0,
            max: row.availableqty,
            style: { width: "80px", textAlign: "center" }
          }}
          className="invoice-input"
        />
      ),
      Pick: (row) => (
        <div className="ReworkerButton9">
          {pickButton && (
            pickedRows.includes(row.id) ? (
              <span style={{ color: 'green', fontWeight: 'bold', marginTop: '20px' }}>Done</span>
            ) : (
              <button
                style={{
                  backgroundColor: 'blue',
                  color: 'white',
                  marginTop: '19px'
                }}
                onClick={() =>
                  handlePick(
                    editedQty[row.selectedid] ?? row.pickingqty,
                    row.racklocation,
                    row.partcode,
                    row.partdescription,
                    row.id
                  )
                }
              >
                Pick
              </button>
            )
          )}
        </div>
      )
    }

  })

  const SECRET_KEY = "1234567890123456"; // same as backend
  const handlePick = (pickingqty, racklocation, partcode, partdescription, rowId) => {
    const formData = [{
      Qty: pickingqty,
      LocationName: racklocation,
      PartNO: partcode,
      Description: partdescription
    }];

    const jsonString = JSON.stringify(formData);

    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString();

    savePickequest(encrypted)
      .then(res => {
        const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
        const decrypted = CryptoJS.AES.decrypt(res.data, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);

        try {
          const parsedData = JSON.parse(decrypted);
          setSuccessMessage(parsedData.message); // store only the string
          setShowSuccessPopup(true);
          setPickedRows(prev => [...prev, rowId]);

          console.log(parsedData);
        } catch (e) {
          console.error("Invalid JSON response:", decrypted);
        }
      })

  };

  const paginatedData = React.useMemo(() => {
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
      totalRows={data.length}
      loading={loading}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      customStyles={{
        table: { style: { tableLayout: "auto" } }, // ensures only the wide column expands
      }}
    />
  )
}

export default PTLOpreatoreTable