import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { fetchMaterialTypeVendor, fetchPoReportDetail } from '../../Services/Services_09';


// const fmtEuro = (v) => `€ ${(Number(v || 0) / 1000).toFixed(2)}`;
// ✅ FIXED
const fmtEuro = (v) => `€ ${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PoReport = () => {
  const [filters, setFilters] = useState({ grnDate: '', poSendDate: '', materialType: '', vendor: '' ,poStatus: 'closed'});
  const [top10Contributors, setTop10Contributors] = useState([]);
  const [top10Countrywise,  setTop10Countrywise]  = useState([]);
  const [top10Vendorwise,   setTop10Vendorwise]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [materialTypes, setMaterialTypes] = useState([]);
const [vendors, setVendors] = useState([]);


//   useEffect(() => {
//   const currentYear = new Date().getFullYear().toString(); // "2026"
//   fetchData(currentYear);
// }, []);



// const fetchData = useCallback(async (defaultYear = null) => {
//   setLoading(true); setError(null);
//   try {
//     const params = {};
//     // ✅ If user picked a full date use it, else send current year
//     params.grnDate    = filters.grnDate || defaultYear || new Date().getFullYear().toString();
//     if (filters.poSendDate)   params.poSendDate   = filters.poSendDate;
//     if (filters.materialType) params.materialType = filters.materialType;
//     if (filters.vendor)       params.vendor       = filters.vendor;

//     const res = await fetchPoReportDetail(params);
//     const data = res.data?.data || {};
//     setTop10Contributors(data.top10Contributors || []);
//     setTop10Countrywise(data.top10Countrywise   || []);
//     setTop10Vendorwise(data.top10Vendorwise     || []);
//   } catch (err) {
//     setError(err?.response?.data?.message || 'Failed to fetch PO report');
//   } finally { setLoading(false); }
// }, [filters]);

const fetchData = useCallback(async (defaultYear = null, overrideFilters = null) => {
  setLoading(true); setError(null);
  try {
    const params = {};
    const activeFilters = overrideFilters || filters;

    if (activeFilters.grnDate) {
      params.grnDate = activeFilters.grnDate;
    } else {
      params.grnDate = defaultYear || new Date().getFullYear().toString();
    }

    if (activeFilters.poSendDate)   params.poSendDate   = activeFilters.poSendDate;
    if (activeFilters.materialType) params.materialType = activeFilters.materialType;
    if (activeFilters.vendor)       params.vendor       = activeFilters.vendor;
    if (activeFilters.poStatus)     params.poStatus     = activeFilters.poStatus;  // ✅ added

    const res = await fetchPoReportDetail(params);
    const data = res.data?.data || {};
    setTop10Contributors(data.top10Contributors || []);
    setTop10Countrywise(data.top10Countrywise   || []);
    setTop10Vendorwise(data.top10Vendorwise     || []);
  } catch (err) {
    setError(err?.response?.data?.message || 'Failed to fetch PO report');
  } finally { setLoading(false); }
}, [filters]);

const fetchMaterialType = useCallback(async () => {
  try {
    const res = await fetchMaterialTypeVendor();
    const data = res.data?.data || {};
    setMaterialTypes(data.materialTypes || []);
    setVendors(data.vendors || []);
  } catch (err) {
    console.error("Failed to fetch material types and vendors", err);
  }
}, []);

  useEffect(() => { 
    fetchData();
    fetchMaterialType();

   }, []);

  const totalContribEuro  = top10Contributors.reduce((s, r) => s + Number(r.totalValueEuro || 0), 0);
  const totalContribQty   = top10Contributors.reduce((s, r) => s + Number(r.orderQty || 0), 0);
  const totalCountryEuro  = top10Countrywise.reduce((s, r) => s + Number(r.totalValueEuro || 0), 0);
  const totalCountryCount = top10Countrywise.reduce((s, r) => s + Number(r.vendorCount || 0), 0);
  const totalVendorEuro   = top10Vendorwise.reduce((s, r) => s + Number(r.totalValueEuro || 0), 0);
  const totalVendorParts  = top10Vendorwise.reduce((s, r) => s + Number(r.partcodeCount || 0), 0);

  const inp = {
    padding: '7px 10px', borderRadius: 5, border: '1px solid #CBD5E1',
    fontSize: 12, color: '#374151', background: '#F8FAFC',
    outline: 'none', width: '100%', boxSizing: 'border-box'
  };

  // 3D-style table header
  const th = (align = 'left') => ({
    padding: '9px 12px',
    background: 'linear-gradient(180deg, #2b5faa 0%, #1a3a6e 100%)',
    color: '#fff', fontWeight: 700, fontSize: 11,
    textAlign: align, whiteSpace: 'nowrap',
    borderRight: '1px solid rgba(255,255,255,0.18)',
    borderBottom: '2px solid #0f2548',
    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
    fontFamily: 'Segoe UI, sans-serif',
    letterSpacing: 0.2,
  });

  const td = (i, align = 'left') => ({
    padding: '6px 12px', fontSize: 12, textAlign: align,
    color: '#1e293b', borderRight: '1px solid #dde6f5',
    borderBottom: '1px solid #e8edf7',
    // background: i % 2 === 0 ? '#edf3fc' : '#fff',
    fontFamily: 'Segoe UI, sans-serif',
    fontWeight: 500,    
  });

  const totalTd = (align = 'left') => ({
    padding: '8px 12px', fontSize: 12, fontWeight: 700,
    background: 'linear-gradient(180deg, #1e3f70 0%, #132a52 100%)',
    color: '#fff', textAlign: align,
    borderRight: '1px solid rgba(255,255,255,0.15)',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  });

  const tableCard = (title, headerBg, children) => (
    <div style={{
      flex: 1, minWidth: 0,
      borderRadius: 10, overflow: 'hidden',
      boxShadow: '2px 4px 0px #b0c4de, 0 8px 24px rgba(26,58,92,0.18), 0 2px 4px rgba(0,0,0,0.08)',
      border: '1px solid #c5d7ee',
    }}>
      {/* Title bar */}
      <div style={{
        background: headerBg,
        padding: '10px 14px',
        boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.2)',
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 0.3 }}>{title}</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {children}
      </table>
    </div>
  );

  const EmptyRow = ({ cols }) => (
    <tr>
      <td colSpan={cols} style={{ textAlign: 'center', padding: 20, color: '#69e024', fontSize: 14 }}>
        {loading ? 'Loading...' : 'No data found'}
      </td>
    </tr>
  );

  return (
    <div style={{ padding: '18px 20px', background: 'white', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* HEADER */}
   
      <div className='ComCssFiledName'>
        <p>PO Report</p>
        <p style={{ fontSize: 11, color: '#94A3B8', margin: '3px 0 0' }}>Purchase Order — Top 10 Analysis</p>
      </div>
      

      {/* FILTER BAR */}
      {/* FILTER BAR */}
      
<div style={{
      background: 'linear-gradient(to right, #f3f190, #f0bfc5)',
 borderRadius: 10, padding: '13px 16px', marginBottom: 16,
  boxShadow: '2px 3px 0 #c5d7ee, 0 4px 12px rgba(38, 112, 209, 0.07)',
  border: '1px solid #dbe8f8'
}}>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr) auto auto', gap: 10, alignItems: 'flex-end' }}>

    {/* GRN Date */}
    <div>
      <label style={{ fontSize: 11, color: 'black', fontWeight: 600, display: 'block', marginBottom: 3 }}>GRN Date</label>
      <input type="date" name="grnDate" value={filters.grnDate}
        onChange={e => setFilters(p => ({ ...p, grnDate: e.target.value }))} style={inp} />
    </div>

    {/* PO Send Date */}
    <div>
      <label style={{ fontSize: 11, color: 'black', fontWeight: 600, display: 'block', marginBottom: 3 }}>PO Send Date</label>
      <input type="date" name="poSendDate" value={filters.poSendDate}
        onChange={e => setFilters(p => ({ ...p, poSendDate: e.target.value }))} style={inp} />
    </div>

    {/* ✅ Material Type — Dropdown */}
    <div>
      <label style={{ fontSize: 11, color: 'black', fontWeight: 600, display: 'block', marginBottom: 3 }}>Material Type</label>
      <select
        value={filters.materialType}
        onChange={e => setFilters(p => ({ ...p, materialType: e.target.value }))}
        style={{ ...inp, cursor: 'pointer' }}
      >
        <option value="">All Material Types</option>
        {materialTypes
          .filter(m => m && m.trim() !== '')   // ✅ remove empty strings
          .map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))
        }
      </select>
    </div>

    {/* ✅ Vendor — Dropdown */}
    <div>
      <label style={{ fontSize: 11, color: 'black', fontWeight: 600, display: 'block', marginBottom: 3 }}>Vendor</label>
      <select
        value={filters.vendor}
        onChange={e => setFilters(p => ({ ...p, vendor: e.target.value }))}
        style={{ ...inp, cursor: 'pointer' }}
      >
        <option value="">All Vendors</option>
        {vendors.map((v, i) => (
          <option key={i} value={v}>{v}</option>
        ))}
      </select>
    </div>

    <div>
  <label style={{ fontSize: 11, color: 'black', fontWeight: 600, display: 'block', marginBottom: 3 }}>PO Status</label>
  <select
    value={filters.poStatus}
    onChange={e => setFilters(p => ({ ...p, poStatus: e.target.value }))}
    style={{ ...inp, cursor: 'pointer' }}
  >
    <option value="">All Status</option>
    <option value="open">Open</option>
    <option value="closed">Closed</option>
    <option value="manual close">Manual Close</option>
    <option value="cancelled">Cancelled</option>
    <option value="on hold">On Hold</option>
  </select>
</div>

    <button onClick={() => fetchData()} style={{
      padding: '7px 18px', background: 'linear-gradient(180deg,#2b5faa,#1a3a6e)',
      color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700,
      cursor: 'pointer', boxShadow: '0 2px 0 #0f2548'
    }}>Search</button>

    {/* <button onClick={() => setFilters({ grnDate: '', poSendDate: '', materialType: '', vendor: '' })} style={{
      padding: '7px 14px', background: '#f1f5f9', color: '#64748B',
      border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer'
    }}>Clear</button> */}

    <button
  onClick={() => {
    const cleared = { grnDate: '', poSendDate: '', materialType: '', vendor: '', poStatus: 'closed' }; // ✅ reset to default
    setFilters(cleared);
    fetchData(new Date().getFullYear().toString(), cleared);
  }}
  style={{
    padding: '7px 14px', background: '#f1f5f9', color: '#64748B',
    border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 12,
    fontWeight: 600, cursor: 'pointer'
  }}
>
  Clear
</button>

  </div>
</div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 13px', marginBottom: 12, color: '#DC2626', fontSize: 12 }}>{error}</div>
      )}

      {/* 3 TABLES SIDE BY SIDE */}
      <div style={{ display: 'flex', gap: 14,fontFamily:'Roboto, sans-serif', alignItems: 'flex-start' }}>

        {/* TABLE 1 — Top 10 Contributors */}
        {tableCard(
          'Top 10 Contributors by Value',
          'linear-gradient(135deg, #21b56d 0%, #950a6e 100%)',
          <>
            <thead>
              <tr>
                <th style={th()}>Part Code</th>
                <th style={th('right')}>Sum of Qty</th>
                <th style={th('right')}>Sum of Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {loading || top10Contributors.length === 0
                ? <EmptyRow cols={3} />
                : top10Contributors.map((r, i) => (
                  <tr key={i}>
                    <td style={td(i)}>{r.partcode}</td>
                    <td style={td(i, 'right')}>{Number(r.orderQty || 0).toLocaleString('en-IN')}</td>
                    <td style={td(i, 'right')}>{fmtEuro(r.totalValueEuro)}</td>
                  </tr>
                ))
              }
            </tbody>
            <tfoot>
              <tr>
                <td style={totalTd()}>Total</td>
                <td style={totalTd('right')}>{totalContribQty.toLocaleString('en-IN')}</td>
                <td style={totalTd('right')}>{fmtEuro(totalContribEuro)}</td>
              </tr>
            </tfoot>
          </>
        )}

        {/* TABLE 2 — Country Wise */}
        {tableCard(
          'Country Wise Cost and Vendor Count',
         'linear-gradient(135deg, #21b56d 0%, #950a6e 100%)',
          <>
            <thead>
              <tr>
                <th style={th()}>Supplier Country</th>
                <th style={th('right')}>Count of Vendor</th>
                <th style={th('right')}>Sum of Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {loading || top10Countrywise.length === 0
                ? <EmptyRow cols={3} />
                : top10Countrywise.map((r, i) => (
                  <tr key={i}>
                    <td style={td(i)}>{r.country}</td>
                    <td style={td(i, 'right')}>{Number(r.vendorCount || 0)}</td>
                    <td style={td(i, 'right')}>{fmtEuro(r.totalValueEuro)}</td>
                  </tr>
                ))
              }
            </tbody>
            <tfoot>
              <tr>
                <td style={totalTd()}>Total</td>
                <td style={totalTd('right')}>{totalCountryCount}</td>
                <td style={totalTd('right')}>{fmtEuro(totalCountryEuro)}</td>
              </tr>
            </tfoot>
          </>
        )}

        {/* TABLE 3 — Vendor Wise */}
        {tableCard(
          'Vendor Wise Cost and Part Count',
          'linear-gradient(135deg, #21b56d 0%, #950a6e 100%)',
          <>
            <thead>
              <tr>
                <th style={th()}>Vendor</th>
                <th style={th('right')}>Sum of Total (€)</th>
                <th style={th('right')}>Count Part Code</th>
              </tr>
            </thead>
            <tbody>
              {loading || top10Vendorwise.length === 0
                ? <EmptyRow cols={3} />
                : top10Vendorwise.map((r, i) => (
                  <tr key={i}>
                    <td style={td(i)}>{r.vendorName}</td>
                    <td style={td(i, 'right')}>{fmtEuro(r.totalValueEuro)}</td>
                    <td style={td(i, 'right')}>{Number(r.partcodeCount || 0)}</td>
                  </tr>
                ))
              }
            </tbody>
            <tfoot>
              <tr>
                <td style={totalTd()}>Total</td>
                <td style={totalTd('right')}>{fmtEuro(totalVendorEuro)}</td>
                <td style={totalTd('right')}>{totalVendorParts.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </>
        )}

      </div>
    </div>
  );
};

export default PoReport;
