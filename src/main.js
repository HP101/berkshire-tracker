/* =========================================================
   Berkshire Tracker — v0 Stripe Press–style sticky sections
   Each section has its own chart that becomes sticky as you scroll
   ========================================================= */

// Import calculation functions and components
import {
  calculateCurrentValue,
  calculateTotalReturnDollars,
  calculateSP500Hypothetical,
  calculateSP500CAGR,
  beatSP500,
  calculateBeatByPercentagePoints,
  calculateCAGR,
  calculateYearsInvested
} from './lib/metrics.js';

import { createMetricCard } from './lib/components.js';

/* ---------- DOM references ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const asOfEl = $('#asOf');

/* ---------- Simple state ---------- */
const state = {
  cache: new Map(),   // ticker -> data object
};

/* ---------- Data loading (mock-first, live-ready) ---------- */
const DATA_INDEX = {
  AAPL: '/public/data/mock-aapl.json',
  AXP:  '/public/data/mock-axp.json',
  KO:   '/public/data/mock-ko.json',
};

/** Fetch & cache one ticker’s JSON. Generates a graceful placeholder if missing. */
async function loadData(ticker) {
  if (state.cache.has(ticker)) return state.cache.get(ticker);

  const url = DATA_INDEX[ticker];
  let data;
  try {
    if (!url) throw new Error('No URL mapped');
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    // Placeholder minimal shape so the app keeps working
    const nowISO = new Date().toISOString().slice(0, 10);
    data = {
      ticker,
      name: ticker,
      invested_year: 2016,
      years_invested: 9.5,
      entry:   { price: 24,   date: '2016-03-31', method: 'Q1 average (mock)' },
      current: { price: 180,  date: nowISO },
      benchmark: { symbol: 'SPY', entry_price: 176, current_price: 670 },
      price_series: genPlaceholderSeries(24, 180),
      benchmark_series: [],
      financials: { ttm: {}, annual: [] },
      methodology: {
        return_scope: 'Price return only; no dividends',
        beat_benchmark: 'Normalized to 100 at entry',
      },
    };
  }

  state.cache.set(ticker, data);
  return data;
}

/** Tiny helper: generate a plausible monotonic series for placeholders. */
function genPlaceholderSeries(start, end, points = 60) {
  const arr = [];
  const startDate = new Date('2016-04-01').getTime();
  const step = (Date.now() - startDate) / points;
  const drift = (end - start) / points;
  let val = start;
  for (let i = 0; i < points; i++) {
    val += drift * (0.8 + Math.random() * 0.4); // small randomness
    arr.push({ date: new Date(startDate + step * i).toISOString().slice(0,10), close: +val.toFixed(2) });
  }
  return arr;
}

/* ---------- Metrics (pure, small) ---------- */
const daysBetween = (aISO, bISO) =>
  (new Date(bISO) - new Date(aISO)) / (1000 * 60 * 60 * 24);

function computePerformance(d) {
  const entry   = d.entry.price;
  const current = d.current.price;

  const years = Math.max(0.01, daysBetween(d.entry.date, d.current.date) / 365.25);
  const multiple = current / entry;
  const totalReturn = multiple - 1;
  const cagr = Math.pow(multiple, 1 / years) - 1;

  const spyMultiple = d.benchmark && d.benchmark.entry_price
    ? (d.benchmark.current_price / d.benchmark.entry_price)
    : null;

  // “Beat” expressed as percentage points since entry (AppleIndex - SPYIndex)
  let beatPP = null;
  if (spyMultiple != null) {
    const aIdx = multiple * 100;
    const sIdx = spyMultiple * 100;
    beatPP = aIdx - sIdx; // percentage points
  }

  return { years, multiple, totalReturn, cagr, beatPP };
}

/* ---------- Formatters ---------- */
const fmt = {
  percent: (x, digits = 1) =>
    (x * 100).toFixed(digits) + '%',
  pp: (x, digits = 0) => (x >= 0 ? '+' : '') + x.toFixed(digits) + ' pp',
  multiple: (x, digits = 2) => x.toFixed(digits) + '×',
  bigUSD: (n) => {
    if (n == null) return '—';
    const abs = Math.abs(n);
    if (abs >= 1e12) return '$' + (n/1e12).toFixed(1) + 'T';
    if (abs >= 1e9)  return '$' + (n/1e9).toFixed(1)  + 'B';
    if (abs >= 1e6)  return '$' + (n/1e6).toFixed(1)  + 'M';
    return '$' + n.toLocaleString();
  },
};

/* ---------- Formatters ---------- */
const formatters = {
  percent: (x, digits = 1) => (x * 100).toFixed(digits) + '%',
  pp: (x, digits = 0) => (x >= 0 ? '+' : '') + x.toFixed(digits) + ' pp',
  multiple: (x, digits = 2) => x.toFixed(digits) + '×',
  bigUSD: (n) => {
    if (n == null) return '—';
    const abs = Math.abs(n);
    if (abs >= 1e12) return '$' + (n/1e12).toFixed(1) + 'T';
    if (abs >= 1e9)  return '$' + (n/1e9).toFixed(1)  + 'B';
    if (abs >= 1e6)  return '$' + (n/1e6).toFixed(1)  + 'M';
    return '$' + n.toLocaleString();
  },
};

