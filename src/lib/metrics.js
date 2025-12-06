/* =========================================================
   METRICS — Berkshire Tracker
   Helper functions to calculate investment metrics
   ========================================================= */

/**
 * Calculate current value of investment
 * 
 * Takes the number of shares bought and the current price
 * to find out what the investment is worth today
 * 
 * Example:
 * - Bought 1,000,000 shares at $24
 * - Current price is $258
 * - Current value = 1,000,000 × $258 = $258,000,000
 */
export function calculateCurrentValue(totalShares, currentPrice) {
  return totalShares * currentPrice;
}

/**
 * Calculate total return in dollars
 * 
 * This is the profit/gain made on the investment
 * Current Value - Initial Investment = Total Return
 * 
 * Example:
 * - Initial investment: $1 billion
 * - Current value: $11 billion
 * - Total return: $10 billion (the profit)
 */
export function calculateTotalReturnDollars(currentValue, initialInvestment) {
  return currentValue - initialInvestment;
}

/**
 * Calculate what the S&P 500 would be worth if they invested the same amount
 * 
 * This helps answer: "If Buffett put this money in an index fund instead,
 * how much would he have today?"
 * 
 * Steps:
 * 1. Calculate S&P multiple (current price / entry price)
 * 2. Apply to initial investment
 * 
 * Example:
 * - Invested $1 billion in Apple
 * - S&P went from 176 to 670 (3.81x)
 * - Would have $3.81 billion in S&P
 */
export function calculateSP500Hypothetical(initialInvestment, spyEntryPrice, spyCurrentPrice) {
  const spyMultiple = spyCurrentPrice / spyEntryPrice;
  return initialInvestment * spyMultiple;
}

/**
 * Calculate S&P 500 CAGR
 * 
 * Same CAGR formula but applied to the S&P 500 benchmark
 * to see how the market performed over the same time period
 */
export function calculateSP500CAGR(spyEntryPrice, spyCurrentPrice, years) {
  const ratio = spyCurrentPrice / spyEntryPrice;
  return Math.pow(ratio, 1 / years) - 1;
}

/**
 * Check if investment beat S&P 500
 * 
 * Returns true if the stock outperformed the market
 */
export function beatSP500(stockCAGR, sp500CAGR) {
  return stockCAGR > sp500CAGR;
}

/**
 * Calculate by how much the investment beat (or lost to) S&P 500
 * 
 * Returns the difference in percentage points
 * Example: Stock CAGR 28.6%, S&P CAGR 15.4% = Beat by 13.2 pp
 */
export function calculateBeatByPercentagePoints(stockCAGR, sp500CAGR) {
  return (stockCAGR - sp500CAGR) * 100; // Convert to percentage points
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 * 
 * This measures the average annual growth rate of an investment
 * over a period of time, assuming the profits were reinvested
 * 
 * Formula: CAGR = (Final Value / Initial Value)^(1/Years) - 1
 * 
 * Example:
 * - Initial investment: $1 billion
 * - Current value: $11.5 billion
 * - Years: 9.6
 * - CAGR = ($11.5B / $1B)^(1/9.6) - 1 = 28.6% per year
 */
export function calculateCAGR(initialValue, finalValue, years) {
  const ratio = finalValue / initialValue;
  return Math.pow(ratio, 1 / years) - 1;
}

/**
 * Calculate years invested
 * 
 * Takes two dates (entry and current) and calculates how many years
 * have passed. Uses 365.25 to account for leap years.
 */
export function calculateYearsInvested(entryDate, currentDate) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysBetween = (new Date(currentDate) - new Date(entryDate)) / millisecondsPerDay;
  return daysBetween / 365.25;
}

/**
 * Get the CSS class for a rating badge
 * 
 * Converts text ratings like "GOOD" or "REALLY GOOD" into CSS class names
 * that we can use for styling (colors, etc.)
 */
export function getRatingClass(rating) {
  const classes = {
    'BAD': 'rating-bad',
    'AVERAGE': 'rating-average',
    'GOOD': 'rating-good',
    'HIGH': 'rating-high',
    'REALLY GOOD': 'rating-really-good'
  };
  return classes[rating.toUpperCase()] || 'rating-default';
}
