import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { autoUpdater } from 'electron-updater'

// Configure autoUpdater
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.logger = console

function setupAutoUpdater() {
  autoUpdater.on('checking-for-update', () => {
    win?.webContents.send('update-checking')
  })

  autoUpdater.on('update-available', (info) => {
    win?.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    win?.webContents.send('update-not-available', {
      version: info.version
    })
  })

  autoUpdater.on('error', (err) => {
    win?.webContents.send('update-error', err == null ? 'unknown' : (err.message || err).toString())
  })

  autoUpdater.on('download-progress', (progressObj) => {
    win?.webContents.send('update-download-progress', {
      percent: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      total: progressObj.total,
      transferred: progressObj.transferred
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    win?.webContents.send('update-downloaded', {
      version: info.version
    })
  })
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const settingsPath = path.join(app.getPath('userData'), 'settings.json')

function readSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Failed to read settings:', err)
  }
  return {
    serverURL: 'http://localhost:8000',
    camera: { width: '1280', height: '1024' },
    printers: { job: '', credit: '', custom: '' },
    isDark: true
  }
}

function writeSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Failed to write settings:', err)
    return false
  }
}


// Set root path to the project root
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL 
  ? path.join(process.env.APP_ROOT, 'public') 
  : RENDERER_DIST

let win = null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, '256x256.png'),
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date()).toLocaleString())
  })

  // Handle system app-command events like mouse back/forward buttons
  win.on('app-command', (e, cmd) => {
    if (cmd === 'browser-backward') {
      win?.webContents.send('app-navigate-back')
    } else if (cmd === 'browser-forward') {
      win?.webContents.send('app-navigate-forward')
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open DevTools in development mode
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    win.removeMenu()
  }
}

ipcMain.handle('get-settings', () => {
  return readSettings()
})

ipcMain.handle('save-settings', (event, settings) => {
  return writeSettings(settings)
})

ipcMain.handle('get-printers', async (event) => {
  try {
    const wc = event.sender
    if (wc) {
      console.log('[IPC get-printers] Invoking wc.getPrintersAsync()...')
      const printers = await wc.getPrintersAsync()
      console.log('[IPC get-printers] Result details:', printers)
      const names = printers.map(p => p.name)
      console.log('[IPC get-printers] Mapped printer names:', names)
      return names
    }
  } catch (err) {
    console.error('[IPC get-printers] Error occurred:', err)
  }
  return []
})

ipcMain.handle('print-document', async (event, { printerName, htmlContent }) => {
  try {
    console.log(`[IPC print-document] Initializing print for printer: "${printerName}"`)
    
    let printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    const options = {
      silent: true,
      printBackground: true,
      margins: { marginType: 'none' }
    }
    if (printerName) {
      options.deviceName = printerName
    }

    return new Promise((resolve) => {
      printWin.webContents.print(options, (success, errorType) => {
        printWin.destroy()
        printWin = null
        if (success) {
          console.log(`[IPC print-document] Printed successfully on "${printerName || 'Default Printer'}"`)
          resolve({ success: true })
        } else {
          console.error(`[IPC print-document] Print failed. Error type: ${errorType}`)
          resolve({ success: false, error: errorType || 'Unknown printing error' })
        }
      })
    })
  } catch (err) {
    console.error('[IPC print-document] Error during printing:', err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('check-for-update', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, result }
  } catch (err) {
    console.error('Error checking for updates:', err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('download-update', async () => {
  try {
    const result = await autoUpdater.downloadUpdate()
    return { success: true, result }
  } catch (err) {
    console.error('Error downloading update:', err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall()
  return { success: true }
})


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
      win = null
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  app.whenReady().then(() => {
    setupAutoUpdater()
    createWindow()
  })
}

