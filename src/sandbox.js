/* =========================================================
   SANDBOX — Berkshire Tracker
   Use this file to experiment with new features safely
   ========================================================= */

// Import all calculation functions from metrics.js
import {
  calculateCurrentValue,
  calculateTotalReturnDollars,
  calculateSP500Hypothetical,
  calculateSP500CAGR,
  beatSP500,
  calculateBeatByPercentagePoints,
  calculateCAGR,
  calculateYearsInvested,
  getRatingClass
} from './lib/metrics.js';

// Import UI components
import { createMetricCard } from './lib/components.js';

console.log('🧪 Sandbox loaded! Start experimenting...');

/* ---------- Helpers (copied from main.js for convenience) ---------- */

// Simple DOM selector
const $ = (sel, root = document) => root.querySelector(sel);

// /sandbox/main.js

// --- 1) Minimal monthly-ish mock for Apple (adjusted close) ---
const entryDate = '2016-03-31'; // Q1-2016 avg proxy

// Yearly-ish adjusted closes (mocked)
const series = [
  { date: '2016-04-01', close: 25.10 },
  { date: '2017-01-01', close: 28.80 },
  { date: '2018-01-01', close: 39.20 },
  { date: '2019-01-01', close: 38.00 },
  { date: '2020-01-01', close: 74.40 },
  { date: '2021-01-01', close: 129.40 },
  { date: '2022-01-01', close: 182.00 },
  { date: '2023-01-01', close: 130.00 },
  { date: '2024-01-01', close: 185.00 },
  { date: '2025-01-01', close: 255.00 }
];


// --- 2) Index to 100 at entry (so 100 = buy-in level) ---
function toIndexed(data, entryISO) {
  // pick the first point on/after entry; fallback to the first point
  const idx = data.findIndex(p => p.date >= entryISO);
  const base = idx >= 0 ? data[idx].close : data[0].close;
  return data.map(p => ({
    x: new Date(p.date).getTime(),     // Chart.js time scale likes timestamps
    y: (p.close / base) * 100          // 100 at entry
  }));
}

const indexed = toIndexed(series, entryDate);

// --- 3) Render the chart ---
function renderAppleChart() {
  const canvas = document.getElementById('myChart');
  if (!canvas) {
    console.warn('Chart canvas not found');
    return;
  }
  
  const ctx2 = canvas.getContext('2d');
  
  new Chart(ctx2, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Indexed to 100 at entry',
        data: indexed,          // [{x: timeMs, y: value}, ...]
        parsing: false,         // we're already giving x/y
        borderWidth: 9,
        borderColor: '#5aa8ff',
        pointRadius: 2,
        tension: 0.18           // tiny smoothing
      }]
    },
    options: {
      responsive: false,                  // disable responsiveness - keep fixed size
      maintainAspectRatio: false,         // respect canvas width/height
      animation: { duration: 800 },
      normalized: true,
      scales: {
        x: {
          type: 'time',
          time: { unit: 'year' },
          grid: { color: 'rgba(255, 47, 47, 0.06)' },
          ticks: { color: '#95a1ab' }
        },
        y: {
          grid: { color: 'rgba(34, 17, 17, 0.06)' },
          ticks: {
            color: '#95a1ab',
            callback: v => v.toFixed(0)   // 100, 150, 200…
          },
          title: {
            display: false,
            text: 'Index (100 = entry)',
            color: '#95a1ab',
            font: { weight: 'normal' }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'nearest',
          intersect: false,
          callbacks: {
            label: ctx => ` Index ${ctx.parsed.y.toFixed(0)}`
          }
        }
      },
      elements: { line: { capBezierPoints: true } }
    }
  });
}


