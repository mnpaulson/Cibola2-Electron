<template>
  <v-card class="job-card pb-20" elevation="3" :loading="loading">
    <!-- Header -->
    <v-card-item class="bg-primary text-white py-3">
      <v-card-title class="font-weight-bold text-subtitle-1 d-flex align-center">
        <v-icon start class="mr-2">mdi-briefcase-outline</v-icon>
        {{ job.id ? `Edit Job #${job.id}` : 'Create New Job' }}
        <v-spacer></v-spacer>
        <span v-if="job.created_at" class="text-caption font-weight-medium">
          Created: {{ formatDate(job.created_at) }}
        </span>
      </v-card-title>
    </v-card-item>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Inline Customer Lookup Field -->
      <div class="mb-4 d-flex align-center gap-2">
        <div class="flex-grow-1">
          <CustomerForm
            v-model="job.customer_id"
            :clearable="true"
            :hide-notes="false"
            :clickable-name="true"
            :lock-notes="true"
            @select="handleCustomerSelect"
            @click-name="navigateTo('customers', { selectedCustomerId: job.customer_id })"
            @dirty-state-change="isCustomerDirty = $event"
          />
        </div>

      </div>

      <v-form ref="formRef" v-model="isFormValid" lazy-validation>
        <v-row>
          <!-- Left Column inputs -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="job.estimate"
              label="Estimate ($)"
              prepend-inner-icon="mdi-currency-usd"
              :rules="decimalRules"
              variant="outlined"
              density="compact"
            ></v-text-field>

            <v-select
              v-model="job.employee_id"
              :items="activeEmployees"
              item-title="name"
              item-value="id"
              label="Assigned Employee *"
              prepend-inner-icon="mdi-account-tie"
              :rules="requiredRules"
              variant="outlined"
              density="compact"
            ></v-select>

            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="dueDateModel"
                  label="Due Date"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  variant="outlined"
                  density="compact"
                  clearable
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dueDateValue"
                no-title
                color="primary"
                @update:model-value="dateMenu = false"
              ></v-date-picker>
            </v-menu>

            <v-text-field
              v-model="job.deposit"
              label="Deposit ($)"
              prepend-inner-icon="mdi-cash"
              :rules="decimalRules"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>

          <!-- Right Column inputs -->
          <v-col cols="12" md="6" class="d-flex flex-column">
            <v-textarea
              v-model="job.est_note"
              label="Estimate Details (Visible on customer slip)"
              variant="outlined"
              rows="3"
              no-resize
              density="compact"
              class="custom-est-textarea"
            ></v-textarea>
          </v-col>

          <!-- Bottom Job Note -->
          <v-col cols="12">
            <v-textarea
              v-model="job.note"
              label="Job Notes"
              variant="outlined"
              rows="3"
              counter="230"
              maxlength="230"
              density="compact"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-form>

      <!-- Attached Jewelry Images Grid -->
      <v-row class="mt-4">
        <v-col cols="12">
          <AttachedImages
            ref="attachedImagesRef"
            v-model="job.job_images"
            delete-endpoint="/jobs/images"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Delete Job Modal -->
    <DeleteConfirmationDialog
      v-model="isDeleteJobOpen"
      title="Delete Job"
      warning-message="Are you sure you want to delete this entire job and all its attached images? This action is permanent."
      :loading="loading"
      @confirm="submitDeleteJob"
    />

    <!-- Actions Footer Navigation -->
    <FormBottomNavigation
      :show-delete="!!job.id"
      :show-preview="true"
      :save-label="job.id ? 'Update Job' : 'Save Job'"
      :disable-save="!isFormValid || isCustomerDirty"
      :show-print-close="true"
      :disable-print-close="!isFormValid || isCustomerDirty"
      :disable-print="isCustomerDirty"
      :customer-dirty="isCustomerDirty"
      @discard="discardJob"
      @delete="isDeleteJobOpen = true"
      @capture="attachedImagesRef?.openCamera()"
      @print="printOnly"
      @preview="downloadPrintPreview"
      @save="saveOrUpdateJob(false, false)"
      @save-print-close="saveOrUpdateJob(true, true)"
    />
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { api } from '../utils/api'
import { settingsState } from '../store/settings'
import { metadataState } from '../store/metadata'
import { navigateBack, navigateTo } from '../store/session'
import { formatLocalDate } from '../utils/dates'
import { generateJobPrintHTML } from '../utils/jobPrintTemplate'
import { showToast } from '../store/toast'
import { removeRecentRecord, refreshRecentRecord } from '../store/recentlyViewed'
import AttachedImages from './AttachedImages.vue'
import CustomerForm from './CustomerForm.vue'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import FormBottomNavigation from './FormBottomNavigation.vue'

