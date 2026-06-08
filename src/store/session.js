import { reactive } from 'vue'

export const sessionState = reactive({
  connectionStatus: 'connecting', // 'connected', 'connecting', 'offline'
  lastCheck: null,
  activeTab: 'dashboard',
  navigationHistory: ['dashboard'],
  selectedCustomerId: null,
  activeJobId: null,
  activeCreditId: null,
  activeSheetId: null,
  enteredJobEditFromList: false,
  enteredCreditEditFromList: false
})

export function navigateTo(tab) {
  if (!tab) return
  // Avoid pushing duplicate consecutive tabs in history
  if (sessionState.navigationHistory[sessionState.navigationHistory.length - 1] !== tab) {
    sessionState.navigationHistory.push(tab)
  }
  sessionState.activeTab = tab
  console.log(`[Navigation] Navigated to tab: ${tab}. History stack:`, sessionState.navigationHistory)
}

export function navigateBack() {
  // If we entered edit mode from a list on the active tab, go back to list view instead of popping tab
  if (sessionState.activeTab === 'jobs' && sessionState.enteredJobEditFromList) {
    sessionState.activeJobId = null
    sessionState.selectedCustomerId = null
    sessionState.enteredJobEditFromList = false
    console.log('[Navigation] Returned to jobs list from edit mode')
    return
  }
  if (sessionState.activeTab === 'credits' && sessionState.enteredCreditEditFromList) {
    sessionState.activeCreditId = null
    sessionState.selectedCustomerId = null
    sessionState.enteredCreditEditFromList = false
    console.log('[Navigation] Returned to credits list from edit mode')
    return
  }

  // Normal tab navigation popping
  if (sessionState.navigationHistory.length > 1) {
    sessionState.navigationHistory.pop() // remove current tab
    const prevTab = sessionState.navigationHistory[sessionState.navigationHistory.length - 1]
    sessionState.activeTab = prevTab
    
    // Reset edit states upon cross-tab back navigation
    sessionState.activeJobId = null
    sessionState.selectedCustomerId = null
    sessionState.activeCreditId = null
    sessionState.activeSheetId = null
    sessionState.enteredJobEditFromList = false
    sessionState.enteredCreditEditFromList = false
    
    console.log(`[Navigation] Navigated back to: ${prevTab}. History stack:`, sessionState.navigationHistory)
  }
}

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
