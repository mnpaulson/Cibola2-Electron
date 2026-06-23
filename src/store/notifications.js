import { reactive } from 'vue'
import { showToast } from './toast'
import pkg from '../../package.json'

// Dynamically generate a simulated version that is higher than the current package version
function getSimulatedNextVersion() {
  const current = pkg.version || '1.0.0'
  const parts = current.split('.').map(Number)
  if (parts.length === 3 && !parts.some(isNaN)) {
    return `${parts[0] + 1}.0.0`
  }
  return '2.0.0'
}

export const notificationsState = reactive({
  list: [],
  updateSimulated: false,
  
  // Shared update state
  updateStatus: 'idle', // 'idle', 'checking', 'available', 'not-available', 'downloading', 'downloaded', 'error'
  updateError: '',
  latestVersion: '',
  releaseNotes: '',
  downloadProgress: {
    percent: 0,
    bytesPerSecond: 0,
    total: 0,
    transferred: 0
  }
})

let simulationInterval = null

/**
 * Add or update a notification.
 * @param {Object} notification - The notification object
 * @param {string} notification.id - Unique identifier
 * @param {string} notification.title - Title text
 * @param {string} notification.message - Subtitle or detail text
 * @param {string} [notification.color] - Color theme ('info', 'success', 'warning', 'error')
 * @param {string} [notification.icon] - Mapped icon name
 */
export function addNotification(notification) {
  const index = notificationsState.list.findIndex(n => n.id === notification.id)
  if (index !== -1) {
    notificationsState.list[index] = { ...notificationsState.list[index], ...notification }
  } else {
    notificationsState.list.push(notification)
  }
}

/**
 * Remove a notification by ID.
 * @param {string} id - The notification identifier
 */
export function removeNotification(id) {
  notificationsState.list = notificationsState.list.filter(n => n.id !== id)
}

/**
 * Remove all active notifications.
 */
export function clearAllNotifications() {
  notificationsState.list = []
}

/**
 * Initialize Electron autoUpdater listeners globally.
 */
export function initUpdaterListeners() {
  if (!window.electronAPI) return

  if (typeof window.electronAPI.onUpdateChecking === 'function') {
    window.electronAPI.onUpdateChecking(() => {
      if (!notificationsState.updateSimulated) {
        notificationsState.updateStatus = 'checking'
      }
    })
  }

  if (typeof window.electronAPI.onUpdateAvailable === 'function') {
    window.electronAPI.onUpdateAvailable((info) => {
      if (!notificationsState.updateSimulated) {
        notificationsState.latestVersion = info.version || ''
        notificationsState.releaseNotes = info.releaseNotes || ''
        notificationsState.updateStatus = 'available'
        
        addNotification({
          id: 'new-version',
          title: 'New Version Available',
          message: `Version ${info.version} is available for download.`,
          color: 'info',
          icon: 'mdi-cloud-download-outline'
        })
        
        showToast(`Update available: v${info.version}`, 'info')
      }
    })
  }

  if (typeof window.electronAPI.onUpdateNotAvailable === 'function') {
    window.electronAPI.onUpdateNotAvailable((info) => {
      if (!notificationsState.updateSimulated) {
        notificationsState.latestVersion = info.version || ''
        notificationsState.updateStatus = 'not-available'
      }
    })
  }

  if (typeof window.electronAPI.onUpdateError === 'function') {
    window.electronAPI.onUpdateError((err) => {
      if (!notificationsState.updateSimulated) {
        notificationsState.updateStatus = 'error'
        notificationsState.updateError = err || 'Unknown update error.'
      }
    })
  }

  if (typeof window.electronAPI.onDownloadProgress === 'function') {
    window.electronAPI.onDownloadProgress((progress) => {
      if (!notificationsState.updateSimulated) {
        notificationsState.updateStatus = 'downloading'
        notificationsState.downloadProgress.percent = progress.percent || 0
        notificationsState.downloadProgress.bytesPerSecond = progress.bytesPerSecond || 0
        notificationsState.downloadProgress.total = progress.total || 0
        notificationsState.downloadProgress.transferred = progress.transferred || 0
      }
    })
  }

  if (typeof window.electronAPI.onUpdateDownloaded === 'function') {
    window.electronAPI.onUpdateDownloaded((info) => {
      if (!notificationsState.updateSimulated) {
        notificationsState.updateStatus = 'downloaded'
        
        addNotification({
          id: 'new-version-downloaded',
          title: 'Update Downloaded',
          message: `Version ${info.version || getSimulatedNextVersion()} has been downloaded. Restart to install.`,
          color: 'success',
          icon: 'mdi-restart'
        })
        
        showToast(`Update downloaded!`, 'success')
      }
    })
  }
}

