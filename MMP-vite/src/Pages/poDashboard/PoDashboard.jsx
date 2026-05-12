import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts';
import { fetchMaterialTypeVendor, fetchPoReportDetail } from '../../Services/Services_09';

const fmtEuro  = (v) => `€${(Number(v||0)/1000).toFixed(1)}K`;
const fmtShort = (v) => { const n=Number(v||0)/1000; return n>=1000?`€${(n/1000).toFixed(1)}M`:`€${n.toFixed(1)}K`; };
const fmtNum   = (v) => Number(v||0).toLocaleString('en-IN');


// Add near your other formatters at the top
const fmtFull = (v) => `€${Number(v||0).toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
const fmtFullNum = (v) => Number(v||0).toLocaleString('en-IN');


const P1 = ['#6366F1','#F59E0B','#10B981','#f71111','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F97316','#84CC16'];
const P2 = ['#06B6D4','#F43F5E','#A855F7','#22C55E','#f7c01c','#3B82F6','#F97316','#64748B','#E11D48','#7C3AED'];

const RADIAN = Math.PI / 180;

/* arrow label */
const ArrowLabel = ({ cx, cy, midAngle, outerRadius, percent, value, fmtFn }) => {
  if (percent < 0.03) return null;
  const GAP = 14;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;
  const ex = cx + (outerRadius + GAP) * cos;
  const ey = cy + (outerRadius + GAP) * sin;
  const textX = ex + (cos >= 0 ? 4 : -4);
  return (
    <g>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#94A3B8" strokeWidth={1}/>
      <circle cx={ex} cy={ey} r={2} fill="#6366F1"/>
      <text x={textX} y={ey} textAnchor={cos>=0?'start':'end'} dominantBaseline="central"
        style={{ fontSize:9, fill:'#1E293B', fontWeight:700, fontFamily:'Nunito,sans-serif' }}>
        {fmtFn ? fmtFn(value) : fmtNum(value)}
      </text>
    </g>
  );
};

const Tip = ({ active, payload }) => {
  if (!active||!payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 11px', boxShadow:'0 6px 18px rgba(0,0,0,0.12)', fontFamily:'Nunito,sans-serif' }}>
      <p style={{ margin:0, color:'#64748B', fontSize:10, fontWeight:700 }}>{d.name}</p>
      <p style={{ margin:'2px 0 0', color:'#1E293B', fontWeight:900, fontSize:13 }}>{d.payload?.tipVal}</p>
    </div>
  );
};

const Card = ({ title, accent, children }) => (
  <div style={{ background:'#fff', borderRadius:10, overflow:'hidden', border:'1px solid #E8EDF5', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', display:'flex', flexDirection:'column' }}>
    <div style={{ height:3, background:accent, flexShrink:0 }}/>
    <p style={{ margin:'8px 12px 0', fontSize:15, fontWeight:600, color:'#0c3b87', fontFamily:'Segoe UI, sans-serif', flexShrink:0 }}>{title}</p>
    <div style={{ flex:1, minHeight:0 }}>{children}</div>
  </div>
);

/* PIE CHART — fills entire card area, no wasted space */
// const PieComp = ({ data, palette, valKey, nameKey, fmtFn }) => {
//   const mapped = data.map(d=>({
//     name: d[nameKey]||'?',
//     value: Number(d[valKey]||0),
//     tipVal: fmtFn ? fmtFn(d[valKey]) : fmtNum(d[valKey]),
//   })).filter(d=>d.value>0);
const PieComp = ({ data, palette, valKey, nameKey, fmtFn, tipFmtFn }) => {
  const mapped = data.map(d=>({
    name: d[nameKey]||'?',
    value: Number(d[valKey]||0),
    tipVal: tipFmtFn ? tipFmtFn(d[valKey]) : fmtFn ? fmtFn(d[valKey]) : fmtFullNum(d[valKey]), // ← use tipFmtFn
  })).filter(d=>d.value>0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top:8, right:90, bottom:8, left:30 }}>
        <Pie
          data={mapped} dataKey="value" nameKey="name"
          cx="38%" cy="50%"
          innerRadius={0} outerRadius="88%"
          startAngle={90} endAngle={-270}
          stroke="#fff" strokeWidth={1.5}
          label={(props)=><ArrowLabel {...props} fmtFn={fmtFn}/>}
          labelLine={false}
        >
          {mapped.map((_,i)=><Cell key={i} fill={palette[i%palette.length]}/>)}
        </Pie>
        <Tooltip content={<Tip/>}/>
        {/* <Legend
          layout="vertical" align="right" verticalAlign="middle"
          iconType="circle" iconSize={7}
          formatter={(v)=>(
            <span style={{ color:'#475569', fontSize:9, fontWeight:600, fontFamily:'Nunito,sans-serif' }}>
              {v?.length>18?v.slice(0,18)+'…':v}
            </span>
          )}
          wrapperStyle={{ right:4, fontSize:9 }}
        /> */}
        <Legend
  layout="vertical" align="right" verticalAlign="middle"
  iconType="circle" iconSize={7}
  formatter={(v, entry) => (
    <span style={{ color:'#475569', fontSize:9, fontWeight:600, fontFamily:'Segoe UI, sans-serif' }}>
      {v?.length > 28 ? v.slice(0, 28) + '…' : v} 
      {/* <span style={{ color:'#1E293B', fontWeight:800, marginLeft:4 }}>
        {entry?.payload?.tipVal}  
      </span> */}
    </span>
  )}
  wrapperStyle={{ right:0, fontSize:9, maxWidth:200 }} 
/>
      </PieChart>
    </ResponsiveContainer>
  );
};

/* HBAR */
// const HBar = ({ data, palette, valKey, nameKey, fmtFn }) => {
//   const mapped = [...data]
//     .sort((a,b)=>Number(b[valKey]||0)-Number(a[valKey]||0))
//     .map((d,i)=>({
//       name:(d[nameKey]||'').slice(0,20),
//       value:Number(d[valKey]||0),
//       tipVal:fmtFn?fmtFn(d[valKey]):fmtNum(d[valKey]),
//       fill:palette[i%palette.length],
//     }));

const HBar = ({ data, palette, valKey, nameKey, fmtFn, tipFmtFn }) => {
  const mapped = [...data]
    .sort((a,b)=>Number(b[valKey]||0)-Number(a[valKey]||0))
    .map((d,i)=>({
      name:(d[nameKey]||'').slice(0,20),
      value:Number(d[valKey]||0),
      tipVal: tipFmtFn ? tipFmtFn(d[valKey]) : fmtFn ? fmtFn(d[valKey]) : fmtFullNum(d[valKey]), // ← use tipFmtFn
      fill:palette[i%palette.length],
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={mapped} layout="vertical" margin={{ left:8, right:60, top:4, bottom:4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false}/>
        <XAxis type="number" tick={{ fill:'#d10f9a', fontSize:9, fontFamily:'Segoe UI, sans-serif' }} axisLine={false} tickLine={false} tickFormatter={v=>fmtFn?fmtFn(v):fmtNum(v)}/>
        <YAxis type="category" dataKey="name" width={90} tick={{ fill:'black', fontSize:9, fontFamily:'Segoe UI, sans-serif', fontWeight:600 }} axisLine={false} tickLine={false}/>
        <Tooltip content={<Tip/>}/>
        <Bar dataKey="value" radius={[0,5,5,0]} barSize={12}>
          {mapped.map((d,i)=><Cell key={i} fill={d.fill}/>)}
          <LabelList dataKey="value" position="right" formatter={v=>fmtFn?fmtFn(v):fmtNum(v)}
            style={{ fill:'#334155', fontSize:9, fontWeight:800, fontFamily:'Segoe UI, sans-serif' }}/>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ════ MAIN ════ */
const PoDashboard = () => {
  const [filters, setFilters] = useState({ grnDate:'', poSendDate:'', materialType:'', vendor:'', poStatus:'closed' ,potool:'' });
  const [top10Contributors, setTop10Contributors] = useState([]);
  const [top10Countrywise,  setTop10Countrywise]  = useState([]);
  const [top10Vendorwise,   setTop10Vendorwise]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [vendors, setVendors] = useState([]);

  const fetchData = useCallback(async (defaultYear=null, overrideFilters=null) => {
    setLoading(true); setError(null);
    try {
      const af = overrideFilters||filters;
      const params = {};
      params.grnDate = af.grnDate||defaultYear||new Date().getFullYear().toString();
      if (af.poSendDate)   params.poSendDate   = af.poSendDate;
      if (af.materialType) params.materialType = af.materialType;
      if (af.vendor)       params.vendor       = af.vendor;
      if (af.poStatus)     params.poStatus     = af.poStatus;
      if (af.potool) params.potool = af.potool;
      const res  = await fetchPoReportDetail(params);
      const data = res.data?.data||{};
      setTop10Contributors(data.top10Contributors||[]);
      setTop10Countrywise(data.top10Countrywise||[]);
      setTop10Vendorwise(data.top10Vendorwise||[]);
    } catch(err) {
      setError(err?.response?.data?.message||'Failed to fetch');
    } finally { setLoading(false); }
  }, [filters]);

  const fetchMeta = useCallback(async () => {
    try {
      const res  = await fetchMaterialTypeVendor();
      const data = res.data?.data||{};
      setMaterialTypes(data.materialTypes||[]);
      setVendors(data.vendors||[]);
    } catch(e){ console.error(e); }
  }, []);

  useEffect(()=>{ fetchData(); fetchMeta(); },[]);

  const totals = {
    partVal:    top10Contributors.reduce((s,r)=>s+Number(r.totalvalueeuro||0),0),
    grnqty:   top10Contributors.reduce((s,r)=>s+Number(r.grnqty||0),0),
    countryVal: top10Countrywise.reduce((s,r)=>s+Number(r.totalvalueeuro||0),0),
    vendorVal:  top10Vendorwise.reduce((s,r)=>s+Number(r.totalvalueeuro||0),0),
  };

  const inp = { padding:'5px 8px', borderRadius:6, border:'1px solid #E2E8F0', fontSize:12, color:'#334155', background:'#F8FAFC', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'Segoe UI, sans-serif', fontWeight:600 };
  const lbl = { fontSize:12, color:'#462dea', fontWeight:700,   display:'block', marginBottom:2, fontFamily:'Segoe UI, sans-serif' };

  const KPI = ({ label:l, value, color, icon }) => (
    <div style={{ background:'#ffffff', borderRadius:9, border:'1px solid #F1F5F9', boxShadow:'0 2px 6px rgba(0,0,0,0.06)', padding:'9px 12px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color }}/>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:30, height:30, borderRadius:8, fontSize:15, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
        <div>
          <p style={{ margin:0, fontSize:12, color:'green', fontWeight:700, letterSpacing:0.5, fontFamily:'Segoe UI, sans-serif' }}>{l}</p>
          <p style={{ margin:'1px 0 0', fontSize:16, fontWeight:600, color:'#c65b0a', fontFamily:'Segoe UI, sans-serif', letterSpacing:-0.5 }}>{value}</p>
        </div>
      </div>
    </div>
  );

  const noData = <p style={{ textAlign:'center', color:'#CBD5E1', padding:'10px 0', fontSize:11 }}>No data</p>;

  // Add near your other formatters
const fmtKpi = (v) => {
  const n = Number(v || 0);
  if (n === 0) return '€0';
  return `€${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

  return (
    <div style={{
      padding:'12px 16px', background:'white',
      height:'100vh', overflow:'hidden', boxSizing:'border-box',
      fontFamily:'Segoe UI, sans-serif',
      display:'flex', flexDirection:'column', gap:8,
    }}>

      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          {/* <div style={{ width:32, height:32, borderRadius:9, fontSize:16, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(99,102,241,0.35)' }}>📦</div> */}
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:'bolder', color:'rgb(9, 146, 156)', letterSpacing:-0.5 }}>Procurement Dashboard</h1>
            <p style={{ margin:0, fontSize:9, color:'#2876e4', fontWeight:600 }}>Purchase Order — Top 10 Analysis</p>
          </div>
        </div>
        <span style={{ fontSize:10, color:'#64748B', fontWeight:700, background:'#fff', padding:'4px 10px', borderRadius:16, border:'1px solid #E2E8F0' }}>
          {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
        </span>
      </div>

      {/* FILTERS */}
      <div style={{ background:'#fff', borderRadius:10, border:'1px solid #a5c7f4', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', padding:'9px 12px', flexShrink:0 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr) auto auto', gap:8, alignItems:'flex-end' }}>
          {[{key:'grnDate',l:'GRN Date',type:'date'},{key:'poSendDate',l:'PO Send Date',type:'date'}].map(({key,l,type})=>(
            <div key={key}><label style={lbl}>{l}</label><input type={type} value={filters[key]} onChange={e=>setFilters(p=>({...p,[key]:e.target.value}))} style={inp}/></div>
          ))}
          <div><label style={lbl}>Technology</label>
            <select value={filters.materialType} onChange={e=>setFilters(p=>({...p,materialType:e.target.value}))} style={{...inp,cursor:'pointer'}}>
              <option value="">All Material Types</option>
              {materialTypes.filter(m=>m?.trim()).map((m,i)=><option key={i} value={m}>{m}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Vendor</label>
            <select value={filters.vendor} onChange={e=>setFilters(p=>({...p,vendor:e.target.value}))} style={{...inp,cursor:'pointer'}}>
              <option value="">All Vendors</option>
              {vendors.map((v,i)=><option key={i} value={v}>{v}</option>)}
            </select>
          </div>
          <div><label style={lbl}>PO Status</label>
            <select value={filters.poStatus} onChange={e=>setFilters(p=>({...p,poStatus:e.target.value}))} style={{...inp,cursor:'pointer'}}>
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="manual close">Manual Close</option>
              <option value="cancelled">Cancelled</option>
              <option value="on hold">On Hold</option>
            </select>
          </div>

          <div><label style={lbl}>PoTool</label>
  <select value={filters.potool} onChange={e=>setFilters(p=>({...p,potool:e.target.value}))} style={{...inp,cursor:'pointer'}}>
    <option value="">All PoTools</option>
    {["I-BUY","P20","SRM","Nokia Internal Transfer","RC Internal Transfer","Harvester"].map((opt,i)=>(
      <option key={i} value={opt}>{opt}</option>
    ))}
  </select>
</div>
          <button onClick={()=>fetchData()} style={{ padding:'6px 16px', background:'blue', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 8px rgba(99,102,241,0.4)', fontFamily:'Segoe UI, sans-serif', whiteSpace:'nowrap' }}>Search</button>
          <button onClick={()=>{ const c={grnDate:'',poSendDate:'',materialType:'',vendor:'',poStatus:'closed',potool:''}; setFilters(c); fetchData(new Date().getFullYear().toString(),c); }} style={{ padding:'6px 12px', background:'#e62c22', color:'white', border:'1px solid #E2E8F0', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Segoe UI, sans-serif', whiteSpace:'nowrap' }}>Clear</button>
        </div>
      </div>

      {error && <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:7, padding:'6px 10px', color:'#EF4444', fontSize:11, fontWeight:600, flexShrink:0 }}>{error}</div>}
      {loading && <div style={{ textAlign:'center', padding:20, color:'#6366F1', fontSize:13, fontWeight:800 }}>⏳ Loading…</div>}

      {!loading && (<>
        {/* KPI */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, flexShrink:0 }}>
          <KPI label="Top 10 Part Value" value={fmtKpi(totals.partVal)}  color="#f3e524"   icon="📊"/>
          <KPI label="Total Order Qty"   value={fmtFullNum(totals.grnqty)}  color="#43ed21"    icon="📦"/>
          <KPI label="Country Total"     value={fmtKpi(totals.countryVal)} color="#10B981" icon="🌍"/>
          <KPI label="Vendor Total"      value={fmtKpi(totals.vendorVal)}  color="#EF4444" icon="🏭"/>
        </div>

        {/* CHARTS — fills remaining height exactly */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:8, flex:1, minHeight:0 }}>
         <Card title="Top 10 Contributors by Value" accent="linear-gradient(90deg,#F59E0B,#EF4444)">
            {top10Contributors.length===0 ? noData : <HBar data={top10Contributors} palette={P1} valKey="totalvalueeuro" nameKey="partcode" fmtFn={fmtEuro} tipFmtFn={fmtFull}/>}
          </Card>
          <Card title="Top 10 Part as per Qty" accent="linear-gradient(90deg,#6366F1,#8B5CF6)">
            {top10Contributors.length===0 ? noData : <PieComp data={top10Contributors} palette={P1} valKey="grnqty" nameKey="partcode" fmtFn={fmtNum} tipFmtFn={fmtFullNum}/>}
          </Card>
          <Card title="Country Wise Cost & Vendor Count" accent="linear-gradient(90deg,#10B981,#06B6D4)">
            {top10Countrywise.length===0 ? noData : <PieComp data={top10Countrywise} palette={P2} valKey="totalvalueeuro" nameKey="country" fmtFn={fmtEuro} tipFmtFn={fmtFull}/>}
          </Card>
          
          <Card title="Vendor Wise Cost & Part Count" accent="linear-gradient(90deg,#EF4444,#EC4899)">
            {top10Vendorwise.length===0 ? noData : <PieComp data={top10Vendorwise} palette={P2} valKey="totalvalueeuro" nameKey="vendorName" fmtFn={fmtEuro} tipFmtFn={fmtFull}/>}
          </Card>
        </div>
      </>)}
    </div>
  );
};

export default PoDashboard;
