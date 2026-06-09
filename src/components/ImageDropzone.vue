<template>
  <v-card
    class="image-dropzone d-flex flex-column align-center justify-center cursor-pointer transition-all"
    :class="{
      'dropzone-dragging': isDragging,
      'dropzone-compact': compact,
      'dropzone-expanded': !compact
    }"
    variant="outlined"
    @dragover.prevent="onDragOver"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="triggerFileInput"
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

    <!-- Compact Layout -->
    <template v-if="compact">
      <v-icon size="32" color="primary" class="mb-1">mdi-image-plus</v-icon>
      <span class="text-caption font-weight-bold text-medium-emphasis">Add Photo</span>
      <span class="text-caption-2 text-disabled text-center px-2">Drag or Click</span>
    </template>

    <!-- Expanded Layout -->
    <template v-else>
      <v-icon size="48" color="primary" class="mb-2">mdi-cloud-upload-outline</v-icon>
      <span class="text-body-1 font-weight-bold text-center mb-1">
        Drag & drop jewelry photos here
      </span>
      <span class="text-body-2 text-medium-emphasis text-center mb-2">
        or <span class="text-primary font-weight-medium">click to browse</span> files
      </span>
      <span class="text-caption text-disabled">
        Supports JPEG, PNG, WEBP
      </span>
    </template>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['upload'])

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
      alert('Only image files are supported.')
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
.image-dropzone {
  border-style: dashed !important;
  border-width: 2px !important;
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  background-color: rgba(var(--v-theme-surface-variant), 0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.image-dropzone:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.04);
  transform: translateY(-1px);
}

.dropzone-dragging {
  border-color: rgb(var(--v-theme-success)) !important;
  background-color: rgba(var(--v-theme-success), 0.08) !important;
  box-shadow: 0 0 10px rgba(var(--v-theme-success), 0.2);
  transform: scale(0.99);
}

.dropzone-expanded {
  min-height: 180px;
  width: 100%;
  padding: 24px;
  border-radius: 12px;
}

.dropzone-compact {
  height: 150px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.transition-all {
  transition: all 0.2s ease;
}

.text-caption-2 {
  font-size: 0.7rem;
}
</style>
