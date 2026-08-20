import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { getUnitcompoenentDetailFilter } from '../../Services/Services_09';
import { downloadPTLCostValidation, getProductAndPartcode } from '../../Services/Services';
import './UnitCom_CostDashboard.css';

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
  const [currentFilter, setCurrentFilter] = useState({ productname: "", monthYear: "" });
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
const [productSearch, setProductSearch] = useState("");
const productDropdownRef = useRef(null);

  useEffect(() => { dashboardDataRef.current = dashboardData; }, [dashboardData]);
  useEffect(() => { selectedProductRef.current = selectedProduct; }, [selectedProduct]);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      productDropdownRef.current &&
      !productDropdownRef.current.contains(event.target)
    ) {
      setProductDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  useEffect(() => {
    fetchPartAndProduct();
    const currentYear = new Date().getFullYear();
    fetchDashboard("", currentYear.toString());
      setCurrentFilter({ productname: "", monthYear: currentYear.toString() }); // ← add
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
  // const data = [...dashboardDataRef.current].sort((a, b) =>
  //   a.monthYear.localeCompare(b.monthYear)
  // );

  const data = [...dashboardDataRef.current]
  .filter(r => r.monthYear)
  .sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  const labels = data.map(r => periodLabel(r.monthYear));

  barChartInst.current = new Chart(barRef.current, {
    type: "bar",
    data: {
      labels,
      // datasets: [{
      //   label: "Total cost",
      //   data:  data.map(r => r.totalCost || 0),
      //  backgroundColor: data.map(() => "#10B981"),
      //   borderRadius: 8,
      //   borderSkipped: false,
      //   hoverBackgroundColor: "#f59e0b",
      // }]
      datasets: [
  {
    label: "Total Cost (€)",
    data: data.map(r => r.totalCost || 0),
    backgroundColor: "#10B981",
    borderRadius: 8,
    yAxisID: "y",
  },
  {
    label: "Repaired Qty",
    data: data.map(r => r.totalrepairedQty || 0),
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    yAxisID: "y1",
  },
  {
    label: "Average Value",
    data: data.map(r => r.averageCostPerUnit || 0),
    backgroundColor: "#cd0792",
    borderRadius: 8,
    yAxisID: "y2",
  }
]
    },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend:     { display: false },
          datalabels: { display: false },
          // tooltip: {
          //   backgroundColor: "#0f0720",
          //   titleColor: "#a78bfa",
          //   bodyColor: "#e8d8f8",
          //   padding: 12,
          //   cornerRadius: 10,
          //   callbacks: {
          //     title: ctx => `${ctx[0].label}`,
          //     label: ctx => `  Total cost: ${fmtFull(ctx.raw)}`
          //   }
          // }
          tooltip: {
  backgroundColor: "#0f0720",
  titleColor: "#a78bfa",
  bodyColor: "#e8d8f8",
  padding: 12,
  cornerRadius: 10,
  callbacks: {
    title: (ctx) => ctx[0].label,

    label: (ctx) => {
      if (ctx.dataset.label === "Total Cost (€)") {
        return `Total Cost: ${fmtFull(ctx.raw)}`;
      }

      if (ctx.dataset.label === "Repaired Qty") {
        return `Repaired Qty: ${ctx.raw}`;
      }

      if (ctx.dataset.label === "Average Value") {
        return `Average Value: ${fmtFull(ctx.raw)}`;
      }

      return ctx.raw;
    }
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
          setCurrentFilter({ productname: selectedProductRef.current || "", monthYear }); // ← add


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
//         scales: {
//           x: {
//             ticks: { autoSkip: false, maxRotation: 0, font: { size: 12 }, color: "#135bd7" },
//             grid:  { display: false }
//           },
//           y: {
//   ticks: {
//     color: "#0a5be8",
//     font: { size: 12 },
//     callback: v => {
//       if (v >= 1_000_000) return '€' + (v / 1_000_000).toFixed(1) + 'M';
//       if (v >= 1_000)     return '€' + (v / 1_000).toFixed(0) + 'K';
//       return '€' + v;
//     }
//   },
//   grid: { color: "rgba(124,58,237,0.08)" }
// }
//         }

scales: {
  x: {
    ticks: {
      autoSkip: false,
      maxRotation: 0,
      color: "#135bd7"
    }
  },

  y: {
    position: "left",
    beginAtZero: true,
    ticks: {
      callback: value => {
        if (value >= 1000)
          return "€" + (value / 1000).toFixed(0) + "K";
        return "€" + value;
      }
    }
  },

  y1: {
    position: "right",
    beginAtZero: true,
    grid: {
      drawOnChartArea: false
    },
    ticks: {
      callback: value => value
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
    setCurrentFilter({ productname: "", monthYear: currentYear.toString() }); // ← add
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


const handleDownloadPTL = (downloadType) => {
   console.log("downloadType",downloadType); // PTL
  const { productname, monthYear } = currentFilter;

    if (!productname || !monthYear) {
        alert("Please select Product Name and Month & Year before downloading PTL.");
        return;
    }

  setDownloadingPTL(true);

  downloadPTLCostValidation({
    productname: productname || "",
    monthYear: monthYear || "",
    search: null,
    downloadType:downloadType
  })
    .then(res => {
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      const label = `${productname || "AllProducts"}_${monthYear || "AllTime"}`;
      link.href = url;
      link.download = `ptlCostValidation_${label}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error("Download failed:", err);
      alert("Failed to download PTL cost validation report.");
    })
    .finally(() => setDownloadingPTL(false));
};

  // const handleApply = () => fetchDashboard(selectedProduct, selectedMonth);
  const handleApply = () => {
  // if (!selectedProduct && !selectedMonth) {
  //   alert("Please select at least one filter (Product Name or Month & Year) before applying.");
  //   return;
  // }
  if (!selectedProduct || !selectedMonth) {
    alert("Please select both Product Name and Month & Year before applying.");
    return;
  }
  fetchDashboard(selectedProduct, selectedMonth);
    setCurrentFilter({ productname: selectedProduct, monthYear: selectedMonth }); // ← add
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
    {(drillMonth || selectedProduct || selectedMonth) && (
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

  <div className="product-dropdown" ref={productDropdownRef}>

    <input
      className="ucd-filter-input"
      type="text"
      placeholder="All Products"
      value={selectedProduct}
      onFocus={() => {
        setProductDropdownOpen(true);
        setProductSearch("");
      }}
      onChange={(e) => {
        setSelectedProduct(e.target.value);
        setProductSearch(e.target.value);
        setProductDropdownOpen(true);
      }}
    />

    {productDropdownOpen && (
      <div className="product-dropdown-menu">

        <div
          className="product-dropdown-item"
          onClick={() => {
            setSelectedProduct("");
            setProductSearch("");
            setProductDropdownOpen(false);
          }}
        >
          All Products
        </div>

        {productDetail
          .filter((item) =>
            item[0]
              ?.toString()
              .toLowerCase()
              .includes(productSearch.toLowerCase())
          )
          .map((item, idx) => (
            <div
              key={idx}
              className="product-dropdown-item"
              onClick={() => {
                setSelectedProduct(item[0]);
                setProductSearch("");
                setProductDropdownOpen(false);
              }}
            >
              {item[0]}
            </div>
          ))}

      </div>
    )}

  </div>
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

      {key === "ptl" && (
        <button
          // onClick={handleDownloadPTL}
              onClick={() => handleDownloadPTL("PTL")}
          disabled={downloadingPTL}
          title="Download PTL cost validation details"
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
          {downloadingPTL ? "⏳" : "⬇️"}
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
