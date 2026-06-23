<template>
  <div>
    <!-- Layout when a customer is selected -->
    <div v-if="selectedId">
      <!-- Top Row: Customer Details (Wide Layout) -->
      <v-row>
        <v-col cols="12">
          <CustomerForm
            v-model="selectedId"
            :clearable="false"
            :show-activity="true"
            @select="handleCustomerSelect"
            @new-customer="handleNewCustomer"
          />
        </v-col>
      </v-row>

      <!-- Bottom Row: History & Actions Two-Column Layout -->
      <v-row class="mt-4">
        <!-- First Column: Associated Records (Jobs, Credits, Sheets) -->
        <v-col cols="12" md="8">
          <v-card elevation="3" class="history-card rounded-lg">
            <!-- Toolbar with Quick Actions -->
            <v-card-item class="bg-accent1 text-white py-3">
              <v-row no-gutters align="center" justify="space-between">
                <v-col class="text-subtitle-1 font-weight-bold">
                  Activity & Records: {{ customerName }}
                </v-col>
                <v-col class="d-flex justify-end gap-2 shrink">
                  <v-btn
                    color="job"
                    variant="elevated"
                    prepend-icon="mdi-briefcase-outline"
                    size="small"
                    @click="createNewRecord('jobs')"
                  >
                    New Job
                  </v-btn>
                  <v-btn
                    color="credit"
                    variant="elevated"
                    prepend-icon="mdi-credit-card-outline"
                    size="small"
                    @click="createNewRecord('credits')"
                  >
                    New Credit
                  </v-btn>
                  <v-btn
                    color="sheet"
                    variant="elevated"
                    prepend-icon="mdi-list-box-outline"
                    size="small"
                    @click="createNewRecord('customsheets')"
                  >
                    New Sheet
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-item>

            <v-divider></v-divider>

            <!-- Unified History Table -->
            <v-card-text class="pa-0">
              <UnifiedRecordTable
                :records="combinedHistory"
                :loading="loadingHistory"
                sortable
                :show-customer-name="false"
                empty-icon="mdi-file-outline"
                empty-title="No records found for this customer."
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Second Column: Actions / Danger Zone (Add more here later) -->
        <v-col cols="12" md="4">
          <!-- Danger Zone: Delete customer button -->
          <v-card class="border-error rounded-lg" elevation="2" border>
            <v-card-text class="d-flex align-center justify-space-between py-3">
              <div>
                <div class="text-subtitle-2 font-weight-bold text-error">Danger Zone</div>
                <div class="text-caption text-medium-emphasis">Delete customer profile and all history</div>
              </div>
              <v-btn
                color="error"
                variant="flat"
                prepend-icon="mdi-delete"
                size="small"
                @click="openDeleteDialog"
              >
                Delete
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Master Customer Directory (When no customer is selected) -->
    <v-row v-else>
      <v-col cols="12">
        <v-card elevation="2" class="directory-card rounded-lg">
          <v-card-item class="bg-accent1 text-white py-3">
            <v-row no-gutters align="center" justify="space-between">
              <v-col class="text-h6 font-weight-bold">
                <v-icon start class="mr-2">mdi-account-box-multiple</v-icon>
                Customer Directory
              </v-col>
              <v-col cols="12" sm="4" class="mt-2 mt-sm-0">
                <v-text-field
                  v-model="directorySearch"
                  placeholder="Filter directory..."
                  prepend-inner-icon="mdi-magnify"
                  variant="solo"
                  density="compact"
                  hide-details
                  flat
                  bg-color="rgba(255, 255, 255, 0.15)"
                  class="search-bar-input text-white"
                ></v-text-field>
              </v-col>
              <v-col class="shrink ml-3">
                <v-btn
                  color="customer"
                  variant="flat"
                  prepend-icon="mdi-account-plus"
                  height="40"
                  @click="openNewCustomerDirectly"
                >
                  New Customer
                </v-btn>
              </v-col>
            </v-row>
          </v-card-item>

          <v-divider></v-divider>

          <v-table hover fixed-header class="directory-table">
            <thead>
              <tr>
                <th
                  class="font-weight-bold text-subtitle-2 py-3 sortable-header"
                  @click="toggleSort('customer_name')"
                >
                  <div class="d-flex align-center">
                    Name
                    <v-icon size="small" class="ml-1" v-if="sortBy === 'customer_name'">
                      {{ sortDesc ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
                    </v-icon>
                  </div>
                </th>
                <th class="font-weight-bold text-subtitle-2 py-3">Phone</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Email</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Location</th>
                <th
                  class="font-weight-bold text-subtitle-2 py-3 sortable-header"
                  @click="toggleSort('updated_at')"
                >
                  <div class="d-flex align-center">
                    Last Active
                    <v-icon size="small" class="ml-1" v-if="sortBy === 'updated_at' || sortBy === 'created_at'">
                      {{ sortDesc ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
                    </v-icon>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingDirectory" class="text-center">
                <td colspan="5" class="py-12">
                  <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
                  <div class="mt-3 text-caption text-medium-emphasis">Loading customer records...</div>
                </td>
              </tr>
              <tr v-else-if="filteredDirectory.length === 0" class="text-center">
                <td colspan="5" class="py-12 text-medium-emphasis italic">
                  No customer records found.
                </td>
              </tr>
              <tr
                v-else
                v-for="cust in paginatedDirectory"
                :key="cust.id"
                class="cursor-pointer transition-row hover-shadow accent-border-row record-accent-customer"
                @click="navigateTo('customers', { selectedCustomerId: cust.id })"
              >
                <td class="font-weight-bold text-body-2 py-3 text-customer">
                  {{ cust.fname }} {{ cust.lname }}
                </td>
                <td class="text-body-2">{{ cust.phone || '—' }}</td>
                <td class="text-body-2 text-medium-emphasis">{{ cust.email || '—' }}</td>
                <td class="text-body-2 text-medium-emphasis">
                  {{ formatCityProv(cust) }}
                </td>
                <td class="text-caption text-medium-emphasis">
                  {{ formatDate(cust.updated_at) }}
                </td>
              </tr>
            </tbody>
          </v-table>
          
          <v-divider v-if="filteredDirectory.length > 0"></v-divider>
          <DirectoryPagination
            v-model="currentPage"
            :total-items="filteredDirectory.length"
            :items-per-page="itemsPerPage"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Global Floating Create Customer Action (only in directory view) -->
    <v-dialog v-model="createNewDialog" max-width="600px">
      <CustomerForm
        v-if="createNewDialog"
        :clearable="false"
        initial-state="form"
        :prefill-query="directorySearch"
        @select="handleNewCustomerSelect"
        @cancel="createNewDialog = false"
      />
    </v-dialog>

    <!-- WARNING DELETE CONFIRMATION MODAL -->
    <DeleteConfirmationDialog
      v-model="deleteDialog"
      title="Warning: Cascading Delete"
      :warning-message="`You are about to delete customer <strong>${customerName}</strong> (ID: #${selectedId}).`"
      :confirm-text-key="selectedCustomer?.lname"
      confirm-text-placeholder="Type customer's Last Name to confirm *"
      checkbox-label="I understand that this action is permanent and cannot be undone."
      :loading="loadingHistory"
      @confirm="submitDeleteCustomer"
      @cancel="closeDeleteDialog"
    >
      <v-alert
        type="warning"
        variant="tonal"
        density="compact"
        class="text-caption font-weight-medium mb-4"
      >
        Deleting this customer will permanently delete all associated items:
        <ul class="pl-4 mt-1">
          <li><strong>{{ jobs.length }}</strong> Jobs and their photos</li>
          <li><strong>{{ credits.length }}</strong> Credits</li>
          <li><strong>{{ customSheets.length }}</strong> Custom Sheets</li>
        </ul>
      </v-alert>
    </DeleteConfirmationDialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../utils/api'
import { sessionState, navigateTo, setSelectedCustomerId } from '../store/session'
import { formatLocalDate, formatCityProv } from '../utils/dates'
import CustomerForm from './CustomerForm.vue'
import DirectoryPagination from './DirectoryPagination.vue'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import { removeRecentRecord } from '../store/recentlyViewed'
import UnifiedRecordTable from './UnifiedRecordTable.vue'

// Local State


// Local State
const selectedId = ref(null)

// Sync with global session state
watch(() => sessionState.selectedCustomerId, (newVal) => {
  if (newVal !== selectedId.value) {
    selectedId.value = newVal
  }
}, { immediate: true })

const selectedCustomer = ref(null)
const loadingHistory = ref(false)
const loadingDirectory = ref(false)
const createNewDialog = ref(false)

// History records
const jobs = ref([])
const credits = ref([])
const customSheets = ref([])

// Directory listings
const customersDirectory = ref([])

// Combined history and sorting logic
const combinedHistory = computed(() => {
  const list = []
  
  jobs.value.forEach(job => {
    const hasEstimate = job.estimate && Number(job.estimate) !== 0
    const detailsText = hasEstimate
      ? `Estimate: $${Number(job.estimate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'No Estimate'
    list.push({
      id: job.id,
      type: 'job',
      typeName: 'Job',
      details: detailsText,
      created_at: job.created_at || '',
      thumbnail: job.thumbnail || null,
      original: job
    })
  })
  
  credits.value.forEach(credit => {
    const hasCredit = credit.credit_value && Number(credit.credit_value) !== 0
    const detailsText = hasCredit
      ? `Payout: $${Number(credit.credit_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'No Final Credit'
    list.push({
      id: credit.id,
      type: 'credit',
      typeName: 'Credit',
      details: detailsText,
      created_at: credit.created_at || '',
      thumbnail: null,
      original: credit
    })
  })
  
  customSheets.value.forEach(sheet => {
    list.push({
      id: sheet.id,
      type: 'sheet',
      typeName: 'Sheet',
      details: sheet.name || '',
      created_at: sheet.created_at || '',
      thumbnail: null,
      original: sheet
    })
  })
  
  return list
})



const directorySearch = computed({
  get: () => sessionState.customerSearchQuery,
  set: (val) => { sessionState.customerSearchQuery = val }
})

const currentPage = computed({
  get: () => sessionState.customerCurrentPage,
  set: (val) => { sessionState.customerCurrentPage = val }
})

const itemsPerPage = 15

// Sorting state
const sortBy = ref('created_at')
const sortDesc = ref(true)

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = field
    sortDesc.value = field === 'created_at' || field === 'updated_at' ? true : false
  }
  currentPage.value = 1
}

const sortedDirectory = computed(() => {
  const list = [...filteredDirectory.value]
  return list.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'customer_name') {
      const nameA = `${a.fname} ${a.lname}`.trim().toLowerCase()
      const nameB = `${b.fname} ${b.lname}`.trim().toLowerCase()
      comparison = nameA.localeCompare(nameB)
    } else if (sortBy.value === 'created_at') {
      const dateA = a.created_at || ''
      const dateB = b.created_at || ''
      comparison = dateA.localeCompare(dateB)
    } else if (sortBy.value === 'updated_at') {
      const dateA = a.updated_at || ''
      const dateB = b.updated_at || ''
      comparison = dateA.localeCompare(dateB)
    }
    return sortDesc.value ? -comparison : comparison
  })
})

const paginatedDirectory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedDirectory.value.slice(start, start + itemsPerPage)
})

