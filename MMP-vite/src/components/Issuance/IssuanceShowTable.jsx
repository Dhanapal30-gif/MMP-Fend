import React, { useMemo, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField } from "@mui/material";
import CommonAddDataTable from "../../components/Com_Component/CommonAddDataTable";
import { generateColumns } from "../../components/Com_Component/generateColumns";
import { fetchpickTicketDetails, saveIssueBatchcodeQty } from "../../Services/Services-Rc";
import { FaPrint } from "react-icons/fa";


const IssuanceShowTable = ({
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
  handleSaveQty,
  setShowErrorPopup,
  setErrorMessage,
  setShowSuccessPopup,
  setSuccessMessage,
  formData,
  setFormData,
  fetchPickTicketDetail,
  ticketNo
}) => {

  const [open, setOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [locationQty, setLocationQty] = useState({}); // {loc1: 5, loc2: 3}
  const [issuedComments, setIssuedComments] = useState({}); // {loc1: 5, loc2: 3}
  const [nsn, setNSN] = useState({}); // {loc1: 5, loc2: 3}

  const handleOpen = (row) => {
    setActiveRow(row);

    const init = {};
    const initComments = {};
    const initNSN = {};

    // If savedQty exists, use it as default, else empty string
    row.batches.forEach(batch => {
      const savedBatch = row.batchesQty?.find(
        bq => bq.batchCode === batch.batchCode && bq.location === batch.location
      );
      init[batch.location] = savedBatch ? savedBatch.savedQty : "";
      initComments[batch.location] = savedBatch ? savedBatch.issued_comments : "";
      initNSN[batch.location] = savedBatch ? savedBatch.nsn : "";
    });

    setLocationQty(init);
    // setActiveRow(prev => ({ ...row, batchesQty: [] }));
    setIssuedComments(initComments); // new state
    setNSN(initNSN);                 // new state
    setFormData(prev => ({ ...prev, Comments: row.batchesQty?.[0]?.issued_comments, newSerialNumber: row.batchesQty?.[0]?.nsn || "" }));

    setOpen(true);
  };


  const handleSave = async () => {
    const hasQty = Object.values(locationQty).some(val => val && Number(val) > 0);
    if (activeRow?.requestertype?.toLowerCase() === "submodule") {
      
      const hasSerial = formData.newSerialNumber && formData.newSerialNumber.trim() !== "";
      if (!hasSerial) {
        setErrorMessage("Please enter New Serial Number!");
        setShowErrorPopup(true);
        return;
      }
    }
    if (!hasQty) {
      // alert("Please enter quantity for at least one location!");
      setErrorMessage("Please enter quantity for location!")
      setShowErrorPopup(true)
      return;
    }


    // Prepare payload
    const payload = Object.keys(locationQty).map(loc => ({
      location: loc,
      issueqty: Number(locationQty[loc] || 0),
      batchcode: activeRow?.batches?.find(b => b.location === loc)?.batchCode || "",
      partcode: activeRow?.partcode || "",
      issued_comments: formData.Comments,
      nsn: formData.newSerialNumber,
      rtn: activeRow?.rec_ticket_no || "", // <-- added here
      createdby: sessionStorage.getItem("userId") || "System",
      updatedby: sessionStorage.getItem("userId") || "System"

    }));

    console.log("Payload to send:", payload);
    try {
      await saveIssueBatchcodeQty(payload); // API call
      // alert("Submitted successfully!");
      setSuccessMessage("Submitted successfully!")
      setShowSuccessPopup(true)
      // fetchPickTicketDetail();
      fetchPickTicketDetail(activeRow?.rec_ticket_no);
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



  // Determine visible fields dynamically
  const visibleFields = useMemo(() => {
    if (data.some(row => row.requestertype === "PTL")) {
      return [
        "rec_ticket_no",
        "requestertype",
        "partcode",
        "partdescription",
        "UOM",
        "componentType",
        "batchCode",
        "location",
        "putQty",
        "allocatedQty",
        "approvedQty",
        // "Comment",
        "createdby",
        "createdon",
        "recordstatus",
        "approver1"
      ]; // only fields you want for PTL
    } else {
      return [
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
      ]; // all fields for others
    }
  }, [data]);

  const columns = generateColumns({
    fields: visibleFields,
    customConfig: {
      rec_ticket_no: { label: "Request TicketNo" },
      requestertype: { label: "Requester Type" },
      partcode: { label: "PartCode" },
      partdescription: { label: "Part Description" },
      productname: { label: "Product Name" },
      productgroup: { label: "Product Group" },
      productfamily: { label: "Product Family" },
      componentType: { label: "Component Type" },
      compatabilitypartcode: { label: "Compatability PartCode" },
      req_qty: { label: "Req Qty" },
      batchCode: { label: "BatchCode" },
      location: { label: "Location" },
      putQty: { label: "PUT Qty" },
      allocatedQty: { label: "Allocated Qty" },
      approvedQty: { label: "Approved Qty" },
      Comment: { label: "Comment" },
      recordstatus: { label: "Status" },
    },
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
const printCleanTable = () => {
  if (!data || data.length === 0) return;

  // Flatten data for printing
  const flatData = data.flatMap(row =>
    row.batches?.map(batch => ({
      rec_ticket_no: row.rec_ticket_no,
      requestertype: row.requestertype,
      productname: row.productname,
      productgroup: row.productgroup,
      productfamily: row.productfamily,
      partcode: row.partcode,
      partdescription: row.partdescription,
      UOM: row.UOM,
      componentType: row.componentType,
      compatabilitypartcode: row.compatabilitypartcode,
      req_qty: row.req_qty,
      batchCode: batch.batchCode,
      location: batch.location,
      putQty: batch.putQty || "",
      allocatedQty: batch.allocatedQty,
      approvedQty: row.approvedQty,
      Comment: row.Comments || "",
      recordstatus: row.recordstatus
    })) || [row]
  );

  const allFields = Object.keys(flatData[0]).filter(
    f => !["putQty", "Comment", "recordstatus", "componentType"].includes(f)
  );

  const tableHTML = `
    <html>
      <head>
        <title>Print Issuance Table</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; table-layout: auto; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; white-space: nowrap; }
          th { background: #1976d2; color: white; font-weight: bold; }
          h3 { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h3>Issuance Report</h3>
        <table>
          <thead>
            <tr>
              ${allFields.map(f => `<th>${f}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${flatData.map(row => `
              <tr>
                ${allFields.map(f => `<td>${row[f] ?? ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=1600,height=900,scrollbars=yes');
  printWindow.document.write(tableHTML);
  printWindow.document.close();
  printWindow.print();
};

  return (
    <>
     
       <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                        <button
  onClick={printCleanTable}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "linear-gradient(90deg, #1976d2, #42a5f5)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.05)";
    e.currentTarget.style.boxShadow = "0 6px 10px rgba(0,0,0,0.15)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
  }}
>
  <FaPrint /> 
</button>

                       
                    </div>
      <CommonAddDataTable
        columns={columns}
        data={normalizedData}
        progressPending={loading}
        totalRows={totalRows}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

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
            // width: 1200,       // custom width in px
            width: activeRow?.requestertype ?.toLowerCase() === "submodule" ? 1200 : 970, // dynamic width
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
          <span>
            {activeRow?.requestertype?.toLowerCase() === "submodule" && (

              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: 'yellow', marginTop: '-5px' }}>
                New Serial Number
                <input
                  type="text"
                  name="newSerialNumber"
                  placeholder="New Serial Number"
                  value={formData.newSerialNumber || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, newSerialNumber: e.target.value }))}
                  style={{ padding: '9px', borderRadius: '4px', fontSize: "12px", marginTop: "-1px", border: '1px solid #ccc', width: '250px' }}
                />
              </label>
            )}
          </span>
          {/* <span>Issue</span> */}
          {/* <span>
            <TableCell>
              <input
                type="text"
                name="Comments"
                placeholder="Comments"
                  value={formData.Comments || ""} // <-- use formData or a dedicated state
                onChange={(e) => setFormData(prev => ({ ...prev, Comments: e.target.value }))}
                style={{ padding: '9px', borderRadius: '4px', fontSize: "12px", marginTop: "-19px", border: '1px solid #ccc', width: '250px' }}
              />
            </TableCell>
          </span> */}
          <span>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: 'yellow', marginTop: '-5px' }}>
              Comments
              <input
                type="text"
                name="Comments"
                placeholder="Comments"
                value={formData.Comments || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, Comments: e.target.value }))}
                style={{ padding: '9px', borderRadius: '4px', fontSize: "12px", marginTop: "-1px", border: '1px solid #ccc', width: '250px' }}
              />
            </label>
          </span>

          <span>Approved Qty: {activeRow?.approvedQty}</span>

        </DialogTitle>

        <DialogContent dividers>
          <TableContainer sx={{ maxHeight: 290 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px', padding: '5px', width: '15%' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px', width: '15%' }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px', width: '15%' }}>Issue Qty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px', width: '15%' }}>Available Qty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px', width: '15%' }}>BatchCode</TableCell>
                  {/* {activeRow?.requestertype === "Submodule" && (
                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px', width: '15%' }}>New Serial Number</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px', width: '15%' }} >Comments</TableCell> */}

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
                                // alert(`Cannot exceed allocated qty (${batch.allocatedQty}) for this batch`);
                                setErrorMessage(`Cannot exceed allocated qty (${batch.allocatedQty}) for this batch`)
                                setShowErrorPopup(true);
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
                      {/* {activeRow?.requestertype === "Submodule" && (
                        <TableCell>
                          <input
                            type="text"
                            name="newSerialNumber"
                            placeholder="New Serial Number"
                            onChange={(e) => setFormData(prev => ({ ...prev, newSerialNumber: e.target.value }))}
                            style={{ padding: '9px', borderRadius: '4px', fontSize: "12px", marginTop: "7px", border: '1px solid #ccc', width: '100%' }}
                          />
                        </TableCell>
                      )} */}
                      {/* <TableCell>
                        <input
                          type="text"
                          name="Comments"
                          placeholder="Comments"
                          onChange={(e) => setFormData(prev => ({ ...prev, Comments: e.target.value }))}
                          style={{ padding: '9px', borderRadius: '4px', fontSize: "12px", marginTop: "7px", border: '1px solid #ccc', width: '100%' }}
                        />
                      </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button sx={{ fontSize: '13px' }} onClick={() => setOpen(false)} >Cancel</Button>
          <Button variant="contained" sx={{ fontSize: '13px' }} onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IssuanceShowTable;
