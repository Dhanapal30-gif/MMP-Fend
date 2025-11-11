import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Slide, Box
} from "@mui/material";
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';

const Transition = React.forwardRef((props, ref) => <Slide direction="down" ref={ref} {...props} />);

const iconMap = {
  success: <CheckCircle className="glow-icon" sx={{ color: 'green', fontSize: 36, mr: 1 }} />,
  error: <Error className="glow-icon" sx={{ color: 'red', fontSize: 36, mr: 1 }} />,
  info: <Info className="glow-icon" sx={{ color: '#1976d2', fontSize: 36, mr: 1 }} />,
  warning: <Warning className="glow-icon" sx={{ color: '#ed6c02', fontSize: 36, mr: 1 }} />,
};

const CustomDialog = ({
  open,
  onClose,
  title,
  message,
  severity = "info",
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  return (
    <>
      <style>
        {`
          .glow-box {
            animation: glow 1.5s infinite alternate;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
          }

          @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(0,0,0,0.2); }
            50% { box-shadow: 0 0 15px rgba(0,0,0,0.5); }
            100% { box-shadow: 0 0 25px rgba(0,0,0,0.8); }
          }

          .glow-icon {
            animation: pulse 1.2s infinite alternate;
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      <Dialog
        open={open}
        onClose={(e, reason) => { if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') onClose?.(); }}
        TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 380, overflow: 'hidden' } }}
        disableScrollLock
      >
        {/* Header with glowing effect */}
        <Box className="glow-box" sx={{ bgcolor: '#f0f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {iconMap[severity]}
          <DialogTitle sx={{ m: 0, p: 0 }}>{title}</DialogTitle>
        </Box>

        {/* Animated content */}
        <DialogContent sx={{ p: 2, textAlign: 'center', overflow: 'hidden' }}>
  <DialogContentText sx={{ fontSize: 14, color: 'text.primary', animation: 'pulse 2s infinite alternate' }}>
    {message}
  </DialogContentText>
</DialogContent>


        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          {onConfirm ? (
            <>
              <Button
                variant="contained"
                color={severity === 'success' ? 'success' : severity === 'error' ? 'error' : 'primary'}
                onClick={onConfirm}
                sx={{ textTransform: 'none', animation: 'pulse 1.5s infinite alternate' }}
              >
                {confirmText}
              </Button>
              <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
                {cancelText}
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              variant="contained"
              color={severity === 'success' ? 'success' : severity === 'error' ? 'error' : 'primary'}
              // sx={{ textTransform: 'none', animation: 'pulse 1.5s infinite alternate' }}
            >
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomDialog;
