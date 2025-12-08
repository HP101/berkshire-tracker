/* =========================================================
   COMPONENTS — Berkshire Tracker
   Reusable UI component factory functions
   ========================================================= */

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
    
    // Create SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '11');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 11 14');
    svg.setAttribute('fill', 'none');
    svg.style.flexShrink = '0';
    svg.style.marginRight = '8px';
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0.5');
    line.setAttribute('y1', '-2.18557e-08');
    line.setAttribute('x2', '0.5');
    line.setAttribute('y2', '10');
    line.setAttribute('stroke', 'var(--theme-text-muted)');
    line.setAttribute('stroke-width', '2.5px');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M10.3536 10.3536C10.5488 10.1583 10.5488 9.84171 10.3536 9.64645L7.17159 6.46447C6.97633 6.2692 6.65974 6.2692 6.46448 6.46447C6.26922 6.65973 6.26922 6.97631 6.46448 7.17157L9.29291 10L6.46448 12.8284C6.26922 13.0237 6.26922 13.3403 6.46448 13.5355C6.65974 13.7308 6.97633 13.7308 7.17159 13.5355L10.3536 10.3536ZM1.52588e-05 10V10.5H10V10V9.5H1.52588e-05V10Z');
    path.setAttribute('fill', 'var(--theme-text-muted)');
    path.setAttribute('stroke', 'var(--theme-text-muted)');
    path.setAttribute('stroke-width', '0.5px');
    path.setAttribute('stroke-linejoin', 'round');
    
    svg.appendChild(line);
    svg.appendChild(path);
    
    // Create text content
    const textContent = document.createElement('p');
    textContent.textContent = description;
    textContent.style.margin = '0';
    
    descEl.appendChild(svg);
    descEl.appendChild(textContent);
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
 * - Company logo (SVG)
 * - Company name and ticker (horizontal)
 * - Sector
 * - Current live price
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.ticker - Stock ticker symbol (e.g., "AAPL")
 * @param {string} config.name - Company name (e.g., "Apple")
 * @param {string} config.sector - Company sector (e.g., "Tech")
 * @param {number} config.currentPrice - Current stock price
 * @returns {HTMLElement} The stock header DOM element
 * 
 * @example
 * const header = createStockHeader({
 *   ticker: "AAPL",
 *   name: "Apple",
 *   sector: "Tech",
 *   currentPrice: 268.47
 * });
 * container.appendChild(header);
 */