/**
 * Triggers checked updates process.
 * @param {boolean} silent - Whether to hide success/availability toast
 */
export async function checkUpdates(silent = false) {
  notificationsState.updateError = ''
  notificationsState.updateStatus = 'checking'
  
  if (notificationsState.updateSimulated) {
    setTimeout(() => {
      const nextVer = getSimulatedNextVersion()
      notificationsState.latestVersion = nextVer
      notificationsState.releaseNotes = `<h3>v${nextVer} Features</h3><ul><li>Added customer duplicate merging functionality</li><li>Reworked job printer speed optimizations</li><li>Fixed gold credit spot price evaluation UI bugs</li></ul>`
      notificationsState.updateStatus = 'available'
      
      addNotification({
        id: 'new-version',
        title: 'New Version Available',
        message: `Version ${nextVer} is available for download.`,
        color: 'info',
        icon: 'mdi-cloud-download-outline'
      })

      if (!silent) {
        showToast('Simulated Update Found!', 'info')
      }
    }, 1500)
    return
  }

  if (window.electronAPI && typeof window.electronAPI.checkForUpdate === 'function') {
    try {
      const checkPromise = window.electronAPI.checkForUpdate()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Update check timed out after 10 seconds.')), 10000)
      )
      
      const res = await Promise.race([checkPromise, timeoutPromise])
      if (!res.success) {
        notificationsState.updateStatus = 'error'
        notificationsState.updateError = res.error || 'Unknown error during updates check.'
      } else {
        // If the check succeeded but status is still 'checking', transition to 'not-available'
        // after a short delay (in case events are still processing in the microtask queue).
        // This is crucial in dev mode where electron-updater skips checking and resolves without events.
        setTimeout(() => {
          if (notificationsState.updateStatus === 'checking') {
            notificationsState.updateStatus = 'not-available'
          }
        }, 200)
      }
    } catch (err) {
      notificationsState.updateStatus = 'error'
      notificationsState.updateError = err.message || err
    }
  } else {
    // Dev or non-Electron mode fallback
    setTimeout(() => {
      notificationsState.updateStatus = 'error'
      notificationsState.updateError = 'Electron API not available. Make sure the app is running inside Electron.'
    }, 1000)
  }
}

/**
 * Trigger update download.
 */
export async function downloadUpdates() {
  if (notificationsState.updateSimulated) {
    notificationsState.updateStatus = 'downloading'
    notificationsState.downloadProgress.percent = 0
    notificationsState.downloadProgress.bytesPerSecond = 1250000 // 1.25 MB/s
    notificationsState.downloadProgress.total = 45000000 // 45 MB
    notificationsState.downloadProgress.transferred = 0

    if (simulationInterval) clearInterval(simulationInterval)

    simulationInterval = setInterval(() => {
      const step = 45000000 / 20 // 5% chunks
      notificationsState.downloadProgress.transferred += step
      notificationsState.downloadProgress.percent = (notificationsState.downloadProgress.transferred / notificationsState.downloadProgress.total) * 100
      if (notificationsState.downloadProgress.transferred >= notificationsState.downloadProgress.total) {
        notificationsState.downloadProgress.transferred = notificationsState.downloadProgress.total
        notificationsState.downloadProgress.percent = 100
        clearInterval(simulationInterval)
        notificationsState.updateStatus = 'downloaded'
        showToast('Simulated Download Complete!', 'success')
        
        const nextVer = getSimulatedNextVersion()
        addNotification({
          id: 'new-version-downloaded',
          title: 'Update Downloaded',
          message: `Version ${nextVer} has been downloaded. Restart to install.`,
          color: 'success',
          icon: 'mdi-restart'
        })
      }
    }, 300)
    return
  }

  if (window.electronAPI && typeof window.electronAPI.downloadUpdate === 'function') {
    notificationsState.updateStatus = 'downloading'
    try {
      const res = await window.electronAPI.downloadUpdate()
      if (!res.success) {
        notificationsState.updateStatus = 'error'
        notificationsState.updateError = res.error || 'Failed to start downloading update.'
      }
    } catch (err) {
      notificationsState.updateStatus = 'error'
      notificationsState.updateError = err.message || err
    }
  }
}

/**
 * Trigger update installation and app restart.
 */
export function installUpdates() {
  if (notificationsState.updateSimulated) {
    showToast('Simulating restart and install...', 'success')
    setTimeout(() => {
      window.location.reload()
    }, 1500)
    return
  }

  if (window.electronAPI && typeof window.electronAPI.installUpdate === 'function') {
    window.electronAPI.installUpdate()
  }
}
