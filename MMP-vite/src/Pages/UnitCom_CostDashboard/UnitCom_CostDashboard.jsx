import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { getUnitcompoenentDetailFilter } from '../../Services/Services_09';
import { getProductAndPartcode } from '../../Services/Services';
import './UnitCom_CostDashboard.css';

const MONTH_MAP = {
  "01":"P01 Jan","02":"P02 Feb","03":"P03 Mar","04":"P04 Apr",
  "05":"P05 May","06":"P06 Jun","07":"P07 Jul","08":"P08 Aug",
  "09":"P09 Sep","10":"P10 Oct","11":"P11 Nov","12":"P12 Dec"
};

const DONUT_COLORS = ["#7c3aed","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899"];
const PIE_COLORS   = ["#7c3aed","#f59e0b","#10b981","#ef4444"];
const PIE_LABELS   = ["DTL cost","PTL cost","Total cost","Avg cost/unit"];

// const METRICS_CFG = [
//   { key:"dtl", cls:"m1", label:"Total DTL Cost",  hint:"Direct Line issuance" },
//   { key:"ptl", cls:"m2",  label:"Total PTL Cost",  hint:"Parts Moving PTL"  },
//   { key:"tot", cls:"m3",  label:"Total Cost",      hint:"DTL + PTL combined"      },
//   { key:"avg", cls:"m4",  label:"Avg Cost / Unit", hint:"Per Repaired unit"       },
// ];

const METRICS_CFG = [
  { key:"other", cls:"m5", label:"DTL Issuance Cost",    hint:"Requester Type: Others" },
  { key:"sub",   cls:"m6", label:"Sub Module Cost",      hint:"Requester Type: Submodule" },
  { key:"dtl",   cls:"m1", label:"Total DTL Cost",       hint:"Direct Line issuance" },
  { key:"ptl",   cls:"m2", label:"Total PTL Cost",       hint:"Parts Moving PTL"     },
  { key:"tot",   cls:"m3", label:"Total Cost",           hint:"DTL + PTL combined"   },
  { key:"avg",   cls:"m4", label:"Avg Cost / Unit",      hint:"Per Repaired unit"    },
  
];

