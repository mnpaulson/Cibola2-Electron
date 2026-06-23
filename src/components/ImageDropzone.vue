<template>
  <v-card
    class="image-dropzone-container d-flex flex-column"
    :class="{
      'dropzone-compact': compact,
      'dropzone-expanded': !compact
    }"
    variant="flat"
  >
    <!-- Hidden file input -->
    <input
      type="file"
      ref="fileInputRef"
      accept="image/*"
      multiple
      class="d-none"
      @change="onFileChange"
    />

    <!-- Top Half: Capture Button -->
    <div
      class="capture-area d-flex align-center justify-center cursor-pointer text-primary"
      @click="emit('open-camera')"
    >
      <v-icon size="24" class="mr-2">mdi-camera</v-icon>
      <span class="text-subtitle-2 font-weight-bold">Capture Photo</span>
    </div>

    <v-divider></v-divider>

    <!-- Bottom Half: Drop Zone -->
    <div
      class="drop-area d-flex flex-column align-center justify-center cursor-pointer"
      :class="{ 'dropzone-dragging': isDragging }"
      @dragover.prevent="onDragOver"
      @dragenter.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <!-- Compact Layout -->
      <template v-if="compact">
        <v-icon size="24" color="primary" class="mb-0.5">mdi-image-plus</v-icon>
        <span class="text-caption font-weight-bold text-medium-emphasis">Upload Photo</span>
        <span class="text-caption-2 text-disabled text-center">Drag or Click</span>
      </template>

      <!-- Expanded Layout -->
      <template v-else>
        <v-icon size="36" color="primary" class="mb-1">mdi-cloud-upload-outline</v-icon>
        <span class="text-body-2 font-weight-bold text-center">
          Drag & drop photos here
        </span>
        <span class="text-caption text-medium-emphasis text-center">
          or <span class="text-primary font-weight-semibold">click to browse</span>
        </span>
      </template>
    </div>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from '../store/toast'

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['upload', 'open-camera'])

const fileInputRef = ref(null)
const isDragging = ref(false)

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const onFileChange = (e) => {
  if (e.target.files) {
    processFiles(e.target.files)
  }
}

const onDragOver = (e) => {
  isDragging.value = true
}

const onDragEnter = (e) => {
  isDragging.value = true
}

const onDragLeave = (e) => {
  isDragging.value = false
}

const onDrop = (e) => {
  isDragging.value = false
  if (e.dataTransfer && e.dataTransfer.files) {
    processFiles(e.dataTransfer.files)
  }
}

const processFiles = (files) => {
  Array.from(files).forEach((file) => {
    if (!file.type.startsWith('image/')) {
      showToast('Only image files are supported.', 'warning')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        emit('upload', e.target.result)
      }
    }
    reader.readAsDataURL(file)
  })
  
  // Clear the input value so the same file can be uploaded again if deleted
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<style scoped>
.image-dropzone-container {
  border: 2px dashed rgba(var(--v-theme-primary), 0.4) !important;
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface-variant), 0.02);
  transition: border-color 0.25s ease;
  overflow: hidden;
  box-sizing: border-box;
}

.image-dropzone-container:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
}

.dropzone-compact {
  height: 232px;
  width: 100%;
}

.dropzone-expanded {
  min-height: 185px;
  width: 100%;
}

.capture-area {
  height: 50%;
  width: 100%;
  transition: all 0.2s ease;
  background-color: transparent;
  flex: 1;
  user-select: none;
}

.capture-area:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.drop-area {
  height: 50%;
  width: 100%;
  transition: all 0.2s ease;
  background-color: transparent;
  flex: 1;
  user-select: none;
}

.drop-area:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.dropzone-dragging {
  background-color: rgba(var(--v-theme-success), 0.08) !important;
  box-shadow: inset 0 0 10px rgba(var(--v-theme-success), 0.15);
}

.text-caption-2 {
  font-size: 0.7rem;
}
</style>
