/**
 * Centralized pricing calculations for Cibola2
 */

/**
 * Calculate the credit payout value for gold or platinum items.
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
 * Calculate the unit price per gram for a gold credit item.
 * Formula: value / weight
 * 
 * @param {number|string} value - Calculated item value
 * @param {number|string} weight - Weight in grams
 * @returns {number} The rounded unit price per gram
 */
export function calculateGoldCreditUnitPrice(value, weight) {
  const val = parseFloat(value) || 0
  const w = parseFloat(weight) || 0
  return w > 0 ? Math.round((val / w) * 100) / 100 : 0
}

/**
 * Get adjusted markup based on the credit type (credit, split, cash).
 * Cash is the baseline. Split adds +10% (+0.1). Credit adds +20% (+0.2).
 * This adjustment only applies to standard gold karats: 8k, 9k, 10k, 12k, 14k, 18k.
 * 
 * @param {string} itemName - Name of karat item (e.g. '10k', 'Platinum')
 * @param {number|string} baseMarkup - Baseline markup percentage (e.g. 0.6)
 * @param {string} creditType - Selected payout type ('credit', 'split', 'cash')
 * @returns {number} The adjusted markup percentage
 */
export function getAdjustedMarkup(itemName, baseMarkup, creditType) {
  const parsedBase = parseFloat(baseMarkup) || 0
  const isAdjustableGold = ['8k', '9k', '10k', '12k', '14k', '18k'].includes(itemName)
  if (!isAdjustableGold) return parsedBase

  let adjustment = 0
  if (creditType === 'credit') {
    adjustment = 0.2
  } else if (creditType === 'split') {
    adjustment = 0.1
  }
  return Math.round((parsedBase + adjustment) * 100) / 100
}

/**
 * Calculate the unit price (Price Per) for a custom sheet item.
 * Formula: basePrice * priceModifier * markup
 * 
 * @param {number|string} basePrice - Base price (metal spot or base rate)
 * @param {number|string} priceModifier - Purity multiplier or modifier
 * @param {number|string} markup - Markup multiplier factor
 * @returns {number} The calculated unit price
 */
export function calculateCustomSheetPricePer(basePrice, priceModifier, markup) {
  const base = parseFloat(basePrice) || 0
  const modifier = parseFloat(priceModifier) || 0
  const markupInput = parseFloat(markup)
  const mark = isNaN(markupInput) || markupInput <= 0 ? 1 : markupInput

  return base * modifier * mark
}

/**
 * Calculate the total cost for a custom sheet item.
 * Formula: amt * PricePer
 * 
 * @param {number|string} amt - Amount or weight
 * @param {number|string} basePrice - Base price
 * @param {number|string} priceModifier - Purity multiplier or modifier
 * @param {number|string} markup - Markup multiplier factor
 * @returns {number} The rounded total cost
 */
export function calculateCustomSheetItemTotal(amt, basePrice, priceModifier, markup) {
  const a = parseFloat(amt) || 0
  const pricePer = calculateCustomSheetPricePer(basePrice, priceModifier, markup)
  return Math.round(a * pricePer * 100) / 100
}
