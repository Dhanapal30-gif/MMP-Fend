import { useNavigate } from "react-router-dom";
import PartCodeInput from "../PartCodeInput";

import {
  MoveToInbox,
  CalendarMonth,
  ArrowForward,
  KeyboardArrowDown,
} from "@mui/icons-material";

const TotalReceiveCard = ({
  receivePartCode,
  setReceivePartCode,
  receiveFrom,
  setReceiveFrom,
  receiveTo,
  setReceiveTo,
  partCodes,
  quantity = 0,
  value = 0,
  loading
}) => {
  const navigate = useNavigate();
  return (
    <div className="kpi-card receive-card">

      <div className="kpi-top">

        <div className="kpi-icon receive-icon">
          <MoveToInbox />
        </div>

        <div className="kpi-title">
          TOTAL RECEIVE
        </div>

      </div>


      <div className="card-filters">

        <div className="small-select">

          <PartCodeInput
            value={receivePartCode}
            onChange={setReceivePartCode}
            partCodes={partCodes}
          />

          <KeyboardArrowDown />

        </div>


        <div className="card-date-range">

          <CalendarMonth />

          <input
            type="date"
            value={receiveFrom}
            onChange={(e) =>
              setReceiveFrom(
                e.target.value
              )
            }
          />

          <span>-</span>

          <input
            type="date"
            value={receiveTo}
            onChange={(e) =>
              setReceiveTo(
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
            Received Quantity
          </div>

        </div>


        <div className="value-divider" />


        <div className="small-value-section">

          <div className="kpi-number">
            € {Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}
          </div>

          <div className="kpi-label">
            Total Value
          </div>

        </div>

      </div>


      {/* <button className="view-details">

        View details

        <ArrowForward />

      </button> */}

 <button
    className="view-details"
    onClick={() => navigate("/recevingReport")}
  >
    View details
    <ArrowForward />
  </button>

    </div>
  );
};

export default TotalReceiveCard;