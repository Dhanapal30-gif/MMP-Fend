import React, { useState, useEffect, useRef } from 'react';

import IssuanceReportTextFiled from "../../components/IssuanceReport/IssuanceReportTextFiled";
import IssuanceReportTable from "../../components/IssuanceReport/IssuanceReportTable";
import ReworkerSummaryTextfiled from "../../components/ReworkerSummary/ReworkerSummaryTextfiled";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { downloadIssuanceReportFilter, downloadReceivingReportFilter, fetchPartcodeDasboard, fetchPartcodeReport, fetchReworkDashboard, getIssuanceReportDetailFilter, getRecevingReportDetailFilter } from '../../Services/Services_09';
import { downloadLocalReport, downloadLocalReportFilter, downloadLocalReportSearch, fetchBoardSerialNumber, fetchProduct_Partcode, fetchproductPtl, fetchRepaier, getindiviualDetailFilter, getindiviualDetailFind, getLocalDetailFind, getLocalINdiviual, getLocalMaster, getLocalReport, getLocalReportDetailFilter, savePTLRepaier, savePTLRequest, savePTLStore } from '../../Services/Services_09';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);


const ReworkerSummaryDashboard = () => {

  const [partcodes, setPartcodes] = useState([]);
  const [productnames, setProductnames] = useState([]);
  const [boardserialnumbers, setBoardserialnumbers] = useState([]);
  const [types, setTypes] = useState([]);
  const [recordstatuses, setRecordstatuses] = useState([]);
  const [reworkernames, setReworkerNames] = useState([]);
  const [typeSummary, setTypeSummary] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalSummary, setTotalSummary] = useState([]);
  const [totalPartcode, setTotalPartcode] = useState([]);
  const [totalReworkerQty, setTotalReworkQty] = useState([]);
  const [totalProductSummary, setProductSummary] = useState([]);
  const [reworkBar, setReworkBar] = useState(false);
  const [clearButton, setClearButton] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [weekResetKey, setWeekResetKey] = useState(0);

  const years = ["2023", "2024", "2025", "2026"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const statusMap = {
    "MSC00001": "Not Start",
    "MSC00003": "Ongoing",
    "MSC00004": "Closed",
    "MSC00005": "Reject"
  };

  const currentYear = new Date().getFullYear().toString();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState("");
  const [weeks, setWeeks] = useState([]);
  const [filters, setFilters] = useState({
    partcode: "",
    productname: "",
    boardserialnumber: "",
    type: "",
    reworkname: "",
    status: "",
    year: currentYear,
    month: "",
    week: ""
  });

  const reverseStatusMap = Object.fromEntries(
    Object.entries(statusMap).map(([k, v]) => [v, k])
  );

  const handleFilterChange = (key, value) => {
    setReworkBar(false);
    setClearButton(true);

    let finalValue = value;

    if (key === "month") {
      const index = months.indexOf(value) + 1;
      finalValue = index.toString().padStart(2, "0");
    }

    if (key === "status") {
      finalValue = reverseStatusMap[value] || value;
    }
    setFilters(prev => ({
      ...prev,
      [key]: finalValue
    }));
  };

  const handleYearChange = (value) => {
    setYear(value);
    setFilters(prev => ({
      ...prev,
      year: value
    }));
  };

  const calledRef = useRef(false);

  useEffect(() => {
    fetchDashboard1();
  }, [filters]);

  useEffect(() => {
    fetchPartcodeList();
  }, []);

  const fetchPartcodeList = () => {
    fetchPartcodeDasboard()
      .then((response) => {
        const data = response.data;
        setPartcodes(data.partcodes || []);
        setProductnames(data.productnames || []);
        setBoardserialnumbers(data.boardserialnumbers || []);
        setTypes(data.types || []);
        const formattedStatuses = (data.recordstatuses || []).map(
          code => statusMap[code] || code
        );
        setRecordstatuses(formattedStatuses);
        setReworkerNames(data.reworkernames || []);
      })
      .catch((error) => { });
  };

  const fetchDashboard1 = async () => {
    try {
      const response = await fetchReworkDashboard(filters);
      const data = response.data.data || {};

      if (!reworkBar) {
        setTotalSummary(data.totalSummary || {});
      }
      setWeeklyData(data.totalWeeklySummary || []);
      setTypeSummary(data.typeSummary || []);
      setTotalPartcode(data.partcodeList || []);
      setTotalReworkQty(data.ReworkerList || []);
      setProductSummary(data.productNameList || []);
      

    } catch (error) {
      setTotalSummary({});
      setTypeSummary([]);
    }
  };

  useEffect(() => {
    if (year) {
      const weekList = Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`);
      setWeeks(weekList);
    } else {
      setWeeks([]);
    }
  }, [year]);

  const chartData = {
    labels: totalSummary.map(item => `PO${item.month}`),
    datasets: [
      {
        label: 'Total boards',
        data: totalSummary.map(item => item.totalBoards),
        backgroundColor: '#08894f ',
        borderRadius: 5,
        borderSkipped: false,
        barPercentage: 0.75,
        categoryPercentage: 0.6,
      },
      {
        label: 'Total picked qty',
        data: totalSummary.map(item => item.totalPickedQty),
        backgroundColor: '#217af6 ',
        borderRadius: 5,
        borderSkipped: false,
        barPercentage: 0.75,
        categoryPercentage: 0.6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      setReworkBar(true);
      setClearButton(true);
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedLabel = chartData.labels[index];
        const monthNumber = clickedLabel.replace('PO', '').padStart(2, '0');
        setWeekResetKey(prev => prev + 1);
        setFilters(prev => ({
          ...prev,
          month: monthNumber,
          week: ""
        }));
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ctx.parsed.y,
        },
      },
      datalabels: {
        color: 'White',              // ← changed to black
        anchor: 'center',
        align: 'center',
        font: { weight: 'bold', size: 12 },
        formatter: value => value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value,
        rotation: -90,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'black' } },   // ← black
      y: { grid: { color: 'rgba(0,0,0,0.07)' }, ticks: { color: 'black' } },  // ← black
    },
  };


   const weekchartData = {
  labels: weeklyData.map(item => `W${item.week}`),  // ← changed from item.month to item.week
  datasets: [
    {
      label: 'Total boards',
      data: weeklyData.map(item => item.totalBoards),
      backgroundColor: '#07b466',
      borderRadius: 5,
      borderSkipped: false,
      barPercentage: 0.75,
      categoryPercentage: 0.6,
    },
    {
      label: 'Total picked qty',
      data: weeklyData.map(item => item.totalPickedQty),
      backgroundColor: '#cd1580',
      borderRadius: 5,
      borderSkipped: false,
      barPercentage: 0.75,
      categoryPercentage: 0.6,
    },
  ],
};

  const weekchartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // onClick: (event, elements) => {
    //   setReworkBar(true);
    //   setClearButton(true);
    //   if (elements.length > 0) {
    //     const index = elements[0].index;
    //     const clickedLabel = weekchartData.labels[index];
    //     const monthNumber = clickedLabel.replace('PO', '').padStart(2, '0');
    //     setWeekResetKey(prev => prev + 1);
    //     setFilters(prev => ({
    //       ...prev,
    //       month: monthNumber,
    //       week: ""
    //     }));
    //   }
    // },
    onClick: (event, elements) => {
  setReworkBar(true);
  setClearButton(true);
  if (elements.length > 0) {
    const index = elements[0].index;
    const clickedLabel = weekchartData.labels[index]; // e.g. "W3"
    const weekNumber = parseInt(clickedLabel.replace('W', ''));  // ← extract week number
    setFilters(prev => ({
      ...prev,
      week: weekNumber
    }));
  }
},
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ctx.parsed.y,
        },
      },
      datalabels: {
        color: 'white',              // ← changed to black
        anchor: 'center',
        align: 'center',
        font: { weight: 'bold', size: 12 },
        formatter: value => value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value,
        rotation: -90,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'black' } },   // ← black
      y: { grid: { color: 'rgba(0,0,0,0.07)' }, ticks: { color: 'black' } },  // ← black
    },
  };

  const sortedPartcode = [...totalPartcode].sort((a, b) => b.partcodePickedQty - a.partcodePickedQty);

  const partcodeChartData = {
    labels: sortedPartcode.map(p => p.partcode),
    datasets: [
      {
        label: 'Picked Qty',
        data: sortedPartcode.map(p => p.partcodePickedQty),
        backgroundColor: '#20b2c8',
        borderRadius: 3,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const partcodeChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed.x.toLocaleString()}`,
        },
      },
      datalabels: {
        color: 'black',              // ← changed to black
        anchor: 'end',
        align: 'end',
        offset: 4,
        font: { size: 11, weight: 'bold' },
        formatter: value => value >= 1000000
          ? (value / 1000000).toFixed(1) + 'M'
          : value >= 1000
            ? (value / 1000).toFixed(1) + 'K'
            : value,
        clip: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: 'black',            // ← changed to black
          font: { size: 11 },
        },
      },
    },
    layout: {
      padding: { right: 50 },
    },
  };

  const sortedRework = [...totalReworkerQty].sort((a, b) => b.reworkerPickedQty - a.reworkerPickedQty);

  const reworkerChartData = {
    labels: sortedRework.map(p => p.reworkername),
    datasets: [
      {
        label: 'Picked Qty',
        data: sortedRework.map(p => p.reworkerPickedQty),
        backgroundColor: '#ecb11c',
        borderRadius: 3,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const reworkerChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed.x.toLocaleString()}`,
        },
      },
      datalabels: {
        color: 'black',              // ← changed to black
        anchor: 'end',
        align: 'end',
        offset: 4,
        font: { size: 11, weight: 'bold' },
        formatter: value => value >= 1000000
          ? (value / 1000000).toFixed(1) + 'M'
          : value >= 1000
            ? (value / 1000).toFixed(1) + 'K'
            : value,
        clip: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: 'black',            // ← changed to black
          font: { size: 11 },
        },
      },
    },
    layout: {
      padding: { right: 50 },
    },
  };

  const sortedProduct = [...totalProductSummary].sort((a, b) => b.productPickedQty - a.productPickedQty);

  const productChartData = {
    labels: sortedProduct.map(p => p.productname),
    datasets: [
      {
        label: 'Picked Qty',
        data: sortedProduct.map(p => p.productPickedQty),
        backgroundColor: '#0ce4a7',
        borderRadius: 3,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const productChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed.x.toLocaleString()}`,
        },
      },
      datalabels: {
        color: 'black',              // ← changed to black
        anchor: 'end',
        align: 'end',
        offset: 4,
        font: { size: 11, weight: 'bold' },
        formatter: value => value >= 1000000
          ? (value / 1000000).toFixed(1) + 'M'
          : value >= 1000
            ? (value / 1000).toFixed(1) + 'K'
            : value,
        clip: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: 'black',            // ← changed to black
          font: { size: 11 },
        },
      },
    },
    layout: {
      padding: { right: 50 },
    },
  };

  const formClear = () => {
    setFilters({
      partcode: "",
      productname: "",
      boardserialnumber: "",
      type: "",
      reworker: "",
      status: "",
      year: currentYear,
      month: "",
      week: ""
    });
    setYear(currentYear);
    setMonth("");
    setResetKey(prev => prev + 1);
    setWeekResetKey(prev => prev + 1);
    setClearButton(false);
  };


  
  return (
    <div>
      <div className='dashboardHeader'>
        <div className='dashboardDropdown' key={resetKey}>
          <ReworkerSummaryTextfiled label="Partcode" options={partcodes}
            onChange={(v) => handleFilterChange("partcode", v)} />

          <ReworkerSummaryTextfiled label="Product Names" options={productnames}
            onChange={(v) => handleFilterChange("productname", v)} />

          <ReworkerSummaryTextfiled label="Boardserial Numbers" options={boardserialnumbers}
            onChange={(v) => handleFilterChange("boardserialnumber", v)} />

          <ReworkerSummaryTextfiled label="ReworkerType" options={types}
            onChange={(v) => handleFilterChange("type", v)} />

          <ReworkerSummaryTextfiled label="Reworker" options={reworkernames}
            onChange={(v) => handleFilterChange("reworkname", v)} />

          <ReworkerSummaryTextfiled label="Status" options={recordstatuses}
            onChange={(v) => handleFilterChange("status", v)} />

          <ReworkerSummaryTextfiled label="Year" options={years}
            onChange={(v) => {
              setYear(v);
              handleFilterChange("year", v);
            }} />

          <ReworkerSummaryTextfiled label="Month" options={months}
            onChange={(v) => {
              setMonth(v);
              handleFilterChange("month", v);
            }}
          />

          <ReworkerSummaryTextfiled
            key={weekResetKey}
            label="Week"
            options={weeks}
            onChange={(v) => {
              const weekNumber = parseInt(v.replace("Week ", ""));
              handleFilterChange("week", weekNumber);
            }}
          />

          {clearButton &&
            <div className="ComCssDashboardButtonMenu">
              <button className='ComCssSubmitButton' onClick={formClear}> Clear</button>
            </div>
          }
        </div>
      </div>

      <div className='dashFlexboxA'>
        <div style={{
          padding: '16px',
          minHeight: '360px',
          borderRadius: '8px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, fontSize: 15, color: 'Blue' }}>  {/* ← black */}
            <span>Rework Qty by Rework Type</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12, color: 'black' }}>  {/* ← black */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10ca95', display: 'inline-block' }} />
              Module Qty
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#dd37b4', display: 'inline-block' }} />
              Component Changed Qty
            </span>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div style={{
          padding: '16px',
          minHeight: '360px',
          borderRadius: '8px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, fontSize: 15, color: 'Blue' }}>  {/* ← black */}
            <span>Rework Qty by Rework Type</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12, color: 'black' }}>  {/* ← black */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10ca95', display: 'inline-block' }} />
              Module Qty
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#dd37b4', display: 'inline-block' }} />
              Component Changed Qty
            </span>
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <Bar data={weekchartData} options={weekchartOptions} />
          </div>
          
        </div>
      </div>

      <div className='dashFlexbox'>
        <div>
           <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, fontSize: 15, color: 'Blue' }}>  {/* ← black */}
              <span>Rework Qty by ReworkType</span>
            </div>
           <div style={{ flex: 1, minHeight: '250px', position: 'relative' }}>
            <Doughnut
              data={{
                labels: typeSummary.map(t => t.type),
                datasets: [
                  {
                    data: typeSummary.map(t => t.percentage),
                    backgroundColor: ['#dbcb1b', '#dd37b4', '#37dd8a', '#37e515', '#378add'],
                    borderColor: 'white',
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 60 },
                onClick: (event, elements) => {
                  setReworkBar(true);
                  setClearButton(true);
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const clickedType = typeSummary[index].type;
                    setWeekResetKey(prev => prev + 1);
                    setFilters(prev => ({
                      ...prev,
                      type: clickedType,
                      week: ""
                    }));
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: ctx => {
                        const t = typeSummary[ctx.dataIndex];
                        const pct = t.percentage != null ? t.percentage.toFixed(2) : '0.00';
                        return `${t.type}: ${t.typePickedQty} (${pct}%)`;
                      },
                    },
                  },
                  datalabels: {
                    color: 'black',          // ← changed to black
                    anchor: 'end',
                    align: 'end',
                    offset: 14,
                    font: { size: 12, weight: 'bold' },
                    clip: false,
                    formatter: (value, ctx) => {
                      const t = typeSummary[ctx.dataIndex];
                      const pct = t.percentage != null ? t.percentage.toFixed(1) : '0.0';
                      return `${t.type}\n${t.typePickedQty} (${pct}%)`;
                    },
                  },
                },
              }}
              plugins={[
                {
                  id: 'arrowConnectors',
                  afterDraw(chart) {
                    const { ctx } = chart;
                    const meta = chart.getDatasetMeta(0);
                    meta.data.forEach((arc, i) => {
                      const model = arc;
                      const midAngle = (model.startAngle + model.endAngle) / 2;
                      const outerRadius = model.outerRadius;
                      const cx = model.x;
                      const cy = model.y;
                      const x1 = cx + Math.cos(midAngle) * (outerRadius + 4);
                      const y1 = cy + Math.sin(midAngle) * (outerRadius + 4);
                      const x2 = cx + Math.cos(midAngle) * (outerRadius + 22);
                      const y2 = cy + Math.sin(midAngle) * (outerRadius + 22);
                      const colors = ['#dbcb1b', '#dd37b4', '#37dd8a', '#378add', '#8c1ac9'];
                      ctx.save();
                      ctx.strokeStyle = colors[i % colors.length];
                      ctx.lineWidth = 1.5;
                      ctx.setLineDash([]);
                      ctx.beginPath();
                      ctx.moveTo(x1, y1);
                      ctx.lineTo(x2, y2);
                      ctx.stroke();
                      const arrowSize = 5;
                      const angle = Math.atan2(y2 - y1, x2 - x1);
                      ctx.fillStyle = colors[i % colors.length];
                      ctx.beginPath();
                      ctx.moveTo(x2, y2);
                      ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 6), y2 - arrowSize * Math.sin(angle - Math.PI / 6));
                      ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 6), y2 - arrowSize * Math.sin(angle + Math.PI / 6));
                      ctx.closePath();
                      ctx.fill();
                      ctx.restore();
                    });
                  },
                },
              ]}
            />
          </div>
          </div>
        </div>
        <div>
          
          <div style={{
            overflowY: 'auto',
            height: '180px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#20b2c8 transparent',
            marginTop: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, fontSize: 15, color: 'Blue' }}>  {/* ← black */}
              <span>Rework Qty by Partcode</span>
            </div>
            <div style={{
              position: 'relative',
              height: `${Math.max(totalPartcode.length * 38, 200)}px`,
              minHeight: '200px',
            }}>
              <Bar data={partcodeChartData} options={partcodeChartOptions} />
            </div>
          </div>
        </div>

        <div>
          <div style={{
            overflowY: 'auto',
            height: '180px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#20b2c8 transparent',
            marginTop: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, fontSize: 15, color: 'Blue' }}>  {/* ← black */}
              <span>Rework Qty by Reworker</span>
            </div>
            <div style={{
              position: 'relative',
              height: `${Math.max(totalReworkerQty.length * 38, 200)}px`,
              minHeight: '200px',
            }}>
              <Bar data={reworkerChartData} options={reworkerChartOptions} />
            </div>
          </div>
        </div>

        <div>
          <div style={{
            overflowY: 'auto',
            height: '180px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#20b2c8 transparent',
            marginTop: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, fontSize: 15, color: 'Blue' }}>  {/* ← black */}
              <span>Rework Qty by Product</span>
            </div>
            <div style={{
              position: 'relative',
              height: `${Math.max(totalProductSummary.length * 38, 200)}px`,
              minHeight: '200px',
            }}>
              <Bar data={productChartData} options={productChartOptions} />
            </div>
          </div>
          
        </div>
       
      </div>
    </div>
  );
};

export default ReworkerSummaryDashboard;