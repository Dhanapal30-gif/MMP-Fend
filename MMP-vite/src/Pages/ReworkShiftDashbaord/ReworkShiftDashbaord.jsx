import React, { useState, useEffect } from 'react';
import { fetchReworkShiftDashboardList, fetchReworkShiftDropdown } from '../../Services/Services_09';
import * as XLSX from 'xlsx';

const SHIFT_THEME = {
  A: { accent: '#0f6cbd', light: '#e8f3fc', badge: '#cce3f6', text: '#063a6e', grad: 'linear-gradient(135deg,#0f6cbd 0%,#0a4a8c 100%)' },
  B: { accent: '#107c10', light: '#e8f5e8', badge: '#c6e8c6', text: '#064706', grad: 'linear-gradient(135deg,#107c10 0%,#084808 100%)' },
  C: { accent: '#8a2be2', light: '#f3eafc', badge: '#ddc8f8', text: '#4a0e8f', grad: 'linear-gradient(135deg,#8a2be2 0%,#5a0d9e 100%)' },
};

const downloadExcel = (block) => {
  const { shift, typeColumns, rows, grandTotal } = block;
  const cols   = typeColumns.filter(tc => tc !== '');
  const header = ['Product Name', ...cols, 'Grand Total'];
  const dataRows = rows.map(r => [r.productname, ...cols.map(t => r[t] || 0), r.grandTotal]);
  const gRow   = ['Grand Total', ...cols.map(t => grandTotal[t] || 0), grandTotal.grandTotal];
  const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows, gRow]);
  ws['!cols'] = header.map((_, i) => ({ wch: i === 0 ? 18 : 10 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${shift} Shift`);
  XLSX.writeFile(wb, `Shift_${shift}_Report.xlsx`);
};

const fmt = v => {
  if (!v || v === 0) return null;
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000)    return (v / 1000).toFixed(1) + 'K';
  return v;
};

/* ── single shift table card ─────────────────────────────────────────────── */
const ShiftTable = ({ block }) => {
  const { shift, rows = [], grandTotal = {} } = block;
  const typeColumns = (block.typeColumns || []).filter(tc => tc !== '');
  const theme = SHIFT_THEME[shift?.toUpperCase()] || SHIFT_THEME.A;

  return (
    <div style={{
      flex: '1 1 0',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 10,
      overflow: 'hidden',
      border: `1.5px solid ${theme.accent}33`,
      boxShadow: '0 2px 10px rgba(0,0,0,0.09)',
      background: '#fff',
    }}>

      {/* ── header ── */}
      <div style={{
        background: theme.grad,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: '#fff',
          }}>{shift}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
              {shift} Shift
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
              {rows.length} products · {grandTotal.grandTotal?.toLocaleString()} total
            </div>
          </div>
        </div>
        <button
          onClick={() => downloadExcel(block)}
          title="Download Excel"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
            color: '#fff', fontSize: 11, fontWeight: 600,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
            <line x1="9" y1="11" x2="15" y2="11"/>
          </svg>
          Excel
        </button>
      </div>

      {/* ── scrollable table area ── */}
      <div style={{
        overflowY: 'auto',
        overflowX: 'auto',
        flex: 1,
        maxHeight: 'calc(100vh - 220px)',
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.accent} transparent`,
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 11.5,
          tableLayout: 'fixed',
        }}>
          {/* colgroup for fixed widths */}
          <colgroup>
            <col style={{ minWidth: 90, width: 90 }} />
            {typeColumns.map(tc => (
              <col key={tc} style={{ minWidth: 68, width: 68 }} />
            ))}
            <col style={{ minWidth: 72, width: 72 }} />
          </colgroup>

          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ background: theme.light }}>
              <th style={{
                padding: '8px 10px', textAlign: 'left', fontWeight: 700,
                color: theme.text, borderBottom: `2px solid ${theme.accent}`,
                fontSize: 11, whiteSpace: 'nowrap',
                position: 'sticky', left: 0, background: theme.light, zIndex: 3,
              }}>
                Row Labels
              </th>
              {typeColumns.map(tc => (
                <th key={tc} style={{
                  padding: '8px 6px', textAlign: 'center', fontWeight: 700,
                  color: theme.text, borderBottom: `2px solid ${theme.accent}`,
                  fontSize: 10, whiteSpace: 'nowrap',
                }}>
                  {tc}
                </th>
              ))}
              <th style={{
                padding: '8px 6px', textAlign: 'center', fontWeight: 700,
                color: theme.text, borderBottom: `2px solid ${theme.accent}`,
                fontSize: 10, whiteSpace: 'nowrap',
                background: theme.badge,
              }}>
                Grand Total
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.productname + idx}
                style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}
                onMouseEnter={e => e.currentTarget.style.background = theme.light}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
              >
                <td style={{
                  padding: '6px 10px', fontWeight: 600, color: '#1a1a2e',
                  borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  position: 'sticky', left: 0,
                  background: 'inherit',
                  fontSize: 11,
                }}>
                  {row.productname}
                </td>
                {typeColumns.map(tc => {
                  const v = row[tc] || 0;
                  const display = fmt(v);
                  return (
                    <td key={tc} style={{
                      padding: '6px 4px', textAlign: 'center',
                      borderBottom: '1px solid #f0f0f0',
                    }}>
                      {display ? (
                        <span style={{
                          display: 'inline-block',
                          minWidth: 26, padding: '1px 5px',
                          borderRadius: 4, fontWeight: 600,
                          background: theme.badge,
                          color: theme.text, fontSize: 10.5,
                        }}>
                          {display}
                        </span>
                      ) : (
                        <span style={{ color: '#d0d0d0', fontSize: 10 }}>—</span>
                      )}
                    </td>
                  );
                })}
                <td style={{
                  padding: '6px 4px', textAlign: 'center',
                  borderBottom: '1px solid #f0f0f0',
                  fontWeight: 700, color: theme.text,
                  background: `${theme.badge}88`,
                  fontSize: 11,
                }}>
                  {row.grandTotal?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

          {/* grand total footer — sticky bottom */}
          <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 2 }}>
            <tr style={{
              background: theme.light,
              borderTop: `2px solid ${theme.accent}`,
            }}>
              <td style={{
                padding: '8px 10px', fontWeight: 800,
                color: theme.text, fontSize: 11,
                position: 'sticky', left: 0, background: theme.light,
              }}>
                Grand Total
              </td>
              {typeColumns.map(tc => {
                const v = grandTotal[tc] || 0;
                return (
                  <td key={tc} style={{
                    padding: '8px 4px', textAlign: 'center',
                    fontWeight: 700, color: theme.text, fontSize: 10.5,
                  }}>
                    {v > 0 ? fmt(v) || v : '—'}
                  </td>
                );
              })}
              <td style={{
                padding: '8px 6px', textAlign: 'center',
                fontWeight: 800, color: '#fff',
                background: theme.accent, fontSize: 11,
              }}>
                {grandTotal.grandTotal?.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

/* ── main component ──────────────────────────────────────────────────────── */
const ReworkShiftDashboard = () => {
  const [filters, setFilters] = useState({
    productname: '', shift: '', startDate: '', endDate: '',
  });
  const [shiftSummary, setShiftSummary] = useState([]);
  const [productnames, setProductnames] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [clearBtn,     setClearBtn]     = useState(false);

  useEffect(() => {
    fetchReworkShiftDropdown()
      .then(res => { const d = res.data || {}; setProductnames(d.productnames || []); })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchDashboard(); }, [filters]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res  = await fetchReworkShiftDashboardList(filters);
      const data = res.data || {};                        // ✅ no .data.data
      const all  = (data.shiftSummary || [])
        .filter(b => ['A','B','C'].includes(b.shift?.toUpperCase())); // only A B C

      // ensure A → B → C order
      const ordered = ['A','B','C'].map(s =>
        all.find(b => b.shift?.toUpperCase() === s)
      ).filter(Boolean);

      setShiftSummary(ordered);
    } catch { setShiftSummary([]); }
    finally  { setLoading(false); }
  };

  const downloadAll = () => {
    const wb = XLSX.utils.book_new();
    shiftSummary.forEach(block => {
      const cols  = (block.typeColumns || []).filter(tc => tc !== '');
      const hdr   = ['Product Name', ...cols, 'Grand Total'];
      const dRows = (block.rows || []).map(r =>
        [r.productname, ...cols.map(t => r[t] || 0), r.grandTotal]);
      const gRow  = ['Grand Total', ...cols.map(t => block.grandTotal[t] || 0), block.grandTotal.grandTotal];
      const ws    = XLSX.utils.aoa_to_sheet([hdr, ...dRows, gRow]);
      ws['!cols'] = hdr.map((_, i) => ({ wch: i === 0 ? 18 : 10 }));
      XLSX.utils.book_append_sheet(wb, ws, `${block.shift} Shift`);
    });
    XLSX.writeFile(wb, 'Shift_Summary_All.xlsx');
  };

  const labelSt = { fontSize: 10, fontWeight: 700, color: 'white', marginBottom: 3, textTransform: 'uppercase' };
  const inpSt   = { height: 28, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f2f4f8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── filter bar ── */}
      {/* ── filter bar ── */}
<div style={{
  background: 'linear-gradient(135deg,#1a2a4a 0%,#0d1b35 100%)',
  padding: '12px 16px',
  display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end',
  boxShadow: '0 3px 12px rgba(0,0,0,0.25)', flexShrink: 0,
}}>
  <div style={{ alignSelf: 'center', marginRight: 6 }}>
    <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Rework Shift Type Summary</div>
    <div style={{ color: '#7fa8d0', fontSize: 10 }}>Rework · Pivot Report</div>
  </div>

  {/* ✅ Shift dropdown — A B C */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 110 }}>
    <label style={labelSt}>Shift</label>
    <select
      value={filters.shift}
      onChange={e => {
        setClearBtn(true);
        setFilters(p => ({ ...p, shift: e.target.value }));
      }}
      style={{ ...inpSt, cursor: 'pointer' }}
    >
      <option value=""  style={{ background: '#1a2a4a', color: '#fff' }}>All Shifts</option>
      <option value="A" style={{ background: '#1a2a4a', color: '#fff' }}>A Shift</option>
      <option value="B" style={{ background: '#1a2a4a', color: '#fff' }}>B Shift</option>
      <option value="C" style={{ background: '#1a2a4a', color: '#fff' }}>C Shift</option>
    </select>
  </div>

  {/* ✅ Product Name — black bg, white text on options */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 140 }}>
    <label style={labelSt}>Product Name</label>
    <select
      value={filters.productname}
      onChange={e => {
        setClearBtn(true);
        setFilters(p => ({ ...p, productname: e.target.value }));
      }}
      style={{ ...inpSt, cursor: 'pointer' }}
    >
      <option value="" style={{ background: '#111', color: '#fff' }}>All Products</option>
      {productnames.map(p => (
        <option key={p} value={p} style={{ background: '#111', color: '#fff' }}>
          {p}
        </option>
      ))}
    </select>
  </div>

  {/* Start Date / End Date remain same... */}


       
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label style={labelSt}>Start Date</label>
          <input type="date" value={filters.startDate}
            onChange={e => { setClearBtn(true); setFilters(p => ({ ...p, startDate: e.target.value })); }}
            style={inpSt} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 120 }}>
          <label style={labelSt}>End Date</label>
          <input type="date" value={filters.endDate}
            onChange={e => { setClearBtn(true); setFilters(p => ({ ...p, endDate: e.target.value })); }}
            style={inpSt} />
        </div>

        <div style={{ flex: 1 }} />

        {shiftSummary.length > 0 && (
          <button onClick={downloadAll} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: '#1d7a1d', border: '1px solid #2ea82e',
            borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
            color: '#fff', fontSize: 11, fontWeight: 700,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download All
          </button>
        )}

        {clearBtn && (
          <button onClick={() => { setFilters({ productname:'', shift:'', startDate:'', endDate:'' }); setClearBtn(false); }}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
              color: '#fff', fontSize: 11, fontWeight: 600,
            }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── three tables in a row ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: 10,
        padding: 12,
        overflow: 'hidden',       // parent doesn't scroll
        minHeight: 0,
      }}>
        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 13 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
              Loading shift data…
            </div>
          </div>
        )}

        {!loading && shiftSummary.length === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No data found</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Adjust filters above</div>
            </div>
          </div>
        )}

        {/* A B C — each takes equal width, scrolls independently */}
        {!loading && shiftSummary.map(block => (
          <ShiftTable key={block.shift} block={block} />
        ))}

        {/* placeholder cards for missing shifts so layout stays 3-col */}
        {!loading && shiftSummary.length > 0 &&
          ['A','B','C']
            .filter(s => !shiftSummary.find(b => b.shift === s))
            .map(s => {
              const theme = SHIFT_THEME[s];
              return (
                <div key={s} style={{
                  flex: '1 1 0', minWidth: 0, borderRadius: 10,
                  border: `1.5px dashed ${theme.accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: theme.accent, opacity: 0.5, fontSize: 13,
                }}>
                  {s} Shift — No Data
                </div>
              );
            })
        }
      </div>
    </div>
  );
};

export default ReworkShiftDashboard;