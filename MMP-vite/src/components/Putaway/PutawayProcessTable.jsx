import React, { useState } from 'react';
import CommonAddDataTable from '../../components/Com_Component/CommonAddDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import {
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer
} from "@mui/material";

const PutawayProcessTable = ({
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
    setErrorMessage,
    setShowErrorPopup
}) => {
    const [open, setOpen] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const [locationQty, setLocationQty] = useState({}); // {loc1: 5, loc2: 3}

    const handleOpen = (row) => {
        setActiveRow(row);
        // preload existing values if any
        const parts = row.location?.split(",") || [];
        const init = {};
        parts.forEach(loc => {
            init[loc.trim()] = row.putQtyDetails?.[loc.trim()] || "";
        });
        setLocationQty(init);
        setOpen(true);
    };

    const handleSave = () => {
        // check if at least one location has a qty
        const hasQty = Object.values(locationQty).some(val => val && Number(val) > 0);
        if (!hasQty) {
            setErrorMessage("Please enter quantity for at least one location!");
            setShowErrorPopup(true)
            return;
        }

        handleGRNQtyChange(activeRow.selectedid, "putQtyDetails", locationQty);
        setOpen(false);
    };

    const handlePageChange = (page) => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        setPage(page);
    };

    const handleSelectAll1 = (e) => {
        if (e.target.checked) {
            setSelectedRows1(data.map((row) => row.id));
        } else {
            setSelectedRows1([]);
        }
    };

    const handleSelect1 = (rowkey) => {
        setSelectedRows1((prevSelectedRows) => {
            const isRowSelected = prevSelectedRows.includes(rowkey);
            return isRowSelected
                ? prevSelectedRows.filter((key) => key !== rowkey)
                : [...prevSelectedRows, rowkey];
        });
    };

    const columns = generateColumns({
        fields: [
            "recevingTicketNo",
            "partcode",
            "partdescription",
            "UOM",
            "recevingQty",
            "GRNQty",
            "location",
            "putQty",
            "ponumber",
            "poDate",
            "vendorname",
            "postingdate",
            "GRNo",
            "GRNQty",
            "Status",
            // "createdon",
            // "showDetail"
        ],
         customConfig: {
      recevingTicketNo: { label: "Receving TicketNo" },
      location: { label: "Location", },
      partcode: { label: "PartCode" },
      partdescription: { label: "Part Description" },
      ponumber: { label: "PO Number" },
      poDate: { label: "PO Date" },
      vendorname: { label: "Vendor Name" },
      postingdate: { label: "Postin Date" },
      recevingQty: { label: "Receving Qty" },
      GRNQty: { label: "GRN Qty" },
      putqty: { label: "PUT Qty" },
      GRNo: { label: "GRN No" },
      Status: { label: "Status" },
    //   createdon: { label: "Create Don" },
    },
        selectedRows: selectedRows1,
        handleSelect: handleSelect1,
        handleSelectAll: handleSelectAll1,
        customCellRenderers: {
                Status: (row) => row.Status || "Pending",

             location: (row) => {
  if (!row.location) return "";
  const value = Array.isArray(row.location)
    ? row.location.join(",")
    : String(row.location);

  const parts = value.split(",");
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {parts.map((loc, i) => (
        <span key={i}>{loc.trim()}</span>
      ))}
    </div>
  );
},
            // location: (row) => {
            //     if (!row.location) return "";
            //     const parts = row.location.split(",");
            //     return (
            //         <div style={{ display: "flex", flexDirection: "column" }}>
            //             {parts.map((loc, i) => (
            //                 <span key={i}>{loc.trim()}</span>
            //             ))}
            //         </div>
            //     );
            // },

            // putQty: (row) => (
            //     <Button variant="outlined" size="small" onClick={() => handleOpen(row)}>
            //         {row.putQtyDetails ? "Edit Qty" : "Add Qty"}
            //     </Button>
            // ),

            putQty: (row) => {
                const isEdit = !!row.putQtyDetails; // true → Edit Qty
                return (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpen(row)}
                        sx={{
                            color: "white",
                            backgroundColor: isEdit ? "brown" : "#1bd0a6ff",  // brown for edit, green for add
                            borderColor: isEdit ? "brown" : "green",
                            "&:hover": {
                                backgroundColor: isEdit ? "#8B4513" : "#3ef43eff"
                            }
                        }}
                    >
                        {isEdit ? "Edit Qty" : "Add Qty"}
                    </Button>
                );
            },

        }
    });

    return (
        <>
            <CommonAddDataTable
                columns={columns}
                data={data}
                progressPending={loading}
                totalRows={totalRows}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
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
                disableEscapeKeyDown // optionalmaxWidth={false} 
                maxWidth={false}

                fullWidth
                PaperProps={{
                    sx: {
                        width: 900,
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
                    <span>Good Qty: {activeRow?.GRNQty}</span>
                    <span>BatchCode: {activeRow?.rcbatchcode}</span>
                    <span>Put Qty: {activeRow?.Allowed_putqty}</span>

                </DialogTitle>

                <DialogContent dividers>
                    <TableContainer sx={{ maxHeight: 290 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Location</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Quantity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(locationQty).map((loc) => {
                                    const totalEntered = Object.values(locationQty)
                                        .reduce((acc, val) => acc + Number(val || 0), 0);

                                    const remainingQty = activeRow?.GRNQty - totalEntered + Number(locationQty[loc] || 0);
                                    const disabled = remainingQty <= 0; // freeze remaining locations

                                    return (
                                        <TableRow
                                            key={loc}
                                            sx={{
                                                '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' },
                                                bgcolor: disabled ? '#ffcdd2' : 'inherit',
                                            }}
                                        >
                                            <TableCell>{loc}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={locationQty[loc] || ""} // ✅ show empty string if no value
                                                    onChange={(e) => {
                                                        let val = e.target.value;

                                                        // allow empty string or numbers only
                                                        if (val === "" || /^\d*$/.test(val)) {
                                                            // check individual value doesn't exceed GRNQty
                                                            const numVal = val === "" ? 0 : Number(val);
                                                            if (numVal > activeRow?.Allowed_putqty) {
                                                                setErrorMessage(`Value cannot exceed Allowed_putqty (${activeRow?.Allowed_putqty})`);
                                                                setShowErrorPopup(true)
                                                                return;
                                                            }

                                                            // check total doesn't exceed GRNQty
                                                            const currentTotal = Object.values(locationQty).reduce(
                                                                (acc, v) => acc + Number(v || 0),
                                                                0
                                                            );
                                                            if (currentTotal - Number(locationQty[loc] || 0) + numVal > activeRow?.GRNQty) {
                                                                alert(`Total entered qty cannot exceed GRN Qty (${activeRow?.GRNQty})`);
                                                                return;
                                                            }

                                                            setLocationQty((prev) => ({ ...prev, [loc]: val }));
                                                        }
                                                    }}
                                                    inputProps={{
                                                        min: 0,
                                                        max: remainingQty,
                                                        disabled,
                                                    }}
                                                    size="small"
                                                    sx={{
                                                        width: '47%',
                                                        borderRadius: 2,
                                                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                                                        bgcolor: disabled ? '#ffcdd2' : 'inherit',
                                                    }}
                                                />
                                            </TableCell>
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

export default PutawayProcessTable;