/* ---------- Render metrics for a stock ---------- */
function renderMetrics(ticker, data) {
  const container = $(`#metrics-${ticker.toLowerCase()}`);
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Calculate all metrics
  const years = calculateYearsInvested(data.entry.date, data.current.date);
  const currentValue = calculateCurrentValue(data.total_shares_bought, data.current.price);
  const totalReturnDollars = calculateTotalReturnDollars(currentValue, data.initial_investment);
  const cagr = calculateCAGR(data.initial_investment, currentValue, years);
  const sp500CAGR = calculateSP500CAGR(
    data.benchmark.entry_price,
    data.benchmark.current_price,
    years
  );
  const sp500Hypothetical = calculateSP500Hypothetical(
    data.initial_investment,
    data.benchmark.entry_price,
    data.benchmark.current_price
  );
  const didBeatSP500 = beatSP500(cagr, sp500CAGR);
  const beatByPP = calculateBeatByPercentagePoints(cagr, sp500CAGR);

  // Create metrics data
  const metricsData = [
    {
      name: 'Portfolio Weight',
      value: formatters.percent(data.portfolio_weight, 0),
      label: 'GOOD',
      description: 'This represents the percentage of Berkshire Hathaway\'s total portfolio allocated to this stock.'
    },
    {
      name: 'Years Invested',
      value: years.toFixed(1) + ' years',
      description: `Berkshire has held this position since ${data.entry.date}.`
    },
    {
      name: 'Initial Investment',
      value: formatters.bigUSD(data.initial_investment)
    },
    {
      name: 'Total Shares',
      value: data.total_shares_bought.toLocaleString(),
      description: 'Total number of shares purchased by Berkshire Hathaway.'
    },
    {
      name: 'CAGR',
      value: formatters.percent(cagr, 1),
      label: cagr > 0.20 ? 'REALLY GOOD' : cagr > 0.15 ? 'GOOD' : 'AVERAGE',
      description: `Compound Annual Growth Rate: ${formatters.percent(cagr, 1)} per year.`
    },
    {
      name: 'Beat S&P 500?',
      value: didBeatSP500 ? 'YES' : 'NO',
      label: didBeatSP500 ? 'REALLY GOOD' : 'AVERAGE',
      description: `Outperformed S&P 500 by ${beatByPP.toFixed(1)} percentage points. If invested in S&P: ${formatters.bigUSD(sp500Hypothetical)}.`
    }
  ];

  // Render metric cards
  metricsData.forEach(metric => {
    container.appendChild(createMetricCard(metric));
  });
}

/* ---------- Minimal line chart (canvas 2D, no libs) ---------- */
function drawLine(canvas, series) {
  if (!canvas || !series || series.length < 2) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Padding inside canvas
  const pad = 18;
  const plotW = w - pad*2;
  const plotH = h - pad*2;

  // Map data to [0..1]
  const xs = series.map(s => new Date(s.date).getTime());
  const ys = series.map(s => s.close);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const xScale = (t) => ( (t - minX) / (maxX - minX || 1) ) * plotW + pad;
  const yScale = (v) => ( 1 - (v - minY) / (maxY - minY || 1) ) * plotH + pad;

  // Grid (light)
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i=0;i<=4;i++){
    const y = pad + (plotH/4)*i;
    ctx.moveTo(pad, y); ctx.lineTo(pad+plotW, y);
  }
  ctx.stroke();

  // Line
  ctx.strokeStyle = '#5aa8ff'; // accent
  ctx.lineWidth = 2;
  ctx.beginPath();
  series.forEach((pt, i) => {
    const x = xScale(new Date(pt.date).getTime());
    const y = yScale(pt.close);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

/* ---------- No need for observers or chart switching ---------- */
// Each section has its own chart that is already in the DOM
// Stripe Press sticky behavior is handled purely by CSS position: sticky

/* ---------- Boot ---------- */
async function boot() {
  // Load data for all stocks
  const tickers = ['AAPL', 'AXP', 'KO'];
  
  // Draw charts and render metrics for each section
  for (const ticker of tickers) {
    const data = await loadData(ticker);
    
    // Draw chart
    const canvas = $(`#chart-${ticker.toLowerCase()}`);
    if (canvas && data.price_series) {
      drawLine(canvas, data.price_series);
    }
    
    // Render metrics
    renderMetrics(ticker, data);
  }

  // Update header with latest date from AAPL
  const aaplData = state.cache.get('AAPL');
  if (aaplData) {
    asOfEl.textContent = `As of ${aaplData.current.date}`;
  }
}

boot();
