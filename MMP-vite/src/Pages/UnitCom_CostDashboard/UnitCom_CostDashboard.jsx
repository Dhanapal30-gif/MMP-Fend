import React, { useState, useEffect,useMemo , useRef } from 'react';
import Chart from 'chart.js/auto';
import { getUnitcompoenentDetailFilter, getUnitcompoenentDetailFilterMMP, getUnitcompoenentDetailFilterMMPDashboard, fetchUnitComponentReportSeprateProductMMPDashboard } from '../../Services/Services_09';
import { downloadPTLCostValidation, getProductAndPartcode } from '../../Services/Services';
import './UnitCom_CostDashboard.css';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { Box, LayoutGrid, FileText, Truck, CreditCard, Wrench, ChartColumn } from 'lucide-react';
import MultiSelectDropdown from './MultiSelectDropdown';

// normalise "" / "x" / ["x","y"] → string[]
const toList = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

// Builds the dashboard filter payload.
// Products / groups are sent ONLY as lists — one selection = 1-item list,
// several selections = multi-item list, none = [].
const buildFilterPayload = (productnames, monthYear, productgroups) => ({
  productnames:  toList(productnames),
  productgroups: toList(productgroups),
  monthYear:     monthYear || "",
  search:        null
});

// Product-wise Total Value report (fetchUnitComponentReportSeprateProductMMPDashboard).
// Disabled for now — set to true to call the API and show the report card again.
const ENABLE_PRODUCT_TOTALS_REPORT = false;

// ── Monthly chart view controls ──
// dataset index: 0 = Total Cost, 1 = Average Cost, 2 = Repaired Qty
const CHART_MODES = [
  { value: "ALL",     label: "SELECT ALL"   },
  { value: "TOT_AVG", label: "TOT vs AVG"   },
  { value: "TOTAL",   label: "TOTAL COST"   },
  { value: "AVG",     label: "AVERAGE COST" },
];
const isTotalVisible = mode => mode === "ALL" || mode === "TOT_AVG" || mode === "TOTAL";
const isAvgVisible   = mode => mode === "ALL" || mode === "TOT_AVG" || mode === "AVG";
// chart title per dropdown option (ALL / TOT_AVG / TOTAL keep the default title)
// const chartTitleFor  = mode => (mode === "AVG" ? "Monthly Average Cost" : "Monthly Total Cost");
const chartTitleFor = mode => mode === "AVG" ? "Monthly Average Cost" : mode === "TOT_AVG"
      ? "Monthly Total vs Average"  : "Monthly Total Cost";
// how many months fit in the chart viewport before horizontal scrolling kicks in
const BAR_AXIS_PAD = 120;   // room for the left (€) + right (qty) axes
const visibleMonthsFor = (w) => (w >= 1000 ? 8 : w >= 760 ? 6 : w >= 520 ? 4 : 3);

const MONTH_MAP = {
  "01":"P01 Jan","02":"P02 Feb","03":"P03 Mar","04":"P04 Apr",
  "05":"P05 May","06":"P06 Jun","07":"P07 Jul","08":"P08 Aug",
  "09":"P09 Sep","10":"P10 Oct","11":"P11 Nov","12":"P12 Dec"
};

const DONUT_COLORS = ["#0e39d4","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899"];
const PIE_COLORS   = ["#0e39d4","#f59e0b","#10b981","#ef4444"];
const PIE_LABELS   = ["DTL cost","PTL cost","Total cost","Avg cost/unit"];

// const METRICS_CFG = [
//   { key:"dtl", cls:"m1", label:"Total DTL Cost",  hint:"Direct Line issuance" },
//   { key:"ptl", cls:"m2",  label:"Total PTL Cost",  hint:"Parts Moving PTL"  },
//   { key:"tot", cls:"m3",  label:"Total Cost",      hint:"DTL + PTL combined"      },
//   { key:"avg", cls:"m4",  label:"Avg Cost / Unit", hint:"Per Repaired unit"       },
// ];

const METRICS_CFG = [
  { key:"other", cls:"m5", label:"DTL Issuance Cost", hint:"Requester: Others",    icon:<Box size={20} strokeWidth={2} /> },
  { key:"sub",   cls:"m6", label:"Sub Module Cost",   hint:"Requester: Submodule", icon:<LayoutGrid size={20} strokeWidth={2} /> },
  { key:"dtl",   cls:"m1", label:"Total DTL Cost",    hint:"Direct line issuance", icon:<FileText size={20} strokeWidth={2} /> },
  { key:"ptl",   cls:"m2", label:"Total PTL Cost",    hint:"Parts moving PTL",     icon:<Truck size={20} strokeWidth={2} /> },
  { key:"tot",   cls:"m3", label:"Total Cost",        hint:"DTL + PTL combined",   icon:<CreditCard size={20} strokeWidth={2} /> },
  { key:"qty",   cls:"m7", label:"Repaired Qty",      hint:"Total repaired units", icon:<Wrench size={20} strokeWidth={2} /> },
  { key:"avg",   cls:"m4", label:"Avg Cost / Unit",   hint:"Per repaired unit",    icon:<ChartColumn size={20} strokeWidth={2} /> },
];

