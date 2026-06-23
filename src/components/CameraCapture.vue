<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800px" persistent>
    <v-card class="camera-card rounded-lg overflow-hidden">
      <!-- Header -->
      <v-toolbar color="primary" flat>
        <v-toolbar-title class="font-weight-bold d-flex align-center">
          <v-icon start class="mr-2">mdi-camera</v-icon>
          Jewelry Item Capture
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-4 bg-dark-viewport d-flex flex-column align-center relative">
        <!-- Error alert -->
        <v-alert v-if="errorMsg" type="error" variant="tonal" class="w-100 mb-4">
          {{ errorMsg }}
        </v-alert>

        <!-- Camera select & settings -->
        <div class="d-flex w-100 justify-space-between align-center mb-4 gap-4 flex-wrap">
          <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 450px;">
            <v-select
              v-model="selectedDeviceId"
              :items="videoDevices"
              item-title="label"
              item-value="deviceId"
              label="Select Camera Device"
              prepend-inner-icon="mdi-webcam"
              variant="outlined"
              density="compact"
              hide-details
              class="camera-select-dropdown"
              @update:model-value="initStream"
            ></v-select>

            <!-- Camera Light/Torch Toggle -->
            <v-btn
              v-if="isStreaming"
              :color="isTorchOn ? 'warning' : 'grey-darken-1'"
              variant="outlined"
              icon
              density="comfortable"
              :title="isTorchOn ? 'Turn Camera Light Off' : 'Turn Camera Light On'"
              @click="toggleTorch"
            >
              <v-icon>{{ isTorchOn ? 'mdi-flash' : 'mdi-flash-off' }}</v-icon>
            </v-btn>
          </div>

          <div class="text-caption text-medium-emphasis d-flex align-center" v-if="isStreaming">
            <span v-if="!isTorchSupported" class="mr-3 text-warning d-flex align-center" title="The camera driver did not report light support, but standard/legacy light commands were attempted anyway.">
              <v-icon size="small" class="mr-1">mdi-help-circle-outline</v-icon>
              Light status unconfirmed
            </span>
            Resolution: {{ currentWidth }} x {{ currentHeight }}
          </div>
        </div>

        <!-- Video stream / Canvas preview area -->
        <div class="video-container rounded-lg relative overflow-hidden" :class="{ 'flash-active': showFlash }">
          <video
            ref="videoRef"
            autoplay
            playsinline
            class="video-preview"
            :style="{ maxWidth: '100%', height: 'auto', display: isStreaming ? 'block' : 'none' }"
          ></video>

          <!-- Loader overlay -->
          <div v-if="isInitializing" class="loading-overlay d-flex flex-column align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
            <span class="text-subtitle-2 text-white font-weight-medium">Initializing camera stream...</span>
          </div>

        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-4 bg-surface d-flex justify-space-between">
        <v-btn variant="text" color="medium-emphasis" class="text-none font-weight-medium px-4" @click="close">
          Cancel
        </v-btn>
        <div class="d-flex gap-2">
          <v-btn
            v-if="isStreaming"
            color="primary"
            variant="flat"
            class="text-none font-weight-bold px-6 rounded-pill"
            prepend-icon="mdi-camera-iris"
            size="large"
            @click="captureImage"
          >
            Capture Photo
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { settingsState } from '../store/settings'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'capture'])

const videoRef = ref(null)
const isStreaming = ref(false)
const isInitializing = ref(false)
const errorMsg = ref('')
const selectedDeviceId = ref('')
const videoDevices = ref([])
const showFlash = ref(false)
const currentWidth = ref(0)
const currentHeight = ref(0)
const isTorchOn = ref(true)
const isTorchSupported = ref(false)

let localStream = null

const close = () => {
  stopStream()
  emit('update:modelValue', false)
}

const stopStream = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop())
    localStream = null
  }
  isStreaming.value = false
}

const getDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const video = devices
      .filter(device => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`
      }))
    
    videoDevices.value = video

    // Default to configured default camera if available, otherwise first camera
    if (video.length > 0 && !selectedDeviceId.value) {
      const defaultId = settingsState.camera.defaultDeviceId
      const hasDefault = video.some(d => d.deviceId === defaultId)
      selectedDeviceId.value = hasDefault ? defaultId : video[0].deviceId
    }
  } catch (err) {
    console.error('Failed to list video devices:', err)
  }
}

const initStream = async () => {
  if (!props.modelValue) return

  stopStream()
  isInitializing.value = true
  errorMsg.value = ''
  isTorchOn.value = true // Default camera light to on

  // Request permission first to populate device labels if empty
  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
    tempStream.getTracks().forEach(track => track.stop())
    await getDevices()
  } catch (err) {
    errorMsg.value = 'Failed to access camera permission: ' + err.message
    isInitializing.value = false
    return
  }

  let width = 4096
  let height = 2160

  // Respect saved settings if the selected device is the default camera (since it holds the user's preference/adjustment)
  if (selectedDeviceId.value && selectedDeviceId.value === settingsState.camera.defaultDeviceId) {
    width = parseInt(settingsState.camera.width) || 4096
    height = parseInt(settingsState.camera.height) || 2160
  }

  const constraints = {
    audio: false,
    video: {
      deviceId: selectedDeviceId.value ? { exact: selectedDeviceId.value } : undefined,
      width: { ideal: width },
      height: { ideal: height }
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStream = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      isStreaming.value = true

      // Get actual stream settings to display the resolution
      const track = stream.getVideoTracks()[0]
      if (track) {
        const settings = track.getSettings()
        currentWidth.value = settings.width || 0
        currentHeight.value = settings.height || 0

        // Wait briefly for the track to be fully active before applying torch
        setTimeout(() => {
          applyTorchState()
        }, 150)
      }
    }
  } catch (err) {
    console.error('getUserMedia failed:', err)
    errorMsg.value = 'Could not load camera stream: ' + err.message
  } finally {
    isInitializing.value = false
  }
}

const applyTorchState = async () => {
  if (!localStream) return
  const track = localStream.getVideoTracks()[0]
  if (!track) return

  try {
    const capabilities = typeof track.getCapabilities === 'function' ? track.getCapabilities() : {}
    isTorchSupported.value = !!capabilities.torch
  } catch (capabilitiesErr) {
    console.warn('Failed to get track capabilities:', capabilitiesErr)
    isTorchSupported.value = false
  }

  try {
    // Attempt standard torch constraint
    await track.applyConstraints({
      advanced: [{ torch: isTorchOn.value }]
    })
    console.log(`Successfully applied torch constraint: ${isTorchOn.value}`)
  } catch (err) {
    console.warn('Failed to apply standard torch constraint:', err)

    // Fallback 1: Try direct constraint property
    try {
      await track.applyConstraints({
        torch: isTorchOn.value
      })
      console.log(`Successfully applied direct torch constraint: ${isTorchOn.value}`)
    } catch (directErr) {
      console.warn('Failed to apply direct torch constraint:', directErr)

      // Fallback 2: Try fillLightMode constraint
      try {
        await track.applyConstraints({
          advanced: [{ fillLightMode: isTorchOn.value ? 'torch' : 'off' }]
        })
        console.log(`Successfully applied fillLightMode: ${isTorchOn.value ? 'torch' : 'off'}`)
      } catch (fillLightErr) {
        console.warn('Failed to apply fillLightMode constraint:', fillLightErr)
      }
    }
  }
}

const toggleTorch = async () => {
  isTorchOn.value = !isTorchOn.value
  await applyTorchState()
}

const captureImage = () => {
  if (!videoRef.value || !isStreaming.value) return

  // Play a brief visual flash
  showFlash.value = true
  setTimeout(() => {
    showFlash.value = false
  }, 150)

  // Capture canvas logic
  const video = videoRef.value
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth || currentWidth.value || 1280
  canvas.height = video.videoHeight || currentHeight.value || 1024

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0)
    emit('capture', dataUrl)
    close()
  }
}

// Watch modelValue to start/stop camera on open/close
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    initStream()
  } else {
    stopStream()
  }
})

onBeforeUnmount(() => {
  stopStream()
})
</script>

<style scoped>
.camera-card {
  background: rgba(30, 30, 35, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.bg-dark-viewport {
  background: #121214 !important;
}

.camera-select-dropdown {
  max-width: 300px;
}

.video-container {
  position: relative;
  background: #000;
  width: 100%;
  max-width: 640px;
  aspect-ratio: 4/3;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid rgba(255, 255, 255, 0.08);
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(18, 18, 20, 0.85);
  z-index: 2;
}

/* alignment target overlay style */
.camera-alignment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.target-crosshair {
  position: absolute;
  width: 30px;
  height: 30px;
}

.target-crosshair::before,
.target-crosshair::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
}

.target-crosshair::before {
  top: 14px;
  left: 0;
  width: 30px;
  height: 2px;
}

.target-crosshair::after {
  top: 0;
  left: 14px;
  width: 2px;
  height: 30px;
}

.target-circle {
  width: 180px;
  height: 180px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
}

.alignment-tip {
  position: absolute;
  bottom: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* flash capture animation */
.flash-active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  opacity: 0.85;
  z-index: 10;
  animation: flash-fade 0.15s ease-out;
}

@keyframes flash-fade {
  from { opacity: 0.85; }
  to { opacity: 0; }
}

.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
</style>
