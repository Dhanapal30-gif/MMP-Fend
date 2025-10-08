import React, { useMemo, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField } from "@mui/material";
import CommonDataTable from "../../components/Com_Component/CommonDataTable";
import { generateColumns } from "../../components/Com_Component/generateColumns";
import { saveIssueBatchcodeQty } from "../../Services/Services-Rc";


const IssuanceShowTable =  ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
    selectedRows1,
    setSelectedRows1,
    formErrors,
    handleGRNQtyChange,

    handleSaveQty
}) => {

   const [open, setOpen] = useState(false);
      const [activeRow, setActiveRow] = useState(null);
      const [locationQty, setLocationQty] = useState({}); // {loc1: 5, loc2: 3}
  
  const handleOpen = (row) => {
    setActiveRow(row);

    const init = {};

    // If savedQty exists, use it as default, else empty string
    row.batches.forEach(batch => {
        const savedBatch = row.batchesQty?.find(
            bq => bq.batchCode === batch.batchCode && bq.location === batch.location
        );
        init[batch.location] = savedBatch ? savedBatch.savedQty : "";
    });

    setLocationQty(init);
    setOpen(true);
};



const handleSave = async () => {
  const hasQty = Object.values(locationQty).some(val => val && Number(val) > 0);
  if (!hasQty) {
    alert("Please enter quantity for at least one location!");
    return;
  }

  // Prepare payload
  const payload = Object.keys(locationQty).map(loc => ({
    location: loc,
    issueqty: Number(locationQty[loc] || 0),
    batchcode: activeRow?.batches?.find(b => b.location === loc)?.batchCode || "",
    partcode: activeRow?.partcode || "",
  rtn: activeRow?.rec_ticket_no || ""  // <-- added here
  }));

  console.log("Payload to send:", payload);
             try {
    await saveIssueBatchcodeQty(payload); // API call
    alert("Submitted successfully!");
    setOpen(false);
  } catch (error) {
    console.error("Error submitting payload:", error);
    alert("Failed to submit. Please try again.");
  }

  // Call your API here
  // api.saveLocationQty(payload);

  setOpen(false);
};



 const normalizedData = useMemo(() => {
  return data.map((row) => ({
    ...row,
    batchCode: row.batches?.map((b) => b.batchCode).join(", ") || "",
    location: row.batches?.map((b) => b.location).join(", ") || "",
    allocatedQty: row.batches?.map((b) => b.allocatedQty).join(", ") || "",
    putQty: "", // <-- must exist for column to render
  }));
}, [data]);

 const columns = generateColumns({
    fields: [
        "rec_ticket_no",
        "requestertype",
        "productname",
        "productgroup",
        "productfamily",
        "partcode",
        "partdescription",
        "UOM",
        "componentType",
        "compatabilitypartcode",
        "req_qty",
        "batchCode",
        "location",
        "putQty",
        "allocatedQty",
        "approvedQty",
        "Comment",
        "recordstatus"
    ],
    customCellRenderers: {
        location: (row) => {
            if (!row.location) return "";
            const parts = row.location.split(",");
            return (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {parts.map((loc, i) => {
                        const trimmedLoc = loc.trim();
                        const isR = trimmedLoc.startsWith("R");
                        return (
                            <span
                                key={i}
                                style={{
                                    backgroundColor: isR ? "inherit" : "saddlebrown",
                                    color: isR ? "inherit" : "white",
                                    padding: "2px 4px",
                                    borderRadius: "3px",
                                    marginBottom: "2px",
                                    display: "inline-block"
                                }}
                            >
                                {trimmedLoc}
                            </span>
                        );
                    })}
                </div>
            );
        },

       putQty: (row) => {
    const hasDefaultQty = row.batchesQty?.some(bq => bq.savedQty > 0);
    return (
        // <Button variant="outlined" size="small" onClick={() => handleOpen(row)}>
        //     {hasDefaultQty ? "Edit Qty" : "Add Qty"}
        // </Button>

        <Button
              variant="outlined"
              size="small"
              onClick={() => handleOpen(row)}
              sx={{
                color: "white",
                backgroundColor: hasDefaultQty ? "#e96929ff" : "#1bd0a6ff",  // brown for edit, green for add
                borderColor: hasDefaultQty ? "brown" : "green",
                "&:hover": {
                  backgroundColor: hasDefaultQty ? "#8B4513" : "#3ef43eff"
                }
              }}
            >
              {hasDefaultQty ? "Edit Qty" : "Add Qty"}
            </Button>
    );
}

    }
});


  return (
    <>
       <CommonDataTable
                columns={columns}
                data={normalizedData}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                onChangePage={setPage}
                onChangeRowsPerPage={setPerPage}
            />

            {/* ✅ Popup with Table */}
            <Dialog
                open={open}
                onClose={(event, reason) => {
        // Only close on Cancel button, ignore backdrop click or escape
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
        }
        setOpen(false);
    }}
    disableEscapeKeyDown // optional
  maxWidth={false}     
                fullWidth
                PaperProps={{
                    sx: {
                            width: 900,       // custom width in px

                        border: '3px solid', // border width required
                        borderImage: 'linear-gradient(to bottom, #d27c19ff 50%, #afee39ff 50%) 1', // top 50% blue, bottom 50% green
                        borderRadius: 3,              // rounded corners
                        overflow: 'hidden',
                        boxShadow: 4,
                        bgcolor: '#f5f5f5',           // light background for day theme
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: '#2b8ac1ff', // header color
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 15,
                        py: 1,
                        display: 'flex',
                        justifyContent: 'space-between', // push content to ends
                        alignItems: 'center',
                    }}
                >
                    <span>Partcode: {activeRow?.partcode}</span>
                                        <span>Issue</span>

                    <span>Approved Qty: {activeRow?.approvedQty}</span>

                </DialogTitle>

                <DialogContent dividers>
  <TableContainer sx={{ maxHeight: 290 }}>
    <Table size="small" stickyHeader>
      <TableHead>
  <TableRow sx={{ bgcolor: '#e3f2fd' }}>
    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '20%' }}>Location</TableCell>
    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '20%' }}>Quantity</TableCell>
    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '20%' }}>Issue Qty</TableCell>
    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '20%' }}>Available Qty</TableCell>
    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '20%' }}>BatchCode</TableCell>
  </TableRow>
