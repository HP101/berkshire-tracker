/* =========================================================
   COMPONENTS — Berkshire Tracker
   Reusable UI component factory functions
   ========================================================= */

/**
 * Label color mapping
 * Maps rating labels to background and text colors
 */
const labelColors = {
  'BAD': { bg: '#fee2e2', text: '#991b1b' },
  'AVERAGE': { bg: '#fef3c7', text: '#92400e' },
  'GOOD': { bg: '#d1fae5', text: '#065f46' },
  'HIGH': { bg: '#dbeafe', text: '#1e40af' },
  'REALLY GOOD': { bg: '#86efac', text: '#064e3b' }
};

/**
 * Create a metric card component
 * 
 * Creates a DOM element for displaying a single metric with:
 * - Metric name and value
 * - Optional label badge (GOOD, BAD, etc.)
 * - Optional collapsible accordion with description
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.name - Metric name (e.g., "Portfolio Weight")
 * @param {string} config.value - Metric value (e.g., "22%")
 * @param {string} [config.label] - Optional label (e.g., "GOOD", "BAD")
 * @param {string} [config.description] - Optional description text for accordion
 * @returns {HTMLElement} The metric card DOM element
 * 
 * @example
 * const card = createMetricCard({
 *   name: "CAGR",
 *   value: "28.6%",
 *   label: "REALLY GOOD",
 *   description: "Compound Annual Growth Rate measures..."
 * });
 * container.appendChild(card);
 */
export function createMetricCard({ name, value, label, description }) {
  // Create main container
  const card = document.createElement('div');
  card.className = 'metric-card';
  
  // Create clickable row
  const row = document.createElement('div');
  row.className = 'metric-row';
  
  // Add clickable class if there's a description
  if (description) {
    row.classList.add('metric-row--clickable');
  }
  
  // Left side: name + label
  const left = document.createElement('div');
  left.className = 'metric-left';
  
  const nameEl = document.createElement('span');
  nameEl.className = 'metric-name';
  nameEl.textContent = name;
  left.appendChild(nameEl);
  
  // Add label badge if provided
  if (label) {
    const labelEl = document.createElement('span');
    labelEl.className = 'metric-label';
    labelEl.textContent = label;
    
    // Apply color based on label type
    const colors = labelColors[label.toUpperCase()] || labelColors['GOOD'];
    labelEl.style.backgroundColor = colors.bg;
    labelEl.style.color = colors.text;
    
    left.appendChild(labelEl);
  }
  
  // Right side: value + chevron
  const right = document.createElement('div');
  right.className = 'metric-right';
  
  const valueEl = document.createElement('span');
  valueEl.className = 'metric-value';
  valueEl.textContent = value;
  right.appendChild(valueEl);
  
  // Add chevron icon if there's a description
  if (description) {
    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'metric-chevron');
    chevron.setAttribute('width', '16');
    chevron.setAttribute('height', '16');
    chevron.setAttribute('viewBox', '0 0 16 16');
    chevron.setAttribute('fill', 'none');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M4 6L8 10L12 6');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    
    chevron.appendChild(path);
    right.appendChild(chevron);
  }
  
  // Assemble the row
  row.appendChild(left);
  row.appendChild(right);
  card.appendChild(row);
  
  // Add description accordion if provided
  if (description) {
    const descEl = document.createElement('div');
    descEl.className = 'metric-description';
    descEl.textContent = description;
    card.appendChild(descEl);
    
    // Add click handler to toggle accordion
    row.addEventListener('click', () => {
      const isOpen = card.classList.contains('metric-card--open');
      
      if (isOpen) {
        card.classList.remove('metric-card--open');
      } else {
        card.classList.add('metric-card--open');
      }
    });
  }
  
  return card;
}

/**
 * Create a stock header component
 * 
 * Creates a header section displaying:
 * - Company logo
 * - Company name and ticker
 * - Current live price and change
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.ticker - Stock ticker symbol (e.g., "AAPL")
 * @param {string} config.name - Company name (e.g., "Apple Inc.")
 * @param {number} config.currentPrice - Current stock price
 * @param {number} config.priceChange - Price change amount
 * @param {number} config.priceChangePercent - Price change percentage
 * @returns {HTMLElement} The stock header DOM element
 * 
 * @example
 * const header = createStockHeader({
 *   ticker: "AAPL",
 *   name: "Apple Inc.",
 *   currentPrice: 180.50,
 *   priceChange: 2.50,
 *   priceChangePercent: 1.4
 * });
 * container.appendChild(header);
 */