export function createStockHeader({ ticker, name, sector = '', currentPrice }) {
  // Main container (flex-column)
  const header = document.createElement('div');
  header.className = 'stock-header';
  
  // Logo container
  const logoDiv = document.createElement('div');
  logoDiv.className = 'stock-logo';
  logoDiv.setAttribute('data-ticker', ticker);
  
  const logoImg = document.createElement('img');
  const tickerLower = ticker.toLowerCase();
  
  // Try PNG first, then fallback to SVG, then to initials
  logoImg.src = `/public/assets/logos/${tickerLower}.png`;
  logoImg.alt = `${name} logo`;
  
  logoImg.onerror = function() {
    // First fallback: try SVG
    if (this.src.endsWith('.png')) {
      this.src = `/public/assets/logos/${tickerLower}.svg`;
    } else {
      // Second fallback: show ticker initials if both PNG and SVG fail
      this.style.display = 'none';
      logoDiv.textContent = ticker.charAt(0);
    }
  };
  logoDiv.appendChild(logoImg);
  
  // Content container (horizontal flex)
  const contentDiv = document.createElement('div');
  contentDiv.className = 'stock-header-content';
  
  // Left column: name/ticker + sector
  const infoColumn = document.createElement('div');
  infoColumn.className = 'stock-info-column';
  
  // Name + Ticker row (horizontal flex)
  const nameTickerRow = document.createElement('div');
  nameTickerRow.className = 'stock-name-ticker';
  
  const nameEl = document.createElement('h2');
  nameEl.className = 'stock-name';
  nameEl.textContent = name;
  
  const tickerEl = document.createElement('span');
  tickerEl.className = 'stock-ticker';
  tickerEl.textContent = ticker;
  
  nameTickerRow.appendChild(nameEl);
  nameTickerRow.appendChild(tickerEl);
  
  // Sector
  const sectorEl = document.createElement('div');
  sectorEl.className = 'stock-sector';
  sectorEl.textContent = sector;
  
  infoColumn.appendChild(nameTickerRow);
  infoColumn.appendChild(sectorEl);
  
  // Right side: Current price
  const priceColumn = document.createElement('div');
  priceColumn.className = 'stock-price-column';
  
  const priceLabel = document.createElement('div');
  priceLabel.className = 'price-label';
  priceLabel.textContent = 'Current Price';
  
  const priceValue = document.createElement('div');
  priceValue.className = 'price-value';
  priceValue.setAttribute('data-price', ticker);
  priceValue.textContent = currentPrice ? `$${currentPrice.toFixed(2)}` : '—';
  
  priceColumn.appendChild(priceLabel);
  priceColumn.appendChild(priceValue);
  
  // Assemble content
  contentDiv.appendChild(infoColumn);
  contentDiv.appendChild(priceColumn);
  
  // Assemble header
  header.appendChild(logoDiv);
  header.appendChild(contentDiv);
  
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
    circle.setAttribute('fill', 'var(--theme-checkmark)');
    
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
  differenceSection.className = 'glance-metric glance-metric-wide';
  differenceSection.innerHTML = `
    <div class="glance-label">If invested in S&P 500</div>
    <div class="glance-value glance-flow">
      ${formatBigUSD(sp500Hypothetical)}
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

/**
 * Create a vertical section navigation component
 * 
 * Creates a fixed vertical navigation bar that:
 * - Shows indicators for each section
 * - Highlights the currently visible section
 * - Allows clicking to jump to sections
 * - Appears on large screens only
 * 
 * @param {Array} sections - Array of section objects
 * @param {string} sections[].id - Section DOM id (e.g., "aapl")
 * @param {string} sections[].label - Display label (e.g., "AAPL")
 * @returns {HTMLElement} The vertical nav DOM element
 * 
 * @example
 * const nav = createVerticalNav([
 *   { id: 'aapl', label: 'AAPL' },
 *   { id: 'axp', label: 'AXP' },
 *   { id: 'ko', label: 'KO' }
 * ]);
 * document.body.appendChild(nav);
 */
export function createVerticalNav(sections) {
  // Main nav container
  const nav = document.createElement('nav');
  nav.className = 'vertical-nav';
  nav.setAttribute('aria-label', 'Section navigation');
  
  // Create a list
  const list = document.createElement('ul');
  list.className = 'vertical-nav-list';
  
  // Create nav items for each section
  sections.forEach((section, index) => {
    const item = document.createElement('li');
    item.className = 'vertical-nav-item';
    
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.className = 'vertical-nav-link';
    link.setAttribute('data-section', section.id);
    link.setAttribute('aria-label', `Go to ${section.label}`);
    
    // Create logo container instead of dot
    const logoContainer = document.createElement('span');
    logoContainer.className = 'vertical-nav-logo';
    
    // Special case for Bank of America - use letter "B"
    if (section.id === 'bac') {
      logoContainer.textContent = 'B';
      logoContainer.classList.add('vertical-nav-logo--text');
    } else {
      // Try to load logo image (PNG first, then SVG)
      const logoImg = document.createElement('img');
      logoImg.src = `/public/assets/logos/${section.id}.png`;
      logoImg.alt = section.label;
      
      logoImg.onerror = function() {
        // First fallback: try SVG
        if (this.src.endsWith('.png')) {
          this.src = `/public/assets/logos/${section.id}.svg`;
        } else {
          // Second fallback: show ticker initials
          this.style.display = 'none';
          logoContainer.textContent = section.label.charAt(0);
          logoContainer.classList.add('vertical-nav-logo--text');
        }
      };
      
      logoContainer.appendChild(logoImg);
    }
    
    // Create the label (visible on hover)
    const label = document.createElement('span');
    label.className = 'vertical-nav-label';
    label.textContent = section.label;
    
    link.appendChild(logoContainer);
    link.appendChild(label);
    item.appendChild(link);
    list.appendChild(item);
    
    // Smooth scroll to section on click
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = document.getElementById(section.id);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  nav.appendChild(list);
  
  // Set up intersection observer to track active section
  setupScrollSpy(sections);
  
  return nav;
}

/**
 * Set up scroll spy to highlight active section in vertical nav
 * Uses Intersection Observer API to detect which section is in view
 * 
 * @param {Array} sections - Array of section objects with id property
 */
function setupScrollSpy(sections) {
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section crosses middle of viewport
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active class from all links
        document.querySelectorAll('.vertical-nav-link').forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to current section's link
        const activeLink = document.querySelector(`.vertical-nav-link[data-section="${entry.target.id}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, observerOptions);
  
  // Observe each section
  sections.forEach(section => {
    const element = document.getElementById(section.id);
    if (element) {
      observer.observe(element);
    }
  });
}

/**
 * Create mobile navigation arrows
 * 
 * Creates fixed up/down arrow buttons for mobile screens that:
 * - Navigate between sections
 * - Meet 44px minimum touch target size
 * - Show/hide based on current position
 * - Hidden on large screens (where vertical nav shows)
 * 
 * @param {Array} sections - Array of section objects
 * @returns {HTMLElement} Container with both arrows
 * 
 * @example
 * const mobileNav = createMobileNav([
 *   { id: 'aapl', label: 'AAPL' },
 *   { id: 'axp', label: 'AXP' },
 *   { id: 'ko', label: 'KO' }
 * ]);
 * document.body.appendChild(mobileNav);
 */
export function createMobileNav(sections) {
  // Container for both arrows
  const container = document.createElement('div');
  container.className = 'mobile-nav';
  
  // Up arrow button
  const upButton = document.createElement('button');
  upButton.className = 'mobile-nav-arrow mobile-nav-up';
  upButton.setAttribute('aria-label', 'Previous section');
  upButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  // Down arrow button
  const downButton = document.createElement('button');
  downButton.className = 'mobile-nav-arrow mobile-nav-down';
  downButton.setAttribute('aria-label', 'Next section');
  downButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  container.appendChild(upButton);
  container.appendChild(downButton);
  
  // Track current section index
  let currentIndex = 0;
  
  // Function to update arrow visibility
  function updateArrowStates() {
    // Hide up arrow if at first section
    if (currentIndex === 0) {
      upButton.style.opacity = '0.3';
      upButton.style.pointerEvents = 'none';
    } else {
      upButton.style.opacity = '1';
      upButton.style.pointerEvents = 'auto';
    }
    
    // Hide down arrow if at last section
    if (currentIndex === sections.length - 1) {
      downButton.style.opacity = '0.3';
      downButton.style.pointerEvents = 'none';
    } else {
      downButton.style.opacity = '1';
      downButton.style.pointerEvents = 'auto';
    }
  }
  
  // Set up observer to track current section
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find index of current section
        currentIndex = sections.findIndex(s => s.id === entry.target.id);
        updateArrowStates();
      }
    });
  }, observerOptions);
  
  // Observe each section
  sections.forEach(section => {
    const element = document.getElementById(section.id);
    if (element) {
      observer.observe(element);
    }
  });
  
  // Up button click handler
  upButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      const prevSection = document.getElementById(sections[currentIndex - 1].id);
      if (prevSection) {
        prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
  
  // Down button click handler
  downButton.addEventListener('click', () => {
    if (currentIndex < sections.length - 1) {
      const nextSection = document.getElementById(sections[currentIndex + 1].id);
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
  
  // Initialize arrow states
  updateArrowStates();
  
  return container;
}

