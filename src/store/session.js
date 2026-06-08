import { reactive } from 'vue'

export const sessionState = reactive({
  connectionStatus: 'connecting', // 'connected', 'connecting', 'offline'
  lastCheck: null
})

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
