import React, { useState, useEffect } from 'react';
import IssuanceTATDashTexrFiled from "../../components/IssuanceTATDashTexrFiled/IssuanceTATDashTexrFiled";
import { getIssuanceTATDashboard } from '../../Services/Services_09';
import { getProductAndPartcode } from '../../Services/Services';
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

/* ─── palette ─────────────────────────────────────────────── */
const C = {
  a1: '#7c3aed', a1Light: 'rgba(124,58,237,0.12)', a1Glow: 'rgba(124,58,237,0.45)',
  a2: '#f97316', a2Light: 'rgba(249,115,22,0.12)',  a2Glow: 'rgba(249,115,22,0.45)',
  st: '#06b6d4', stLight: 'rgba(6,182,212,0.12)',   stGlow: 'rgba(6,182,212,0.45)',
  oa: '#db2777', oaLight: 'rgba(219,39,119,0.12)',  oaGlow: 'rgba(219,39,119,0.45)',
  bg: '#0f0c29',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.10)',
  text: '#f1f5f9',
  muted: 'rgba(255,255,255,0.45)',
};

/* ─── shared styles ────────────────────────────────────────── */
const S = {
  wrap: {
    minHeight: '100vh',
    // background: `linear-gradient(135deg, #19134b 0%, #1a0533 50%, #0f0c29 100%)`,
   background: '#ffffff',
    padding: '20px',
    fontFamily: "'Segoe UI', sans-serif",
  },

  /* header bar */
  header: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 12,
  // background: 'rgba(225, 238, 227, 0.05)',
    background: 'linear-gradient(135deg, #11a2b9 0%, #a30a63 100%)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
  padding: '10px 15px',
  marginBottom: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  overflow: 'visible',   // ✅ ensure dropdown not clipped
  position: 'relative',
  zIndex: 100,           // ✅ ensure above chart cards
},
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerDot: {
    width: 10, height: 10, borderRadius: '50%',
    // background: 'linear-gradient(135deg,#7c3aed,#db2777)',
      background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)',
    boxShadow: '0 0 12px rgba(124,58,237,0.8)',
  },
  // headerTitle: { color: C.text, fontSize: 16, fontWeight: 700, margin: 0 },
  // headerSub:   { color: C.muted, fontSize: 11, margin: 0 },



 headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: 700, margin: 0 },
headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 11, margin: 0 },
  

  /* filter group */
  filterGroup: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  filterLabel: { color: C.muted, fontSize: 11, fontWeight: 600,
                 textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 },
  filterWrap:  { display: 'flex', flexDirection: 'column' },
  input: {
    height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.07)', color: C.text,
    padding: '0 10px', fontSize: 12, outline: 'none',
    colorScheme: 'dark',
  },
  btnClear: {
    height: 34, padding: '0 16px', borderRadius: 8,
    background: 'linear-gradient(135deg,#7c3aed,#db2777)',
    border: 'none', color: '#fff', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.45)',
    transition: 'opacity .2s',
  },

  /* chart grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16,
  },

  /* 3‑D card */
  // card: (accent) => ({
  //   background: `linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
  //   backdropFilter: 'blur(16px)',
  //   border: `1px solid ${accent}55`,
  //   borderRadius: 18,
  //   padding: '16px 18px',
  //   boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${accent}22`,
  //   transform: 'perspective(800px) rotateX(0.8deg)',
  //   transition: 'transform .25s, box-shadow .25s',
  //   position: 'relative',
  // }),
  

  card: (accent) => ({
  background: '#ffffff',
  border: `1px solid ${accent}55`,
  borderRadius: 18,
  padding: '16px 18px',
  boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px ${accent}22`,
  transform: 'perspective(800px) rotateX(0.8deg)',
  transition: 'transform .25s, box-shadow .25s',
  position: 'relative',
}),

  // ✅ Use clipPath instead of overflow hidden for glow effect
cardGlow: (accent) => ({
  position: 'absolute', top: -40, right: -40,
  width: 130, height: 130, borderRadius: '50%',
  background: accent, filter: 'blur(55px)', opacity: 0.18,
  pointerEvents: 'none',
  zIndex: 0,
  // ✅ clip the glow blob itself instead of the whole card
  clipPath: 'inset(0 0 0 0 round 18px)',
}),
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  iconBox: (bg, border) => ({
    width: 38, height: 38, borderRadius: 10,
    background: bg, border: `1px solid ${border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 4px 12px ${border}`,
    flexShrink: 0,
  }),
  // cardTitle: { color: C.text, fontSize: 13, fontWeight: 700, margin: 0 },
  cardTitle: { color: '#0f172a', fontSize: 12, fontWeight: 700, margin: 0 },
  cardSub:   (color) => ({ color, fontSize: 11, margin: 0 }),
  liveDot: (color) => ({
    marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
    background: color, boxShadow: `0 0 10px ${color}`,
  }),

  /* scrollable chart area */
  scroll: (color) => ({
    overflowY: 'auto', maxHeight: 280,
    scrollbarWidth: 'thin', scrollbarColor: `${color} transparent`,
  }),
};

/* ─── chart option factory ─────────────────────────────────── */
const makeOptions = (color, sortedData, tatKey, onClickFn, chartData) => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  onClick: (evt, els) => onClickFn(evt, els, chartData),
  animation: { duration: 600, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e1235',
      titleColor: '#e2d9f3',
      bodyColor: '#c4b5fd',
      borderColor: color,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      callbacks: { label: ctx => ` ${sortedData[ctx.dataIndex][tatKey]}` },
    },
    datalabels: {
      color: 'rgba(255,255,255,0.75)',
      anchor: 'end', align: 'end', offset: 4,
      font: { size: 10 },
      formatter: (_, ctx) => {
        const item = sortedData[ctx.dataIndex];
        return `${item.componentUsage}  |  ${item[tatKey]}`;
      },
      clip: false,
    },
  },
  scales: {
    x: { display: false, grid: { display: false } },
    y: {
  grid: { display: false },
  ticks: { color: '#334155', font: { size: 11 } },
},
  },
  layout: { padding: { right: 130 } },
});

/* ─── single chart card component ─────────────────────────── */
const TATCard = ({ title, accent, icon, sorted, tatKey, chartData, onBarClick }) => {
  const options = makeOptions(accent, sorted, tatKey, onBarClick, chartData);
  const barH    = Math.max(sorted.length * 40, 160);

  return (
    <div style={S.card(accent)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'perspective(800px) rotateX(0deg) translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px ${accent}44`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'perspective(800px) rotateX(0.8deg)';
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${accent}22`;
      }}
    >
      {/* glow blob */}
      <div style={S.cardGlow(accent)} />

      {/* card header */}
      <div style={S.cardHeader}>
        <div style={S.iconBox(`${accent}20`, `${accent}50`)}>
          {icon}
        </div>
        <div>
          <p style={S.cardTitle}>{title}</p>
          <p style={S.cardSub(accent)}>⏱ {sorted.length} product groups</p>
        </div>
        <div style={S.liveDot(accent)} />
      </div>

      {/* scrollable bar chart */}
      <div style={S.scroll(accent)}>
        <div style={{ position: 'relative', height: barH, minHeight: 160 }}>
          <Bar
            data={chartData}
            options={options}
          />
        </div>
      </div>
    </div>
  );
};

/* ─── icons ────────────────────────────────────────────────── */
const IconA1 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="10" cy="7" r="4" stroke="#a78bfa" strokeWidth="1.8"/>
    <path d="M2 20c0-4 3.6-7 8-7" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M15 14l2 2 4-4" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconA2 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="8"  cy="7" r="3.5" stroke="#fb923c" strokeWidth="1.8"/>
    <circle cx="16" cy="7" r="3.5" stroke="#fb923c" strokeWidth="1.8" strokeDasharray="2 1.2"/>
    <path d="M1 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M18 13c2 .8 4 2.5 4 5"          stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconStore = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" stroke="#22d3ee" strokeWidth="1.8"/>
    <rect x="9" y="13" width="6" height="7" rx="1"            stroke="#22d3ee" strokeWidth="1.8"/>
  </svg>
);
const IconOverall = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9"   stroke="#f472b6" strokeWidth="1.8"/>
    <path d="M12 7v5l3 3"           stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ─── main component ────────────────────────────────────────── */
const IssuanceTATDashboard = () => {
  const [productDetail,        setProductDetail]        = useState([]);
  const [recevingReportDetail, setRecevingReportDetail] = useState([]);
  const [loading,              setLoading]              = useState(false);
  const [resetKey,             setResetKey]             = useState(0);
  const [clearButton,          setClearButton]          = useState(false);
  const [formData, setFormData] = useState({ productgroup:'', startDate:'', endDate:'' });

  const tatToSeconds = (tat) => {
    if (!tat) return 0;
    const p = tat.split(':').map(Number);
    return p[0]*3600 + p[1]*60 + (p[2]||0);
  };

  const fetchFilterResultWith = (payload) => {
    setLoading(true);
    getIssuanceTATDashboard(payload)
      .then(res => {
        const raw = res.data || [];
        setRecevingReportDetail(raw);
      })
      .catch(err => console.error('API Error:', err))
      .finally(() => setLoading(false));
  };

  const fetchPartAndProduct = () => {
    getProductAndPartcode()
      .then(res => setProductDetail(res.data?.ProductDetail || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPartAndProduct();
    const today = new Date();
    const start = `${today.getFullYear()}-01-01`;
    const end   = today.toISOString().split('T')[0];
    const def   = { productgroup:'', startDate:start, endDate:end };
    setFormData(def);
    fetchFilterResultWith(def);
  }, []);

  const handleBarClick = (evt, elements, chartData) => {
    if (!elements.length) return;
    setClearButton(true);
    const label   = chartData.labels[elements[0].index];
    const payload = { ...formData, productgroup: label };
    setFormData(payload);
    fetchFilterResultWith(payload);
  };

  const formClear = () => {
    const today = new Date();
    const start = `${today.getFullYear()}-01-01`;
    const end   = today.toISOString().split('T')[0];
    const def   = { productgroup:'', startDate:start, endDate:end };
    setFormData(def);
    setResetKey(p => p+1);
    setClearButton(false);
    fetchFilterResultWith(def);
  };

  /* sorted datasets */
  const sorted1     = [...recevingReportDetail].sort((a,b) => tatToSeconds(b.approver_1_TAT) - tatToSeconds(a.approver_1_TAT));
  const sorted2     = [...recevingReportDetail].sort((a,b) => tatToSeconds(b.approver_2_TAT) - tatToSeconds(a.approver_2_TAT));
  const sortedStore = [...recevingReportDetail].sort((a,b) => tatToSeconds(b.storeTAT)       - tatToSeconds(a.storeTAT));
  const sortedOA    = [...recevingReportDetail].sort((a,b) => tatToSeconds(b.overallTAT)     - tatToSeconds(a.overallTAT));

  const mkData = (sorted, tatKey, color) => ({
    labels: sorted.map(p => p.productgroup),
    datasets: [{
      label: tatKey,
      data: sorted.map(p => tatToSeconds(p[tatKey])),
      backgroundColor: color,
      borderRadius: 4,
      borderSkipped: false,
      barPercentage: 0.65,
      categoryPercentage: 0.8,
    }],
  });

  const data1     = mkData(sorted1,     'approver_1_TAT', C.a1);
  const data2     = mkData(sorted2,     'approver_2_TAT', C.a2);
  const dataStore = mkData(sortedStore, 'storeTAT',       C.st);
  const dataOA    = mkData(sortedOA,    'overallTAT',     C.oa);

  return (
    <div style={S.wrap}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.headerDot} />
          <div>
            <p style={S.headerTitle}>Issuance TAT Dashboard</p>
            <p style={S.headerSub}>
              {loading ? 'Loading…' : `${recevingReportDetail.length} product groups • live`}
            </p>
          </div>
        </div>

        {/* filters */}
        <div style={S.filterGroup} key={resetKey}>

          <div style={S.filterWrap}>
            <span style={S.filterLabel}>Product Group</span>
            <IssuanceTATDashTexrFiled
              label="Product Group"
              options={productDetail}
              onChange={(v) => {
                const u = { ...formData, productgroup: v };
                setFormData(u);
                fetchFilterResultWith(u);
                setClearButton(true);
              }}
            />
          </div>

          <div style={S.filterWrap}>
            <span style={S.filterLabel}>Start Date</span>
            <input
              type="date"
              style={S.input}
              value={formData.startDate}
              max={formData.endDate || ''}
              onChange={e => {
                const u = { ...formData, startDate: e.target.value };
                setFormData(u);
                fetchFilterResultWith(u);
                setClearButton(true);
              }}
            />
          </div>

          <div style={S.filterWrap}>
            <span style={S.filterLabel}>End Date</span>
            <input
              type="date"
              style={S.input}
              value={formData.endDate}
              min={formData.startDate || ''}
              onChange={e => {
                const u = { ...formData, endDate: e.target.value };
                setFormData(u);
                fetchFilterResultWith(u);
                setClearButton(true);
              }}
            />
          </div>

          {clearButton && (
            <div style={S.filterWrap}>
              <span style={{ ...S.filterLabel, visibility:'hidden' }}>x</span>
              <button style={S.btnClear} onClick={formClear}>✕ Clear</button>
            </div>
          )}

        </div>
      </div>

      {/* ── 4 chart cards ── */}
      <div style={S.grid}>

        <TATCard
          title="Approver 1 TAT"
          accent={C.a1}
          icon={<IconA1 />}
          sorted={sorted1}
          tatKey="approver_1_TAT"
          chartData={data1}
          onBarClick={handleBarClick}
        />

        <TATCard
          title="Approver 2 TAT"
          accent={C.a2}
          icon={<IconA2 />}
          sorted={sorted2}
          tatKey="approver_2_TAT"
          chartData={data2}
          onBarClick={handleBarClick}
        />

        <TATCard
          title="Store TAT"
          accent={C.st}
          icon={<IconStore />}
          sorted={sortedStore}
          tatKey="storeTAT"
          chartData={dataStore}
          onBarClick={handleBarClick}
        />

        <TATCard
          title="Overall TAT"
          accent={C.oa}
          icon={<IconOverall />}
          sorted={sortedOA}
          tatKey="overallTAT"
          chartData={dataOA}
          onBarClick={handleBarClick}
        />

      </div>
    </div>
  );
};

export default IssuanceTATDashboard;