<template>
  <v-row>
    <v-col cols="12" md="8" lg="6" class="mx-auto">
      <v-card variant="outlined" class="border-light pa-4">
        <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-network</v-icon>
          Local Connection & Camera
        </v-card-title>
        <v-card-text class="px-0 pb-0 pt-4">
          <v-text-field
            label="Server URL"
            v-model="localSettings.serverURL"
            placeholder="e.g. http://localhost:8000"
            persistent-placeholder
            prepend-inner-icon="mdi-server"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            hint="The address of the cibola2 backend service"
            persistent-hint
          ></v-text-field>

          <v-select
            v-model="localSettings.defaultDeviceId"
            :items="videoDevices"
            item-title="label"
            item-value="deviceId"
            label="Default Camera"
            prepend-inner-icon="mdi-webcam"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            clearable
            hint="Choose the default camera device for jewelry photography"
            persistent-hint
            @update:model-value="onDefaultCameraChanged"
          ></v-select>

          <v-row class="mt-2">
            <v-col cols="6">
              <v-text-field
                label="Camera Width"
                v-model="localSettings.cameraWidth"
                prepend-inner-icon="mdi-arrow-resize"
                variant="outlined"
                density="comfortable"
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                label="Camera Height"
                v-model="localSettings.cameraHeight"
                prepend-inner-icon="mdi-arrow-resize"
                variant="outlined"
                density="comfortable"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card variant="outlined" class="border-light pa-4 mt-6">
        <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold d-flex align-center justify-space-between">
          <span class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-printer</v-icon>
            Printer Routing
          </span>
          <v-btn
            variant="text"
            density="comfortable"
            icon="mdi-refresh"
            color="primary"
            size="small"
            @click="fetchPrinters(true)"
            title="Refresh system printers"
          ></v-btn>
        </v-card-title>
        <v-card-text class="px-0 pb-0 pt-4">
          <v-row class="align-start mb-4">
            <v-col cols="9">
              <v-combobox
                label="Job Ticket Printer"
                v-model="localSettings.jobPrinter"
                :items="printerNames"
                prepend-inner-icon="mdi-file-document-outline"
                variant="outlined"
                density="comfortable"
                clearable
                hint="Select a printer or type the name manually"
                persistent-hint
                no-data-text="No system printers detected. Type to enter manually."
              ></v-combobox>
            </v-col>
            <v-col cols="3" class="pt-1">
              <v-btn
                block
                variant="tonal"
                color="secondary"
                height="48"
                prepend-icon="mdi-printer-eye"
                @click="handlePrintTestPage(localSettings.jobPrinter, 'Job Ticket')"
                :disabled="!localSettings.jobPrinter"
              >
                Test
              </v-btn>
            </v-col>
          </v-row>

          <v-row class="align-start mb-2">
            <v-col cols="9">
              <v-combobox
                label="Gold Credit Receipt Printer"
                v-model="localSettings.creditPrinter"
                :items="printerNames"
                prepend-inner-icon="mdi-receipt-text-outline"
                variant="outlined"
                density="comfortable"
                clearable
                hint="Select a printer or type the name manually"
                persistent-hint
                no-data-text="No system printers detected. Type to enter manually."
              ></v-combobox>
            </v-col>
            <v-col cols="3" class="pt-1">
              <v-btn
                block
                variant="tonal"
                color="secondary"
                height="48"
                prepend-icon="mdi-printer-eye"
                @click="handlePrintTestPage(localSettings.creditPrinter, 'Gold Credit')"
                :disabled="!localSettings.creditPrinter"
              >
                Test
              </v-btn>
            </v-col>
          </v-row>

          <v-row class="align-start mb-2">
            <v-col cols="9">
              <v-combobox
                label="Custom Sheet Printer"
                v-model="localSettings.customPrinter"
                :items="printerNames"
                prepend-inner-icon="mdi-file-document-edit-outline"
                variant="outlined"
                density="comfortable"
                clearable
                hint="Select a printer or type the name manually"
                persistent-hint
                no-data-text="No system printers detected. Type to enter manually."
              ></v-combobox>
            </v-col>
            <v-col cols="3" class="pt-1">
              <v-btn
                block
                variant="tonal"
                color="secondary"
                height="48"
                prepend-icon="mdi-printer-eye"
                @click="handlePrintTestPage(localSettings.customPrinter, 'Custom Sheet')"
                :disabled="!localSettings.customPrinter"
              >
                Test
              </v-btn>
            </v-col>
          </v-row>
         </v-card-text>
      </v-card>

      <!-- Application Updates Section -->
      <v-card variant="outlined" class="border-light pa-4 mt-6">
        <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold d-flex align-center justify-space-between">
          <span class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-cloud-download</v-icon>
            Application Updates
          </span>
          
          <!-- Simulation Toggle -->
          <div class="d-flex align-center">
            <span class="text-caption text-medium-emphasis mr-2">Simulate</span>
            <v-switch
              v-model="updateSimulated"
              color="warning"
              density="compact"
              hide-details
              inset
            ></v-switch>
          </div>
        </v-card-title>
        
        <v-card-text class="px-0 pb-0 pt-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-body-2 font-weight-medium">Current Version</div>
              <div class="text-h6 font-weight-bold text-primary">{{ appVersion }}</div>
            </div>
            <div>
              <div class="text-body-2 font-weight-medium text-right">Latest Version</div>
              <div class="text-h6 font-weight-bold text-right" :class="latestVersionClass">
                {{ notificationsState.latestVersion || 'Not Checked' }}
              </div>
            </div>
          </div>

          <!-- Messages / Info Banners -->
          <v-alert
            v-if="notificationsState.updateStatus === 'checking'"
            type="info"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            <div class="d-flex align-center">
              <v-progress-circular indeterminate size="20" width="2" class="mr-3"></v-progress-circular>
              Checking GitHub releases for updates...
            </div>
          </v-alert>

          <v-alert
            v-else-if="notificationsState.updateStatus === 'not-available'"
            type="success"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            Your application is up to date! (v{{ appVersion }} is the latest release)
          </v-alert>

          <v-alert
            v-else-if="notificationsState.updateStatus === 'error'"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            <div class="font-weight-bold mb-1">Failed to process update:</div>
            <div class="text-caption">{{ notificationsState.updateError }}</div>
          </v-alert>

          <v-alert
            v-else-if="notificationsState.updateStatus === 'downloaded'"
            type="success"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            Update has been downloaded successfully! Relaunch the application to apply the update.
          </v-alert>

          <!-- Update Available Panel -->
          <v-expand-transition>
            <div v-if="notificationsState.updateStatus === 'available' || notificationsState.updateStatus === 'downloading' || notificationsState.updateStatus === 'downloaded'">
              <v-card variant="flat" bg-color="surface-variant" class="pa-3 mb-4 border rounded">
                <div class="text-subtitle-2 font-weight-bold mb-1">Release Notes for v{{ notificationsState.latestVersion }}</div>
                <div class="release-notes-box text-caption text-medium-emphasis overflow-y-auto" style="max-height: 120px; line-height: 1.4;">
                  <div v-if="notificationsState.releaseNotes" v-html="notificationsState.releaseNotes"></div>
                  <div v-else>No release notes provided for this version.</div>
                </div>
              </v-card>
              
              <!-- Downloading Progress -->
              <div v-if="notificationsState.updateStatus === 'downloading'" class="mb-4">
                <div class="d-flex justify-space-between text-caption mb-1">
                  <span>Downloading update package...</span>
                  <span class="font-weight-bold">{{ Math.round(notificationsState.downloadProgress.percent) }}%</span>
                </div>
                <v-progress-linear
                  :model-value="notificationsState.downloadProgress.percent"
                  color="primary"
                  height="10"
                  striped
                  rounded
                  class="mb-2"
                ></v-progress-linear>
                <div class="d-flex justify-space-between text-caption text-medium-emphasis">
                  <span>Speed: {{ formatSpeed(notificationsState.downloadProgress.bytesPerSecond) }}</span>
                  <span>{{ formatBytes(notificationsState.downloadProgress.transferred) }} of {{ formatBytes(notificationsState.downloadProgress.total) }}</span>
                </div>
              </div>
            </div>
          </v-expand-transition>

          <!-- Actions -->
          <div class="d-flex flex-wrap justify-end gap-2 mt-4">
            <v-btn
              v-if="notificationsState.updateStatus === 'idle' || notificationsState.updateStatus === 'not-available' || notificationsState.updateStatus === 'error'"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-sync"
              :loading="notificationsState.updateStatus === 'checking'"
              @click="triggerCheckUpdates"
            >
              Check for Updates
            </v-btn>
            
            <v-btn
              v-if="notificationsState.updateStatus === 'available'"
              color="primary"
              prepend-icon="mdi-download"
              @click="triggerDownloadUpdates"
            >
              Download Update
            </v-btn>

            <v-btn
              v-if="notificationsState.updateStatus === 'downloaded'"
              color="success"
              prepend-icon="mdi-restart"
              @click="triggerInstallUpdates"
            >
              Install & Restart
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex justify-end mt-6">
        <v-btn
          color="primary"
          size="large"
          class="text-none px-6 font-weight-medium"
          prepend-icon="mdi-content-save"
          :loading="isSavingSettings"
          @click="handleSaveSettings"
          elevation="1"
        >
          Save Settings
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted, reactive, watch, computed } from 'vue'
import { api } from '../../utils/api'
import { settingsState, saveSettings, loadSettings } from '../../store/settings'
import { showToast } from '../../store/toast'
import {
  notificationsState,
  checkUpdates,
  downloadUpdates,
  installUpdates
} from '../../store/notifications'