watch(directorySearch, () => {
  currentPage.value = 1
})

// Deletion Dialog variables
const deleteDialog = ref(false)

// Fetch all associated jobs, credits, sheets
const fetchAssociatedHistory = async (customerId) => {
  loadingHistory.value = true
  try {
    const [jobsData, creditsData, sheetsData] = await Promise.all([
      api.get(`/jobs?customer_id=${customerId}`),
      api.get(`/goldcredits?customer_id=${customerId}`),
      api.get(`/customsheets?customer_id=${customerId}`)
    ])
    
    // Fetch job details in parallel to load thumbnails
    const jobsWithThumbnails = await Promise.all(
      (jobsData || []).map(async (job) => {
        try {
          const fullJob = await api.get(`/jobs/${job.id}`)
          if (fullJob && fullJob.job_images && fullJob.job_images.length > 0) {
            job.thumbnail = fullJob.job_images[0].image
          }
        } catch (err) {
          console.error('[CustomerManager] Failed to load job thumbnail:', err)
        }
        return job
      })
    )
    
    jobs.value = jobsWithThumbnails
    credits.value = creditsData || []
    customSheets.value = sheetsData || []
  } catch (err) {
    console.error('Failed to load customer history:', err)
  } finally {
    loadingHistory.value = false
  }
}

