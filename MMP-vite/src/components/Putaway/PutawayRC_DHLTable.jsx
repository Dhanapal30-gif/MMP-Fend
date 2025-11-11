import React, { useMemo, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField } from "@mui/material";
import CommonAddDataTable from "../../components/Com_Component/CommonAddDataTable";
import { generateColumns } from "../../components/Com_Component/generateColumns";

const PutawayRC_DHLTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
    setShowErrorPopup,
    setErrorMessage,
    handleGRNQtyChange,
    selectedRows1,
    setSelectedRows1,
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
        const hasQty = Object.values(locationQty).some(val => val && Number(val) > 0);
        if (!hasQty) {
            setErrorMessage("Please enter quantity for at least one location!");
            setShowErrorPopup(true);
            return;
        }

        // update parent
        handleGRNQtyChange(activeRow.selectedid, "putQtyDetails", locationQty);
        activeRow.putQtyDetails = { ...locationQty };
        setOpen(false);
    };

    const safeData = Array.isArray(data) ? data : [];

    const normalizedData = useMemo(() => {
        return safeData.map((row, index) => ({
            ...row,
            id: row.selectedId ?? row.selectedid ?? index, // Use `id`, table expects `id`
            batchCode: row.batches?.map(b => b.batchCode).join(", ") || "",
            location: row.batches?.map(b => b.location).join(", ") || "",
            allocatedQty: row.batches?.map(b => b.allocatedQty).join(", ") || "",
            putQty: "",
        }));
    }, [safeData]);

    // SELECT ALL
    const handleSelectAll1 = (e) => {
        if (e.target.checked) {
            setSelectedRows1(normalizedData.map(row => row.id));
        } else {
            setSelectedRows1([]);
        }
    };

    // SELECT SINGLE ROW
    const handleSelect1 = (rowId) => {
        setSelectedRows1(prev => {
            if (prev.includes(rowId)) {
                return prev.filter(id => id !== rowId);
            } else {
                return [...prev, rowId];
            }
        });
    };


    // console.log("selectedRows1:", selectedRows1)


    const columns = generateColumns({
        fields: [
            "rec_ticket_no",
            "requestertype",
            "ordertype",
            "partcode",
            "partdescription",
            "inventory_box_no",
            "UOM",
            "componenttype",
            "approvedQty",
            "req_qty",
            "batchCode",
            "location",
            "putQty",
            "allocatedQty",
            "approvedQty",
            "recordstatus"

        ],
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
        selectedRows: selectedRows1,
        handleSelect: handleSelect1,
        handleSelectAll: handleSelectAll1,
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
                const isEdit = !!row.putQtyDetails; // true → Edit Qty

                const hasDefaultQty = row.batchesQty?.some(bq => bq.savedQty > 0);
                return (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpen(row)}
                        sx={{
                            color: "white",
                            backgroundColor: isEdit ? "#e96929ff" : "#1bd0a6ff",  // brown for edit, green for add
                            borderColor: isEdit ? "brown" : "green",
                            "&:hover": {
                                backgroundColor: isEdit ? "#8B4513" : "#3ef43eff"
                            }
                        }}
                    >
                        {isEdit ? "Edit Qty" : "Add Qty"}
                    </Button>
                );
            }

        }
    });


    return (
        <>
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
                        width: activeRow?.requestertype === "Submodule" ? 1200 : 970, // dynamic width
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
                    <span>Inventory Box No: {activeRow?.inventory_box_no}</span>

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

export default PutawayRC_DHLTable;
