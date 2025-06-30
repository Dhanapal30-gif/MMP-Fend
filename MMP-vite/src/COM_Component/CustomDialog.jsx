import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from "@mui/material";

const CustomDialog = ({
  open,
  onClose,
  title,
  message,
  color = "primary",
  severity = "info", // ✅ new prop: "success", "error", etc.
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  const messageColor = {
    success: "green",
    error: "red",
    info: "#1976d2", // MUI primary blue
    warning: "#ed6c02"
  }[severity] || "black";

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
        <DialogContentText sx={{ color: messageColor }}>
          {message}
        </DialogContentText>
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
  );
};

export default CustomDialog;
