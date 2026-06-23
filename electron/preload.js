import { contextBridge, ipcRenderer } from 'electron'

// Expose minimal API to the renderer process safely
contextBridge.exposeInMainWorld('electronAPI', {
  onMainProcessMessage: (callback) => {
    ipcRenderer.on('main-process-message', (_event, value) => callback(value))
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printDocument: (payload) => ipcRenderer.invoke('print-document', payload),

  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  onUpdateChecking: (callback) => {
    const fn = () => callback()
    ipcRenderer.on('update-checking', fn)
    return () => ipcRenderer.removeListener('update-checking', fn)
  },
  onUpdateAvailable: (callback) => {
    const fn = (_event, info) => callback(info)
    ipcRenderer.on('update-available', fn)
    return () => ipcRenderer.removeListener('update-available', fn)
  },
  onUpdateNotAvailable: (callback) => {
    const fn = (_event, info) => callback(info)
    ipcRenderer.on('update-not-available', fn)
    return () => ipcRenderer.removeListener('update-not-available', fn)
  },
  onUpdateError: (callback) => {
    const fn = (_event, err) => callback(err)
    ipcRenderer.on('update-error', fn)
    return () => ipcRenderer.removeListener('update-error', fn)
  },
  onDownloadProgress: (callback) => {
    const fn = (_event, progress) => callback(progress)
    ipcRenderer.on('update-download-progress', fn)
    return () => ipcRenderer.removeListener('update-download-progress', fn)
  },
  onUpdateDownloaded: (callback) => {
    const fn = (_event, info) => callback(info)
    ipcRenderer.on('update-downloaded', fn)
    return () => ipcRenderer.removeListener('update-downloaded', fn)
  },
  onAppNavigateBack: (callback) => {
    const fn = () => callback()
    ipcRenderer.on('app-navigate-back', fn)
    return () => ipcRenderer.removeListener('app-navigate-back', fn)
  },
  onAppNavigateForward: (callback) => {
    const fn = () => callback()
    ipcRenderer.on('app-navigate-forward', fn)
    return () => ipcRenderer.removeListener('app-navigate-forward', fn)
  }
})
