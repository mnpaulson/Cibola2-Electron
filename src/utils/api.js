import { watch } from 'vue'
import { settingsState } from '../store/settings'
import { setConnectionStatus } from '../store/session'

async function waitUntilSettingsLoaded() {
  if (settingsState.isLoaded) return
  await new Promise((resolve) => {
    const unwatch = watch(
      () => settingsState.isLoaded,
      (loaded) => {
        if (loaded) {
          unwatch()
          resolve()
        }
      },
      { immediate: true }
    )
  })
}

async function apiRequest(endpoint, options = {}) {
  await waitUntilSettingsLoaded()
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  // Clean serverURL trailing slash
  const baseUrl = settingsState.serverURL.replace(/\/$/, '')
  const url = `${baseUrl}${path}`

  const fetchOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, fetchOptions)
    
    let json
    try {
      json = await response.json()
    } catch (err) {
      setConnectionStatus('offline')
      throw new Error(`HTTP ${response.status}: Failed to parse JSON response`)
    }

    if (!response.ok || json.success === false) {
      const errMsg = json.error?.message || `HTTP ${response.status}: ${response.statusText}`
      setConnectionStatus('connected')
      throw new Error(errMsg)
    }

    setConnectionStatus('connected')
    return json.data // Returns the data field directly
  } catch (err) {
    // Network failures like connection refused, DNS error, offline
    if (err instanceof TypeError || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      setConnectionStatus('offline')
    }
    throw err
  }
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options
  }),
  put: (endpoint, body, options) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options
  }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: 'DELETE', ...options })
}
