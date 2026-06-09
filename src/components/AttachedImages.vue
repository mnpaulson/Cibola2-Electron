<template>
  <div class="attached-images-container mt-4">
    <!-- Header -->
    <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
      <v-icon start class="mr-2" color="primary">mdi-camera-image</v-icon>
      {{ title }} ({{ images.length }})
    </div>

    <!-- Attached Jewelry Images Grid -->
    <v-row dense v-if="images.length > 0">
      <!-- Dropzone tile inside grid -->
      <v-col cols="12" sm="6" md="4" lg="3">
        <ImageDropzone :compact="true" @upload="handlePhotoCaptured" />
      </v-col>

      <v-col
        v-for="(img, idx) in images"
        :key="idx"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="image-thumbnail-card" border elevation="1">
          <v-btn
            icon="mdi-delete"
            color="error"
            variant="flat"
            size="x-small"
            class="remove-image-btn"
            @click="confirmRemoveImage(idx)"
          ></v-btn>
          
          <v-img
            :src="getImageUrl(img.image)"
            height="150px"
            cover
            class="cursor-zoom-in"
            @click="openLightbox(img.image)"
          ></v-img>

          <v-card-text class="pa-2 bg-light-surface">
            <v-textarea
              v-model="img.note"
              placeholder="Add details about this photo..."
              variant="outlined"
              density="compact"
              rows="2"
              no-resize
              hide-details
              class="text-caption"
            ></v-textarea>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <div v-else class="mb-4">
      <ImageDropzone @upload="handlePhotoCaptured" />
    </div>

    <!-- Camera dialog integration -->
    <CameraCapture v-model="isCameraOpen" @capture="handlePhotoCaptured" />

    <!-- Lightbox Modal -->
    <v-dialog v-model="isLightboxOpen" max-width="80vw" class="lightbox-dialog">
      <v-card class="bg-black border-none overflow-hidden d-flex justify-center align-center">
        <v-btn icon="mdi-close" color="white" variant="text" class="lightbox-close-btn" @click="isLightboxOpen = false"></v-btn>
        <img :src="getImageUrl(lightboxImage)" class="lightbox-image" alt="Lightbox Preview" />
      </v-card>
    </v-dialog>

    <!-- Delete Image Modal -->
    <DeleteConfirmationDialog
      v-model="isDeleteImgOpen"
      title="Delete Saved Photo"
      warning-message="Are you sure you want to delete this photo? This will permanently delete the file from the server. This action cannot be undone."
      :loading="loading"
      @confirm="deleteSavedImage"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from '../utils/api'
import { settingsState } from '../store/settings'
import CameraCapture from './CameraCapture.vue'
import ImageDropzone from './ImageDropzone.vue'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => []
  },
  deleteEndpoint: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Images'
  }
})

const emit = defineEmits(['update:modelValue'])

const images = computed({
  get() {
    return props.modelValue || []
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const loading = ref(false)
const isCameraOpen = ref(false)
const isLightboxOpen = ref(false)
const lightboxImage = ref('')

const isDeleteImgOpen = ref(false)
const deleteImgIndex = ref(null)
const deleteImgId = ref(null)

function getImageUrl(imgStr) {
  if (!imgStr) return ''
  if (imgStr.startsWith('data:')) {
    return imgStr
  }
  const base = settingsState.serverURL.replace(/\/$/, '')
  const path = imgStr.startsWith('/') ? imgStr : `/${imgStr}`
  return `${base}${path}`
}

function handlePhotoCaptured(dataUrl) {
  const updated = [...images.value, {
    id: null,
    image: dataUrl,
    note: ''
  }]
  emit('update:modelValue', updated)
}

function openLightbox(imgStr) {
  lightboxImage.value = imgStr
  isLightboxOpen.value = true
}

function confirmRemoveImage(index) {
  const target = images.value[index]
  if (target && target.id !== null && target.id !== undefined) {
    deleteImgId.value = target.id
    deleteImgIndex.value = index
    isDeleteImgOpen.value = true
  } else {
    const updated = [...images.value]
    updated.splice(index, 1)
    emit('update:modelValue', updated)
  }
}

async function deleteSavedImage() {
  if (deleteImgId.value === null) return
  loading.value = true
  try {
    const res = await api.delete(`${props.deleteEndpoint}/${deleteImgId.value}`)
    if (res) {
      const updated = [...images.value]
      updated.splice(deleteImgIndex.value, 1)
      emit('update:modelValue', updated)
      isDeleteImgOpen.value = false
      deleteImgId.value = null
      deleteImgIndex.value = null
    }
  } catch (err) {
    console.error('Failed to delete image:', err)
  } finally {
    loading.value = false
  }
}

function openCamera() {
  isCameraOpen.value = true
}

defineExpose({
  openCamera
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.image-thumbnail-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-thumbnail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.cursor-zoom-in {
  cursor: zoom-in;
}

.lightbox-dialog :deep(.v-overlay__content) {
  background: transparent !important;
  box-shadow: none !important;
}

.lightbox-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  background: rgba(0,0,0,0.4);
}

.lightbox-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
}

.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
