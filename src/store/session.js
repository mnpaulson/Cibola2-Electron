import { reactive, watch } from 'vue'

export const sessionState = reactive({
  connectionStatus: 'connecting', // 'connected', 'connecting', 'offline'
  lastCheck: null,
  activeTab: 'dashboard',
  navigationHistory: [
    {
      tab: 'dashboard',
      params: {
        selectedCustomerId: null,
        activeJobId: null,
        activeCreditId: null,
        activeSheetId: null
      }
    }
  ],
  selectedCustomerId: null,
  activeJobId: null,
  activeCreditId: null,
  activeSheetId: null,

  // Persistent list/directory view states
  customerSearchQuery: '',
  customerCurrentPage: 1,
  customerActiveSubTab: 'jobs',
  jobSearchQuery: '',
  jobCurrentPage: 1
})

let isNavigatingHistory = false

export function navigateTo(tab, params = {}) {
  if (!tab) return

  const route = {
    tab,
    params: {
      selectedCustomerId: params.selectedCustomerId !== undefined ? params.selectedCustomerId : null,
      activeJobId: params.activeJobId !== undefined ? params.activeJobId : null,
      activeCreditId: params.activeCreditId !== undefined ? params.activeCreditId : null,
      activeSheetId: params.activeSheetId !== undefined ? params.activeSheetId : null
    }
  }

  // Avoid pushing duplicate consecutive routes in history
  const lastRoute = sessionState.navigationHistory[sessionState.navigationHistory.length - 1]
  const isDuplicate = lastRoute && 
                     lastRoute.tab === route.tab && 
                     lastRoute.params.selectedCustomerId === route.params.selectedCustomerId &&
                     lastRoute.params.activeJobId === route.params.activeJobId &&
                     lastRoute.params.activeCreditId === route.params.activeCreditId &&
                     lastRoute.params.activeSheetId === route.params.activeSheetId

  if (!isDuplicate) {
    sessionState.navigationHistory.push(route)
  }

  isNavigatingHistory = true
  try {
    sessionState.activeTab = tab
    sessionState.selectedCustomerId = route.params.selectedCustomerId
    sessionState.activeJobId = route.params.activeJobId
    sessionState.activeCreditId = route.params.activeCreditId
    sessionState.activeSheetId = route.params.activeSheetId
  } finally {
    isNavigatingHistory = false
  }

  console.log(`[Navigation] Navigated to tab: ${tab}. History stack size:`, sessionState.navigationHistory.length)
}

export function navigateBack() {
  if (sessionState.navigationHistory.length > 1) {
    isNavigatingHistory = true
    try {
      sessionState.navigationHistory.pop() // remove current tab
      const prevRoute = sessionState.navigationHistory[sessionState.navigationHistory.length - 1]
      
      sessionState.activeTab = prevRoute.tab
      sessionState.selectedCustomerId = prevRoute.params.selectedCustomerId
      sessionState.activeJobId = prevRoute.params.activeJobId
      sessionState.activeCreditId = prevRoute.params.activeCreditId
      sessionState.activeSheetId = prevRoute.params.activeSheetId
      
      console.log(`[Navigation] Navigated back to:`, prevRoute, `History stack size:`, sessionState.navigationHistory.length)
    } finally {
      isNavigatingHistory = false
    }
  }
}

// Synchronize state parameter changes into the current history entry
watch(
  () => [
    sessionState.selectedCustomerId,
    sessionState.activeJobId,
    sessionState.activeCreditId,
    sessionState.activeSheetId
  ],
  ([custId, jobId, creditId, sheetId]) => {
    if (isNavigatingHistory) return

    const history = sessionState.navigationHistory
    if (history.length > 0) {
      const lastRoute = history[history.length - 1]
      // Ensure we only update parameters if we are currently looking at the correct active tab
      if (lastRoute.tab === sessionState.activeTab) {
        lastRoute.params = {
          selectedCustomerId: custId,
          activeJobId: jobId,
          activeCreditId: creditId,
          activeSheetId: sheetId
        }
        console.log(`[Navigation] Updated parameters of current route to match state changes:`, lastRoute.params)
      }
    }
  },
  { flush: 'sync' }
)

export function setSelectedCustomerId(id) {
  sessionState.selectedCustomerId = id
  console.log(`[Session] Selected customer ID: ${id}`)
}

let heartbeatInterval = null

export function setConnectionStatus(status) {
  if (sessionState.connectionStatus !== status) {
    sessionState.connectionStatus = status
    console.log(`[Session] Connection status changed to: ${status}`)
  }
  sessionState.lastCheck = new Date()
}

export function startHeartbeat(serverURL) {
  if (heartbeatInterval) clearInterval(heartbeatInterval)
  
  const ping = async () => {
    if (!serverURL) {
      setConnectionStatus('offline')
      return
    }
    
    const url = serverURL.replace(/\/$/, '')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout
      
      const response = await fetch(`${url}/employees`, {
        method: 'GET',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('offline')
      }
    } catch (err) {
      setConnectionStatus('offline')
    }
  }

  // Ping immediately, then every 8 seconds
  ping()
  heartbeatInterval = setInterval(ping, 8000)
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}
