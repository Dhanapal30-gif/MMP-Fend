import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const CATEGORY_COLORS = {
  subModule: "#2f8ff0",
  thermalGel: "#3fb96a",
  others: "#ff9a2e",
};

const MONTHLY_DATA = {
  "Jan 2025": { subModule: 1250, thermalGel: 780, others: 420 },
  "Feb 2025": { subModule: 1480, thermalGel: 920, others: 540 },
  "Mar 2025": { subModule: 1720, thermalGel: 1050, others: 620 },
  "Apr 2025": { subModule: 1980, thermalGel: 1240, others: 760 },
  "May 2025": { subModule: 2150, thermalGel: 1380, others: 920 },
};

const MONTH_KEYS = Object.keys(MONTHLY_DATA);

const CustomTick = ({ x, y, payload, selectedMonth }) => {
  const isSelected = payload.value === selectedMonth;
  return (
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="middle"
      fontSize={12}
      fontWeight={isSelected ? 700 : 500}
      fill={isSelected ? "#14335e" : "#7c8aa0"}
    >
      {payload.value}
    </text>
  );
};

const BarValueLabel = (props) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
      fill="#26324a"
    >
      {value.toLocaleString()}
    </text>
  );
};

const StockByCategoryChart = () => {
  const [selectedMonth, setSelectedMonth] = useState("May 2025");

  const chartData = MONTH_KEYS.map((month) => ({
    month,
    subModule: MONTHLY_DATA[month].subModule,
    thermalGel: MONTHLY_DATA[month].thermalGel,
    others: MONTHLY_DATA[month].others,
  }));

  const selected = MONTHLY_DATA[selectedMonth];
  const selectedTotal =
    selected.subModule + selected.thermalGel + selected.others;

  return (
    <div className="chart-card stock-category-panel">
      <div className="scp-header">
        <div className="scp-title-group">
          <span className="scp-title-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 20V10M12 20V4M20 20V14"
                stroke="#2f8ff0"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <h3 className="scp-title">Stock by Category</h3>
        </div>

        <div className="scp-month-select">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
              stroke="#36577f"
              strokeWidth="1.8"
            />
            <path
              d="M3 9H21"
              stroke="#36577f"
              strokeWidth="1.8"
            />
            <path
              d="M8 3V6M16 3V6"
              stroke="#36577f"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {MONTH_KEYS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="scp-legend">
          <span className="scp-legend-item">
            <i style={{ background: CATEGORY_COLORS.subModule }} />
            Sub Module
          </span>
          <span className="scp-legend-item">
            <i style={{ background: CATEGORY_COLORS.thermalGel }} />
            Thermal Gel
          </span>
          <span className="scp-legend-item">
            <i style={{ background: CATEGORY_COLORS.others }} />
            Others
          </span>
        </div>
      </div>

      <div className="scp-chart-wrap">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            barGap={4}
            barCategoryGap="18%"
            margin={{ top: 34, right: 12, left: 0, bottom: 6 }}
          >
            <CartesianGrid vertical={false} stroke="#eef2f8" />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#e3e9f1" }}
              tickLine={false}
              tick={<CustomTick selectedMonth={selectedMonth} />}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#8a96a8" }}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(47,143,240,0.06)" }}
              formatter={(value, name) => [
                value.toLocaleString(),
                name === "subModule"
                  ? "Sub Module"
                  : name === "thermalGel"
                  ? "Thermal Gel"
                  : "Others",
              ]}
            />

            <Bar
              dataKey="subModule"
              fill={CATEGORY_COLORS.subModule}
              radius={[4, 4, 0, 0]}
              maxBarSize={26}
            >
              <LabelList content={BarValueLabel} />
            </Bar>
            <Bar
              dataKey="thermalGel"
              fill={CATEGORY_COLORS.thermalGel}
              radius={[4, 4, 0, 0]}
              maxBarSize={26}
            >
              <LabelList content={BarValueLabel} />
            </Bar>
            <Bar
              dataKey="others"
              fill={CATEGORY_COLORS.others}
              radius={[4, 4, 0, 0]}
              maxBarSize={26}
            >
              <LabelList content={BarValueLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Highlight box + total callout for the selected month */}
        <div
          className="scp-selected-box"
          style={{
            left: `${
              (MONTH_KEYS.indexOf(selectedMonth) / MONTH_KEYS.length) * 100
            }%`,
            width: `${100 / MONTH_KEYS.length}%`,
          }}
        >
          <div className="scp-selected-tag">
            {selectedMonth}
            <span>Total: {selectedTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <style>{`
        .stock-category-panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .scp-header {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .scp-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .scp-title-icon {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eaf3ff;
          border-radius: 6px;
        }

        .scp-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #122c55;
        }

        .scp-month-select {
          height: 34px;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #dce4ef;
          border-radius: 7px;
          padding: 0 10px;
          background: #ffffff;
        }

        .scp-month-select select {
          border: none;
          outline: none;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          color: #1d3150;
          cursor: pointer;
        }

        .scp-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: auto;
        }

        .scp-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #445370;
        }

        .scp-legend-item i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: inline-block;
        }

        .scp-chart-wrap {
          position: relative;
        }

        .scp-selected-box {
          position: absolute;
          top: 0;
          bottom: 24px;
          border: 1.5px dashed #2f8ff0;
          background: rgba(47, 143, 240, 0.05);
          border-radius: 8px;
          pointer-events: none;
        }

        .scp-selected-tag {
          position: absolute;
          top: -30px;
          right: 0;
          background: #14335e;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.3;
        }

        .scp-selected-tag span {
          font-weight: 500;
          font-size: 10px;
          opacity: 0.85;
        }

        @media (max-width: 800px) {
          .scp-legend {
            margin-left: 0;
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StockByCategoryChart;
