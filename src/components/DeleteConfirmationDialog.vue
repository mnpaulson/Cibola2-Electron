<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" max-width="500px" :persistent="loading">
    <v-card class="rounded-lg">
      <v-card-item class="bg-error text-white py-3">
        <v-card-title class="text-subtitle-2 font-weight-bold d-flex align-center">
          <v-icon start class="mr-2">mdi-alert</v-icon>
          {{ title }}
        </v-card-title>
      </v-card-item>

      <v-card-text class="pa-4">
        <p v-if="warningMessage" class="text-body-2 mb-3" v-html="warningMessage"></p>
        
        <!-- Slot for custom layouts (like bullet points or list of items affected) -->
        <slot></slot>

        <!-- Safety Checklist Checkbox -->
        <v-checkbox
          v-if="checkboxLabel"
          v-model="confirmCheckbox"
          :label="checkboxLabel"
          color="error"
          density="compact"
          class="text-caption mt-0"
          hide-details
        ></v-checkbox>

        <!-- Confirmation Text Key Input -->
        <v-text-field
          v-if="confirmTextKey"
          v-model="confirmInput"
          :label="confirmTextPlaceholder || 'Type confirmation text *'"
          placeholder="Type here..."
          variant="outlined"
          density="compact"
          class="mt-4"
          hide-details
          @keydown.enter="submitIfValid"
        ></v-text-field>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-3 bg-light-surface d-flex justify-end gap-2">
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          size="small"
          :disabled="loading"
          @click="close"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          size="small"
          :loading="loading"
          :disabled="!isValid"
          @click="confirm"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  title: {
    type: String,
    default: 'Delete Confirmation'
  },
  warningMessage: {
    type: String,
    default: ''
  },
  confirmTextKey: {
    type: String,
    default: ''
  },
  confirmTextPlaceholder: {
    type: String,
    default: ''
  },
  checkboxLabel: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirmCheckbox = ref(false)
const confirmInput = ref('')

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    confirmCheckbox.value = false
    confirmInput.value = ''
  }
})

const isValid = computed(() => {
  if (props.loading) return false
  
  if (props.checkboxLabel && !confirmCheckbox.value) return false
  
  if (props.confirmTextKey) {
    const expected = props.confirmTextKey.trim().toLowerCase()
    const entered = confirmInput.value.trim().toLowerCase()
    if (expected !== entered || entered.length === 0) return false
  }
  
  return true
})

function close() {
  if (props.loading) return
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  if (isValid.value) {
    emit('confirm')
  }
}

function submitIfValid() {
  if (isValid.value) {
    confirm()
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
