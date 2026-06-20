<template>
  <v-bottom-navigation
    elevation="8"
    grow
    height="64"
    class="form-bottom-nav px-4"
  >
    <!-- Print & Close -->
    <v-btn
      v-if="showPrintClose"
      class="btn-print-close"
      :disabled="disablePrintClose"
      @click="$emit('save-print-close')"
    >
      <v-icon class="mb-1">mdi-check-all</v-icon>
      <span>Print & Close</span>
    </v-btn>

    <!-- Save / Update -->
    <v-btn
      class="btn-save"
      :disabled="disableSave"
      @click="$emit('save')"
    >
      <v-icon class="mb-1">{{ saveIcon }}</v-icon>
      <span>{{ saveLabel }}</span>
    </v-btn>

    <!-- Capture -->
    <v-btn
      v-if="showCapture"
      class="btn-capture"
      :disabled="disableCapture"
      @click="$emit('capture')"
    >
      <v-icon class="mb-1">mdi-camera</v-icon>
      <span>Capture</span>
    </v-btn>

    <!-- Print -->
    <v-btn
      v-if="showPrint"
      class="btn-print"
      :disabled="disablePrint"
      @click="$emit('print')"
    >
      <v-icon class="mb-1">mdi-printer</v-icon>
      <span>Print</span>
    </v-btn>

    <!-- Preview HTML -->
    <v-btn
      v-if="showPreview"
      class="btn-preview"
      @click="$emit('preview')"
    >
      <v-icon class="mb-1">mdi-file-document-outline</v-icon>
      <span>Preview</span>
    </v-btn>

    <!-- Discard (New records) / Delete (Saved records) -->
    <v-btn
      v-if="!showDelete"
      class="btn-discard"
      @click="$emit('discard')"
    >
      <v-icon class="mb-1">mdi-arrow-left</v-icon>
      <span>Discard</span>
    </v-btn>
    <v-btn
      v-else
      class="btn-delete"
      @click="$emit('delete')"
    >
      <v-icon class="mb-1">mdi-delete</v-icon>
      <span>Delete</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
defineProps({
  showDelete: {
    type: Boolean,
    default: false
  },
  showCapture: {
    type: Boolean,
    default: true
  },
  disableCapture: {
    type: Boolean,
    default: false
  },
  showPrint: {
    type: Boolean,
    default: true
  },
  disablePrint: {
    type: Boolean,
    default: false
  },
  showPreview: {
    type: Boolean,
    default: false
  },
  saveLabel: {
    type: String,
    default: 'Save'
  },
  saveIcon: {
    type: String,
    default: 'mdi-content-save-all'
  },
  disableSave: {
    type: Boolean,
    default: false
  },
  showPrintClose: {
    type: Boolean,
    default: false
  },
  disablePrintClose: {
    type: Boolean,
    default: false
  }
})

defineEmits(['discard', 'delete', 'capture', 'print', 'preview', 'save', 'save-print-close'])
</script>

<style scoped>
.form-bottom-nav {
  /* Premium glassmorphic background */
  backdrop-filter: blur(10px) saturate(180%);
  background-color: rgba(var(--v-theme-surface), 0.85) !important;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
  transition: all 0.3s ease;
}

/* Custom styling for Vuetify bottom navigation buttons */
.form-bottom-nav :deep(.v-btn) {
  height: 100% !important;
  border-radius: 0 !important;
  min-width: 80px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Subtle hover effects on buttons */
.form-bottom-nav :deep(.v-btn:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}

/* Action button custom colors */
.btn-print-close {
  color: rgb(var(--v-theme-primary)) !important;
}

.btn-save {
  color: rgb(var(--v-theme-success)) !important;
}

.btn-capture {
  color: rgb(var(--v-theme-secondary)) !important;
}

.btn-print {
  color: rgb(var(--v-theme-info)) !important;
}

.btn-preview {
  color: #fb8c00 !important; /* orange-darken-2 color */
}

.btn-discard {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}

.btn-delete {
  color: rgb(var(--v-theme-error)) !important;
}

/* Let the disabled states override the custom colors */
.form-bottom-nav :deep(.v-btn:disabled) {
  color: rgba(var(--v-theme-on-surface), 0.26) !important;
}
</style>