import pkg from '../../../package.json'

// Application Updates State
const appVersion = ref(pkg.version || '1.0.0')

// Format bytes helper
function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format download speed helper
function formatSpeed(bytesPerSecond) {
  if (!bytesPerSecond) return '0 B/s'
  return formatBytes(bytesPerSecond) + '/s'
}

// Computed text color for latest version
const latestVersionClass = computed(() => {
  if (!notificationsState.latestVersion) return 'text-medium-emphasis'
  return notificationsState.latestVersion !== appVersion.value ? 'text-warning font-weight-bold' : 'text-success'
})

// Proxy simulation toggle to the global notifications store
const updateSimulated = computed({
  get: () => notificationsState.updateSimulated,
  set: (val) => {
    notificationsState.updateSimulated = val
  }
})

// Wrapper functions for updates flow actions
const triggerCheckUpdates = () => {
  checkUpdates(false)
}

const triggerDownloadUpdates = () => {
  downloadUpdates()
}

const triggerInstallUpdates = () => {
  installUpdates()
}

// Local Settings State
const localSettings = reactive({
  serverURL: '',
  cameraWidth: '',
  cameraHeight: '',
  defaultDeviceId: '',
  jobPrinter: '',
  creditPrinter: '',
  customPrinter: ''
})
const printerNames = ref([])
const videoDevices = ref([])
const isSavingSettings = ref(false)

