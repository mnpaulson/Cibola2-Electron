<template>
  <div>
    <!-- Workspace Layout: Customer Profile + Job Form (When a job is active or customer selected for new job) -->
    <v-row v-if="isWorkspaceActive">
      <v-col cols="12">
        <!-- Reusable Customer Profile at the top (Info mode, clearable, compact) -->
        <CustomerForm
          v-model="sessionState.selectedCustomerId"
          :clearable="true"
          :hide-notes="true"
          @select="handleCustomerSelect"
        />

        <!-- Job Form Editor below -->
        <JobForm
          v-model:jobId="sessionState.activeJobId"
          v-model:customerId="sessionState.selectedCustomerId"
          class="mt-4"
          @saved="handleJobSaved"
        />
      </v-col>
    </v-row>

    <!-- Master Job Directory Listing (Default state when no job/customer selected) -->
    <v-row v-else>
      <v-col cols="12">
        <v-card elevation="2" class="directory-card rounded-lg">
          <!-- Directory Header -->
          <v-card-item class="bg-primary text-white py-3">
            <v-row no-gutters align="center" justify="space-between">
              <v-col class="text-h6 font-weight-bold d-flex align-center">
                <v-icon start class="mr-2">mdi-wrench-clock</v-icon>
                Repair Jobs Directory
              </v-col>
              <v-col cols="12" sm="4" class="mt-2 mt-sm-0">
                <v-text-field
                  v-model="directorySearch"
                  placeholder="Filter jobs (ID, customer, employee)..."
                  prepend-inner-icon="mdi-magnify"
                  variant="solo"
                  density="compact"
                  hide-details
                  flat
                  bg-color="rgba(255, 255, 255, 0.15)"
                  class="search-bar-input text-white"
                  @update:model-value="currentPage = 1"
                ></v-text-field>
              </v-col>
              <v-col class="shrink ml-3">
                <v-btn
                  color="white"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  size="small"
                  @click="openNewJobCustomerDialog"
                >
                  New Job
                </v-btn>
              </v-col>
            </v-row>
          </v-card-item>

          <v-divider></v-divider>

          <!-- Table Content -->
          <v-table hover fixed-header class="directory-table">
            <thead>
              <tr>
                <th class="font-weight-bold text-subtitle-2 py-3">Job ID</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Customer</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Estimate</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Assigned Employee</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Created</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Due Date</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="text-center">
                <td colspan="7" class="py-12">
                  <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
                  <div class="mt-3 text-caption text-medium-emphasis">Loading repair jobs...</div>
                </td>
              </tr>
              <tr v-else-if="filteredJobs.length === 0" class="text-center">
                <td colspan="7" class="py-12 text-medium-emphasis italic">
                  No repair jobs found.
                </td>
              </tr>
              <tr
                v-else
                v-for="job in paginatedJobs"
                :key="job.id"
                class="cursor-pointer transition-row hover-shadow"
                @click="openJobEditor(job)"
              >
                <td class="font-weight-bold text-body-2 text-primary py-3">
                  #{{ job.id }}
                </td>
                <td class="text-body-2 font-weight-medium">
                  {{ job.customer ? `${job.customer.fname} ${job.customer.lname}` : 'Unknown Customer' }}
                </td>
                <td class="text-body-2 font-weight-bold text-green-darken-2">
                  ${{ (job.estimate || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>
                <td class="text-body-2">
                  {{ job.employee ? job.employee.name : 'Unassigned' }}
                </td>
                <td class="text-caption text-medium-emphasis">
                  {{ formatDate(job.created_at) }}
                </td>
                <td :class="['text-caption', { 'text-error font-weight-bold': isUrgent(job) }]">
                  {{ formatDate(job.due_date) || '—' }}
                </td>
                <td>
                  <v-chip
                    :color="job.completed_at ? 'success' : 'info'"
                    size="x-small"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ job.completed_at ? 'Completed' : 'In Progress' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Local Pagination Controls -->
          <v-divider v-if="filteredJobs.length > 0"></v-divider>
          <div v-if="filteredJobs.length > 0" class="d-flex align-center justify-space-between pa-3 bg-light-surface flex-wrap gap-2">
            <span class="text-caption text-medium-emphasis">
              Showing {{ pageStart }} to {{ pageEnd }} of {{ filteredJobs.length }} jobs
            </span>
            <div class="d-flex align-center gap-2">
              <v-btn
                icon="mdi-chevron-left"
                variant="outlined"
                size="x-small"
                color="primary"
                :disabled="currentPage === 1"
                @click="currentPage--"
              ></v-btn>
              <span class="text-caption font-weight-bold">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <v-btn
                icon="mdi-chevron-right"
                variant="outlined"
                size="x-small"
                color="primary"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              ></v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog to select a Customer before creating a New Job -->
    <v-dialog v-model="newJobCustomerDialog" max-width="600px">
      <CustomerForm
        v-if="newJobCustomerDialog"
        :clearable="false"
        initial-state="search"
        @select="handleNewJobCustomerSelect"
        @cancel="newJobCustomerDialog = false"
      />
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../utils/api'
import { sessionState } from '../store/session'
import CustomerForm from './CustomerForm.vue'
import JobForm from './JobForm.vue'

// Local State
const jobsList = ref([])
const loading = ref(false)
const directorySearch = ref('')
const newJobCustomerDialog = ref(false)

// Local Pagination
const currentPage = ref(1)
const itemsPerPage = 15

// Check if edit workspace is active
const isWorkspaceActive = computed(() => {
  return sessionState.activeJobId !== null || sessionState.selectedCustomerId !== null
})

// Load customer select helper
const handleCustomerSelect = (custObj) => {
  // Can be used if JobManager needs to update internal cached states
}

// Fetch all jobs from SQLite DB
const fetchJobs = async () => {
  loading.value = true
  try {
    const data = await api.get('/jobs')
    jobsList.value = data || []
  } catch (err) {
    console.error('Failed to load jobs directory:', err)
  } finally {
    loading.value = false
  }
}

// Filtered directory
const filteredJobs = computed(() => {
  const q = directorySearch.value.trim().toLowerCase()
  if (!q) return jobsList.value

  return jobsList.value.filter(job => {
    const idMatch = String(job.id).includes(q)
    const custFname = job.customer ? (job.customer.fname || '').toLowerCase() : ''
    const custLname = job.customer ? (job.customer.lname || '').toLowerCase() : ''
    const custName = `${custFname} ${custLname}`
    const empName = job.employee ? (job.employee.name || '').toLowerCase() : ''
    const estString = String(job.estimate || '')

    return (
      idMatch ||
      custName.includes(q) ||
      empName.includes(q) ||
      estString.includes(q)
    )
  })
})

// Paginated subset
const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredJobs.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredJobs.value.length / itemsPerPage) || 1
})

