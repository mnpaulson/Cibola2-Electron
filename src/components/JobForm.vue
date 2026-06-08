<template>
  <v-card class="job-card" elevation="3" :loading="loading">
    <!-- Header -->
    <v-card-item class="bg-primary text-white py-3">
      <v-card-title class="font-weight-bold text-subtitle-1 d-flex align-center">
        <v-icon start class="mr-2">mdi-wrench</v-icon>
        {{ job.id ? `Edit Job #${job.id}` : 'Create New Repair Job' }}
        <v-spacer></v-spacer>
        <span v-if="job.created_at" class="text-caption font-weight-medium">
          Created: {{ formatDate(job.created_at) }}
        </span>
      </v-card-title>
    </v-card-item>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Inline Customer Lookup Field -->
      <div class="mb-4">
        <CustomerForm
          v-model="job.customer_id"
          :clearable="true"
          :hide-notes="true"
          @select="handleCustomerSelect"
        />
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
          <v-col cols="12" md="6">
            <v-textarea
              v-model="job.est_note"
              label="Estimate Details (Gold karat, gems, layout info)"
              variant="outlined"
              rows="3"
              no-resize
              density="compact"
            ></v-textarea>


          </v-col>

          <!-- Bottom Job Note -->
          <v-col cols="12">
            <v-textarea
              v-model="job.note"
              label="Job Notes (Visible on receipt ticket)"
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
      <div class="mt-4">
        <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
          <v-icon start class="mr-2" color="primary">mdi-camera-image</v-icon>
          Attached Jewelry Photos ({{ job.job_images.length }})
        </div>

        <v-row dense v-if="job.job_images.length > 0">
          <v-col
            v-for="(img, idx) in job.job_images"
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
        <div v-else class="text-caption text-medium-emphasis italic pa-4 border rounded-lg text-center bg-light-surface">
          No photos attached. Click the 'Capture' button below to add photos of the jewelry item.
        </div>
      </div>
    </v-card-text>

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
    <v-dialog v-model="isDeleteImgOpen" max-width="400px">
      <v-card class="rounded-lg">
        <v-card-item class="bg-error text-white py-3">
          <v-card-title class="text-subtitle-2 font-weight-bold">
            <v-icon start class="mr-2">mdi-alert</v-icon>
            Delete Saved Photo
          </v-card-title>
        </v-card-item>
        <v-card-text class="pa-4 text-body-2">
          Are you sure you want to delete this photo? This will permanently delete the file from the server. This action cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-3 bg-light-surface d-flex justify-end gap-2">
          <v-btn color="grey-darken-1" variant="outlined" size="small" @click="isDeleteImgOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" size="small" @click="deleteSavedImage">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Job Modal -->
    <v-dialog v-model="isDeleteJobOpen" max-width="400px">
      <v-card class="rounded-lg">
        <v-card-item class="bg-error text-white py-3">
          <v-card-title class="text-subtitle-2 font-weight-bold">
            <v-icon start class="mr-2">mdi-alert</v-icon>
            Delete Repair Job
          </v-card-title>
        </v-card-item>
        <v-card-text class="pa-4 text-body-2">
          Are you sure you want to delete this entire repair job and all its attached images? This action is permanent.
        </v-card-text>
        <v-card-actions class="pa-3 bg-light-surface d-flex justify-end gap-2">
          <v-btn color="grey-darken-1" variant="outlined" size="small" @click="isDeleteJobOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" size="small" @click="submitDeleteJob">Delete Job</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Actions Footer Navigation -->
    <v-divider></v-divider>
    <v-card-actions class="pa-3 bg-light-surface d-flex flex-wrap justify-end gap-2">
      <v-btn
        color="grey-darken-2"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        size="small"
        @click="discardJob"
      >
        Discard
      </v-btn>
      <v-btn
        v-if="job.id"
        color="error"
        variant="outlined"
        prepend-icon="mdi-delete"
        size="small"
        @click="isDeleteJobOpen = true"
      >
        Delete
      </v-btn>
      <v-btn
        color="secondary"
        variant="elevated"
        prepend-icon="mdi-camera"
        size="small"
        @click="isCameraOpen = true"
      >
        Capture
      </v-btn>
      <v-btn
        color="info"
        variant="elevated"
        prepend-icon="mdi-print"
        size="small"
        @click="printOnly"
      >
        Print
      </v-btn>
      <v-btn
        color="success"
        variant="flat"
        prepend-icon="mdi-content-save-all"
        size="small"
        :disabled="!isFormValid"
        @click="saveOrUpdateJob(false, false)"
      >
        {{ job.id ? 'Update Job' : 'Save Job' }}
      </v-btn>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-done-all"
        size="small"
        :disabled="!isFormValid"
        @click="saveOrUpdateJob(true, true)"
      >
        Print & Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { api } from '../utils/api'
