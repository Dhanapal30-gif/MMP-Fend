
import React from 'react'
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest } from '../../Services/Services_09';

const ReworkerTypeBasedhide = ({
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
    setBoardFetch,
    setSubmitButton
}) => {

    const columns = generateColumns({
        fields: [
            "type",
            "productname",
            "boardserialnumber",
            "Repaier commnent",
            "Submit",
            "Repairer Name"

        ],
        customConfig: {
            productname: { label: "Product Name" },
            boardserialnumber: { label: "Board Serial Number" },
            type: { label: "Reworker Type" },


        },

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
            // Submit: (row) => (
            //     <div className="ReworkerButton9">
            //         {(row.is_done === "0" || row.is_done === null) && (
            //             <button
            //                 style={{ backgroundColor: 'blue', color: 'white' }}
            //                 onClick={() => handleDone(row.id)}
            //             >
            //                 Done
            //             </button>
            //         )}
            //     </div>
            // )
            Submit: (row) => (
    <div className="ReworkerButton9">
        {row.is_done === "0" || row.is_done === null ? (
            <button
                style={{ backgroundColor: 'blue', color: 'white' }}
                onClick={() => handleDone(row.id)}
            >
                Done
            </button>
        ) : (
            <span style={{ color: 'green', fontWeight: 'bold', marginTop: '15px' }}>
                Done
            </span>
        )}
    </div>
)


        }
    })

    // const handleDone = (id) => {
    //     const formData = [{ id }];
    //     saveDoneRequest(formData)
    //         .then((response) => {
    //             if (response.status === 200 && response.data) {
    //                 const { message } = response.data;
    //                 setSuccessMessage(message || "Saved successfully");
    //                 setShowSuccessPopup(true);
    //                 setRequestButton(false);
    //                 setdoneButton(false);   
    //                 fetchData(); // ✅ now works
                    
    //             }
    //         })
    //         .catch((error) => console.error(error));
    // };

const handleDone = (id) => {
    const formData = [{ id }];
    saveDoneRequest(formData)
        .then((response) => {
            if (response.status === 200 && response.data) {
                const { message } = response.data;
                setSuccessMessage(message || "Saved successfully");
                setShowSuccessPopup(true);
                setSubmitButton(true)
                // Update only the clicked row
                setBoardFetch(prev =>
                    prev.map(row =>
                        row.id === id ? { ...row, is_done: "1" } : row
                    )
                );
            }
        })
        .catch((error) => console.error(error));
};



    return (
        <CommonDataTable
            columns={columns}
            data={data}
            page={page}
            perPage={perPage}
            totalRows={totalRows}
            loading={loading}
            onPageChange={setPage}       // ✅ correct
            onPerPageChange={setPerPage} // ✅ correct
        />)
}

export default ReworkerTypeBasedhide