const pageStart = computed(() => {
  if (filteredJobs.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage + 1
})

const pageEnd = computed(() => {
  const end = currentPage.value * itemsPerPage
  return end > filteredJobs.value.length ? filteredJobs.value.length : end
})

// Open specific job for editing
const openJobEditor = (job) => {
  sessionState.activeJobId = job.id
  sessionState.selectedCustomerId = job.customer_id
  sessionState.enteredJobEditFromList = true
}

// Dialog trigger for new job customer selection
const openNewJobCustomerDialog = () => {
  newJobCustomerDialog.value = true
}

// Handle customer selection for a new job
const handleNewJobCustomerSelect = (customer) => {
  if (customer && customer.id) {
    sessionState.activeJobId = null
    sessionState.selectedCustomerId = customer.id
    sessionState.enteredJobEditFromList = true
    newJobCustomerDialog.value = false
  }
}

// Handle job saved event
const handleJobSaved = (savedJob) => {
  if (savedJob && savedJob.id) {
    sessionState.activeJobId = savedJob.id
  }
  fetchJobs()
}

// Date formatter helper
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    // Format to local date string MMDDYY
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

// Check if job due date is urgent/vital and not completed
const isUrgent = (job) => {
  return job.vital_date && !job.completed_at
}

// Load directory on mounting
onMounted(() => {
  fetchJobs()
})

// Re-fetch directory when returning to list state
watch(isWorkspaceActive, (active) => {
  if (!active) {
    fetchJobs()
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.directory-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}

.directory-table :deep(th) {
  background-color: rgba(var(--v-theme-surface-variant), 0.04) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-row {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.transition-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.hover-shadow {
  transition: box-shadow 0.2s ease;
}

.hover-shadow:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.search-bar-input {
  border-radius: 4px;
}

.search-bar-input :deep(.v-field) {
  box-shadow: none !important;
  color: white !important;
}

.search-bar-input :deep(.v-field__input) {
  color: white !important;
}

.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
