<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="close"
    max-width="500px"
    :persistent="submitting"
  >
    <v-card class="rounded-lg overflow-hidden">
      <!-- Gradient Header -->
      <v-toolbar class="feedback-header text-white" flat>
        <v-toolbar-title class="text-subtitle-1 font-weight-bold d-flex align-center">
          <v-icon start class="mr-2">mdi-comment-text-outline</v-icon>
          Send Feedback to Developers
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-close"
          variant="text"
          :disabled="submitting"
          @click="close"
        ></v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <!-- Offline Warning Banner -->
        <v-alert
          v-if="isOffline"
          type="warning"
          variant="tonal"
          density="comfortable"
          class="mb-4 text-caption font-weight-medium"
          icon="mdi-wifi-off"
        >
          System is currently offline. Feedback submission will fail until the backend server is reconnected.
        </v-alert>

        <!-- Error Alert Banner -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="comfortable"
          class="mb-4 text-caption font-weight-medium"
          icon="mdi-alert-circle-outline"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-form ref="formRef" v-model="isFormValid" lazy-validation>
          <v-row dense>
            <!-- Category Selection -->
            <v-col cols="12">
              <v-select
                v-model="form.type"
                :items="categories"
                label="Feedback Category *"
                prepend-inner-icon="mdi-tag-outline"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-4"
              ></v-select>
            </v-col>

            <!-- Employee Selection -->
            <v-col cols="12">
              <v-select
                v-model="form.employeeName"
                :items="employeeOptions"
                label="Your Name (Optional)"
                prepend-inner-icon="mdi-account-tie-outline"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-4"
              ></v-select>
            </v-col>

            <!-- Feedback Message -->
            <v-col cols="12">
              <v-textarea
                v-model="form.message"
                label="Message *"
                placeholder="What can we improve or what went wrong?"
                prepend-inner-icon="mdi-pencil-outline"
                :rules="messageRules"
                variant="outlined"
                density="comfortable"
                rows="4"
                no-resize
                required
                class="mb-2"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>

        <!-- Active Page Context Hint (Subtle text showing what context will be sent) -->
        <div class="text-caption text-medium-emphasis mt-2 d-flex align-center">
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          Auto-sending page context: <strong class="ml-1 text-primary">{{ resolvedPageContext }}</strong>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-light-surface d-flex justify-end gap-2">
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          size="small"
          class="text-none font-weight-medium px-4"
          :disabled="submitting"
          @click="close"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          class="text-none font-weight-medium px-4"
          :loading="submitting"
          :disabled="!isFormValid || !form.message || isOffline"
          @click="handleSubmit"
        >
          Submit Feedback
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { api } from '../utils/api'
import { sessionState } from '../store/session'
import { metadataState } from '../store/metadata'
import { showToast } from '../store/toast'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// Component State
const formRef = ref(null)
const isFormValid = ref(true)
const submitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  type: 'General Suggestion',
  employeeName: 'Unassigned',
  message: ''
})

const categories = [
  'Bug Report',
  'Feature Request',
  'General Suggestion',
  'Other'
]

// Rules
const messageRules = [
  v => !!v || 'Feedback message is required',
  v => (v && v.trim().length > 0) || 'Message cannot be empty or whitespace only'
]

// Offline check
const isOffline = computed(() => sessionState.connectionStatus === 'offline')

// Extract employee list from cache metadata store
const employeeOptions = computed(() => {
  const list = (metadataState.employees || [])
    .filter(emp => emp.active === 1)
    .map(emp => emp.name)
  
  // Guarantee 'Unassigned' is present and at the top of the list
  const cleanList = list.filter(name => name !== 'Unassigned')
  cleanList.unshift('Unassigned')
  return cleanList
})

// Auto-resolve current page tab name and state context
const resolvedPageContext = computed(() => {
  const tab = sessionState.activeTab
  switch (tab) {
    case 'dashboard':
      return 'Dashboard'
    case 'customers':
      if (sessionState.selectedCustomerId) {
        return `Customer Profile (ID: ${sessionState.selectedCustomerId})`
      }
      return 'Customer Directory'
    case 'jobs':
      if (sessionState.activeJobId === 0) {
        return 'Create Job Form'
      } else if (sessionState.activeJobId) {
        return `Job Form (ID: ${sessionState.activeJobId})`
      }
      return 'Jobs Directory'
    case 'credits':
      if (sessionState.activeCreditId === 0) {
        return 'Create Gold Credit Form'
      } else if (sessionState.activeCreditId) {
        return `Gold Credit Form (ID: ${sessionState.activeCreditId})`
      }
      return 'Gold Credits Directory'
    case 'custom':
      if (sessionState.activeSheetId === 0) {
        return 'Create Custom Sheet Form'
      } else if (sessionState.activeSheetId) {
        return `Custom Sheet Form (ID: ${sessionState.activeSheetId})`
      }
      return 'Custom Sheets Directory'
    case 'config':
      return 'Configuration Settings'
    default:
      return tab ? `Tab: ${tab}` : 'Unknown View'
  }
})

// Reset form data when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    form.type = 'General Suggestion'
    form.employeeName = 'Unassigned'
    form.message = ''
    errorMessage.value = ''
    if (formRef.value) {
      formRef.value.resetValidation()
    }
  }
})

function close() {
  if (submitting.value) return
  emit('update:modelValue', false)
}

async function handleSubmit() {
  if (formRef.value) {
    const validateRes = await formRef.value.validate()
    if (!validateRes.valid) return
  }

  if (isOffline.value) {
    errorMessage.value = 'Cannot submit feedback while offline.'
    return
  }

  submitting.value = true
  errorMessage.value = ''

  const payload = {
    message: form.message.trim(),
    type: form.type,
    employeeName: form.employeeName,
    page: resolvedPageContext.value
  }

  try {
    // API utility automatically parses response and returns the data block or throws error on success === false
    await api.post('/feedback', payload)
    
    // Trigger global Snackbar toast notification
    showToast('Thank you! Your feedback has been sent directly to the development team.', 'success')
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Failed to submit feedback:', err)
    errorMessage.value = err.message || 'An unexpected error occurred while sending feedback.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feedback-header {
  background: linear-gradient(45deg, #1867C0, #5CBBF6) !important;
}
.gap-2 {
  gap: 8px;
}
.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
