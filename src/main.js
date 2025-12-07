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

import { createMetricCard, createStockHeader, createAtAGlance } from './lib/components.js';

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

/* ---------- Render stock header ---------- */
function renderStockHeader(ticker, data) {
  const container = $(`#header-${ticker.toLowerCase()}`);
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Calculate price change (mock for now - we'll use live data later)
  const priceChange = data.current.price - data.entry.price;
  const priceChangePercent = (priceChange / data.entry.price) * 100;

  // Create and append header
  const header = createStockHeader({
    ticker: ticker,
    name: data.name,
    currentPrice: data.current.price,
    priceChange: priceChange,
    priceChangePercent: priceChangePercent
  });

  container.appendChild(header);
}

/* ---------- Render "At a Glance" summary ---------- */
function renderAtAGlance(ticker, data) {
  const container = $(`#glance-${ticker.toLowerCase()}`);
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Calculate key metrics
  const years = calculateYearsInvested(data.entry.date, data.current.date);
  const currentValue = calculateCurrentValue(data.total_shares_bought, data.current.price);
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
  const sp500Difference = currentValue - sp500Hypothetical;

  // Extract start year from entry date
  const startYear = new Date(data.entry.date).getFullYear();

  // Create and append the at-a-glance card
  const glanceCard = createAtAGlance({
    startYear: startYear,
    invested: data.initial_investment,
    returned: currentValue,
    beatSP500: didBeatSP500,
    sp500Hypothetical: sp500Hypothetical,
    sp500Difference: sp500Difference
  });

  container.appendChild(glanceCard);
}

/* ---------- Render metrics for a stock ---------- */
function renderMetrics(ticker, data) {
  const tickerLower = ticker.toLowerCase();
  
  // Get containers
  const basicContainer = $(`#metrics-basic-${tickerLower}`);
  const sp500Container = $(`#metrics-sp500-${tickerLower}`);
  const buffettContainer = $(`#metrics-buffett-${tickerLower}`);
  
  if (!basicContainer || !sp500Container || !buffettContainer) return;

  // Clear containers
  basicContainer.innerHTML = '';
  sp500Container.innerHTML = '';
  buffettContainer.innerHTML = '';

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

  // === BASIC METRICS ===
  const basicMetrics = [
    {
      name: 'Portfolio Weight',
      value: formatters.percent(data.portfolio_weight, 0),
      label: data.portfolio_weight > 0.15 ? 'HIGH' : 'GOOD',
      description: 'Percentage of Berkshire Hathaway\'s total portfolio allocated to this stock.'
    },
    {
      name: 'Years Invested',
      value: years.toFixed(1) + ' years',
      description: `Berkshire has held this position since ${data.entry.date}.`
    },
    {
      name: 'Initial Investment',
      value: formatters.bigUSD(data.initial_investment),
      description: 'Total amount Berkshire invested when building this position.'
    },
    {
      name: 'Total Return',
      value: formatters.bigUSD(totalReturnDollars),
      label: totalReturnDollars > 0 ? 'REALLY GOOD' : 'BAD',
      description: `Total dollar profit/loss. Current value: ${formatters.bigUSD(currentValue)}.`
    },
    {
      name: 'CAGR',
      value: formatters.percent(cagr, 1),
      label: cagr > 0.20 ? 'REALLY GOOD' : cagr > 0.15 ? 'GOOD' : cagr > 0.10 ? 'AVERAGE' : 'BAD',
      description: `Compound Annual Growth Rate: the average yearly return since entry.`
    }
  ];

  // === S&P 500 METRICS ===
  const sp500Metrics = [
    {
      name: 'Beat S&P 500 by',
      value: beatByPP >= 0 ? `+${beatByPP.toFixed(1)} pp` : `${beatByPP.toFixed(1)} pp`,
      label: beatByPP > 50 ? 'REALLY GOOD' : beatByPP > 0 ? 'GOOD' : 'AVERAGE',
      description: `Outperformed S&P 500 by ${beatByPP.toFixed(1)} percentage points. S&P CAGR: ${formatters.percent(sp500CAGR, 1)}. If invested in S&P: ${formatters.bigUSD(sp500Hypothetical)}.`
    }
  ];

  // === BUFFETT METRICS ===
  const buffettMetricsData = data.buffett_metrics || {};
  const buffettMetrics = [
    {
      name: 'ROIC',
      value: buffettMetricsData.roic?.value ? formatters.percent(buffettMetricsData.roic.value, 1) : '—',
      label: buffettMetricsData.roic?.rating || null,
      description: buffettMetricsData.roic?.description || 'Return on Invested Capital: measures how efficiently a company generates profits from its capital.'
    },
    {
      name: 'Free Cash Flow',
      value: buffettMetricsData.fcf?.value ? formatters.bigUSD(buffettMetricsData.fcf.value) : '—',
      label: buffettMetricsData.fcf?.rating || null,
      description: buffettMetricsData.fcf?.description || 'Cash generated after capital expenditures. The lifeblood of a business.'
    },
    {
      name: 'FCF Margin',
      value: buffettMetricsData.fcf_margin?.value ? formatters.percent(buffettMetricsData.fcf_margin.value, 1) : '—',
      label: buffettMetricsData.fcf_margin?.rating || null,
      description: buffettMetricsData.fcf_margin?.description || 'Free cash flow as a percentage of revenue. Higher is better.'
    },
    {
      name: 'Revenue CAGR',
      value: buffettMetricsData.revenue_cagr?.value ? formatters.percent(buffettMetricsData.revenue_cagr.value, 1) : '—',
      label: buffettMetricsData.revenue_cagr?.rating || null,
      description: buffettMetricsData.revenue_cagr?.description || 'Revenue growth rate over time. Buffett likes steady, predictable growth.'
    },
    {
      name: 'Net Income CAGR',
      value: buffettMetricsData.net_income_cagr?.value ? formatters.percent(buffettMetricsData.net_income_cagr.value, 1) : '—',
      label: buffettMetricsData.net_income_cagr?.rating || null,
      description: buffettMetricsData.net_income_cagr?.description || 'Profit growth rate. Should ideally exceed revenue growth (margin expansion).'
    },
    {
      name: 'Operating Margin Stability',
      value: buffettMetricsData.operating_margin_stability?.value || '—',
      label: buffettMetricsData.operating_margin_stability?.rating || null,
      description: buffettMetricsData.operating_margin_stability?.description || 'Consistency of operating margins. Buffett values predictability.'
    },
    {
      name: 'Net Income Margin Stability',
      value: buffettMetricsData.net_margin_stability?.value || '—',
      label: buffettMetricsData.net_margin_stability?.rating || null,
      description: buffettMetricsData.net_margin_stability?.description || 'Consistency of net profit margins over time.'
    },
    {
      name: 'Reinvestment Rate',
      value: buffettMetricsData.reinvestment_rate?.value ? formatters.percent(buffettMetricsData.reinvestment_rate.value, 1) : '—',
      label: buffettMetricsData.reinvestment_rate?.rating || null,
      description: buffettMetricsData.reinvestment_rate?.description || 'Percentage of earnings reinvested into the business vs returned to shareholders.'
    },
    {
      name: 'Dividend CAGR',
      value: buffettMetricsData.dividend_cagr?.value ? formatters.percent(buffettMetricsData.dividend_cagr.value, 1) : '—',
      label: buffettMetricsData.dividend_cagr?.rating || null,
      description: buffettMetricsData.dividend_cagr?.description || 'Dividend growth rate. Shows management confidence and shareholder friendliness.'
    },
    {
      name: 'Net Debt/EBITDA',
      value: buffettMetricsData.net_debt_ebitda?.value ? buffettMetricsData.net_debt_ebitda.value.toFixed(1) + 'x' : '—',
      label: buffettMetricsData.net_debt_ebitda?.rating || null,
      description: buffettMetricsData.net_debt_ebitda?.description || 'Leverage ratio. Lower is better. Buffett prefers companies with manageable debt.'
    },
    {
      name: 'Recession Performance',
      value: buffettMetricsData.recession_performance?.value || '—',
      label: buffettMetricsData.recession_performance?.rating || null,
      description: buffettMetricsData.recession_performance?.description || 'How the company performed during economic downturns. Resilience matters.'
    }
  ];

  // Render all metrics to their respective containers
  basicMetrics.forEach(metric => {
    basicContainer.appendChild(createMetricCard(metric));
  });

  sp500Metrics.forEach(metric => {
    sp500Container.appendChild(createMetricCard(metric));
  });

  buffettMetrics.forEach(metric => {
    buffettContainer.appendChild(createMetricCard(metric));
  });
}

/* ---------- Minimal line chart (canvas 2D, no libs) ---------- */
function drawLine(canvas, series) {
  if (!canvas || !series || series.length < 2) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // No padding for full bleed grid
  const pad = 0;
  const plotW = w;
  const plotH = h;

  // Draw fine grid (small squares like graph paper)
  const gridSize = 20; // Size of each grid square
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; // Very subtle grid lines
  ctx.lineWidth = 0.5;
  
  // Vertical lines
  ctx.beginPath();
  for (let x = 0; x <= w; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();
  
  // Horizontal lines
  ctx.beginPath();
  for (let y = 0; y <= h; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Map data to [0..1] with some padding for the line
  const linePad = 40; // Padding for the actual data line
  const xs = series.map(s => new Date(s.date).getTime());
  const ys = series.map(s => s.close);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const xScale = (t) => ( (t - minX) / (maxX - minX || 1) ) * (plotW - linePad*2) + linePad;
  const yScale = (v) => ( 1 - (v - minY) / (maxY - minY || 1) ) * (plotH - linePad*2) + linePad;

  // Draw the price line
  ctx.strokeStyle = '#5aa8ff'; // accent color
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
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
    
    // Render stock header
    renderStockHeader(ticker, data);
    
    // Draw chart
    const canvas = $(`#chart-${ticker.toLowerCase()}`);
    if (canvas && data.price_series) {
      drawLine(canvas, data.price_series);
    }
    
    // Render "At a Glance" summary
    renderAtAGlance(ticker, data);
    
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
