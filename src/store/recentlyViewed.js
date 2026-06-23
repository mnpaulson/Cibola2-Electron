import { reactive, watch } from 'vue'
import { sessionState } from './session'
import { api } from '../utils/api'

export const recentlyViewedState = reactive({
  records: []
})

// Map to prevent redundant concurrent fetches for the same record
const pendingFetches = new Set()

async function resolveCustomerName(customerId, existingCustomer) {
  if (existingCustomer) {
    return `${existingCustomer.fname} ${existingCustomer.lname}`.trim()
  }
  if (customerId) {
    try {
      const customer = await api.get(`/customers/${customerId}`)
      if (customer) {
        return `${customer.fname} ${customer.lname}`.trim()
      }
    } catch (err) {
      console.error('[RecentlyViewed] Failed to resolve customer name:', err)
    }
  }
  return ''
}

// Load from localStorage
export function loadRecentlyViewed() {
  try {
    const data = localStorage.getItem('recently_viewed_records')
    if (data) {
      recentlyViewedState.records = JSON.parse(data)
    }
  } catch (err) {
    console.error('Failed to load recently viewed records:', err)
  }
}

// Save to localStorage
function saveRecentlyViewed() {
  try {
    localStorage.setItem('recently_viewed_records', JSON.stringify(recentlyViewedState.records))
  } catch (err) {
    console.error('Failed to save recently viewed records:', err)
  }
}

// Add a record to the list (max 10, no duplicates)
export function addRecentRecord(record) {
  // Remove existing duplicate of same record (by ID and Type)
  recentlyViewedState.records = recentlyViewedState.records.filter(
    r => !(r.id === record.id && r.type === record.type)
  )

  // Prepend to array
  recentlyViewedState.records.unshift(record)

  // Cap at 10 items
  if (recentlyViewedState.records.length > 10) {
    recentlyViewedState.records.pop()
  }

  saveRecentlyViewed()
}

// Remove a record (used during deletion)
export function removeRecentRecord(type, id) {
  recentlyViewedState.records = recentlyViewedState.records.filter(
    r => !(r.id === id && r.type === type)
  )
  saveRecentlyViewed()
}

// Clear history
export function clearRecentlyViewed() {
  recentlyViewedState.records = []
  saveRecentlyViewed()
}

// Refresh details of a viewed/saved record from the backend
export async function refreshRecentRecord(type, id) {
  if (sessionState.connectionStatus !== 'connected') return

  const fetchKey = `${type}-${id}`
  if (pendingFetches.has(fetchKey)) return
  pendingFetches.add(fetchKey)

  try {
    if (type === 'job') {
      const job = await api.get(`/jobs/${id}`)
      if (job && job.id) {
        const thumbnail = job.job_images && job.job_images.length > 0 ? job.job_images[0].image : null
        const hasEstimate = job.estimate && Number(job.estimate) !== 0
        const details = hasEstimate
          ? `Estimate: $${Number(job.estimate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : 'No Estimate'
        const customerName = await resolveCustomerName(job.customer_id, job.customer)

        addRecentRecord({
          id: job.id,
          type: 'job',
          typeName: 'Job',
          details,
          customerId: job.customer_id,
          customerName,
          created_at: job.created_at || '',
          thumbnail,
          viewedAt: Date.now()
        })
      }
    } else if (type === 'credit') {
      const credit = await api.get(`/goldcredits/${id}`)
      if (credit && credit.id) {
        const hasCredit = credit.credit_value && Number(credit.credit_value) !== 0
        const details = hasCredit
          ? `Payout: $${Number(credit.credit_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : 'No Final Credit'
        const customerName = await resolveCustomerName(credit.customer_id, credit.customer)

        addRecentRecord({
          id: credit.id,
          type: 'credit',
          typeName: 'Credit',
          details,
          customerId: credit.customer_id,
          customerName,
          created_at: credit.created_at || '',
          thumbnail: null,
          viewedAt: Date.now()
        })
      }
    } else if (type === 'sheet') {
      const sheet = await api.get(`/customsheets/${id}`)
      if (sheet && sheet.id) {
        const customerName = await resolveCustomerName(sheet.customer_id, sheet.customer)
        addRecentRecord({
          id: sheet.id,
          type: 'sheet',
          typeName: 'Sheet',
          details: sheet.name || '',
          customerId: sheet.customer_id,
          customerName,
          created_at: sheet.created_at || '',
          thumbnail: null,
          viewedAt: Date.now()
        })
      }
    } else if (type === 'customer') {
      const customer = await api.get(`/customers/${id}`)
      if (customer && customer.id) {
        addRecentRecord({
          id: customer.id,
          type: 'customer',
          typeName: 'Customer',
          details: `${customer.fname} ${customer.lname}`.trim(),
          customerId: customer.id,
          customerName: `${customer.fname} ${customer.lname}`.trim(),
          created_at: customer.created_at || '',
          thumbnail: null,
          viewedAt: Date.now()
        })
      }
    }
  } catch (err) {
    console.error(`[RecentlyViewed] Failed to refresh recent record ${type} #${id}:`, err)
  } finally {
    pendingFetches.delete(fetchKey)
  }
}

// Watch global navigation to automatically record views
watch(
  () => [
    sessionState.activeTab,
    sessionState.selectedCustomerId,
    sessionState.activeJobId,
    sessionState.activeCreditId,
    sessionState.activeSheetId
  ],
  async ([tab, custId, jobId, creditId, sheetId]) => {
    if (tab === 'jobs' && jobId && jobId !== 0) {
      await refreshRecentRecord('job', jobId)
    } else if (tab === 'credits' && creditId && creditId !== 0) {
      await refreshRecentRecord('credit', creditId)
    } else if (tab === 'custom' && sheetId && sheetId !== 0) {
      await refreshRecentRecord('sheet', sheetId)
    } else if (tab === 'customers' && custId && custId !== 0) {
      await refreshRecentRecord('customer', custId)
    }
  },
  { deep: true, immediate: true }
)
