import { reactive } from 'vue'

export const settingsState = reactive({
  serverURL: 'http://localhost:8000',
  camera: {
    width: '1280',
    height: '1024'
  },
  printers: {
    job: '',
    credit: ''
  },
  isLoaded: false
})

export async function loadSettings() {
  if (window.electronAPI && window.electronAPI.getSettings) {
    try {
      const settings = await window.electronAPI.getSettings()
      if (settings) {
        if (settings.serverURL) settingsState.serverURL = settings.serverURL
        if (settings.camera) {
          if (settings.camera.width) settingsState.camera.width = settings.camera.width
          if (settings.camera.height) settingsState.camera.height = settings.camera.height
        }
        if (settings.printers) {
          if (settings.printers.job) settingsState.printers.job = settings.printers.job
          if (settings.printers.credit) settingsState.printers.credit = settings.printers.credit
        }
      }
    } catch (err) {
      console.error('Failed to load settings from electron IPC:', err)
    }
  }
  settingsState.isLoaded = true
}

export async function saveSettings(newSettings) {
  if (newSettings.serverURL) settingsState.serverURL = newSettings.serverURL
  if (newSettings.camera) {
    if (newSettings.camera.width) settingsState.camera.width = newSettings.camera.width
    if (newSettings.camera.height) settingsState.camera.height = newSettings.camera.height
  }
  if (newSettings.printers) {
    settingsState.printers.job = newSettings.printers.job || ''
    settingsState.printers.credit = newSettings.printers.credit || ''
  }

  if (window.electronAPI && window.electronAPI.saveSettings) {
    try {
      await window.electronAPI.saveSettings({
        serverURL: settingsState.serverURL,
        camera: {
          width: settingsState.camera.width,
          height: settingsState.camera.height
        },
        printers: {
          job: settingsState.printers.job,
          credit: settingsState.printers.credit
        }
      })
    } catch (err) {
      console.error('Failed to save settings via electron IPC:', err)
      throw err
    }
  }
}
