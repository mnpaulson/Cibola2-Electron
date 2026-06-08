/**
 * Centralized pricing calculations for Cibola2
 */

/**
 * Calculate the store credit payout value for gold or platinum items.
 * Formula: weight (g) * spotPrice ($/g) * metalPurityMultiplier * markupFactor
 * 
 * @param {number|string} weight - Weight in grams
 * @param {number|string} multiplier - Karat purity multiplier (e.g. 14k = 0.583)
 * @param {number|string} markup - Markup or margin factor (e.g. 0.75 for 75% of spot)
 * @param {number|string} spotPrice - Current spot price per gram of the metal
 * @returns {number} The calculated credit payout value
 */
export function calculateGoldCreditValue(weight, multiplier, markup, spotPrice) {
  const w = parseFloat(weight) || 0
  const mult = parseFloat(multiplier) || 0
  const mark = parseFloat(markup) || 1
  const spot = parseFloat(spotPrice) || 0

  if (w <= 0 || spot <= 0) return 0

  // Calculate: weight * spot_price * karat_purity * buy_back_markup
  const rawValue = w * spot * mult * mark
  return Math.round((rawValue + Number.EPSILON) * 100) / 100
}

/**
 * Calculate the estimate cost of a repair job based on configured formulas.
 * 
 * @param {string} formulaName - Name/type of pricing formula (e.g. 'WeightBased', 'BaseOnly')
 * @param {number|string} basePrice - Base/labor price
 * @param {number|string} weight - Weight of metal added/used in grams
 * @param {number|string} spotPrice - Current spot price per gram of metal type
 * @returns {number} Total estimate price
 */
export function calculateRepairJobEstimate(formulaName, basePrice, weight, spotPrice) {
  const base = parseFloat(basePrice) || 0
  const w = parseFloat(weight) || 0
  const spot = parseFloat(spotPrice) || 0

  const normalizedFormula = (formulaName || '').toLowerCase().trim()

  switch (normalizedFormula) {
    case 'weight':
    case 'weightbased':
    case 'metal':
      // Base labor cost + weight * spot price
      const metalCost = w * spot
      return Math.round((base + metalCost + Number.EPSILON) * 100) / 100

    case 'doublemetal':
      // Base labor cost + weight * spot price * 2 (standard markup for added materials)
      const doubleMetalCost = w * spot * 2
      return Math.round((base + doubleMetalCost + Number.EPSILON) * 100) / 100

    case 'base':
    case 'baseonly':
    default:
      // Just the static/base labor cost
      return Math.round((base + Number.EPSILON) * 100) / 100
  }
}