const formatDate = (dateStr) => formatLocalDate(dateStr, 'short')


const props = defineProps({
  customerId: {
    type: Number,
    default: null
  },
  jobId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['customerId', 'update:jobId', 'update:customerId', 'saved'])

// Component Local State
const formRef = ref(null)
const loading = ref(false)
const isFormValid = ref(true)
const attachedImagesRef = ref(null)
const isCustomerDirty = ref(false)

const isDeleteJobOpen = ref(false)

const customerObj = ref(null)
const dateMenu = ref(false)

const dueDateModel = computed({
  get() {
    return formatDate(job.due_date)
  },
  set(val) {
    if (!val) {
      job.due_date = ''
    }
  }
})

const dueDateValue = computed({
  get() {
    if (!job.due_date) return null
    const parts = job.due_date.split('-')
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
    }
    return null
  },
  set(val) {
    if (!val) {
      job.due_date = ''
      return
    }
    const dateObj = new Date(val)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    job.due_date = `${year}-${month}-${day}`
  }
})

const job = reactive({
  id: null,
  customer_id: null,
  employee_id: 1, // Default 'Unassigned'
  estimate: '',
  deposit: '',
  est_note: '',
  note: '',
  appraisal: false,
  vital_date: true,
  due_date: '',
  completed_at: '',
  created_at: '',
  job_images: []
})

// Rules
const requiredRules = [v => !!v || 'Required']
const decimalRules = [
  v => {
    if (!v) return true
    const pattern = /^\d*(,\d+)*[\.]?\d*?$/
    return pattern.test(v) || 'Must be a valid numeric amount'
  }
]

// Computed Cache for Employees
const activeEmployees = computed(() => {
  return metadataState.employees || []
})

