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
  printDocument: (payload) => ipcRenderer.invoke('print-document', payload)
})
