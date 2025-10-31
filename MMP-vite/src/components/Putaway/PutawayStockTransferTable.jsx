import React, { useState } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import {
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
    TableContainer,
    TextField,
    Autocomplete
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from "@mui/material";

const PutawayStockTransferTable = ({
    data = [],
    rackLocationList = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
    selectedRows1,
    setSelectedRows1,
    handleGRNQtyChange,
}) => {
    const [open, setOpen] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const [dialogRows, setDialogRows] = useState([]);
    const [savedRows, setSavedRows] = useState({}); // { rowId: [rows] }

    const handleOpen = (row) => {
        setActiveRow(row);
        setDialogRows(savedRows[row.id] || []); // load saved rows if any
        setOpen(true);
    };

    const handleAddRow = () => {
        setDialogRows(prev => [
            ...prev,
            { batch: "", fromLocation: "", availQty: "", qty: "", toLocation: "" }
        ]);
    };

    const handleRemoveRow = (idx) => {
        setDialogRows(prev => prev.filter((_, i) => i !== idx));
    };

    // const handleBatchChange = (idx, val) => {
    //     const fromLocation = activeRow?.location?.[0] || ""; // auto select first location for demo
    //     const availQty = activeRow?.availableQty?.[0] || 0;
    //     setDialogRows(prev => prev.map((r, i) => i === idx ? { ...r, batch: val, fromLocation, availQty } : r));
    // };
    const handleBatchChange = (idx, val) => {
        const batchIndex = activeRow?.batchcode?.indexOf(val);
        if (batchIndex === undefined || batchIndex === -1) return;

        const fromLocation = activeRow?.location?.[batchIndex] || "";
        const availQty = activeRow?.availableQty?.[batchIndex] || 0;

        setDialogRows(prev => prev.map((r, i) => i === idx ? { ...r, batch: val, fromLocation, availQty } : r));
    };

    const handleToLocChange = (idx, val) => {
        setDialogRows(prev => prev.map((r, i) => i === idx ? { ...r, toLocation: val } : r));
    };

    const handleQtyChange = (idx, val) => {
        const sanitizedValue = val.replace(/[^0-9]/g, "");
        setDialogRows(prev => prev.map((r, i) => i === idx ? { ...r, qty: sanitizedValue } : r));
    };

    // const handleSave = () => {
    //     let hasError = false;
    //     const username = sessionStorage.getItem("userName") || "System";

    //     const batchSums = {};

    //     for (const row of dialogRows) {
    //         const qty = Number(row.qty || 0);
    //         const avail = Number(row.availQty || 0);

    //         if (!row.batch) { alert("Select batch code for all rows"); hasError = true; break; }
    //         if (!row.toLocation) { alert(`Please select To Location for batch ${row.batch}`); hasError = true; break; }
    //         if (qty <= 0) { alert(`Enter quantity for batch ${row.batch}`); hasError = true; break; }
    //         if (qty > avail) { alert(`Entered quantity ${qty} exceeds available quantity ${avail} for batch ${row.batch}`); hasError = true; break; }

    //         batchSums[row.batch] = (batchSums[row.batch] || 0) + qty;
    //         if (batchSums[row.batch] > avail) { alert(`Total quantity for batch ${row.batch} exceeds available qty`); hasError = true; break; }
    //     }

    //     if (hasError) return;

    //     // Save rows in state
    //     setSavedRows(prev => {
    //         const updated = { ...prev, [activeRow.id]: [...dialogRows] };
    //         console.log("savedRows after save:", updated); // proper log
    //         return updated;
    //     });

    //     // Merge quantities for main table
    //     const putQtyDetails = {};
    //     const toLocationDetails = {};
    //     dialogRows.forEach(row => {
    //         putQtyDetails[row.fromLocation] = row.qty;
    //         toLocationDetails[row.fromLocation] = row.toLocation;
    //     });

    //     handleGRNQtyChange(activeRow.id, "putQtyDetails", putQtyDetails);
    //     handleGRNQtyChange(activeRow.id, "toLocationDetails", toLocationDetails);

    //     setOpen(false);
    // };

    const handleSave = () => {
        let hasError = false;
        const username = sessionStorage.getItem("userName") || "System";

        const batchSums = {};
        const batchLocSet = new Set(); // To track batchcode + toLocation combos

        for (const row of dialogRows) {
            const qty = Number(row.qty || 0);
            const avail = Number(row.availQty || 0);

            if (!row.batch) {
                alert("Select batch code for all rows");
                hasError = true;
                break;
            }
            if (!row.toLocation) {
                alert(`Please select To Location for batch ${row.batch}`);
                hasError = true;
                break;
            }
            if (qty <= 0) {
                alert(`Enter quantity for batch ${row.batch}`);
                hasError = true;
                break;
            }
            if (qty > avail) {
                alert(`Entered quantity ${qty} exceeds available quantity ${avail} for batch ${row.batch}`);
                hasError = true;
                break;
            }

            // Check for duplicate batch + toLocation
            const batchLocKey = `${row.batch}__${row.toLocation}`;
            if (batchLocSet.has(batchLocKey)) {
                alert(`Batch ${row.batch} already has To Location ${row.toLocation}. Duplicate not allowed.`);
                hasError = true;
                break;
            }
            batchLocSet.add(batchLocKey);

            batchSums[row.batch] = (batchSums[row.batch] || 0) + qty;
            if (batchSums[row.batch] > avail) {
                alert(`Total quantity for batch ${row.batch} exceeds available qty`);
                hasError = true;
                break;
            }
        }

        if (hasError) return;

        // Save rows in state
        setSavedRows(prev => {
            const updated = { ...prev, [activeRow.id]: [...dialogRows] };
            console.log("savedRows after save:", updated); // proper log
            return updated;
        });

        // Merge quantities for main table
        const putQtyDetails = {};
        const toLocationDetails = {};
        dialogRows.forEach(row => {
            putQtyDetails[row.fromLocation] = row.qty;
            toLocationDetails[row.fromLocation] = row.toLocation;
        });

        handleGRNQtyChange(activeRow.id, "putQtyDetails", putQtyDetails);
        handleGRNQtyChange(activeRow.id, "toLocationDetails", toLocationDetails);

        setOpen(false);
    };

    const handleClear = () => setOpen(false);

    const handleSelectAll1 = (e) => {
        if (e.target.checked) setSelectedRows1(data.map(r => r.id));
        else setSelectedRows1([]);
    };

    const handleSelect1 = (rowId) => {
        setSelectedRows1(prev => prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]);
    };

    const columns = generateColumns({
        fields: [
            "transferTicketNo",
            "TransferType",
            "OrderType",
            "Partcode",
            "Partdescription",
            "putQty",
            "location",
            "batchcode",
            "availableQty"
        ],
        customConfig: {
            Rec_ticket_no: { label: "Transfer TicketNo" },
            RequesterType: { label: "Transfer Type", },
            OrderType: { label: "OrderType" },
            Partcode: { label: "PartCode" },
            Partdescription: { label: "Part Description" },
            availableQty: { label: "Available Qty" },
            putQty: { label: "PUT Qty" },
            location: { label: "Location" },
            Batchcode: { label: "BatchCode" },
            //   createdon: { label: "Create Don" },
        },
        selectedRows: selectedRows1,
        handleSelect: handleSelect1,
        handleSelectAll: handleSelectAll1,
        customCellRenderers: {
            putQty: (row) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpen(row)}
                    sx={{
                        color: "white",
                        backgroundColor: row.putQtyDetails ? "brown" : "#1bd0a6ff",
                        borderColor: row.putQtyDetails ? "brown" : "green",
                        "&:hover": { backgroundColor: row.putQtyDetails ? "#8B4513" : "#3ef43eff" }
                    }}
                >
                    {row.putQtyDetails ? "Edit Qty" : "Add Qty"}
                </Button>
            )
        }
    });

    return (
        <>
            <CommonDataTable
                columns={columns}
                data={data}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                onChangePage={setPage}
                onChangeRowsPerPage={setPerPage}
            />

            <Dialog
                open={open}
                onClose={(e, reason) => reason !== "backdropClick" && setOpen(false)}
                disableEscapeKeyDown
                fullWidth
                maxWidth={false}
                PaperProps={{
                    sx: {
                        width: 1300,
                        border: '3px solid',
                        borderImage: 'linear-gradient(to bottom, #d27c19ff 50%, #afee39ff 50%) 1',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: 4,
                        bgcolor: '#f5f5f5',
                    }
                }}
            >
                <DialogTitle sx={{ bgcolor: '#2b8ac1ff', color: 'white', py: 1 }}>
                    Partcode: {activeRow?.Partcode}
                    <Button sx={{ ml: 2 }} variant="contained" size="small" onClick={handleAddRow}>Add</Button>
                </DialogTitle>

                <DialogContent dividers>
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px' }}>From Location</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px' }}>Batch Code</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px' }}>Available Qty</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px' }}>Quantity</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '13px' }}>To Location</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#cf2963ff', fontSize: '13px' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dialogRows.map((r, idx) => (
                                    <TableRow key={idx} sx={{ "&:nth-of-type(odd)": { bgcolor: "#f9f9f9" } }}>
                                        <TableCell>{r.fromLocation}</TableCell>
                                        <TableCell>
                                            <Autocomplete
                                                options={activeRow?.batchcode || []}
                                                value={r.batch}
                                                onChange={(e, val) => handleBatchChange(idx, val)}
                                                renderInput={(params) => <TextField {...params} size="small"
                                                    sx={{
                                                        width: '240px', // Adjust width
                                                        '& .MuiInputBase-input': {
                                                            fontSize: '13px',
                                                            fontWeight: 'bold'
                                                        },
                                                    }}
                                                />}
                                            />
                                        </TableCell>
                                        <TableCell>{r.availQty}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="text"
                                                value={r.qty || ""}
                                                onChange={(e) => handleQtyChange(idx, e.target.value)}
                                                size="small"
                                                sx={{
                                                    width: '130px', // Adjust width
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '13px',
                                                        fontWeight: 'bold'
                                                    },
                                                }}
                                                placeholder="Qty"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Autocomplete
                                                options={rackLocationList || []}
                                                value={r.toLocation}
                                                onChange={(e, val) => handleToLocChange(idx, val)}
                                                renderInput={(params) => <TextField {...params}
                                                    // sx={{ width: '170px' ,fontSize:"10px"}} 
                                                    sx={{
                                                        width: '170px', // Adjust width
                                                        '& .MuiInputBase-input': {
                                                            fontSize: '13px',
                                                            fontWeight: 'bold'
                                                        },
                                                    }}
                                                    size="small" />}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleRemoveRow(idx)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>

                <DialogActions>
                    <Button sx={{fontSize: '13px'}} onClick={handleClear}>Cancel</Button>
                    <Button variant="contained" sx={{fontSize: '13px'}} onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PutawayStockTransferTable;
