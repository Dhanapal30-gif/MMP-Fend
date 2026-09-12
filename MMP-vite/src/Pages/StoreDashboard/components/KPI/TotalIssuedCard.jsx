import React from "react";

import {
  Outbox,
  CalendarMonth,
  ArrowForward,
  KeyboardArrowDown,
} from "@mui/icons-material";

const TotalIssuedCard = ({
  issuePartCode,
  setIssuePartCode,
  issueFrom,
  setIssueFrom,
  issueTo,
  setIssueTo,
  partCodes,
  quantity = 0,
  value = 0,
  loading
}) => {
  return (
    <div className="kpi-card issued-card">

      <div className="kpi-top">

        <div className="kpi-icon issued-icon">
          <Outbox />
        </div>

        <div className="kpi-title">
          TOTAL ISSUED
        </div>

      </div>


      <div className="card-filters">

        <div className="small-select">

          <select
            value={issuePartCode}
            onChange={(e) =>
              setIssuePartCode(
                e.target.value
              )
            }
          >

            {partCodes.map(
              (partCode) => (
                <option
                  key={partCode}
                  value={partCode}
                >
                  {partCode}
                </option>
              )
            )}

          </select>

          <KeyboardArrowDown />

        </div>


        <div className="card-date-range">

          <CalendarMonth />

          <input
            type="date"
            value={issueFrom}
            onChange={(e) =>
              setIssueFrom(
                e.target.value
              )
            }
          />

          <span>-</span>

          <input
            type="date"
            value={issueTo}
            onChange={(e) =>
              setIssueTo(
                e.target.value
              )
            }
          />

        </div>

      </div>


      <div className="kpi-values receive-values">

        <div className="quantity-section">

          <div className="kpi-number">
           {loading ? "Loading..." : quantity}
          </div>

          <div className="kpi-label">
            Issued Quantity
          </div>

        </div>


        <div className="value-divider" />


        <div className="small-value-section">

          <div className="kpi-number">
            €{Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}
          </div>

          <div className="kpi-label">
            Total Value
          </div>

        </div>

      </div>


      <button className="view-details">

        View details

        <ArrowForward />

      </button>

    </div>
  );
};

export default TotalIssuedCard;