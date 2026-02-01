import React from 'react'
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumnshidecheckbox } from '../../components/Com_Component/generateColumnshidecheckbox';
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
    fetchData,
    setSuccessMessage,
    setShowSuccessPopup,
    setRequestButton,
    doneButton,
    setdoneButton,
      setSelectedGrnRows,
  selectedGrnRows,
    isFrozen = { isFrozen },
    setBoardFetch,
    setSubmitButton,
    setLoading
}) => {

const requestedQtyInitRef = React.useRef(false);

React.useEffect(() => {
  if (requestedQtyInitRef.current) return;
  if (!data?.length) return;

  requestedQtyInitRef.current = true;

  setBoardFetch(prev =>
    prev.map(row => ({
      ...row,
      RequestedQty: row.pickingqty
    }))
  );
}, [data, setBoardFetch]);


//    const handleGrnSelectAll = () => {
//     if (selectedGrnRows.length === data.length) {
//         setSelectedGrnRows([]);
//     } else {
//         setSelectedGrnRows(data.map((row) => row.id));
//     }
// };

const handleGrnSelectAll = () => {
    const notDoneRows = data.filter(row => row.is_done !== 1).map(row => row.id);

    if (selectedGrnRows.length === notDoneRows.length) {
        setSelectedGrnRows([]); // deselect all
    } else {
        setSelectedGrnRows(notDoneRows); // select only not-done rows
    }
};


const handleGrnSelect = (rowSelectedId) => {
    setSelectedGrnRows((prev) =>
        prev.includes(rowSelectedId)
            ? prev.filter((id) => id !== rowSelectedId)
            : [...prev, rowSelectedId]
    );
};

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return data.slice(start, end);
}, [data, page, perPage]);


    const columns = generateColumnshidecheckbox({
        fields: [
            "productname",
            "boardserialnumber",
            "partcode",
            "partdescription",
            "racklocation",
            "repairercomments",
            "availableqty",
            "RequestedQty",
            "pickingqty",
            "pickedqty",
            // "Submit",
            // "Status",
            "repairerName"

        ],
        customConfig: {
            productname: { label: "Product Name" },
            boardserialnumber: { label: "Board Serial Number" },
            partcode: { label: "partCode" },
            partdescription: { label: "Part Description" },
            racklocation: { label: "ReackLocation" },
            availableqty: { label: "Available Qty" },
            RequestedQty: { label: "Requested Qty" },
            pickingqty: { label: "Picking Qty" },
            pickedqty: { label: "picked Qty" },
            repairercomments:{ label: "Repairer Comments"},
            repairerName: { label: "Repairer Name"}

        },
         data,  
selectedRows: selectedGrnRows,
      handleSelect: handleGrnSelect,
      handleSelectAll: handleGrnSelectAll,
        customCellRenderers: {
            RequestedQty: (row) => row.RequestedQty,


            pickingqty: (row) => (
                <TextField
                    type="number"
                    value={row.pickingqty || ""}
                    onChange={(e) => {
                         if (isFrozen) return;
                        const inputValue = e.target.value; // keep as string for empty handling
                        const max = Number(row.availableqty || 0);
                        if (inputValue === "") {
                            handleQtyChange(row.id, ""); // allow clearing input
                        } else if (Number(inputValue) <= max) {
                            handleQtyChange(row.id, Number(inputValue));
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

            /*
            Submit: (row) => (
                <div className="ReworkerButton9">
                    {row.is_done === "0" || row.is_done === null ? (
                        <button
                            style={{ backgroundColor: 'blue', color: 'white', marginTop: '15px' }}
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



            */


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
        setLoading(true)
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
          .catch((error) => console.error(error))
.finally(() => {
    setLoading(false);
});
    };



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

export default ReworkerTable