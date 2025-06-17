import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

const CustomDialog = ({
    open,
    onClose,
    title,
    message,
    color = "primary",
    onConfirm, // optional, if you want to show "Confirm" and "Cancel" instead of just "OK"
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {
    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
                    onClose?.();
                }
            }}
            disableScrollLock
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                {onConfirm ? (
                    <>
                        <Button onClick={onConfirm} color={color}>
                            {confirmText}
                        </Button>
                        <Button onClick={onClose}>
                            {cancelText}
                        </Button>
                    </>
                ) : (
                    <Button onClick={onClose} color={color}>
                        OK
                    </Button>
                )}

            </DialogActions>
        </Dialog>
    )
}

export default CustomDialog;
