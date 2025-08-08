import React from 'react'
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest } from '../../Services/Services_09';

const ReworkerTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
    handleQtyChange,
}) => {

    const columns = generateColumns({
        fields: [
            "productname",
            "boardserialnumber",
            "partcode",
            "partdescription",
            "racklocation",
            "Repaier commnent",
            "availableqty",
            "RequestedQty",
            "pickingqty",
            "pickedqty",
            "Submit",
            "RepaierName"

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
            Submit: (row) => (
                <div className="ReworkerButton9">
                    {(row.is_done === 0 || row.is_done === null) && (
                        <button
                            style={{ backgroundColor: 'blue', color: 'white' }}
                            onClick={() => handleDone(row.id)}
                        >
                            Done
                        </button>
                    )}
                </div>
            )

        }
    })

    const handleDone = (id) => {

        const formData = [{ id }];  // shorthand for { id: id }

        saveDoneRequest(formData)
            .then((response) => {
                console.log("RESPONSE:", response);
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    setRequestButton(false);
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
        />)
}

export default ReworkerTable