function fmtFull(v) {
  return "€" + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function periodLabel(my) {
  const mm = my?.split("-")[1];
  return MONTH_MAP[mm] || my;
}

const UnitCom_CostDashboard = () => {
  const [dashboardData,   setDashboardData]   = useState([]);
  const [productDetail,   setProductDetail]   = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [drillLoading,    setDrillLoading]    = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedMonth,   setSelectedMonth]   = useState("");
  const [drillMonth,      setDrillMonth]      = useState(null);
  const [pieLegendData,   setPieLegendData]   = useState(null);
  const [donutLegendData, setDonutLegendData] = useState({});
  const [drillData,       setDrillData]       = useState(null);

  const barRef         = useRef(null);
  const donutRef       = useRef(null);
  const pieRef         = useRef(null);
  const barChartInst   = useRef(null);
  const donutChartInst = useRef(null);
  const pieChartInst   = useRef(null);
  const dashboardDataRef   = useRef([]);
  const selectedProductRef = useRef("");

  useEffect(() => { dashboardDataRef.current = dashboardData; }, [dashboardData]);
  useEffect(() => { selectedProductRef.current = selectedProduct; }, [selectedProduct]);

  useEffect(() => {
    fetchPartAndProduct();
    const currentYear = new Date().getFullYear();
    fetchDashboard("", currentYear.toString());
  }, []);

  useEffect(() => {
    if (dashboardData.length > 0) {
      buildBarChart();
      aggregateAndSetState(dashboardData);
    } else {
      if (barChartInst.current) { barChartInst.current.destroy(); barChartInst.current = null; }
      aggregateAndSetState([]);
    }
    return () => {
      if (barChartInst.current) { barChartInst.current.destroy(); barChartInst.current = null; }
    };
  }, [dashboardData]);

  useEffect(() => {
    if (pieChartInst.current) { pieChartInst.current.destroy(); pieChartInst.current = null; }
    if (pieLegendData && pieRef.current) {
      buildPieChart(pieLegendData);
    }
  }, [pieLegendData]);

  useEffect(() => {
    if (donutChartInst.current) { donutChartInst.current.destroy(); donutChartInst.current = null; }
    if (Object.keys(donutLegendData).length > 0 && donutRef.current) {
      buildDonutChart(donutLegendData);
    }
  }, [donutLegendData]);

  const fetchPartAndProduct = () => {
    getProductAndPartcode()
      .then(res => setProductDetail(res.data?.ProductDetail || []))
      .catch(err => console.error("Error:", err));
  };

  const fetchDashboard = (productname, monthYear) => {
    setLoading(true);
    setDrillMonth(null);
    setDrillData(null);
    getUnitcompoenentDetailFilter(0, 100, {
      productname: productname || "",
      monthYear:   monthYear   || "",
      search:      null
    })
      .then(res => {
        const content = res.data?.content || [];
        setDashboardData(content);
      })
      .finally(() => setLoading(false));
  };

  // const aggregateAndSetState = (content, isDrill = false) => {
  //   if (!content || content.length === 0) {
  //     setPieLegendData({ dtl: 0, ptl: 0, total: 0, avg: 0 });
  //     setDonutLegendData({});
  //     if (isDrill) setDrillData(null);
  //     return;
  //   }

  //   const aggDTL   = content.reduce((s, r) => s + (Number(r.dtlIssuanceCost)    || 0), 0);
  //   const aggPTL   = content.reduce((s, r) => s + (Number(r.ptlIssuanceCost)    || 0), 0);
  //   const aggTotal = content.reduce((s, r) => s + (Number(r.totalCost)          || 0), 0);
  //   const aggAvg   = content.reduce((s, r) => s + (Number(r.averageCostPerUnit) || 0), 0) / content.length;

  //   const rtbAgg = {};
  //   content.forEach(r => {
  //     if (!r.requesterTypeBreakdown) return;
  //     Object.entries(r.requesterTypeBreakdown).forEach(([k, v]) => {
  //       rtbAgg[k] = (rtbAgg[k] || 0) + (Number(v) || 0);
  //     });
  //   });

  //   setPieLegendData({ dtl: aggDTL, ptl: aggPTL, total: aggTotal, avg: aggAvg });
  //   setDonutLegendData({ ...rtbAgg });

  //   if (isDrill) {
  //     setDrillData({ dtl: aggDTL, ptl: aggPTL, total: aggTotal, avg: aggAvg });
  //   }
  // };

  const aggregateAndSetState = (content, isDrill = false) => {
  if (!content || content.length === 0) {
    setPieLegendData({ dtl: 0, ptl: 0, total: 0, avg: 0, other: 0, sub: 0 });
    setDonutLegendData({});
    if (isDrill) setDrillData(null);
    return;
  }

  const aggDTL   = content.reduce((s, r) => s + (Number(r.dtlIssuanceCost)    || 0), 0);
  const aggPTL   = content.reduce((s, r) => s + (Number(r.ptlIssuanceCost)    || 0), 0);
  const aggTotal = content.reduce((s, r) => s + (Number(r.totalCost)          || 0), 0);
  const aggOther = content.reduce((s, r) => s + (Number(r.otherCost)          || 0), 0); // ← new
  const aggSub   = content.reduce((s, r) => s + (Number(r.subModuleCost)      || 0), 0); // ← new
  const aggAvg   = content.reduce((s, r) => s + (Number(r.averageCostPerUnit) || 0), 0) / content.length;

  const rtbAgg = {};
  content.forEach(r => {
    if (!r.requesterTypeBreakdown) return;
    Object.entries(r.requesterTypeBreakdown).forEach(([k, v]) => {
      rtbAgg[k] = (rtbAgg[k] || 0) + (Number(v) || 0);
    });
  });

  setPieLegendData({ dtl: aggDTL, ptl: aggPTL, total: aggTotal, avg: aggAvg, other: aggOther, sub: aggSub });
  setDonutLegendData({ ...rtbAgg });

  if (isDrill) {
    setDrillData({ dtl: aggDTL, ptl: aggPTL, total: aggTotal, avg: aggAvg, other: aggOther, sub: aggSub });
  }
};

  const buildBarChart = () => {
  if (barChartInst.current) { barChartInst.current.destroy(); barChartInst.current = null; }
  if (!barRef.current) return;

  // ✅ Sort ascending by monthYear so bars always appear P01 → P02 → P03…
  const data = [...dashboardDataRef.current].sort((a, b) =>
    a.monthYear.localeCompare(b.monthYear)
  );

  const labels = data.map(r => periodLabel(r.monthYear));

  barChartInst.current = new Chart(barRef.current, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Total cost",
        data:  data.map(r => r.totalCost || 0),
        backgroundColor: data.map(() => "#7c3aed"),
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: "#f59e0b",
      }]
    },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend:     { display: false },
          datalabels: { display: false },
          tooltip: {
            backgroundColor: "#0f0720",
            titleColor: "#a78bfa",
            bodyColor: "#e8d8f8",
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              title: ctx => `${ctx[0].label}`,
              label: ctx => `  Total cost: ${fmtFull(ctx.raw)}`
            }
          }
        },
        onClick: (evt, elements) => {
        if (elements.length > 0) {
          const idx       = elements[0].index;
          // ✅ Use the locally sorted `data`, not dashboardDataRef
          const monthYear = data[idx]?.monthYear;
          if (!monthYear) return;

          barChartInst.current.data.datasets[0].backgroundColor =
            data.map((_, i) => i === idx ? "#f59e0b" : "#7c3aed");
          barChartInst.current.update();

          setDrillMonth(periodLabel(monthYear));
          setDrillLoading(true);

          getUnitcompoenentDetailFilter(0, 100, {
            productname: selectedProductRef.current || "",
            monthYear:   monthYear,
            search:      null
          })
            .then(res => {
              const content = res.data?.content || [];
              aggregateAndSetState(content, true);
            })
            .finally(() => setDrillLoading(false));
        }
      },
        scales: {
          x: {
            ticks: { autoSkip: false, maxRotation: 0, font: { size: 12 }, color: "#135bd7" },
            grid:  { display: false }
          },
          // y: {
          //   ticks: {
          //     color: "#0a5be8",
          //     font:  { size: 12 },
          //     callback: v => fmtFull(v)
          //   },
          //   grid: { color: "rgba(124,58,237,0.08)" }
          // }
          y: {
  ticks: {
    color: "#0a5be8",
    font: { size: 12 },
    callback: v => {
      if (v >= 1_000_000) return '€' + (v / 1_000_000).toFixed(1) + 'M';
      if (v >= 1_000)     return '€' + (v / 1_000).toFixed(0) + 'K';
      return '€' + v;
    }
  },
  grid: { color: "rgba(124,58,237,0.08)" }
}
        }
      }
    });
  };

  const buildDonutChart = (rtbAgg) => {
    if (!donutRef.current) return;
    const rtKeys  = Object.keys(rtbAgg);
    const rtVals  = rtKeys.map(k => rtbAgg[k]);
    const rtTotal = rtVals.reduce((s, v) => s + v, 0);

    donutChartInst.current = new Chart(donutRef.current, {
      type: "doughnut",
      data: {
        labels: rtKeys,
        datasets: [{
          data: rtVals,
          backgroundColor: DONUT_COLORS.slice(0, rtKeys.length),
          borderWidth: 3,
          borderColor: "white",
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        animation: { duration: 500 },
        plugins: {
          legend:     { display: false },
          datalabels: { display: false },
          tooltip: {
            backgroundColor: "#0f0720",
            titleColor: "#ffffff",
            bodyColor: "#c4b5fd",
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: ctx => {
                const pct = rtTotal > 0 ? ((ctx.raw / rtTotal) * 100).toFixed(1) : 0;
                return `  ${ctx.label}: ${fmtFull(ctx.raw)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  };

  const buildPieChart = (data) => {
    if (!pieRef.current) return;
    const vals = [data.dtl, data.ptl, data.total, data.avg];

    pieChartInst.current = new Chart(pieRef.current, {
      type: "pie",
      data: {
        labels: PIE_LABELS,
        datasets: [{
          data: vals,
          backgroundColor: PIE_COLORS,
          borderWidth: 3,
          borderColor: "white",
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        plugins: {
          legend:     { display: false },
          datalabels: { display: false },
          tooltip: {
            backgroundColor: "#0f0720",
            titleColor: "#fff",
            bodyColor: "#e8d8f8",
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: ctx => `  ${ctx.label}: ${fmtFull(ctx.raw)}`
            }
          }
        }
      }
    });
  };

  const totalDTL  = dashboardData.reduce((s, r) => s + (r.dtlIssuanceCost    || 0), 0);
  const totalPTL  = dashboardData.reduce((s, r) => s + (r.ptlIssuanceCost    || 0), 0);
  const totalCost = dashboardData.reduce((s, r) => s + (r.totalCost          || 0), 0);
  const totalOther = dashboardData.reduce((s, r) => s + (r.otherCost          || 0), 0); 
const totalSub   = dashboardData.reduce((s, r) => s + (r.subModuleCost      || 0), 0); 
  const avgCPU    = dashboardData.length
    ? dashboardData.reduce((s, r) => s + (r.averageCostPerUnit || 0), 0) / dashboardData.length
    : 0;

  // const source = drillData || { dtl: totalDTL, ptl: totalPTL, total: totalCost, avg: avgCPU };

  const source = drillData || { dtl: totalDTL, ptl: totalPTL, total: totalCost, avg: avgCPU, other: totalOther, sub: totalSub };

  // const metricValues = {
  //   dtl: fmtFull(source.dtl),
  //   ptl: fmtFull(source.ptl),
  //   tot: fmtFull(source.total),
  //   avg: fmtFull(source.avg)
  // };


const metricValues = {
  dtl:   fmtFull(source.dtl),
  ptl:   fmtFull(source.ptl),
  tot:   fmtFull(source.total),
  avg:   fmtFull(source.avg),
  other: fmtFull(source.other || 0), // ← new
  sub:   fmtFull(source.sub   || 0), // ← new
};

  const donutLegendTotal = Object.values(donutLegendData).reduce((s, v) => s + v, 0);

  // const handleClearDrill = () => {
  //   setDrillMonth(null);
  //   setDrillData(null);
  //   aggregateAndSetState(dashboardData);
  //   if (barChartInst.current) {
  //     barChartInst.current.data.datasets[0].backgroundColor =
  //       dashboardData.map(() => "#7c3aed");
  //     barChartInst.current.update();
  //   }
  // };
  const handleClearDrill = () => {
  setDrillMonth(null);
  setDrillData(null);
  setSelectedProduct("");   // ← add this
  setSelectedMonth("");     // ← add this
  const currentYear = new Date().getFullYear();
  fetchDashboard("", currentYear.toString()); // ← reload default data
  if (barChartInst.current) {
    barChartInst.current.data.datasets[0].backgroundColor =
      dashboardData.map(() => "#7c3aed");
    barChartInst.current.update();
  }
};

  // const handleApply = () => fetchDashboard(selectedProduct, selectedMonth);
  const handleApply = () => {
  if (!selectedProduct && !selectedMonth) {
    alert("Please select at least one filter (Product Name or Month & Year) before applying.");
    return;
  }
  fetchDashboard(selectedProduct, selectedMonth);
};
  
  const handleReset = () => {
    setSelectedProduct("");
    setSelectedMonth("");
    fetchDashboard("", "");
  };

  return (
    <div className="ucd-wrap">

      {/* Top bar */}
      <div className="ucd-topbar">
        <div className="ucd-topbar-left">
          <div className="ucd-title">Unit Component Cost Dashboard</div>
          
        </div>
        <div className="ucd-topbar-right">
          {/* {drillMonth && (
            <button className="ucd-btn-clear" onClick={handleClearDrill}>
              &#10005; Clear 
            </button>
          )} */}
          {(drillMonth || selectedProduct || selectedMonth) && (
  <button className="ucd-btn-clear" onClick={handleClearDrill}>
    &#10005; Clear 
  </button>
)}
          {drillLoading && <div className="ucd-spinner" />}
          <div className="ucd-live-badge">
            <span className="ucd-live-dot" />Live Data
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="ucd-filter-bar">
        <div className="ucd-filter-group">
          <div className="ucd-filter-item">
            <label className="ucd-filter-label">Product Name</label>
            <select
              className="ucd-filter-select"
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
            >
              <option value="">All Products</option>
              {productDetail.map((item, idx) => (
                <option key={idx} value={item[0]}>{item[0]}</option>
              ))}
            </select>
          </div>
          <div className="ucd-filter-item">
            <label className="ucd-filter-label">Month &amp; Year</label>
            <input
              className="ucd-filter-input"
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="ucd-filter-btns">
            <button className="ucd-btn-apply" onClick={handleApply}>Apply</button>
            {/* <button className="ucd-btn-reset"  onClick={handleReset}>Reset</button> */}
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="ucd-metrics">
        {METRICS_CFG.map(({ key, cls, icon, label, hint }) => (
          <div key={key} className={`ucd-metric ${cls}`}>
            <div className="ucd-metric-glow" />
            <div className="ucd-metric-icon">{icon}</div>
            <div className="ucd-metric-lbl">{label}</div>
            <div className="ucd-metric-val">
              {loading ? <span className="ucd-metric-loading">Loading…</span> : metricValues[key]}
            </div>
            <div className="ucd-metric-hint">{hint}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="ucd-charts">

        {/* Bar chart */}
        <div className="ucd-card ucd-card-bar">
          <div className="ucd-card-head">
            <div>
              <div className="ucd-card-title">Monthly Total Cost</div>
              <div className="ucd-card-sub">Click a bar to drill into that month</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span className="ucd-pill">{dashboardData.length} months</span>
            </div>
          </div>
          {loading
            ? <div className="ucd-chart-empty">Loading data…</div>
            : dashboardData.length === 0
              ? <div className="ucd-chart-empty">No data available</div>
              : <div className="ucd-canvas-bar">
                  <canvas ref={barRef} style={{ cursor: "pointer" }} />
                </div>
          }
        </div>

        {/* Pie chart */}
        <div className="ucd-card ucd-card-pie">
          <div className="ucd-card-head">
            <div>
              <div className="ucd-card-title">{drillMonth || "Cost Breakdown"}</div>
              <div className="ucd-card-sub">DTL · PTL · Total · Avg</div>
            </div>
          </div>
          <div className="ucd-pie-legend">
            {PIE_LABELS.map((l, i) => {
              const val = pieLegendData
                ? [pieLegendData.dtl, pieLegendData.ptl, pieLegendData.total, pieLegendData.avg][i]
                : 0;
              return (
                <div key={l} className="ucd-pie-legend-row">
                  <span className="ucd-legend-dot" style={{ background: PIE_COLORS[i] }} />
                  <span className="ucd-pie-legend-label">{l}</span>
                  <span className="ucd-pie-legend-val">{pieLegendData ? fmtFull(val) : "—"}</span>
                </div>
              );
            })}
          </div>
          <div className="ucd-canvas-pie">
            <canvas ref={pieRef} />
          </div>
        </div>

        {/* Donut chart */}
        <div className="ucd-card ucd-card-donut">
          <div className="ucd-card-head">
            <div>
              <div className="ucd-card-title">Requester Breakdown</div>
              <div className="ucd-card-sub">{drillMonth || "All months"}</div>
            </div>
          </div>
          <div className="ucd-donut-rows">
            {Object.keys(donutLegendData).length === 0
              ? <p className="ucd-chart-empty" style={{ fontSize:12 }}>No breakdown data</p>
              : Object.entries(donutLegendData).map(([k, v], i) => {
                  const pct = donutLegendTotal > 0 ? ((v / donutLegendTotal) * 100) : 0;
                  return (
                    <div key={k} className="ucd-donut-row">
                      <span className="ucd-legend-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="ucd-donut-row-label">{k}</span>
                      <div className="ucd-progress-wrap">
                        <div
                          className="ucd-progress-fill"
                          style={{ width: pct.toFixed(1) + "%", background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                        />
                      </div>
                      <span className="ucd-donut-row-val">{fmtFull(v)}</span>
                      <span className="ucd-donut-row-pct">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })
            }
          </div>
          {/* Donut canvas with center value overlay */}
          <div className="ucd-donut-canvas-wrap">
            <div className="ucd-canvas-donut">
              <canvas ref={donutRef} />
            </div>
            <div className="ucd-donut-center">
              <div className="ucd-donut-center-val">
                {pieLegendData ? fmtFull(pieLegendData.dtl) : fmtFull(totalDTL)}
              </div>
              <div className="ucd-donut-center-sub">Total DTL</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UnitCom_CostDashboard;
