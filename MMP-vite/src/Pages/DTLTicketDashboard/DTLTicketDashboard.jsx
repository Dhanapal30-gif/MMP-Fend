import React, { useState, useEffect, useRef } from 'react';
import ReworkerSummaryTextfiled from "../../components/ReworkerSummary/ReworkerSummaryTextfiled";
import { fetchDTLSummaryDashboard, fetchDTLSummaryDashboardPartcodeList } from '../../Services/Services_09';
import {
  Chart as ChartJS, BarElement, CategoryScale,
  LinearScale, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const DTLTicketDashboard = () => {
  const currentYear = new Date().getFullYear().toString();

  const years  = ["2025", "2026"];
  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const statusOptions = ["Ongoing", "Closed", "Pending"];

  const statusMap        = { Ongoing: "MSC00003", Closed: "MSC00004", Pending: "MSC00002" };
  const reverseStatusMap = Object.fromEntries(Object.entries(statusMap).map(([k,v])=>[v,k]));

  const [year,          setYear]          = useState(currentYear);
  const [weeks,         setWeeks]         = useState([]);
  const [resetKey,      setResetKey]      = useState(0);
  const [weekResetKey,  setWeekResetKey]  = useState(0);
  const [clearButton,   setClearButton]   = useState(false);
  const [clickedBar,    setClickedBar]    = useState(false);

  // ── chart data states ───────────────────────────────────────────────────────
  const [monthlySummary,       setMonthlySummary]       = useState([]);
  const [weeklySummary,        setWeeklySummary]        = useState([]);
  const [requesterTypeSummary, setRequesterTypeSummary] = useState([]);
    const [partcodeList,        setPartcodeList]        = useState([]);
      const [requesterTypeList,        setRequesterTypeList]        = useState([]);

  const [filters, setFilters] = useState({
    partcode:      "",
    requestertype: "",
    status:        "",
    year:          currentYear,
    month:         "",
    week:          "",
    startDate:     "",
    endDate:       "",
  });

  // populate week dropdown whenever year changes
  useEffect(() => {
    setWeeks(year ? Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`) : []);
  }, [year]);

  // re-fetch whenever filters change
  useEffect(() => { fetchDashboard(); }, [filters]);

  useEffect(() => {
     fetchDashboardPartcodeList();
     }, []);

  const fetchDashboard = async () => {
    try {
      const res  = await fetchDTLSummaryDashboard(filters);
    //   const data = res.data || {};
    const data = res.data.data || {};

      if (!clickedBar) setMonthlySummary(data.monthlySummary || []);
      setWeeklySummary(data.weeklySummary               || []);
      setRequesterTypeSummary(data.requesterTypeSummary || []);
    } catch {
      setMonthlySummary([]);
      setWeeklySummary([]);
      setRequesterTypeSummary([]);
    }
  };

  const fetchDashboardPartcodeList = async () => {
    try {
      const res  = await fetchDTLSummaryDashboardPartcodeList();
    //   const data = res.data || {};
    const data = res.data || {};

      
      setPartcodeList(data.partcodes               || []);
      setRequesterTypeList(data.requestertypes || []);
    } catch {
        setPartcodeList([]);
        setRequesterTypeList([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setClearButton(true);
    setClickedBar(false);

    let final = value;
    if (key === "month") {
      const idx = months.indexOf(value) + 1;
      final = idx.toString().padStart(2, "0");
    }
    if (key === "status") final = statusMap[value] || value;

    setFilters(prev => ({ ...prev, [key]: final }));
  };

  const formClear = () => {
    setFilters({
      partcode:"", requestertype:"", status:"",
      year: currentYear, month:"", week:"",
      startDate:"", endDate:""
    });
    setYear(currentYear);
    setClickedBar(false);
    setClearButton(false);
    setResetKey(p => p + 1);
    setWeekResetKey(p => p + 1);
  };

  // ── shared datalabels plugin config ─────────────────────────────────────────
  const datalabelsCenter = {
    color: '#fff', anchor: 'center', align: 'center',
    font: { weight: 'bold', size: 11 }, rotation: -90,
    formatter: v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v,
  };

  // ── Monthly chart ────────────────────────────────────────────────────────────
  const monthChartData = {
    labels: monthlySummary.map(d => `P${d.month}`),
    datasets: [
      {
        label: 'Total Tickets',
        data: monthlySummary.map(d => d.totalTicket),
        backgroundColor: '#1e4db7', borderRadius: 4, borderSkipped: false,
        barPercentage: 0.75, categoryPercentage: 0.6,
      },
      {
        label: 'Total Partcodes',
        data: monthlySummary.map(d => d.totalPartcode),
        backgroundColor: '#08894f', borderRadius: 4, borderSkipped: false,
        barPercentage: 0.75, categoryPercentage: 0.6,
      },
    ],
  };

  const monthChartOptions = {
    responsive: true, maintainAspectRatio: false,
    onClick: (_, elements) => {
      if (!elements.length) return;
      setClickedBar(true); setClearButton(true);
      const m = monthlySummary[elements[0].index].month;
      setWeekResetKey(p => p + 1);
      setFilters(prev => ({ ...prev, month: String(m).padStart(2,'0'), week: '' }));
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ctx.parsed.y } },
      datalabels: datalabelsCenter,
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#555', font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,.06)' },
           ticks: { color: '#555', font: { size: 10 },
                    callback: v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v } },
    },
  };

  // ── Weekly chart ─────────────────────────────────────────────────────────────
  const weekChartData = {
    labels: weeklySummary.map(d => `W${d.week}`),
    datasets: [
      {
        label: 'Total Tickets',
        data: weeklySummary.map(d => d.totalTicket),
        backgroundColor: '#07b466', borderRadius: 4, borderSkipped: false,
        barPercentage: 0.75, categoryPercentage: 0.6,
      },
      {
        label: 'Total Partcodes',
        data: weeklySummary.map(d => d.totalPartcode),
        backgroundColor: '#cd1580', borderRadius: 4, borderSkipped: false,
        barPercentage: 0.75, categoryPercentage: 0.6,
      },
    ],
  };

  const weekChartOptions = {
    responsive: true, maintainAspectRatio: false,
    onClick: (_, elements) => {
      if (!elements.length) return;
      setClickedBar(true); setClearButton(true);
      const w = weeklySummary[elements[0].index].week;
      setFilters(prev => ({ ...prev, week: w }));
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ctx.parsed.y } },
      datalabels: datalabelsCenter,
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#555', font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,.06)' },
           ticks: { color: '#555', font: { size: 10 },
                    callback: v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v } },
    },
  };

  // ── Requester Type chart (horizontal) ────────────────────────────────────────
  const reqChartData = {
    labels: requesterTypeSummary.map(d => d.requestertype),
    datasets: [
      {
        label: 'Total Tickets',
        data: requesterTypeSummary.map(d => d.totalTicket),
        backgroundColor: '#7f3fbf', borderRadius: 3, borderSkipped: false,
        barPercentage: 0.6, categoryPercentage: 0.7,
      },
      {
        label: 'Total Partcodes',
        data: requesterTypeSummary.map(d => d.totalPartcode),
        backgroundColor: '#e07b00', borderRadius: 3, borderSkipped: false,
        barPercentage: 0.6, categoryPercentage: 0.7,
      },
    ],
  };

  const reqChartOptions = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    onClick: (_, elements) => {
      if (!elements.length) return;
      setClickedBar(true); setClearButton(true);
      const rt = requesterTypeSummary[elements[0].index].requestertype;
      setFilters(prev => ({ ...prev, requestertype: rt }));
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ctx.parsed.x } },
      datalabels: {
        color: '#fff', anchor: 'center', align: 'center',
        font: { weight: 'bold', size: 11 },
        formatter: v => v >= 1000 ? (v/1000).toFixed(1)+'K' : v,
      },
    },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { grid: { display: false }, ticks: { color: '#555', font: { size: 11 } } },
    },
    layout: { padding: { right: 10 } },
  };

  const Legend = ({ items }) => (
    <div style={{ display:'flex', gap:14, fontSize:12, color:'#555',
                  marginBottom:10, justifyContent:'center', flexWrap:'wrap' }}>
      {items.map(({ color, label }) => (
        <span key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:10, height:10, borderRadius:2,
                         background:color, display:'inline-block' }} />
          {label}
        </span>
      ))}
    </div>
  );

  return (
    <div>
      {/* ── Header / Filters ─────────────────────────────────── */}
      <div className='dashboardHeader'>
        <div className='dashboardDropdown' key={resetKey}>

         {/* Partcode — was options={[]} */}
<ReworkerSummaryTextfiled
  label="Partcode"
  options={partcodeList}            
  onChange={v => handleFilterChange("partcode", v)}
/>

{/* Requester Type — was hardcoded ["Internal","External","Vendor"] */}
<ReworkerSummaryTextfiled
  label="Requester Type"
  options={requesterTypeList}        
  onChange={v => handleFilterChange("requestertype", v)}
/>

          {/* <ReworkerSummaryTextfiled label="Status" options={statusOptions}
            onChange={v => handleFilterChange("status", v)} /> */}

          <ReworkerSummaryTextfiled label="Year" options={years}
            onChange={v => { setYear(v); handleFilterChange("year", v); }} />

          <ReworkerSummaryTextfiled label="Month" options={months}
            onChange={v => handleFilterChange("month", v)} />

          <ReworkerSummaryTextfiled key={weekResetKey} label="Week" options={weeks}
            onChange={v => {
              const w = parseInt(v.replace("Week ", ""));
              handleFilterChange("week", w);
            }} />

          {/* Start Date */}
          <div className="ComCssDashboardButtonMenu"
               style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <label style={{ fontSize:10, fontWeight:600, marginBottom:2, color:'#fff' }}>
              Start Date
            </label>
            <input type="date" value={filters.startDate}
              onChange={e => {
                setClearButton(true);
                setFilters(prev => ({ ...prev, startDate: e.target.value }));
              }}
              style={{ padding:'3px 6px', borderRadius:6, border:'1px solid #ccc',
                       fontSize:11, height:'28px', boxSizing:'border-box' }} />
          </div>

          {/* End Date */}
          <div className="ComCssDashboardButtonMenu"
               style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <label style={{ fontSize:10, fontWeight:600, marginBottom:2, color:'#fff' }}>
              End Date
            </label>
            <input type="date" value={filters.endDate}
              onChange={e => {
                setClearButton(true);
                setFilters(prev => ({ ...prev, endDate: e.target.value }));
              }}
              style={{ padding:'3px 6px', borderRadius:6, border:'1px solid #ccc',
                       fontSize:11, height:'28px', boxSizing:'border-box' }} />
          </div>

          {clearButton && (
            <div className="ComCssDashboardButtonMenu">
              <button className='ComCssSubmitButton' onClick={formClear}>Clear</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Top Row: Monthly + Weekly ─────────────────────────── */}
     {/* ── Top Row: Monthly + Weekly ─────────────────────────── */}
<div className='dashFlexboxA'>

  {/* Monthly */}
  <div style={{ padding: 16, minHeight: 360, borderRadius: 8,
                boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
    <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 15, color: 'Blue' }}>
      Ticket &amp; Partcode Count — Monthly
    </div>
    <Legend items={[
      { color: '#1e4db7', label: 'Total Tickets' },
      { color: '#08894f', label: 'Total Partcodes' },
    ]} />
    {/* ✅ ADD height: 300px here — same as ReworkerSummary */}
    <div style={{ flex: 1, position: 'relative', height: '300px' }}>
      <Bar data={monthChartData} options={monthChartOptions} />
    </div>
  </div>

  {/* Weekly */}
  <div style={{ padding: 16, minHeight: 360, borderRadius: 8,
                boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
    <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 15, color: 'Blue' }}>
      Ticket &amp; Partcode Count — Weekly
    </div>
    <Legend items={[
      { color: '#07b466', label: 'Total Tickets' },
      { color: '#cd1580', label: 'Total Partcodes' },
    ]} />
    {/* ✅ ADD height: 300px here */}
    <div style={{ flex: 1, position: 'relative', height: '300px' }}>
      <Bar data={weekChartData} options={weekChartOptions} />
    </div>
  </div>

</div>

{/* ── Bottom Row: Requester Type ───────────────────────── */}
{/* ── Bottom Row: Requester Type ───────────────────────── */}
{/* <div style={{ padding: '0 16px 16px' }}>
  <div style={{
    padding: 16,
    borderRadius: 8,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',                         
    border: '1px solid #e6c6c6',                
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',     
  }}>
    <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 15, color: 'Blue' }}>
      Ticket &amp; Partcode Count — By Requester Type
    </div>
    <Legend items={[
      { color: '#7f3fbf', label: 'Total Tickets' },
      { color: '#e07b00', label: 'Total Partcodes' },
    ]} />
    <div style={{
      position: 'relative',
      height: `${Math.max(
        requesterTypeSummary.filter(d => d.requestertype).length * 55 + 60,
        200
      )}px`,
    }}>
      <Bar data={reqChartData} options={reqChartOptions} />
    </div>
  </div>
</div> */}

{/* ── Bottom Row: Separate card per Requester Type ───────── */}
<div style={{ padding: '0 16px 16px' }}>

  {/* Section Title */}
  <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 15, color: 'Blue', fontWeight: 600 }}>
    Ticket &amp; Partcode Count — By Requester Type
  </div>

  {/* Flex row — one card per type */}
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
    {requesterTypeSummary
      .filter(d => d.requestertype)           // skip null
      .map((item) => (
        <div
          key={item.requestertype}
          onClick={() => {
            setClickedBar(true);
            setClearButton(true);
            setFilters(prev => ({ ...prev, requestertype: item.requestertype }));
          }}
          style={{
            flex: '1 1 180px',
            minWidth: 160,
            padding: 14,
            borderRadius: 8,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            cursor: 'pointer',
          }}
        >
          {/* Type label */}
          <div style={{
            textAlign: 'center', fontSize: 12, fontWeight: 600,
            color: '#1e4db7', marginBottom: 10,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {item.requestertype}
          </div>

          {/* Mini bar chart */}
          <div style={{ position: 'relative', height: 160 }}>
            <Bar
              data={{
                labels: ['Tickets', 'Partcodes'],
                datasets: [{
                  data: [item.totalTicket, item.totalPartcode],
                  backgroundColor: ['#7f3fbf', '#e07b00'],
                  borderRadius: 4,
                  borderSkipped: false,
                  barPercentage: 0.6,
                  categoryPercentage: 0.6,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: ctx => ctx.parsed.y } },
                  datalabels: {
                    color: '#fff',
                    anchor: 'center',
                    align: 'center',
                    font: { weight: 'bold', size: 11 },
                    rotation: -90,
                    formatter: v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v,
                  },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#1855ab', font: { size: 10 } } },
                  y: {
                    grid: { color: 'rgba(0,0,0,.06)' },
                    ticks: {
                      color: '#555', font: { size: 9 },
                      callback: v => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v,
                    },
                  },
                },
              }}
            />
          </div>

          {/* Count summary below chart */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'black' }}>Tickets</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#7f3fbf' }}>
                {item.totalTicket}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'black' }}>Partcodes</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e07b00' }}>
                {item.totalPartcode}
              </div>
            </div>
          </div>
        </div>
      ))}
  </div>
</div>

    </div>
  );
};

export default DTLTicketDashboard;