function fmtFull(v) {
  return "€" + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function periodLabel(my) {
  const mm = my?.split("-")[1];
  return MONTH_MAP[mm] || my;
}

// function computeAvgOfAverages(rows) {
//   if (!rows || rows.length === 0) return 0;

//   // Only count months that actually have repaired qty — a month with
//   // totalrepairedQty = 0 (or missing) shouldn't drag the average down
//   // just because its averageCostPerUnit defaulted to 0.
//   const validRows = rows.filter(r => Number(r.totalrepairedQty) > 0);
//   if (validRows.length === 0) return 0;

//   const sum = validRows.reduce((s, r) => s + (Number(r.averageCostPerUnit) || 0), 0);
//   return sum / validRows.length;
// }

function computeAverageCost(rows) {
  if (!rows || rows.length === 0) return 0;

  const totalCost = rows.reduce(
    (sum, r) => sum + (Number(r.totalCost) || 0),
    0
  );

  const totalRepairedQty = rows.reduce(
    (sum, r) => sum + (Number(r.totalrepairedQty) || 0),
    0
  );

  return totalRepairedQty > 0
    ? totalCost / totalRepairedQty
    : 0;
}

const UnitCom_CostDashboard = () => {
  const [dashboardData,   setDashboardData]   = useState([]);
  const [productDetail,   setProductDetail]   = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [drillLoading,    setDrillLoading]    = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);   // multi-select
  const [selectedMonth,   setSelectedMonth]   = useState("");
  const [drillMonth,      setDrillMonth]      = useState(null);
  const [pieLegendData,   setPieLegendData]   = useState(null);
  const [donutLegendData, setDonutLegendData] = useState({});
  const [drillData,       setDrillData]       = useState(null);

  // Monthly chart: series visibility + responsive scroll width
  const [chartMode,     setChartMode]     = useState("ALL");   // Select All by default
  const [showQty,       setShowQty]       = useState(true);
  const [barViewportW,  setBarViewportW]  = useState(0);
  const chartModeRef = useRef("ALL");
  const showQtyRef   = useRef(true);
  const barScrollRef = useRef(null);

  const barRef         = useRef(null);
  const donutRef       = useRef(null);
  const pieRef         = useRef(null);
  const barChartInst   = useRef(null);
  const donutChartInst = useRef(null);
  const pieChartInst   = useRef(null);
  const dashboardDataRef   = useRef([]);
  const selectedProductRef = useRef([]);
  const [currentFilter, setCurrentFilter] = useState(buildFilterPayload([], "", []));

const [selectedProductGroups, setSelectedProductGroups] = useState([]);   // multi-select
function fmtQty(v) {
  return Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
  useEffect(() => { dashboardDataRef.current = dashboardData; }, [dashboardData]);
  useEffect(() => { selectedProductRef.current = selectedProducts; }, [selectedProducts]);

//   useEffect(() => {
//   const handleClickOutside = (event) => {
//     if (
//       productDropdownRef.current &&
//       !productDropdownRef.current.contains(event.target)
//     ) {
//       setProductDropdownOpen(false);
//     }
//   };

//   document.addEventListener("mousedown", handleClickOutside);

//   return () => {
//     document.removeEventListener("mousedown", handleClickOutside);
//   };
// }, []);

// (click-outside handling now lives inside MultiSelectDropdown)

useEffect(() => {
  fetchPartAndProduct();
  const currentYear = new Date().getFullYear();
  fetchDashboard([], currentYear.toString(), []);
  setCurrentFilter(buildFilterPayload([], currentYear.toString(), []));
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

  // Apply chart view selection to the live chart (no rebuild, no refetch)
  useEffect(() => {
    chartModeRef.current = chartMode;
    showQtyRef.current   = showQty;
    const ch = barChartInst.current;
    if (!ch) return;
    ch.setDatasetVisibility(0, isTotalVisible(chartMode));
    ch.setDatasetVisibility(1, isAvgVisible(chartMode));
    ch.setDatasetVisibility(2, showQty);
    ch.update();
  }, [chartMode, showQty]);

  // Track the chart viewport width → decides months-per-view and scroll width
  useEffect(() => {
    const el = barScrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(entries => {
      setBarViewportW(Math.floor(entries[0].contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading, dashboardData.length]);   // scroll box is re-mounted after loading / empty states

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

// ⬇️ these must live at the top level of the component, NOT inside fetchPartAndProduct
const productGroups = useMemo(
  () => [...new Set(productDetail.map(item => item[1]).filter(Boolean))],
  [productDetail]
);

const filteredProductDetail = useMemo(
  () => selectedProductGroups.length
    ? productDetail.filter(item => selectedProductGroups.includes(item[1]))
    : productDetail,
  [productDetail, selectedProductGroups]
);

// unique product names for the multi-select (same source list as before)
const productNames = useMemo(
  () => [...new Set(productDetail.map(item => item[0]).filter(Boolean))],
  [productDetail]
);

// ── ProductName-wise SUM(Value) report (separate, reusable) ──
const [productTotals,        setProductTotals]        = useState([]);
const [productTotalsLoading, setProductTotalsLoading] = useState(false);
const productTotalsReqId = useRef(0);

const fetchProductTotals = (filters) => {
  const reqId = ++productTotalsReqId.current;   // ignore stale responses if filters change quickly
  setProductTotalsLoading(true);
  fetchUnitComponentReportSeprateProductMMPDashboard(filters)
    .then(res => {
      if (reqId !== productTotalsReqId.current) return;
      setProductTotals(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => {
      if (reqId !== productTotalsReqId.current) return;
      console.error("Product-wise total value fetch failed:", err);
      setProductTotals([]);
    })
    .finally(() => {
      if (reqId === productTotalsReqId.current) setProductTotalsLoading(false);
    });
};

  const fetchDashboard = (productname, monthYear, productgroup) => {
  setLoading(true);
  setDrillMonth(null);
  setDrillData(null);

  // identical filter criteria for both APIs (accepts single values or arrays)
  const filters = buildFilterPayload(productname, monthYear, productgroup);

  // new API — runs alongside, independent of the existing call
  if (ENABLE_PRODUCT_TOTALS_REPORT) fetchProductTotals(filters);

  getUnitcompoenentDetailFilterMMPDashboard(0, 100, filters)
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

//   const aggregateAndSetState = (content, isDrill = false) => {
//   if (!content || content.length === 0) {
//     setPieLegendData({ dtl: 0, ptl: 0, total: 0, avg: 0, other: 0, sub: 0 });
//     setDonutLegendData({});
//     if (isDrill) setDrillData(null);
//     return;
//   }

//   const aggDTL   = content.reduce((s, r) => s + (Number(r.dtlIssuanceCost)    || 0), 0);
//   const aggPTL   = content.reduce((s, r) => s + (Number(r.ptlIssuanceCost)    || 0), 0);
//   const aggTotal = content.reduce((s, r) => s + (Number(r.totalCost)          || 0), 0);
//   const aggOther = content.reduce((s, r) => s + (Number(r.otherCost)          || 0), 0); // ← new
//   const aggSub   = content.reduce((s, r) => s + (Number(r.subModuleCost)      || 0), 0); // ← new
//   const aggAvg   = content.reduce((s, r) => s + (Number(r.averageCostPerUnit) || 0), 0) / content.length;

//   const rtbAgg = {};
//   content.forEach(r => {
//     if (!r.requesterTypeBreakdown) return;
//     Object.entries(r.requesterTypeBreakdown).forEach(([k, v]) => {
//       rtbAgg[k] = (rtbAgg[k] || 0) + (Number(v) || 0);
//     });
//   });

//   setPieLegendData({ dtl: aggDTL, ptl: aggPTL, total: aggTotal, avg: aggAvg, other: aggOther, sub: aggSub });
//   setDonutLegendData({ ...rtbAgg });

//   if (isDrill) {
//     setDrillData({ dtl: aggDTL, ptl: aggPTL, total: aggTotal, avg: aggAvg, other: aggOther, sub: aggSub });
//   }
// };


const aggregateAndSetState = (content, isDrill = false) => {
  if (!content || content.length === 0) {
    setPieLegendData({ dtl: 0, ptl: 0, total: 0, avg: 0, other: 0, sub: 0, qty: 0  });
    setDonutLegendData({});
    if (isDrill) setDrillData(null);
    return;
  }

  const aggDTL   = content.reduce((s, r) => s + (Number(r.dtlIssuanceCost) || 0), 0);
  const aggPTL   = content.reduce((s, r) => s + (Number(r.ptlIssuanceCost) || 0), 0);
  const aggTotal = content.reduce((s, r) => s + (Number(r.totalCost)       || 0), 0);
  const aggOther = content.reduce((s, r) => s + (Number(r.otherCost)       || 0), 0);
  const aggSub   = content.reduce((s, r) => s + (Number(r.subModuleCost)   || 0), 0);
 // ...existing aggDTL, aggPTL, aggTotal, aggOther, aggSub, aggAvg...
  const aggQty = content.reduce((s, r) => s + (Number(r.totalrepairedQty) || 0), 0); // ← new

  const aggAvg = computeAverageCost(content);

  // ✅ single source of truth for "avg cost/unit"
  // const aggAvg = computeAvgOfAverages(content);

  const rtbAgg = {};
  content.forEach(r => {
    if (!r.requesterTypeBreakdown) return;
    Object.entries(r.requesterTypeBreakdown).forEach(([k, v]) => {
      rtbAgg[k] = (rtbAgg[k] || 0) + (Number(v) || 0);
    });
  });

  setPieLegendData({ dtl: aggDTL, ptl: aggPTL, total: aggTotal, avg: aggAvg, other: aggOther, sub: aggSub, qty: aggQty  });
  setDonutLegendData({ ...rtbAgg });

  if (isDrill) {
    setDrillData({ dtl: aggDTL, ptl: aggPTL, total: aggTotal, avg: aggAvg, other: aggOther, sub: aggSub, qty: aggQty });
  }
};

const buildBarChart = () => {
  if (barChartInst.current) {
    barChartInst.current.destroy();
    barChartInst.current = null;
  }

  if (!barRef.current) return;

  // GROUP ALL PRODUCTS BY MONTH
  const monthlyMap = {};

  dashboardDataRef.current
    .filter(r => r.monthYear)
    .forEach(r => {
      const month = r.monthYear;

      if (!monthlyMap[month]) {
        monthlyMap[month] = {
          monthYear: month,
          totalCost: 0,
          totalrepairedQty: 0,
          averageCostPerUnit: 0,
          rowCount: 0
        };
      }

      // monthlyMap[month].totalCost += Number(r.totalCost) || 0;
      // monthlyMap[month].totalrepairedQty += Number(r.totalrepairedQty) || 0;

      monthlyMap[month].totalCost += Number(r.totalCost) || 0;
      monthlyMap[month].totalrepairedQty += Number(r.totalrepairedQty) || 0;
      // Keep average based on product rows
      if (Number(r.totalrepairedQty) > 0) {
        monthlyMap[month].averageCostPerUnit +=
          Number(r.averageCostPerUnit) || 0;

        monthlyMap[month].rowCount++;
      }
    });

  const data = Object.values(monthlyMap)
  .map(r => ({
    ...r,
    averageCostPerUnit:
      r.totalrepairedQty > 0
        ? r.totalCost / r.totalrepairedQty
        : 0
  }))
  .sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  const labels = data.map(r => periodLabel(r.monthYear));

  const COST_COLOR = "#10B981";
  const AVG_COLOR  = "#cd0792";
  const QTY_COLOR  = "#3B82F6";

  const fmtAvg = v => "€" + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const shortCost = v => {
    const n = Number(v) || 0;
    if (n >= 1_000_000) return "€" + (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1000)      return "€" + (n / 1000).toFixed(1) + "K";
    return "€" + n.toFixed(0);
  };

  // Draws the value above each bar (no external plugin dependency).
  // Font size follows the space each bar gets; hidden only when there's no room.
  const barValueLabels = {
    id: "ucdBarValueLabels",
    afterDatasetsDraw(chart) {
      const months = chart.data.labels.length || 1;
      const visibleSets = chart.data.datasets.filter((_, i) => chart.isDatasetVisible(i)).length || 1;
      const slot = (chart.chartArea.width / months) / visibleSets;   // px per bar
      if (slot < 22) return;
      const size = slot >= 45 ? 12 : slot >= 32 ? 11 : 10;
      const { ctx } = chart;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.font = `700 ${size}px "Segoe UI", sans-serif`;
      chart.data.datasets.forEach((ds, di) => {
        const meta = chart.getDatasetMeta(di);
        if (meta.hidden) return;
        ctx.fillStyle = ds.backgroundColor;
        meta.data.forEach((bar, i) => {
          const raw = ds.data[i];
          if (!raw) return;
          const text = ds.valueFormat ? ds.valueFormat(raw) : raw;
          ctx.fillText(text, bar.x, bar.y - 3);
        });
      });
      ctx.restore();
    }
  };

  const tickFont = c => ({ size: c.chart.width < 500 ? 9 : 11, family: "Segoe UI, sans-serif" });

  barChartInst.current = new Chart(barRef.current, {
    type: "bar",

    data: {
      labels,

      datasets: [
        // LEFT bar — existing DTL + PTL total cost (unchanged calculation)
        {
          label: "Total Cost (€)",
          data: data.map(r => r.totalCost || 0),
          backgroundColor: COST_COLOR,
          hoverBackgroundColor: "#059669",
          borderRadius: 6,
          borderSkipped: false,
          categoryPercentage: 0.78,
          barPercentage: 0.9,
          maxBarThickness: 28,
          yAxisID: "y",
          valueFormat: shortCost,
          hidden: !isTotalVisible(chartModeRef.current),
        },
        // MIDDLE bar — existing month-wise average cost / unit (left € axis)
        {
          label: "Average Cost / Unit (€)",
          data: data.map(r => r.averageCostPerUnit || 0),
          backgroundColor: AVG_COLOR,
          hoverBackgroundColor: "#a3056f",
          borderRadius: 6,
          borderSkipped: false,
          categoryPercentage: 0.78,
          barPercentage: 0.9,
          maxBarThickness: 28,
          yAxisID: "y",
          valueFormat: fmtAvg,
          hidden: !isAvgVisible(chartModeRef.current),
        },
        // RIGHT bar — monthly repaired qty (right quantity axis)
        {
          label: "Repaired Qty",
          data: data.map(r => r.totalrepairedQty || 0),
          backgroundColor: QTY_COLOR,
          hoverBackgroundColor: "#2563EB",
          borderRadius: 6,
          borderSkipped: false,
          categoryPercentage: 0.78,
          barPercentage: 0.9,
          maxBarThickness: 28,
          yAxisID: "y1",
          valueFormat: fmtQty,
          hidden: !showQtyRef.current,
        }
      ]
    },

    plugins: [barValueLabels],

    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 18 } },
      interaction: { mode: "index", intersect: false },

      plugins: {
        legend: {
          display: true,
          position: "top",
          align: "end",
          // visibility is driven by the view selector / Repaired Qty toggle above the chart
          onClick: () => {},
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded",
            boxWidth: 10,
            boxHeight: 10,
            padding: 14,
            color: "#475569",
            font: { size: 11, weight: "600", family: "Segoe UI, sans-serif" }
          }
        },

        datalabels: {
          display: false
        },

        tooltip: {
          backgroundColor: "#0f0720",
          titleColor: "#a78bfa",
          bodyColor: "#e8d8f8",
          footerColor: "#f9a8d4",
          padding: 12,
          cornerRadius: 10,
          usePointStyle: true,

          callbacks: {
            title: ctx => ctx[0].label,

            label: ctx => {
              if (ctx.dataset.label === "Total Cost (€)") {
                return `Total Cost: ${fmtFull(ctx.raw)}`;
              }

              if (ctx.dataset.label === "Average Cost / Unit (€)") {
                return `Avg Cost / Unit: ${fmtFull(ctx.raw)}`;
              }

              if (ctx.dataset.label === "Repaired Qty") {
                return `Repaired Qty: ${fmtQty(ctx.raw)}`;
              }

              return ctx.raw;
            }
          }
        }
      },

      // onClick: (evt, elements) => {
      //   if (elements.length > 0) {
      //     const idx = elements[0].index;
      //     const monthYear = data[idx]?.monthYear;

      //     if (!monthYear) return;

      //     setDrillMonth(periodLabel(monthYear));

      //     setDrillLoading(true);

      //     setCurrentFilter({
      //       productname: selectedProductRef.current || "",
      //       productgroup: selectedProductGroup || "",
      //       monthYear: monthYear
      //     });

      //     getUnitcompoenentDetailFilterMMPDashboard(0, 100, {
      //       productname: selectedProductRef.current || "",
      //       productgroup: selectedProductGroup || "",
      //       monthYear: monthYear,
      //       search: null
      //     })
      //       .then(res => {
      //         const content = res.data?.content || [];
      //         aggregateAndSetState(content, true);
      //       })
      //       .finally(() => setDrillLoading(false));
      //   }
      // },

      scales: {
        x: {
          grid: { display: false },
          border: { color: "#E2E8F0" },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 0,
            color: "#135bd7",
            font: tickFont
          }
        },

        y: {
          display: "auto",   // hides itself when no cost series is visible
          position: "left",
          beginAtZero: true,
          grace: "8%",
          border: { display: false, dash: [4, 4] },
          grid: { color: "rgba(148,163,184,0.25)", drawTicks: false },
          title: { display: true, text: "Cost (€)", color: COST_COLOR, font: { size: 10, weight: "600" } },
          ticks: {
            color: "#64748B",
            padding: 6,
            font: tickFont,
            callback: value => {
              if (value >= 1000)
                return "€" + (value / 1000).toFixed(0) + "K";

              return "€" + value;
            }
          }
        },

        y1: {
          display: "auto",   // hides itself when Repaired Qty is switched off
          position: "right",
          beginAtZero: true,
          grace: "8%",
          border: { display: false },
          grid: { drawOnChartArea: false, drawTicks: false },
          title: { display: true, text: "Repaired Qty", color: QTY_COLOR, font: { size: 10, weight: "600" } },
          ticks: {
            color: "#64748B",
            padding: 6,
            precision: 0,
            font: tickFont,
            callback: value => fmtQty(value)
          }
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

//   const totalDTL  = dashboardData.reduce((s, r) => s + (r.dtlIssuanceCost    || 0), 0);
//   const totalPTL  = dashboardData.reduce((s, r) => s + (r.ptlIssuanceCost    || 0), 0);
//   const totalCost = dashboardData.reduce((s, r) => s + (r.totalCost          || 0), 0);
//   const totalOther = dashboardData.reduce((s, r) => s + (r.otherCost          || 0), 0); 
// const totalSub   = dashboardData.reduce((s, r) => s + (r.subModuleCost      || 0), 0); 
//   const avgCPU    = dashboardData.length
//     ? dashboardData.reduce((s, r) => s + (r.averageCostPerUnit || 0), 0) / dashboardData.length
//     : 0;

const totalDTL   = dashboardData.reduce((s, r) => s + (r.dtlIssuanceCost || 0), 0);
const totalPTL   = dashboardData.reduce((s, r) => s + (r.ptlIssuanceCost || 0), 0);
const totalCost  = dashboardData.reduce((s, r) => s + (r.totalCost       || 0), 0);
const totalOther = dashboardData.reduce((s, r) => s + (r.otherCost       || 0), 0);
const totalSub   = dashboardData.reduce((s, r) => s + (r.subModuleCost   || 0), 0);
const totalQty   = dashboardData.reduce((s, r) => s + (Number(r.totalrepairedQty) || 0), 0); // ← add this
const avgCPU = computeAverageCost(dashboardData);
// ✅ same helper — guarantees this always matches pieLegendData.avg for the same dataset
// const avgCPU = computeAvgOfAverages(dashboardData);

  // const source = drillData || { dtl: totalDTL, ptl: totalPTL, total: totalCost, avg: avgCPU };

  const source = drillData || { dtl: totalDTL, ptl: totalPTL, total: totalCost, avg: avgCPU, other: totalOther, sub: totalSub, qty: totalQty };

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
  qty:   fmtQty(source.qty)
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
  setSelectedProducts([]);
  setSelectedProductGroups([]);
  setSelectedMonth("");
  const currentYear = new Date().getFullYear();
  fetchDashboard([], currentYear.toString(), []); // ← reload default data
  setCurrentFilter(buildFilterPayload([], currentYear.toString(), []));
  if (barChartInst.current) {
    barChartInst.current.data.datasets[0].backgroundColor =
      dashboardData.map(() => "#7c3aed");
    barChartInst.current.update();
  }
};

const getDateRangeFromFilter = (monthYear) => {
  if (!monthYear) {
    const y = new Date().getFullYear();
    return { startDate: `${y}-01-01`, endDate: `${y + 1}-01-01` };
  }
  const parts = monthYear.split("-");
  if (parts.length === 1) {
    // year only, e.g. "2026"
    const y = Number(parts[0]);
    return { startDate: `${y}-01-01`, endDate: `${y + 1}-01-01` };
  }
  // "yyyy-MM"
  const [year, month] = parts.map(Number);
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);
  const fmt = d => d.toISOString().split("T")[0];
  return { startDate: fmt(start), endDate: fmt(end) };
};

const [downloadingPTL, setDownloadingPTL] = useState(false);
// which card's download is in progress (for the ⏳ indicator)
const [downloadingKey, setDownloadingKey] = useState(null);

// Cards that show a download icon → downloadType sent to download-ptlCostValidation
const CARD_DOWNLOADS = {
  other: { type: "DTL", requesterType: "Others",     title: "Download DTL issuance cost details" },
  sub:   { type: "DTL", requesterType: "Sub module", title: "Download sub module cost details" },
  ptl:   { type: "PTL", title: "Download PTL cost validation details" },
};


const handleDownloadPTL = (downloadType, requesterType) => {
   console.log("downloadType",downloadType); // PTL
  const { monthYear } = currentFilter;
  // download API (unchanged) still takes a single productname → only when exactly one is selected
  const productname = currentFilter.productnames?.length === 1 ? currentFilter.productnames[0] : "";

    // if (!productname || !monthYear) {
    //     alert("Please select Product Name and Month & Year before downloading PTL.");
    //     return;
    // }

  setDownloadingPTL(true);

  downloadPTLCostValidation({
    productname: productname || "",
    monthYear: monthYear || "",
    search: null,
    downloadType:downloadType,
    // only DTL card downloads send requesterType; PTL payload stays unchanged
    ...(requesterType ? { requesterType } : {})
  })
    .then(res => {
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const label = `${productname || "AllProducts"}_${monthYear || "AllTime"}`;
      const prefix = (downloadType || "PTL").toLowerCase();
      link.href = url;
      link.download = `${prefix}CostValidation_${label}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error("Download failed:", err);
      alert(`Failed to download ${downloadType || "PTL"} cost validation report.`);
    })
    .finally(() => { setDownloadingPTL(false); setDownloadingKey(null); });
};


const handleApply = () => {

  const hasProducts = selectedProducts.length > 0;
  const hasGroups   = selectedProductGroups.length > 0;

  // If both are selected, refresh/reset both filters (existing condition)
  if (hasProducts && hasGroups) {
    setSelectedProducts([]);
    setSelectedProductGroups([]);
    setSelectedMonth("");

    fetchDashboard([], "", []);

    setCurrentFilter(buildFilterPayload([], "", []));

    return;
  }

  if (!hasProducts && !selectedMonth && !hasGroups) {
    alert(
      "Please select at least one filter (Product Name, Product Group, or Month & Year) before applying."
    );
    return;
  }

  fetchDashboard(
    selectedProducts,
    selectedMonth,
    selectedProductGroups
  );

  setCurrentFilter(buildFilterPayload(selectedProducts, selectedMonth, selectedProductGroups));
};

//  const handleApply = () => {
//   if (!selectedProduct && !selectedMonth && !selectedProductGroup) {
//     alert("Please select at least one filter (Product Name, Product Group, or Month & Year) before applying.");
//     return;
//   }
//   fetchDashboard(selectedProduct, selectedMonth, selectedProductGroup);
//   setCurrentFilter({ productname: selectedProduct, productgroup: selectedProductGroup, monthYear: selectedMonth });
// };



// const handleApply = () => {
//   // Product Name and Product Group cannot be selected together
//   if (selectedProduct && selectedProductGroup) {
//     alert("Please select either Product Name or Product Group, not both.");
//     return;
//   }

//   // Product Group requires Month & Year
//   if (selectedProductGroup && !selectedMonth) {
//     alert("Please select Month & Year when selecting Product Group.");
//     return;
//   }

//   // At least one filter is required
//   if (!selectedProduct && !selectedMonth && !selectedProductGroup) {
//     alert(
//       "Please select at least one filter (Product Name, Product Group, or Month & Year) before applying."
//     );
//     return;
//   }

//   fetchDashboard(
//     selectedProduct,
//     selectedMonth,
//     selectedProductGroup
//   );

//   setCurrentFilter({
//     productname: selectedProduct,
//     productgroup: selectedProductGroup,
//     monthYear: selectedMonth
//   });
// };



  
  const handleReset = () => {
  setSelectedProducts([]);
  setSelectedProductGroups([]);
  setSelectedMonth("");
  fetchDashboard([], "", []);
};

  return (
    <div className="ucd-wrap">
 <LoadingOverlay loading={loading} />
      {/* Top bar */}
      <div className="ucd-topbar">
        <div className="ucd-topbar-left">
          {/* <div className="ucd-title">Unit Component Cost Dashboard</div> */}
          <h1 style={{ margin:0, fontSize:20, fontWeight:'bolder', color:'rgb(9, 146, 156)', letterSpacing:-0.5, fontFamily:'Segoe UI, sans-serif' }}>
      Unit Component Cost Analysis
    </h1>
    {/* <p style={{ margin:'1px 0 0', fontSize:9, color:'#2876e4', fontWeight:600, fontFamily:'Segoe UI, sans-serif' }}>
      Unit Component — Cost Analysis
    </p> */}
        </div>
        {/* <div className="ucd-topbar-right">
        
          {(drillMonth || selectedProduct || selectedMonth) && (
  <button className="ucd-btn-clear" onClick={handleClearDrill}>
    &#10005; Clear 
  </button>
)}
          {drillLoading && <div className="ucd-spinner" />}
          <div className="ucd-live-badge">
            <span className="ucd-live-dot" />Live Data
          </div>
        </div> */}
        <div className="ucd-topbar-right">
    {/* {(drillMonth || selectedProduct || selectedMonth) && ( */}
    {(drillMonth || selectedProducts.length > 0 || selectedProductGroups.length > 0 || selectedMonth) && (
      <button className="ucd-btn-clear" onClick={handleClearDrill}>&#10005; Clear</button>
    )}
    {drillLoading && <div className="ucd-spinner" />}
    
    <span style={{ fontSize:10, color:'#64748B', fontWeight:700, background:'#fff', padding:'4px 10px', borderRadius:16, border:'1px solid #E2E8F0', fontFamily:'Segoe UI, sans-serif' }}>
      {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
    </span>
  </div>

      </div>

      {/* Filter bar */}
      <div className="ucd-filter-bar">
        <div className="ucd-filter-group">
          {/* <div className="ucd-filter-item">
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
          </div> */}
          {/* <div className="ucd-filter-item">
  <label className="ucd-filter-label">Product Name</label>

  <input
    className="ucd-filter-input"
    type="text"
    placeholder="Type product name..."
    value={selectedProduct}
    onChange={(e) => setSelectedProduct(e.target.value)}
    list="product-name-list"
  />

  <datalist id="product-name-list">
    {productDetail.map((item, idx) => (
      <option key={idx} value={item[0]}>
        {item[0]}
      </option>
    ))}
  </datalist>
</div> */}
<div className="ucd-filter-item product-filter">
  <label className="ucd-filter-label">Product Name</label>

  <MultiSelectDropdown
    options={productNames}
    selected={selectedProducts}
    onChange={setSelectedProducts}
    allLabel="All Products"
  />
</div>

<div className="ucd-filter-item product-filter">
  <label className="ucd-filter-label">Product Group</label>

  <MultiSelectDropdown
    options={productGroups}
    selected={selectedProductGroups}
    onChange={(groups) => {
      setSelectedProductGroups(groups);
      setSelectedProducts([]); // existing rule: changing group resets product names
    }}
    allLabel="All Product Groups"
  />
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
      {/* <div className="ucd-metrics">
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
      </div> */}

      <div className="ucd-metrics">
  {METRICS_CFG.map(({ key, cls, icon, label, hint }) => (
    <div key={key} className={`ucd-metric ${cls}`} style={{ position: "relative" }}>
      <div className="ucd-metric-glow" />
      <div className="ucd-metric-icon">{icon}</div>

      {CARD_DOWNLOADS[key] && (
        <button
          onClick={() => { setDownloadingKey(key); handleDownloadPTL(CARD_DOWNLOADS[key].type, CARD_DOWNLOADS[key].requesterType); }}
          disabled={downloadingPTL}
          title={CARD_DOWNLOADS[key].title}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "transparent",
            border: "none",
            cursor: downloadingPTL ? "not-allowed" : "pointer",
            fontSize: 16,
            opacity: downloadingPTL ? 0.5 : 0.85
          }}
        >
          {downloadingPTL && downloadingKey === key ? "⏳" : "⬇️"}
        </button>
      )}

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
              <div className="ucd-card-title">{chartTitleFor(chartMode)}</div>
              <div className="ucd-card-sub">Click a bar to drill into that month</div>
            </div>
            <div className="ucd-bar-controls">
              <div className="ucd-view-select-wrap">
                <select
                  className="ucd-view-select"
                  value={chartMode}
                  onChange={e => {
                    const mode = e.target.value;
                    setChartMode(mode);
                    if (mode === "ALL") setShowQty(true);   // Select All → all three bars
                  }}
                  aria-label="Chart view"
                >
                  {CHART_MODES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className={`ucd-qty-toggle${showQty ? " on" : ""}`}
                onClick={() => setShowQty(v => !v)}
                aria-pressed={showQty}
                title={showQty ? "Hide Repaired Qty bars" : "Show Repaired Qty bars"}
              >
                <span className="ucd-qty-dot" />
                REPAIRED QTY
              </button>
              <span className="ucd-pill">{dashboardData.length} months</span>
            </div>
          </div>
          {loading
            ? <div className="ucd-chart-empty">Loading data…</div>
            : dashboardData.length === 0
              ? <div className="ucd-chart-empty">No data available</div>
              : (() => {
                  // months shown per view: 8 desktop → fewer on tablet / mobile; rest via scrollbar
                  const months   = new Set(dashboardData.filter(r => r.monthYear).map(r => r.monthYear)).size || 1;
                  const perView  = visibleMonthsFor(barViewportW);
                  const perMonth = barViewportW > 0 ? (barViewportW - BAR_AXIS_PAD) / perView : 0;
                  const innerW   = months > perView && perMonth > 0
                    ? Math.ceil(BAR_AXIS_PAD + months * perMonth)
                    : null;   // fits → 100%
                  return (
                    <div className="ucd-bar-scroll" ref={barScrollRef}>
                      <div className="ucd-canvas-bar" style={innerW ? { width: innerW } : undefined}>
                        <canvas ref={barRef} style={{ cursor: "pointer" }} />
                      </div>
                    </div>
                  );
                })()
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

      {/* Product-wise Total Value (fetchUnitComponentReportSeprateProductMMPDashboard) */}
      {ENABLE_PRODUCT_TOTALS_REPORT && (
      <div className="ucd-card ucd-card-ptv">
        <div className="ucd-card-head">
          <div>
            <div className="ucd-card-title">Product-wise Total Value</div>
            <div className="ucd-card-sub">SUM(Value) by product name for the selected filters</div>
          </div>
          <span className="ucd-pill">{productTotals.length} products</span>
        </div>
        {productTotalsLoading
          ? <div className="ucd-chart-empty">Loading data…</div>
          : productTotals.length === 0
            ? <div className="ucd-chart-empty">No data available</div>
            : <div className="ucd-ptv-scroll">
                <table className="ucd-ptv-table">
                  <thead>
                    <tr><th>#</th><th>Product Name</th><th className="num">Total Value (€)</th></tr>
                  </thead>
                  <tbody>
                    {productTotals.map((r, i) => (
                      <tr key={`${r.productName}-${i}`}>
                        <td>{i + 1}</td>
                        <td>{r.productName || "—"}</td>
                        <td className="num">{fmtFull(r.totalValue || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td />
                      <td>Total</td>
                      <td className="num">
                        {fmtFull(productTotals.reduce((s, r) => s + (Number(r.totalValue) || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
        }
      </div>
      )}
    </div>
  );
};

export default UnitCom_CostDashboard;
