import React from "react";

import {
  WarningAmber,
  ArrowForward,
} from "@mui/icons-material";

const LowStockCard = ({
  count = 18,
}) => {
  return (
    <div className="kpi-card low-stock-card">

      <div className="kpi-top">

        <div className="kpi-icon low-stock-icon">
          <WarningAmber />
        </div>

        <div className="kpi-title">
          LOW STOCK ITEMS
        </div>

      </div>


      <div className="kpi-number low-stock-number">
        {count.toLocaleString()}
      </div>


      <div className="kpi-label">
        Below Minimum Level
      </div>


      {/* <button className="view-details">

        View details

        <ArrowForward />

      </button> */}

    </div>
  );
};

export default LowStockCard;