import React from "react";
import { Box } from "@mui/material";

const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box
        sx={{
          position: "absolute",
          top: -50,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(2px)",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
<Box className="walker">
  <span style={{ fontSize: "48px" }}>🚶‍♂️</span>
  <span style={{ fontSize: "18px", marginLeft: "8px" }}>Loading...</span>
</Box>

      </Box>

      <style>
        {`
         .walker {
  display: flex;
  align-items: center;
  animation: walk 5s linear infinite;
}

@keyframes walk {
  0% { transform: translateX(-150px); }
  50% { transform: translateX(150px); }
  100% { transform: translateX(-150px); }
}

        `}
      </style>
    </Box>
  );
};

export default LoadingOverlay;