import { settingsState } from '../store/settings'
import { metadataState } from '../store/metadata'
import { navigateBack } from '../store/session'
import CameraCapture from './CameraCapture.vue'
import CustomerForm from './CustomerForm.vue'

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
const isCameraOpen = ref(false)
const isLightboxOpen = ref(false)
const lightboxImage = ref('')

const isDeleteImgOpen = ref(false)
const deleteImgIndex = ref(null)
const deleteImgId = ref(null)

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

// Image Utilities
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
  job.job_images.push({
    id: null,
    image: dataUrl,
    note: ''
  })
}

function openLightbox(imgStr) {
  lightboxImage.value = imgStr
  isLightboxOpen.value = true
}

function confirmRemoveImage(index) {
  const target = job.job_images[index]
  if (target && target.id !== null && target.id !== undefined) {
    deleteImgId.value = target.id
    deleteImgIndex.value = index
    isDeleteImgOpen.value = true
  } else {
    job.job_images.splice(index, 1)
  }
}

async function deleteSavedImage() {
  if (deleteImgId.value === null) return
  loading.value = true
  try {
    const res = await api.delete(`/jobs/images/${deleteImgId.value}`)
    if (res) {
      job.job_images.splice(deleteImgIndex.value, 1)
      isDeleteImgOpen.value = false
      deleteImgId.value = null
      deleteImgIndex.value = null
    }
  } catch (err) {
    console.error('Failed to delete job image:', err)
  } finally {
    loading.value = false
  }
}

// Job Create/Update submission
async function saveOrUpdateJob(print = false, close = false) {
  // Validate fields
  if (formRef.value) {
    const validateRes = await formRef.value.validate()
    if (!validateRes.valid) return
  }

  if (!job.customer_id) {
    alert('Please select a customer first.')
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
    alert('Failed to save job: ' + err.message)
  } finally {
    loading.value = false
  }
}

// Print and close / Print only
async function printOnly() {
  if (!job.id) {
    // Save first to get an ID before printing
    await saveOrUpdateJob(true, false)
  } else {
    await executeHeadlessPrint()
  }
}

function discardJob() {
  navigateBack()
}

async function submitDeleteJob() {
  if (!job.id) return
  loading.value = true
  try {
    const res = await api.delete(`/jobs/${job.id}`)
    if (res) {
      isDeleteJobOpen.value = false
      navigateBack()
    }
  } catch (err) {
    console.error('Failed to delete job:', err)
    alert('Failed to delete job: ' + err.message)
  } finally {
    loading.value = false
  }
}

// HEADLESS PRINT ENGINE
async function executeHeadlessPrint() {
  if (!settingsState.printers.job) {
    alert('Please select a printer for Repair Jobs in Configuration settings.')
    return
  }

  const htmlContent = generatePrintHTML()

  try {
    const printResult = await window.electronAPI.printDocument({
      printerName: settingsState.printers.job,
      htmlContent
    })

    if (!printResult || !printResult.success) {
      alert('Printing failed: ' + (printResult?.error || 'Unknown printer queue error'))
    }
  } catch (err) {
    console.error('IPC Print error:', err)
    alert('IPC Connection failed: ' + err.message)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const clean = dateStr.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const parts = clean.split('-')
      return `${parts[1]}-${parts[2]}-${parts[0].slice(-2)}`
    }
    let parseableStr = clean
    if (clean.includes(' ') && !clean.includes('T')) {
      parseableStr = clean.replace(' ', 'T') + 'Z'
    }
    const date = new Date(parseableStr)
    if (isNaN(date.getTime())) return dateStr
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yy = String(date.getFullYear()).slice(-2)
    return `${mm}-${dd}-${yy}`
  } catch {
    return dateStr
  }
}

