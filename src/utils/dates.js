/**
 * Centralized formatting and timezone-safe date utilities
 * aligned with architectural guidelines (Rule 11).
 */

/**
 * Formats date strings to local date strings safely without off-by-one errors.
 * @param {string} dateStr - The input date string (YYYY-MM-DD or YYYY-MM-DD HH:mm:ss)
 * @param {string} formatType - 'long' (Jun 9, 2026), 'short' (06-09-26), or 'empty-dash' (— if empty)
 * @returns {string} The formatted local date string
 */
export function formatLocalDate(dateStr, formatType = 'long') {
  if (!dateStr) {
    return formatType === 'empty-dash' ? '—' : ''
  }
  
  try {
    const clean = dateStr.trim()
    
    // 1. Date-only values: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const parts = clean.split('-')
      const year = parseInt(parts[0], 10)
      const monthIndex = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      
      if (formatType === 'short') {
        const mm = String(monthIndex + 1).padStart(2, '0')
        const dd = String(day).padStart(2, '0')
        const yy = String(year).slice(-2)
        return `${mm}-${dd}-${yy}`
      }
      
      const localDate = new Date(year, monthIndex, day)
      return localDate.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }
    
    // 2. Timestamp values: YYYY-MM-DD HH:mm:ss
    let parseableStr = clean
    if (clean.includes(' ') && !clean.includes('T')) {
      parseableStr = clean.replace(' ', 'T') + 'Z'
    }
    
    const date = new Date(parseableStr)
    if (isNaN(date.getTime())) {
      return dateStr
    }
    
    if (formatType === 'short') {
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const yy = String(date.getFullYear()).slice(-2)
      return `${mm}-${dd}-${yy}`
    }
    
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch {
    return dateStr
  }
}

/**
 * Safely builds a 'City, Province' address string from a customer object.
 * @param {object} customer - The customer object containing address fields
 * @returns {string} The formatted location label or '—'
 */
export function formatCityProv(customer) {
  if (!customer) return '—'
  const parts = []
  if (customer.addr_city) parts.push(customer.addr_city)
  if (customer.addr_prov) parts.push(customer.addr_prov)
  return parts.length > 0 ? parts.join(', ') : '—'
}
