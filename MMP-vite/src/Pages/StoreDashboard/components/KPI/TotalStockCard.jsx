import React from "react";

import {
  Inventory2,
  KeyboardArrowDown,
  ArrowForward,
} from "@mui/icons-material";

const TotalStockCard = ({
  stockCategory,
  setStockCategory,
  quantity = 0,
  value = 0,
  loading
}) => {
  return (
    <div className="kpi-card stock-card">

      <div className="kpi-top">

        <div className="kpi-icon stock-icon">
          <Inventory2 />
        </div>

        <div className="kpi-title">
          TOTAL STOCK
        </div>

      </div>


      <div className="card-select-wrapper">

        <select
          value={stockCategory}
          onChange={(e) =>
            setStockCategory(
              e.target.value
            )
          }
        >

          <option>
            All
          </option>  

          <option>
            Sub Module
          </option>

          <option>
            Thermal Gel
          </option>

          <option>
            Others
          </option>
        </select>

        <KeyboardArrowDown />

      </div>


      <div className="kpi-values">

        <div className="quantity-section">

          <div className="kpi-number">
              {loading ? "Loading..." : quantity}
          </div>

          <div className="kpi-label">
            Total Quantity
          </div>

        </div>


        <div className="value-divider" />


        <div className="value-section">

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

export default TotalStockCard;