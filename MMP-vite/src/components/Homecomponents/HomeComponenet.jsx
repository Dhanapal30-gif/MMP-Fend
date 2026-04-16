import React, { useState, useEffect } from 'react';
import { getHomeCard } from '../../Services/Services';
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

import './HomeComponent.css';

const HomeComponent = () => {

  const [totalSummary,      setTotalSummary]      = useState({ totalStockCount: 0, totalStockValue: 0 });
  const [partcodeList,      setPartcodeList]      = useState([]);
  const [outOfStockList,    setOutOfStockList]    = useState([]);
  const [todayReceivedList, setTodayReceivedList] = useState([]);
  const [todayIssuedList,   setTodayIssuedList]   = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [showOutOfStock,    setShowOutOfStock]    = useState(false);
  const [showTodayReceived, setShowTodayReceived] = useState(false);
  const [showTodayIssued,   setShowTodayIssued]   = useState(false);
  const [partcodeSearch,    setPartcodeSearch]    = useState('');

  const filteredPartcodeList = partcodeSearch.trim() === ''
    ? partcodeList.slice(0, 20)
    : partcodeList.filter(item =>
        item.partcode.toLowerCase().includes(partcodeSearch.toLowerCase())
      );

  const fetchHomeCardData = () => {
    setLoading(true);
    getHomeCard()
      .then((response) => {
        const data = response.data.data;
        setTotalSummary(data.totalSummary || { totalStockCount: 0, totalStockValue: 0 });
        const sorted = (data.partcodeList || [])
          .filter(item => Number(item.totalValue) > 0)
          .sort((a, b) => Number(b.totalValue) - Number(a.totalValue));
        setPartcodeList(sorted);
        setOutOfStockList((data.outOfStockList || []).filter(Boolean));
        setTodayReceivedList(data.todayReceivedList || []);
        setTodayIssuedList(data.todayIssuedList || []);
      })
      .catch((error) => console.error("Error fetching home card data:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHomeCardData(); }, []);

  /* ── Reusable popup renderer ── */
  const renderPopup = (show, onClose, title, subtitle, list, badgeStyle, isObjectList = false) => {
    if (!show) return null;
    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-box" onClick={(e) => e.stopPropagation()}>

          <div className="popup-header">
            <div>
              <strong className="popup-title">{title}</strong>
              <p className="popup-subtitle">{subtitle}</p>
            </div>
            <button className="popup-close" onClick={onClose}>×</button>
          </div>

          <div className="popup-list">
            {list.length === 0 ? (
              <p className="popup-empty">No data available</p>
            ) : (
              list.map((item, index) => (
                <div key={index} className="popup-list-item">
                  <span className="popup-badge" style={badgeStyle}>
                    {index + 1}
                  </span>
                  {isObjectList
                    ? <span>{item.partcode}{item.technology ? ` — ${item.technology}` : ''}</span>
                    : <span>{item}</span>
                  }
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    );
  };

  /* ── Ticker scroller ── */
  const renderTicker = (list) => {
    if (list.length === 0) return null;
    return (
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...list, ...list].map((item, index) => (
            <span key={index}>
              {typeof item === 'string' ? item : item.partcode}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">

      {/* ── Total Summary Card ── */}
      <div className="stat-box stat-box--split">
        <div>
          <h6>Total Stock Partcode</h6>
          <p>{Number(totalSummary.totalStockCount).toLocaleString('en-IN')}</p>
        </div>
        <div className="stat-box--split-right">
          <h6>Total Stock Value</h6>
          <p>€ {Number(totalSummary.totalStockValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* ── Out Of Stock Card ── */}
      <div className="stat-box stat-box--clickable" onClick={() => setShowOutOfStock(true)}>
        <h6>Out Of Stock Parts</h6>
        <p>{outOfStockList.length}</p>
        <small className="stat-hint">Click to view list</small>
      </div>

      {/* ── Today Received Card ── */}
      <div className="stat-box stat-box--clickable" onClick={() => setShowTodayReceived(true)}>
        <h6>Received Parts : {todayReceivedList.length}</h6>
        {renderTicker(todayReceivedList)}
        <small className="stat-hint">Click to view list</small>
      </div>

      {/* ── Today Issued Card ── */}
      <div className="stat-box stat-box--clickable" onClick={() => setShowTodayIssued(true)}>
        <h6>Issued Parts : {todayIssuedList.length}</h6>
        {renderTicker(todayIssuedList)}
        <small className="stat-hint">Click to view list</small>
      </div>

      {/* ── Second Row: 3 boxes ── */}
      <div className="homedashFlexbox">

        {/* Box 1 — Partcode wise bar chart */}
        <div>
          <h6 style={{ marginBottom: 8, color: '#fff', fontSize: 13, width: '100%' }}>
            Partcode wise Stock Value — highest first
          </h6>
          <input
            type="text"
            placeholder="Search partcode..."
            value={partcodeSearch}
            onChange={(e) => setPartcodeSearch(e.target.value)}
            className="chart-search-input"
          />
          <div style={{ width: '100%', overflowY: 'auto', maxHeight: '320px' }}>
            <div style={{ width: '100%', height: `${filteredPartcodeList.length * 45}px`, minHeight: '200px' }}>
              <Bar
                data={{
                  labels: filteredPartcodeList.map(item => item.partcode),
                  datasets: [{
                    label: 'Stock Value (€)',
                    data: filteredPartcodeList.map(item => Number(item.totalValue).toFixed(2)),
                    backgroundColor: filteredPartcodeList.map((_, i) =>
                      i === 0 ? 'rgba(16, 222, 126, 0.85)' :
                      i === 1 ? 'rgba(197, 10, 239, 0.85)' :
                      i === 2 ? 'rgba(255, 205, 86, 0.85)' :
                      i === 3 ? 'white'                    :
                                'rgba(54, 162, 235, 0.75)'
                    ),
                    borderRadius: 5,
                    borderSkipped: false,
                    barThickness: 28,
                  }],
                }}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: { padding: { right: 130 } },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` € ${Number(ctx.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                      },
                    },
                    datalabels: {
                      anchor: 'end', align: 'end', clip: false,
                      font: { size: 10, weight: 'bold' },
                      color: '#fff',
                      formatter: (value) =>
                        `€ ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        font: { size: 10 }, color: '#ccc',
                        callback: (value) => `€ ${Number(value).toLocaleString('en-IN')}`,
                      },
                      grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                    y: {
                      ticks: { font: { size: 10 }, color: '#fff' },
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
          {filteredPartcodeList.length === 0 && (
            <p style={{ color: '#aaa', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
              No partcode found
            </p>
          )}
        </div>

        {/* Box 2 — empty */}
        <div></div>

        {/* Box 3 — empty */}
        <div></div>

      </div>

      {/* ── Popups ── */}
      {renderPopup(
        showOutOfStock,
        () => setShowOutOfStock(false),
        'Out Of Stock Partcodes',
        `${outOfStockList.length} partcodes with zero qty`,
        outOfStockList,
        { background: '#fee2e2', color: '#b91c1c' },
        false
      )}

      {renderPopup(
        showTodayReceived,
        () => setShowTodayReceived(false),
        'Last 7-Days Received Partcodes',
        `${todayReceivedList.length} partcodes received`,
        todayReceivedList,
        { background: '#dcfce7', color: '#15803d' },
        true   // ← objects {partcode, technology}
      )}

      {renderPopup(
        showTodayIssued,
        () => setShowTodayIssued(false),
        'Today Issued Partcodes',
        `${todayIssuedList.length} partcodes issued today`,
        todayIssuedList,
        { background: '#fef9c3', color: '#854d0e' },
        false
      )}

    </div>
  );
};

export default HomeComponent;