// Fetch directory of all customers
const fetchDirectory = async () => {
  loadingDirectory.value = true
  try {
    const data = await api.get('/customers')
    customersDirectory.value = data || []
  } catch (err) {
    console.error('Failed to load customer directory:', err)
  } finally {
    loadingDirectory.value = false
  }
}

// Watch selected Customer ID to load records
watch(selectedId, (newId) => {
  if (sessionState.selectedCustomerId !== newId) {
    navigateTo('customers', { selectedCustomerId: newId })
  }
  if (newId) {
    fetchAssociatedHistory(newId)
  } else {
    selectedCustomer.value = null
    fetchDirectory()
  }
}, { immediate: true })

// Customer full name helper
const customerName = computed(() => {
  if (selectedCustomer.value) {
    return `${selectedCustomer.value.fname} ${selectedCustomer.value.lname}`
  }
  return ''
})



// Handle customer object emitted from sub-component
const handleCustomerSelect = (custObj) => {
  selectedCustomer.value = custObj
}

const handleNewCustomer = (newId) => {
  selectedId.value = newId
}

// History and directory loaders moved above selectedId watcher to prevent temporal dead zone errors

// Filtered directory matching search input
const filteredDirectory = computed(() => {
  const queryStr = directorySearch.value.trim().toLowerCase()
  if (!queryStr) return customersDirectory.value

  const queryWords = queryStr.split(/\s+/).filter(Boolean)

  return customersDirectory.value.filter(c => {
    const fname = (c.fname || '').toLowerCase()
    const lname = (c.lname || '').toLowerCase()
    const phone = (c.phone || '').toLowerCase()
    const email = (c.email || '').toLowerCase()
    const city = (c.addr_city || '').toLowerCase()
    const fullName = `${fname} ${lname}`

    return queryWords.every(word => 
      fname.includes(word) ||
      lname.includes(word) ||
      fullName.includes(word) ||
      phone.includes(word) ||
      email.includes(word) ||
      city.includes(word)
    )
  })
})

