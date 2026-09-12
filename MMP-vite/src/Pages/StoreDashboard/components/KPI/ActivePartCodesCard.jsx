import React from "react";

import {
  LocalOffer,
} from "@mui/icons-material";

const ActivePartCodesCard = ({ count }) => {
  return (
    <div className="kpi-card active-parts-card">

      <div className="kpi-top">

        <div className="kpi-icon active-parts-icon">
          <LocalOffer />
        </div>

        <div className="kpi-title">
          Total PART CODES
        </div>

      </div>

      <div className="kpi-number">
        {(count ?? 0).toLocaleString()}
      </div>

      <div className="kpi-label">
        Partcode in Store
      </div>

    </div>
  );
};

export default ActivePartCodesCard;