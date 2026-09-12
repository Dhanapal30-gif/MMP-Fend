import React from "react";

import {
  HourglassEmpty,
  ArrowForward,
} from "@mui/icons-material";

const PendingRequestsCard = ({
  totalRequests = 100,
  completedRequests = 90,
}) => {

  const pendingRequests =
    Math.max(
      totalRequests -
        completedRequests,
      0
    );

  return (
    <div className="kpi-card pending-card">

      <div className="kpi-top">

        <div className="kpi-icon pending-icon">
          <HourglassEmpty />
        </div>

        <div className="kpi-title">
          PENDING REQUESTS
        </div>

      </div>


      <div className="pending-number">
        {pendingRequests.toLocaleString()}
      </div>


      <div className="kpi-label">
        Requests Awaiting Action
      </div>


      {/* <div className="pending-summary"> */}

{/* <div className="pending-number">
        <span>
          Total:{" "}
          {totalRequests.toLocaleString()}
        </span>
</div> */}

      {/* </div> */}

{/* 
      <button className="view-details">

        View details

        <ArrowForward />

      </button> */}

    </div>
  );
};

export default PendingRequestsCard;