// Snackbar Toast System
const showSnackbar = (text, color = 'success') => {
  showToast(text, color)
}

const initLocalSettings = () => {
  localSettings.serverURL = settingsState.serverURL
  localSettings.cameraWidth = settingsState.camera.width
  localSettings.cameraHeight = settingsState.camera.height
  localSettings.defaultDeviceId = settingsState.camera.defaultDeviceId || ''
  localSettings.jobPrinter = settingsState.printers.job
  localSettings.creditPrinter = settingsState.printers.credit
  localSettings.customPrinter = settingsState.printers.custom
}

const fetchVideoDevices = async () => {
  try {
    // Request permission first to get labels
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
    tempStream.getTracks().forEach(track => track.stop())
  } catch (err) {
    console.warn('Failed to access camera permission for settings page list:', err)
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    videoDevices.value = devices
      .filter(device => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`
      }))
  } catch (err) {
    console.error('Failed to list video devices in settings:', err)
  }
}

const onDefaultCameraChanged = async (deviceId) => {
  if (!deviceId) return
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 4096 },
        height: { ideal: 2160 }
      }
    })
    
    const track = stream.getVideoTracks()[0]
    if (track) {
      const settings = track.getSettings()
      if (settings.width) {
        localSettings.cameraWidth = String(settings.width)
      }
      if (settings.height) {
        localSettings.cameraHeight = String(settings.height)
      }
    }
    
    stream.getTracks().forEach(t => t.stop())
  } catch (err) {
    console.error('Failed to autodetect camera resolution on settings select:', err)
  }
}

const fetchPrinters = async (showToastFlag = false) => {
  console.log('Renderer: Invoking electronAPI.getPrinters()...')
  if (window.electronAPI && window.electronAPI.getPrinters) {
    try {
      const list = await window.electronAPI.getPrinters()
      console.log('Renderer: electronAPI.getPrinters() returned list:', list)
      printerNames.value = list || []
      if (showToastFlag) {
        showSnackbar(`Found ${printerNames.value.length} system printer(s)`, 'info')
      }
    } catch (err) {
      console.error('Renderer: Failed to query system printers:', err)
      showSnackbar('Failed to query system printers: ' + err.message, 'error')
    }
  } else {
    console.warn('Renderer: window.electronAPI.getPrinters is NOT defined')
    if (showToastFlag) {
      showSnackbar('Printer API not available in this environment', 'warning')
    }
  }
}

const handlePrintTestPage = async (printerName, type) => {
  if (!printerName) {
    showSnackbar('Please select a printer first', 'warning')
    return
  }

  const timestamp = new Date().toLocaleString()
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Test Page</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 20px;
            color: #000;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
          }
          .info {
            font-size: 12px;
            margin-top: 5px;
          }
          .content {
            font-size: 14px;
            line-height: 1.4;
          }
          .field {
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 20px;
            border-top: 2px dashed #000;
            padding-top: 10px;
            text-align: center;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="title">CIBOLA II PRINT TEST</p>
          <p class="info">${type} Printer Routing</p>
        </div>
        <div class="content">
          <div class="field"><strong>Status:</strong> SUCCESSFUL</div>
          <div class="field"><strong>Printer:</strong> ${printerName}</div>
          <div class="field"><strong>Timestamp:</strong> ${timestamp}</div>
          <div class="field"><strong>Environment:</strong> Electron Renderer</div>
        </div>
        <div class="footer">
          <p>End of Test Page</p>
        </div>
      </body>
    </html>
  `

  console.log(`Renderer: Requesting print test on printer "${printerName}"...`)
  if (window.electronAPI && window.electronAPI.printDocument) {
    try {
      const response = await window.electronAPI.printDocument({ printerName, htmlContent })
      if (response && response.success) {
        showSnackbar(`Test page printed successfully on "${printerName}"`, 'success')
      } else {
        throw new Error(response?.error || 'Unknown printer failure')
      }
    } catch (err) {
      console.error('Renderer: Print test failed:', err)
      showSnackbar('Print test failed: ' + err.message, 'error')
    }
  } else {
    console.warn('Renderer: window.electronAPI.printDocument is NOT defined')
    showSnackbar('Printing API is not available in this environment', 'warning')
  }
}

const handleSaveSettings = async () => {
  isSavingSettings.value = true
  try {
    // Basic validation / normalization
    let cleanURL = localSettings.serverURL.trim()
    if (cleanURL && !cleanURL.startsWith('http://') && !cleanURL.startsWith('https://')) {
      cleanURL = 'http://' + cleanURL
    }
    localSettings.serverURL = cleanURL

    await saveSettings({
      serverURL: localSettings.serverURL,
      camera: {
        width: localSettings.cameraWidth,
        height: localSettings.cameraHeight,
        defaultDeviceId: localSettings.defaultDeviceId
      },
      printers: {
        job: localSettings.jobPrinter,
        credit: localSettings.creditPrinter,
        custom: localSettings.customPrinter
      }
    })
    showSnackbar('Local settings cached successfully', 'success')
  } catch (err) {
    showSnackbar('Failed to write settings: ' + err.message, 'error')
  } finally {
    isSavingSettings.value = false
  }
}

onMounted(async () => {
  // Ensure settings are loaded
  if (!settingsState.isLoaded) {
    await loadSettings()
  }
  
  initLocalSettings()
  await fetchPrinters()
  await fetchVideoDevices()

  // Load App Version
  if (window.electronAPI && typeof window.electronAPI.getAppVersion === 'function') {
    window.electronAPI.getAppVersion().then(version => {
      appVersion.value = version
    })
  }
})

// Watch settings state to sync local variables if changed elsewhere
watch(() => settingsState.isLoaded, (loaded) => {
  if (loaded) {
    initLocalSettings()
  }
})
</script>

<style scoped>
.border-light {
  border: 1px solid rgba(var(--v-border-color), 0.12) !important;
  border-radius: 12px !important;
}

.gap-2 {
  gap: 8px;
}

.release-notes-box {
  scrollbar-width: thin;
}
</style>
