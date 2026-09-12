import React from "react";

import {
  Assignment,
  ArrowForward,
  KeyboardArrowDown,
} from "@mui/icons-material";

const TotalRequestsCard = ({
  requestType,
  setRequestType,
  requestPartCode,
  setRequestPartCode,
  partCodes = [],
  count = 0,
  loading,
}) => {
  return (
    <div className="kpi-card request-card">

      <div className="kpi-top">

        <div className="kpi-icon request-icon">
          <Assignment />
        </div>

        <div className="kpi-title">
          TOTAL REQUESTS
        </div>

      </div>

      <div className="card-filters">

        {/* Request Type */}
        <div className="small-select request-select">

          <select
            value={requestType}
            onChange={(e) =>
              setRequestType(e.target.value)
            }
          >
            <option value="ALL">ALL</option>
            <option value="DTL">DTL</option>
            <option value="PTL">PTL</option>
          </select>

          <KeyboardArrowDown />

        </div>


        {/* Part Code */}
        <div className="small-select request-partcode-select">

          <select
            value={requestPartCode}
            onChange={(e) =>
              setRequestPartCode(e.target.value)
            }
          >

            {partCodes.map((partCode) => (
              <option
                key={partCode}
                value={partCode}
              >
                {partCode}
              </option>
            ))}

          </select>

          <KeyboardArrowDown />

        </div>

      </div>


      <div className="request-number">
        {loading ? "Loading..." : count}
      </div>

      <div className="kpi-label">
        Requests Received
      </div>


      <button className="view-details">

        View details

        <ArrowForward />

      </button>

    </div>
  );
};

export default TotalRequestsCard;