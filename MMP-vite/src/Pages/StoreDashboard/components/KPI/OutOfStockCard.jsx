import React from "react";

import {
  Cancel,
  ArrowForward,
} from "@mui/icons-material";

const OutOfStockCard = ({
  count = 7,
}) => {
  return (
    <div className="kpi-card out-stock-card">

      <div className="kpi-top">

        <div className="kpi-icon out-stock-icon">
          <Cancel />
        </div>

        <div className="kpi-title">
          OUT OF STOCK ITEMS
        </div>

      </div>


      <div className="kpi-number">
        {count.toLocaleString()}
      </div>


      <div className="kpi-label">
        Zero Stock Items
      </div>


      {/* <button className="view-details">

        View details

        <ArrowForward />

      </button> */}

    </div>
  );
};

export default OutOfStockCard;