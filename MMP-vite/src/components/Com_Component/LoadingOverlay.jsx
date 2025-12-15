import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const LoadingOverlay = ({ loading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(255,255,255,0.8)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div className="cube">
        <div></div><div></div><div></div><div></div>
      </div>

      <Typography variant="h6" sx={{ mt: 2, color: "#1976d2", fontWeight: "bold" }}>
        Loading... {progress}%
      </Typography>

      <style>
        {`
        .cube {
          width: 50px;
          height: 50px;
          position: relative;
          transform: rotateZ(45deg);
        }
        .cube div {
          position: absolute;
          width: 20px;
          height: 20px;
          background: #1976d2;
          animation: cubeMove 1.6s infinite ease-in-out;
        }
        .cube div:nth-child(1) { top: 0; left: 0; animation-delay: 0s; }
        .cube div:nth-child(2) { top: 0; right: 0; animation-delay: 0.2s; }
        .cube div:nth-child(3) { bottom: 0; right: 0; animation-delay: 0.4s; }
        .cube div:nth-child(4) { bottom: 0; left: 0; animation-delay: 0.6s; }

        @keyframes cubeMove {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.5); opacity: 0.5; }
        }
        `}
      </style>
    </Box>
  );
};

export default LoadingOverlay;