// Formatters
const fmt = {
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

/* ---------- METRICS EXPERIMENTS ---------- */

// Test loading data and displaying metrics
async function experimentDataLoading() {
  try {
    console.log('📊 Loading AAPL data and testing calculations...');
    
    // Load the data
    const response = await fetch('/public/data/mock-aapl.json');
    const data = await response.json();
    
    console.log('✅ Data loaded:', data);
    
    // Calculate metrics using functions from metrics.js
    const years = calculateYearsInvested(data.entry.date, data.current.date);
    
    // Calculate current value and total return using shares
    const currentValue = calculateCurrentValue(data.total_shares_bought, data.current.price);
    const totalReturnDollars = calculateTotalReturnDollars(currentValue, data.initial_investment);
    
    // Calculate CAGR
    const cagr = calculateCAGR(data.initial_investment, currentValue, years);
    
    // Calculate S&P 500 metrics
    const spyEntryPrice = data.benchmark.entry_price;
    const spyCurrentPrice = data.benchmark.current_price; // Hardcoded for now, will be dynamic later
    const sp500CAGR = calculateSP500CAGR(spyEntryPrice, spyCurrentPrice, years);
    const sp500Hypothetical = calculateSP500Hypothetical(data.initial_investment, spyEntryPrice, spyCurrentPrice);
    const didBeatSP500 = beatSP500(cagr, sp500CAGR);
    const beatByPP = calculateBeatByPercentagePoints(cagr, sp500CAGR);
    
    // Display results
    console.log('\n📈 CALCULATED METRICS:');
    console.log('─────────────────────');
    console.log('✅ METRIC #1 - Portfolio Weight:', (data.portfolio_weight * 100).toFixed(0) + '% (hardcoded)');
    console.log('✅ METRIC #2 - Years Invested:', years.toFixed(1) + ' years (calculated from dates)');
    console.log('✅ METRIC #3 - Amount Invested Initially:', fmt.bigUSD(data.initial_investment) + ' (hardcoded)');
    console.log('✅ METRIC #4 - Total Shares Bought:', data.total_shares_bought.toLocaleString() + ' shares (hardcoded)');
    console.log('✅ METRIC #5 - CAGR:', (cagr * 100).toFixed(1) + '% per year (calculated)');
    console.log('✅ METRIC #6 - Did it Beat S&P 500?:', didBeatSP500 ? '✅ YES' : '❌ NO');
    console.log('   └─ Apple CAGR:', (cagr * 100).toFixed(1) + '%');
    console.log('   └─ S&P 500 CAGR:', (sp500CAGR * 100).toFixed(1) + '%');
    console.log('   └─ Beat by:', beatByPP.toFixed(1) + ' percentage points');
    console.log('   └─ If invested in S&P:', fmt.bigUSD(sp500Hypothetical));
    console.log('📊 Calculated - Current Value:', fmt.bigUSD(currentValue));
    console.log('📊 Calculated - Total Return:', fmt.bigUSD(totalReturnDollars));
    
    // Display in the UI
    const output = $('#data-output');
    if (output) {
      output.textContent = `
📊 APPLE (AAPL) METRICS
${'─'.repeat(50)}

METRIC #1: Portfolio Weight
──────────────────────────
Value:  ${(data.portfolio_weight * 100).toFixed(0)}%
Type:   Hardcoded in JSON
Source: data.portfolio_weight

METRIC #2: Number of Years Invested
────────────────────────────────────
Value:       ${years.toFixed(1)} years
Type:        Calculated
Source:      data.entry.date → data.current.date
Calculation: (current date - entry date) / 365.25
Entry Date:  ${data.entry.date}
Current Date: ${data.current.date}

METRIC #3: Amount Invested Initially
─────────────────────────────────────
Value:  ${fmt.bigUSD(data.initial_investment)}
Type:   Hardcoded in JSON
Source: data.initial_investment
Raw:    $${data.initial_investment.toLocaleString()}

METRIC #4: Total Shares Bought
───────────────────────────────
Value:  ${data.total_shares_bought.toLocaleString()} shares
Type:   Hardcoded in JSON
Source: data.total_shares_bought
Note:   Used to calculate current value and total return

METRIC #5: CAGR (Compound Annual Growth Rate)
──────────────────────────────────────────────
Value:       ${(cagr * 100).toFixed(1)}% per year
Type:        Calculated
Formula:     (Final Value / Initial Value)^(1/Years) - 1
Calculation: (${fmt.bigUSD(currentValue)} / ${fmt.bigUSD(data.initial_investment)})^(1/${years.toFixed(1)}) - 1
Result:      ${(cagr * 100).toFixed(2)}% annual growth

METRIC #6: Did it Beat S&P 500?
────────────────────────────────
Answer:      ${didBeatSP500 ? '✅ YES' : '❌ NO'}
Type:        Calculated (comparison)

Apple Performance:
  CAGR:            ${(cagr * 100).toFixed(1)}%
  Current Value:   ${fmt.bigUSD(currentValue)}
  
S&P 500 Benchmark:
  Entry Price:     $${spyEntryPrice} (${data.entry.date})
  Current Price:   $${spyCurrentPrice} (${data.current.date}) [hardcoded, will be live]
  CAGR:            ${(sp500CAGR * 100).toFixed(1)}%
  Hypothetical:    ${fmt.bigUSD(sp500Hypothetical)}
                   (if invested same $${fmt.bigUSD(data.initial_investment)} in S&P)

Comparison:
  Beat by:         ${beatByPP.toFixed(1)} percentage points
  Dollar Advantage: ${fmt.bigUSD(currentValue - sp500Hypothetical)}

CALCULATED: Total Return (in $)
────────────────────────────────
Current Value:   ${fmt.bigUSD(currentValue)}
                 (${data.total_shares_bought.toLocaleString()} shares × $${data.current.price})
Total Return:    ${fmt.bigUSD(totalReturnDollars)}
                 ($${fmt.bigUSD(currentValue)} - ${fmt.bigUSD(data.initial_investment)})
Type:            Calculated from shares & prices

─────────────────────────────────────────────────────
      `.trim();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Test the reusable metric component with all 6 metrics
async function experimentMetricComponents() {
  console.log('🎨 Testing metric card components...');
  
  try {
    // Load the data
    const response = await fetch('../public/data/mock-aapl.json');
    const data = await response.json();
    
    // Calculate all metrics
    const years = calculateYearsInvested(data.entry.date, data.current.date);
    const currentValue = calculateCurrentValue(data.total_shares_bought, data.current.price);
    const totalReturnDollars = calculateTotalReturnDollars(currentValue, data.initial_investment);
    const cagr = calculateCAGR(data.initial_investment, currentValue, years);
    const spyEntryPrice = data.benchmark.entry_price;
    const spyCurrentPrice = data.benchmark.current_price;
    const sp500CAGR = calculateSP500CAGR(spyEntryPrice, spyCurrentPrice, years);
    const sp500Hypothetical = calculateSP500Hypothetical(data.initial_investment, spyEntryPrice, spyCurrentPrice);
    const didBeatSP500 = beatSP500(cagr, sp500CAGR);
    const beatByPP = calculateBeatByPercentagePoints(cagr, sp500CAGR);
    
    // Create metrics data array
    const metricsData = [
      {
        name: 'Portfolio Weight',
        value: fmt.percent(data.portfolio_weight, 0),
        label: 'GOOD',
        description: 'This represents the percentage of Berkshire Hathaway\'s total portfolio allocated to this stock.'
      },
      {
        name: 'Number of Years Invested',
        value: years.toFixed(1) + ' years',
        description: `Berkshire has held this position since ${data.entry.date}, demonstrating long-term conviction in the company.`
      },
      {
        name: 'Amount Invested Initially',
        value: fmt.bigUSD(data.initial_investment)
      },
      {
        name: 'Total Shares Bought',
        value: data.total_shares_bought.toLocaleString() + ' shares',
        description: 'The total number of shares purchased by Berkshire Hathaway in this company.'
      },
      {
        name: 'CAGR (Compound Annual Growth Rate)',
        value: fmt.percent(cagr, 1),
        label: cagr > 0.20 ? 'REALLY GOOD' : cagr > 0.15 ? 'GOOD' : 'AVERAGE',
        description: `This investment has grown at an average of ${fmt.percent(cagr, 1)} per year. The formula is: (Final Value / Initial Value)^(1/Years) - 1.`
      },
      {
        name: 'Beat S&P 500?',
        value: didBeatSP500 ? 'YES ✓' : 'NO ✗',
        label: didBeatSP500 ? 'REALLY GOOD' : 'AVERAGE',
        description: `This investment ${didBeatSP500 ? 'outperformed' : 'underperformed'} the S&P 500 by ${beatByPP.toFixed(1)} percentage points. If the same amount (${fmt.bigUSD(data.initial_investment)}) was invested in the S&P 500, it would be worth ${fmt.bigUSD(sp500Hypothetical)} today.`
      }
    ];
    
    // Get container
    const container = $('#all-metrics-container');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Create and append metric cards
    metricsData.forEach(metric => {
      const card = createMetricCard(metric);
      container.appendChild(card);
    });
    
    console.log('✅ All metric cards rendered!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/* ---------- Initialize sandbox ---------- */
function initSandbox() {
  console.log('🚀 Initializing sandbox...');
  
  // Render the Apple chart prototype
  renderAppleChart();
  
  // Run metrics experiments
  experimentDataLoading();
  experimentMetricComponents();
  
  console.log('✅ Sandbox ready!');
}

// Boot the sandbox
initSandbox();