const today = computed(() => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Fetch customer when customerId prop updates
watch(() => props.customerId, async (newId) => {
  if (newId && newId !== job.customer_id) {
    job.customer_id = newId
    try {
      customerObj.value = await api.get(`/customers/${newId}`)
      emit('customerId', newId)
    } catch (err) {
      console.error('Failed to load customer details:', err)
    }
  } else if (!newId && props.jobId === null) {
    customerObj.value = null
    job.customer_id = null
  }
}, { immediate: true })

const handleCustomerSelect = (custObj) => {
  customerObj.value = custObj
  if (custObj) {
    job.customer_id = custObj.id
    emit('customerId', custObj.id)
    emit('update:customerId', custObj.id)
  } else {
    job.customer_id = null
    emit('customerId', null)
    emit('update:customerId', null)
  }
}

// Watch jobId to load existing job details
watch(() => props.jobId, (newId) => {
  resetJobFields()
  if (newId && newId !== 0) {
    loadJob(newId)
  }
}, { immediate: true })



// Reset fields
function resetJobFields() {
  job.id = null
  job.customer_id = props.customerId
  job.employee_id = 1
  job.estimate = ''
  job.deposit = ''
  job.est_note = ''
  job.note = ''
  job.appraisal = false
  job.vital_date = true
  job.due_date = ''
  job.completed_at = ''
  job.created_at = ''
  job.job_images = []
}

// Load Job details from API
async function loadJob(id) {
  loading.value = true
  try {
    const data = await api.get(`/jobs/${id}`)
    if (data) {
      job.id = data.id
      job.customer_id = data.customer_id
      job.employee_id = data.employee_id || 1
      job.estimate = data.estimate !== null && data.estimate !== undefined ? String(data.estimate) : ''
      job.deposit = data.deposit !== null && data.deposit !== undefined ? String(data.deposit) : ''
      job.est_note = data.est_note || ''
      job.note = data.note || ''
      job.appraisal = !!data.appraisal
      job.vital_date = !!data.vital_date
      job.due_date = data.due_date ? data.due_date.split(' ')[0].split('T')[0] : ''
      job.completed_at = data.completed_at || ''
      job.created_at = data.created_at || ''
      job.job_images = data.job_images || []
    }
  } catch (err) {
    console.error('Failed to load job details:', err)
  } finally {
    loading.value = false
  }
}



// Note: handlePhotoCaptured, openLightbox, confirmRemoveImage, and deleteSavedImage are now handled in AttachedImages.vue

// Job Create/Update submission
async function saveOrUpdateJob(print = false, close = false) {
  if (isCustomerDirty.value) {
    showToast('Please save or discard customer note/profile changes first.', 'warning')
    return
  }

  // Validate fields
  if (formRef.value) {
    const validateRes = await formRef.value.validate()
    if (!validateRes.valid) return
  }

  if (!job.customer_id) {
    showToast('Please select a customer first.', 'warning')
    return
  }

  loading.value = true
  try {
    let savedJob
    if (job.id) {
      // Update
      savedJob = await api.put(`/jobs/${job.id}`, job)
    } else {
      // Create
      savedJob = await api.post('/jobs', job)
    }

    if (savedJob) {
      Object.assign(job, savedJob)
      emit('update:jobId', savedJob.id)
      emit('saved', savedJob)
      refreshRecentRecord('job', savedJob.id)

      if (print) {
        await executeHeadlessPrint()
      }

      if (close) {
        navigateBack()
      } else if (!job.id) {
        // Switch view to edit mode for the saved job
        loadJob(savedJob.id)
      }
    }
  } catch (err) {
    console.error('Failed to save job:', err)
    showToast('Failed to save job: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

// Print and close / Print only
async function printOnly() {
  if (isCustomerDirty.value) {
    showToast('Please save or discard customer note/profile changes first.', 'warning')
    return
  }
  if (!job.id) {
    // Save first to get an ID before printing
    await saveOrUpdateJob(true, false)
  } else {
    await executeHeadlessPrint()
  }
}

function downloadPrintPreview() {
  const htmlContent = generateJobPrintHTML({
    job,
    customer: customerObj.value,
    activeEmployees: activeEmployees.value
  })
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `job-${job.id || 'new'}-print-preview.html`
  a.click()
  URL.revokeObjectURL(url)
}

function discardJob() {
  navigateBack()
}

async function submitDeleteJob() {
  if (!job.id) return
  loading.value = true
  try {
    const jobIdToDelete = job.id
    const res = await api.delete(`/jobs/${jobIdToDelete}`)
    if (res) {
      removeRecentRecord('job', jobIdToDelete)
      isDeleteJobOpen.value = false
      navigateBack()
    }
  } catch (err) {
    console.error('Failed to delete job:', err)
    showToast('Failed to delete job: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

// HEADLESS PRINT ENGINE
async function executeHeadlessPrint() {
  if (!settingsState.printers.job) {
    showToast('Please select a printer for Jobs in Configuration settings.', 'warning')
    return
  }

  const htmlContent = generateJobPrintHTML({
    job,
    customer: customerObj.value,
    activeEmployees: activeEmployees.value
  })

  try {
    const printResult = await window.electronAPI.printDocument({
      printerName: settingsState.printers.job,
      htmlContent
    })

    if (!printResult || !printResult.success) {
      showToast('Printing failed: ' + (printResult?.error || 'Unknown printer queue error'), 'error')
    }
  } catch (err) {
    console.error('IPC Print error:', err)
    showToast('IPC Connection failed: ' + err.message, 'error')
  }
}

</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}

.job-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}

.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}



.urgent-date-input :deep(input) {
  color: rgb(var(--v-theme-error)) !important;
  font-weight: bold;
}

@media (min-width: 960px) {
  .custom-est-textarea {
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
  }
  .custom-est-textarea :deep(.v-input__control) {
    flex-grow: 1;
  }
  .custom-est-textarea :deep(.v-field) {
    height: 100%;
  }
  .custom-est-textarea :deep(.v-field__field) {
    height: 100%;
  }
  .custom-est-textarea :deep(textarea) {
    height: 100% !important;
  }
}
</style>