// Navigation shortcuts
const createNewRecord = (tabValue) => {
  if (!selectedId.value) return
  
  if (tabValue === 'jobs') {
    navigateTo('jobs', { activeJobId: 0, selectedCustomerId: selectedId.value })
  } else if (tabValue === 'credits') {
    navigateTo('credits', { activeCreditId: 0, selectedCustomerId: selectedId.value })
  } else if (tabValue === 'customsheets') {
    navigateTo('custom', { activeSheetId: 0, selectedCustomerId: selectedId.value })
  } else {
    navigateTo(tabValue, { selectedCustomerId: selectedId.value })
  }
}

// Open Form state directly to create customer
const openNewCustomerDirectly = () => {
  createNewDialog.value = true
}

const handleNewCustomerSelect = (custObj) => {
  if (custObj && custObj.id) {
    selectedId.value = custObj.id
    createNewDialog.value = false
  }
}

// Dialog management
const openDeleteDialog = () => {
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
}

const submitDeleteCustomer = async () => {
  loadingHistory.value = true
  try {
    const custIdToDelete = selectedId.value
    const result = await api.delete(`/customers/${custIdToDelete}`)
    if (result) {
      removeRecentRecord('customer', custIdToDelete)
      deleteDialog.value = false
      selectedId.value = null
    }
  } catch (err) {
    console.error('Failed to delete customer:', err)
  } finally {
    loadingHistory.value = false
  }
}

// Helper formats
const formatDate = (dateStr) => formatLocalDate(dateStr, 'empty-dash')





onMounted(() => {
  // Directory loading is handled by the immediate watch on selectedId
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.history-card, .directory-card {
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

.border-error {
  border: 1px solid rgba(var(--v-theme-error), 0.3) !important;
}

.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable-header:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}
</style>
