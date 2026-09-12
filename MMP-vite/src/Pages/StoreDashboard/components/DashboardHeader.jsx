import React from "react";
import {
  HomeWork,
  KeyboardArrowDown,
} from "@mui/icons-material";

const DashboardHeader = ({
  globalPartCode,
  setGlobalPartCode,
  globalFromDate,
  setGlobalFromDate,
  globalToDate,
  setGlobalToDate,
  partCodes,
}) => {

  return (
    <header className="dashboard-header">

      {/* =========================
          LEFT
      ========================= */}

      <div className="header-left">

        <div className="title-icon">
          <HomeWork />
        </div>

        <h1>
          Store Dashboard
        </h1>

      </div>


      {/* =========================
          RIGHT FILTERS
      ========================= */}

      <div className="header-filters">

        {/* =========================
            PART CODE
        ========================= */}

        <div className="header-filter">

          <label>
            Part Code
          </label>

          <div className="header-select">

            <select
              value={globalPartCode}
              onChange={(e) =>
                setGlobalPartCode(e.target.value)
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


        {/* =========================
            DATE RANGE
        ========================= */}

        <div className="header-filter date-range-filter">

          <label>
            Date Range
          </label>

          <div className="date-range-box">

            {/* FROM DATE */}

            <input
              type="date"
              value={globalFromDate}
              onChange={(e) =>
                setGlobalFromDate(e.target.value)
              }
            />

            <span>
              to
            </span>

            {/* TO DATE */}

            <input
              type="date"
              value={globalToDate}
              onChange={(e) =>
                setGlobalToDate(e.target.value)
              }
            />

          </div>

        </div>

      </div>

    </header>
  );
};

export default DashboardHeader;