</TableHead>

      <TableBody>
        {activeRow?.batches?.map((batch, idx) => {
          const remainingQty = activeRow?.GRNQty - Object.values(locationQty).reduce((acc, v) => acc + Number(v || 0), 0) + Number(locationQty[batch.location] || 0);
          const disabled = remainingQty <= 0;

          return (
            <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' }, bgcolor: disabled ? '#ffcdd2' : 'inherit' }}>
              <TableCell>{batch.location}</TableCell>
              <TableCell>
  <TextField
  type="number"
  value={locationQty[batch.location] || ""}
  onChange={(e) => {
    let val = e.target.value;
    if (val === "" || /^\d*$/.test(val)) {
      const numVal = val === "" ? 0 : Number(val);
      
      // Don't allow more than allocatedQty
      if (numVal > batch.allocatedQty) {
        alert(`Cannot exceed allocated qty (${batch.allocatedQty}) for this batch`);
        return;
      }

      setLocationQty(prev => ({ ...prev, [batch.location]: val }));
    }
  }}
  inputProps={{
    min: 0,
    max: batch.allocatedQty, // max restriction for input
  }}
  size="small"
  sx={{ width: '110px', borderRadius: 2 }}
/>

</TableCell>

              <TableCell>{batch.allocatedQty}</TableCell>
              <TableCell>{batch.AvailableQty}</TableCell>
              <TableCell>{batch.batchCode}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
</DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>


    </>
  );
};

export default IssuanceShowTable;
