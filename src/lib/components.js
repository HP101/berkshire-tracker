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