export function createStockHeader({ ticker, name, currentPrice, priceChange, priceChangePercent }) {
  // Create main container
  const header = document.createElement('div');
  header.className = 'stock-header';
  
  // Left side: logo + info
  const left = document.createElement('div');
  left.className = 'stock-header-left';
  
  // Logo container
  const logoDiv = document.createElement('div');
  logoDiv.className = 'stock-logo';
  logoDiv.setAttribute('data-ticker', ticker);
  
  const logoImg = document.createElement('img');
  logoImg.src = `/assets/logos/${ticker.toLowerCase()}.svg`;
  logoImg.alt = `${name} logo`;
  logoImg.onerror = function() {
    // Fallback: show ticker initials if logo fails to load
    this.style.display = 'none';
    logoDiv.textContent = ticker.charAt(0);
  };
  logoDiv.appendChild(logoImg);
  
  // Stock info (name + ticker)
  const infoDiv = document.createElement('div');
  infoDiv.className = 'stock-info';
  
  const nameEl = document.createElement('h2');
  nameEl.className = 'stock-name';
  nameEl.textContent = name;
  
  const tickerEl = document.createElement('span');
  tickerEl.className = 'stock-ticker';
  tickerEl.textContent = ticker;
  
  infoDiv.appendChild(nameEl);
  infoDiv.appendChild(tickerEl);
  
  left.appendChild(logoDiv);
  left.appendChild(infoDiv);
  
  // Right side: price data
  const priceDiv = document.createElement('div');
  priceDiv.className = 'stock-price-live';
  
  const priceValue = document.createElement('div');
  priceValue.className = 'price-value';
  priceValue.setAttribute('data-price', ticker);
  priceValue.textContent = currentPrice ? `$${currentPrice.toFixed(2)}` : '—';
  
  const priceChangeEl = document.createElement('div');
  priceChangeEl.className = 'price-change';
  priceChangeEl.setAttribute('data-change', ticker);
  
  // Determine color class based on change
  if (priceChange > 0) {
    priceChangeEl.classList.add('positive');
    priceChangeEl.textContent = `+$${priceChange.toFixed(2)} (+${priceChangePercent.toFixed(2)}%)`;
  } else if (priceChange < 0) {
    priceChangeEl.classList.add('negative');
    priceChangeEl.textContent = `$${priceChange.toFixed(2)} (${priceChangePercent.toFixed(2)}%)`;
  } else {
    priceChangeEl.classList.add('neutral');
    priceChangeEl.textContent = '—';
  }
  
  priceDiv.appendChild(priceValue);
  priceDiv.appendChild(priceChangeEl);
  
  // Assemble header
  header.appendChild(left);
  header.appendChild(priceDiv);
  
  return header;
}

/**
 * Create an "At a Glance" summary card
 * 
 * Displays key investment metrics in a condensed format:
 * - Start year
 * - Investment amount → Return amount
 * - Beat S&P 500 status
 * - S&P 500 hypothetical return comparison
 * 
 * @param {Object} config - Configuration object
 * @param {number} config.startYear - Year investment started
 * @param {number} config.invested - Initial investment amount
 * @param {number} config.returned - Current value/return amount
 * @param {boolean} config.beatSP500 - Whether it beat the S&P 500
 * @param {number} config.sp500Hypothetical - What S&P 500 would have returned
 * @param {number} config.sp500Difference - Dollar difference vs S&P 500
 * @returns {HTMLElement} The at-a-glance card DOM element
 * 
 * @example
 * const glanceCard = createAtAGlance({
 *   startYear: 2016,
 *   invested: 1069000000,
 *   returned: 11490000000,
 *   beatSP500: true,
 *   sp500Hypothetical: 4073000000,
 *   sp500Difference: 7417000000
 * });
 */
export function createAtAGlance({ startYear, invested, returned, beatSP500, sp500Hypothetical, sp500Difference }) {
  // Format currency for display
  const formatBigUSD = (n) => {
    if (n == null) return '—';
    const abs = Math.abs(n);
    if (abs >= 1e12) return '$' + (n/1e12).toFixed(1) + 'T';
    if (abs >= 1e9)  return '$' + (n/1e9).toFixed(1)  + 'B';
    if (abs >= 1e6)  return '$' + (n/1e6).toFixed(0)  + 'M';
    return '$' + n.toLocaleString();
  };

  // Create main container
  const card = document.createElement('div');
  card.className = 'at-a-glance-card';
  
  // Header
  const header = document.createElement('div');
  header.className = 'at-a-glance-header';
  header.textContent = 'AT A GLANCE';
  card.appendChild(header);
  
  // Grid container for metrics
  const grid = document.createElement('div');
  grid.className = 'at-a-glance-grid';
  
  // Start Year
  const startYearSection = document.createElement('div');
  startYearSection.className = 'glance-metric';
  startYearSection.innerHTML = `
    <div class="glance-label">Start Year</div>
    <div class="glance-value glance-year">${startYear}</div>
  `;
  
  // Invested → Return
  const investedReturnSection = document.createElement('div');
  investedReturnSection.className = 'glance-metric';
  investedReturnSection.innerHTML = `
    <div class="glance-label">Invested → Return</div>
    <div class="glance-value glance-flow">
      ${formatBigUSD(invested)} → ${formatBigUSD(returned)}
    </div>
  `;
  
  // Beat S&P 500?
  const beatSP500Section = document.createElement('div');
  beatSP500Section.className = 'glance-metric';
  
  const beatLabel = document.createElement('div');
  beatLabel.className = 'glance-label';
  beatLabel.textContent = 'Beat S&P 500?';
  
  const beatValue = document.createElement('div');
  beatValue.className = 'glance-value glance-checkmark';
  
  if (beatSP500) {
    // Create SVG checkmark
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.setAttribute('fill', 'none');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '16');
    circle.setAttribute('cy', '16');
    circle.setAttribute('r', '14');
    circle.setAttribute('fill', 'var(--accent)');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M10 16L14 20L22 12');
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    
    svg.appendChild(circle);
    svg.appendChild(path);
    beatValue.appendChild(svg);
  } else {
    beatValue.textContent = 'No';
  }
  
  beatSP500Section.appendChild(beatLabel);
  beatSP500Section.appendChild(beatValue);
  
  // By how much? (vs S&P 500)
  const differenceSection = document.createElement('div');
  differenceSection.className = 'glance-metric';
  differenceSection.innerHTML = `
    <div class="glance-label">By how much?</div>
    <div class="glance-value glance-flow">
      ${formatBigUSD(sp500Hypothetical)} → ${beatSP500 ? '+' : ''}${formatBigUSD(sp500Difference)}
    </div>
  `;
  
  // Append all sections to grid
  grid.appendChild(startYearSection);
  grid.appendChild(investedReturnSection);
  grid.appendChild(beatSP500Section);
  grid.appendChild(differenceSection);
  
  card.appendChild(grid);
  
  return card;
}