function generatePrintHTML() {
  const emp = activeEmployees.value.find(e => e.id === job.employee_id)
  const empName = emp ? emp.name : 'Unassigned'
  const estVal = parseFloat(String(job.estimate).replace(/,/g, '')) || 0
  const depVal = parseFloat(String(job.deposit).replace(/,/g, '')) || 0
  
  const createdDateStr = formatDate(job.created_at || new Date().toISOString())
  const dueDateStr = job.due_date ? formatDate(job.due_date) : ''

  // Process images
  let imagesHTML = ''
  let customerImagesHTML = ''

  job.job_images.forEach(img => {
    const fullUrl = getImageUrl(img.image)
    imagesHTML += `
      <div class="cb-print-element cb-print-image-cont">
        <img src="${fullUrl}" class="cb-print-image cb-print-element" />
        <div class="cb-print-element cb-print-image-note">${img.note || ''}</div>
      </div>
    `
    customerImagesHTML += `
      <div class="cb-print-element cb-print-cus-img-cont">
        <img src="${fullUrl}" class="cb-print-cust-img cb-print-element" />
      </div>
    `
  })

  // Full server path for logo
  const logoUrl = getImageUrl('/logo.png')

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      height: 11in;
      width: 8.5in;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      overflow: hidden;
      background: white;
      color: black;
    }
    .cb-print {
      position: absolute !important;        
      top: 0px;
      left: 0px;
      width: 8in;
      height: 10.5in;
      margin: 0.2in;
      margin-left: 0.2325in;        
    }
    .cb-print-element {
      position: absolute !important;
      overflow: hidden;
    }
    .cb-print-nowrap {
      white-space: nowrap;
    }
    .cb-print-blanks {
      height: 0.45in;
      width: 3.95in;
      position: absolute;
      top: 0;
      left: 0;
    }
    .cb-print-top-box {
      display: inline-block;
      height: 100%;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      border: 1px solid #ddd;
    }
    .cb-print-top-text {
      position: relative;
      bottom: -0.275in;
      font-size: 0.75em;
      color: grey;
      text-align: center;
      display: block;
    }
    .cb-print-top-flags {
      width: 1.34in;
    }
    .cb-print-top-deposit {
      width: 0.75in;
    }
    .cb-print-deposit-value {
      position: absolute;
      left: 1.38in;
      top: 0.05in;
      font-size: 1.4em;
      font-weight: bold;
    }
    .cb-print-top-gold-credit {
      width: 0.75in;
    }
    .cb-print-total {
      width: 0.986in;
    }
    .cb-print-customer-info {
      height: 0.85in;
      top: 0.5in;
      left: 0;
      width: 2.45in;        
      font-size: 1.3em;
      padding-left: 30px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      overflow: hidden;
      border: 1px solid #ddd;
    }
    .cb-print-customer-icon {
      left: 0px;
    }
    .cb-print-note {
      top: 2in;
      left: 0;
      height: 0.99in;
      width: 3.95in;        
      padding: 5px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      border: 1px solid #ddd;
    }
    .cb-print-job-num {
      top: 1.4in;
      width: 1.05in;
      height: 0.55in;
      left: 1.4in;
      font-size: 1.75em;
      line-height: 2.25em;
      text-align: center;
      font-weight: bold;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      border: 1px solid #ddd;
    }
    .cb-employee {
      top: 0.5in;
      width: 1.45in;
      height: 0.4in;
      left: 2.5in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
      padding: 3px;
      line-height: 1.5em;
      font-size: 1.5em;
      text-align: center;
      border: 1px solid #ddd;
    }
    .cb-print-estimate {
      height: 1in;
      top: 0.95in;
      left: 2.5in;
      width: 1.45in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
      padding: 3px;
      line-height: 1.1em;
      border: 1px solid #ddd;
    }
    .cb-print-est-amt {
      font-size: 1.2em;
      font-weight: bold;
      text-align: center;
      margin-top: 3px;
    }
    .cb-print-est-note {
      font-size: 0.9em;
      line-height: 0.9em;
    }
    .cb-print-due {
      top: 1.4in;
      left: 0;
      width: 1.35in;
      height: 0.55in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      font-size: 0.95em;
      padding: 3px;
      border: 1px solid #ddd;
    }
    .cbPrintRed {
      color: red !important;
      font-weight: bold;
    }
    .cb-print-images{
      top: 0in;
      left: 4.05in;
      width: 3.95in;
      height: 6in;
    }
    .cb-print-image-spacer {
      height: 3in;
    }
    .cb-print-image-cont {
      height: 0.99in;
      margin-bottom: 0.05in;
      width: 100%;
      border: 1px solid #eee;
    }
    .cb-print-image{
      float: left;
      height: 100%;
      width: 1.3in;
      object-fit: cover;
    }
    .cb-print-image-note {
      height: 0.97in;
      overflow: hidden;
      padding-left: 5px;
      padding-top: 3px;
      line-height: 1.1em;
      font-size: 0.8em;
    }
    .cb-print-logo {
      position: absolute;
      width: 3.4in;
      top: 6.2in;
      left: 0.25in;
    }
    .cb-print-customer-name {
      position: absolute;
      top: 7.4in;
      font-weight: bold;
      left: 0.25in;
    }
    .cb-print-cus-images {
      position: absolute;
      top: 7.6in;
      left: 0.25in;
      width: 3.5in;
      height: 3in;
    }
    .cb-print-cus-img-cont {
      height: 1.4in;
      width: 1.6in;
      margin: 2px;
      display: inline-block;
      border: 1px solid #ccc;
    }
    .cb-print-cust-img {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
    .cb-print-cus-job-info {
      position: absolute;
      left: 4.05in;
      width: 2.45in;
      height: 1.3in;
      top: 6.25in;
      padding: 5px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      border: 1px solid #ddd;
      font-size: 0.9em;
    }
    .cb-print-cus-estimate {
      position: absolute;
      top: 6.25in;
      width: 1.45in;
      height: 1.3in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      left: 6.55in;       
      padding: 5px;
      border: 1px solid #ddd;
    }
    .cb-print-cus-warning {
      position: absolute;
      top: 10in;
      font-size: 1.1em;
      left: 4.25in;
      font-weight: bold;
      text-align: center;
      width: 3.8in;
    }
  </style>
</head>
<body>
  <div class="cb-print">
    <!-- Blanks Box -->
    <div class="cb-print-element cb-print-blanks">
      <div class="cb-print-top-box cb-print-top-flags"><span class="cb-print-top-text">EMR NA Check</span></div>
      <div class="cb-print-top-box cb-print-top-deposit"><span class="cb-print-top-text">Deposit</span></div>
      <div class="cb-print-top-box cb-print-top-gold-credit"><span class="cb-print-top-text">Gold Credit</span></div>
      <div class="cb-print-top-box cb-print-total"><span class="cb-print-top-text">Total</span></div>
    </div>
    
    <!-- Deposit Value -->
    <div class="cb-print-element cb-print-deposit-value">
      ${depVal > 0 ? '$' + depVal.toFixed(2) : ''}
    </div>

    <!-- Customer info -->
    <div class="cb-print-element cb-print-customer-info">
      <span class="cb-print-nowrap">Name: ${customerObj.value?.fname || ''} ${customerObj.value?.lname || ''}</span><br>
      <span class="cb-print-nowrap">Phone: ${customerObj.value?.phone || ''}</span><br>
      <span class="cb-print-nowrap">Email: ${customerObj.value?.email || ''}</span>
    </div>

    <!-- Job Notes -->
    <div class="cb-print-element cb-print-note">
      ${job.note || ''}
    </div>

    <!-- Job ID -->
    <div class="cb-print-element cb-print-job-num">
      # ${job.id || ''}
    </div>

    <!-- Employee -->
    <div class="cb-print-element cb-employee">
      ${empName}
    </div>

    <!-- Estimate Details -->
    <div class="cb-print-element cb-print-estimate">
      <div class="cb-print-est-amt">
        ${estVal > 0 ? `Est: $${estVal.toLocaleString(undefined, {minimumFractionDigits: 2})}` : ''}
      </div>
      <div class="cb-print-est-note">${job.est_note || ''}</div>
    </div>

    <!-- Due Dates -->
    <div class="cb-print-element cb-print-due">
      <span>Date: ${createdDateStr}</span><br>
      <span class="cbPrintRed">Due: ${dueDateStr}</span>
    </div>

    <!-- Top Images section -->
    <div class="cb-print-element cb-print-images">
      <div class="cb-print-image-spacer"></div>
      ${imagesHTML}
    </div>

    <!-- Bottom Customer Section Logo -->
    <img class="cb-print-logo cb-print-element" src="${logoUrl}" alt="">

    <!-- Bottom Customer Name -->
    <div class="cb-print-element cb-print-customer-name">
      Name: ${customerObj.value?.fname || ''} ${customerObj.value?.lname || ''}
    </div>

    <!-- Bottom Customer Images -->
    <div class="cb-print-element cb-print-cus-images">
      ${customerImagesHTML}
    </div>

    <!-- Bottom Store Contact info -->
    <div class="cb-print-element cb-print-cus-job-info">
      Date: ${today.value}<br>
      Employee: ${empName}<br>
      Phone: 403-320-0846<br>
      E-mail: info@thegoldworks.com<br>
    </div>

    <!-- Bottom Customer Estimate -->
    <div class="cb-print-element cb-print-cus-estimate">
      <div class="cb-print-est-amt">
        ${estVal > 0 ? `Estimate: $${estVal.toLocaleString(undefined, {minimumFractionDigits: 2})}` : ''}
      </div>
      <div class="cb-print-est-note">${job.est_note || ''}</div>
    </div>

    <!-- Bottom Warning -->
    <div class="cb-print-element cb-print-cus-warning">
      The Goldworks is not responsible for any items held for over 90 days.
    </div>
  </div>
</body>
</html>
  `
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

.urgent-date-input :deep(input) {
  color: rgb(var(--v-theme-error)) !important;
  font-weight: bold;
}
</style>
