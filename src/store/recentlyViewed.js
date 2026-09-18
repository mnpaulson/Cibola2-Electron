import { reactive, watch } from 'vue'
import { sessionState } from './session'
import { api } from '../utils/api'

export const recentlyViewedState = reactive({
  records: [],         // Local records (persisted in localStorage)
  globalRecords: [],   // Global records (fetched from central backend)
  loadingGlobal: false
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

// Add a record to the list (max 50, no duplicates)
export function addRecentRecord(record) {
  // Remove existing duplicate of same record (by ID and Type)
  recentlyViewedState.records = recentlyViewedState.records.filter(
    r => !(r.id === record.id && r.type === record.type)
  )

  // Prepend to array
  recentlyViewedState.records.unshift(record)

  // Cap at 50 items
  if (recentlyViewedState.records.length > 50) {
    recentlyViewedState.records.pop()
  }

  saveRecentlyViewed()
}

// Remove a record (used during deletion)
export function removeRecentRecord(type, id) {
  recentlyViewedState.records = recentlyViewedState.records.filter(
    r => !(r.id === id && r.type === type)
  )
  recentlyViewedState.globalRecords = recentlyViewedState.globalRecords.filter(
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
        const hasCredit = credit.total && Number(credit.total) !== 0
        const details = hasCredit
          ? `Payout: $${Number(credit.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
          fname: customer.fname || '',
          lname: customer.lname || '',
          phone: customer.phone || '',
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

// Track last recorded view to debounce / prevent duplicate POST requests
let lastRecordedView = {
  type: null,
  id: null,
  timestamp: 0
}

// Record a single view to the central backend database
export async function recordGlobalView(type, id) {
  if (!type || !id || sessionState.connectionStatus !== 'connected') return

  const now = Date.now()
  // Debounce if the same record was recorded within 5 minutes
  if (lastRecordedView.type === type && lastRecordedView.id === id && (now - lastRecordedView.timestamp < 5 * 60 * 1000)) {
    return
  }

  lastRecordedView = { type, id, timestamp: now }

  try {
    await api.post('/recently-viewed', { type, id })
  } catch (err) {
    // Fail quietly without interrupting UX if network request fails
    console.debug('[RecentlyViewed] Failed to post global view:', err)
  }
}

// Fetch hydrated global recent records from central server
export async function fetchGlobalRecentlyViewed() {
  if (sessionState.connectionStatus !== 'connected') return

  recentlyViewedState.loadingGlobal = true
  try {
    const data = await api.get('/recently-viewed')
    if (Array.isArray(data)) {
      const current = recentlyViewedState.globalRecords
      // Smart check: avoid replacing the array reference if contents are identical
      const isIdentical = current.length === data.length &&
        data.every((newItem, i) => {
          const oldItem = current[i]
          return oldItem &&
            oldItem.id === newItem.id &&
            oldItem.type === newItem.type &&
            oldItem.viewedAt === newItem.viewedAt &&
            oldItem.details === newItem.details &&
            oldItem.customerName === newItem.customerName
        })

      if (!isIdentical) {
        recentlyViewedState.globalRecords = data
      }
    }
  } catch (err) {
    console.error('[RecentlyViewed] Failed to fetch global recently viewed records:', err)
  } finally {
    recentlyViewedState.loadingGlobal = false
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
    let activeType = null
    let activeId = null

    if (tab === 'jobs' && jobId && jobId !== 0) {
      activeType = 'job'
      activeId = jobId
    } else if (tab === 'credits' && creditId && creditId !== 0) {
      activeType = 'credit'
      activeId = creditId
    } else if (tab === 'custom' && sheetId && sheetId !== 0) {
      activeType = 'sheet'
      activeId = sheetId
    } else if (tab === 'customers' && custId && custId !== 0) {
      activeType = 'customer'
      activeId = custId
    }

    if (activeType && activeId) {
      await refreshRecentRecord(activeType, activeId)
      recordGlobalView(activeType, activeId)
    }
  },
  { deep: true, immediate: true }
)
