<template>
  <div>
    <!-- Widescreen Layout: 2 Columns when a customer is selected -->
    <v-row v-if="selectedId">
      <!-- Left Column: Reusable Customer details & form card -->
      <v-col cols="12" md="4" lg="4">
        <CustomerForm
          v-model="selectedId"
          :clearable="true"
          @select="handleCustomerSelect"
          @new-customer="handleNewCustomer"
        />

        <!-- Danger Zone: Delete customer button below the card -->
        <v-card class="mt-4 border-error" elevation="2" border>
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

      <!-- Right Column: Associated Records (Jobs, Credits, Sheets) -->
      <v-col cols="12" md="8" lg="8">
        <v-card elevation="3" class="history-card rounded-lg">
          <!-- Toolbar with Quick Actions -->
          <v-card-item class="bg-surface-variant py-3">
            <v-row no-gutters align="center" justify="space-between">
              <v-col class="text-subtitle-1 font-weight-bold">
                Activity & Records: {{ customerName }}
              </v-col>
              <v-col class="d-flex justify-end gap-2 shrink">
                <v-btn
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-briefcase-clock"
                  size="small"
                  @click="createNewRecord('jobs')"
                >
                  New Job
                </v-btn>
                <v-btn
                  color="warning"
                  variant="elevated"
                  prepend-icon="mdi-wallet-membership"
                  size="small"
                  @click="createNewRecord('credits')"
                >
                  New Credit
                </v-btn>
                <v-btn
                  color="info"
                  variant="elevated"
                  prepend-icon="mdi-file-document-outline"
                  size="small"
                  @click="createNewRecord('customsheets')"
                >
                  New Sheet
                </v-btn>
              </v-col>
            </v-row>
          </v-card-item>

          <v-divider></v-divider>

          <!-- History Tabs -->
          <v-tabs v-model="activeTab" bg-color="surface" align-tabs="start" density="comfortable">
            <v-tab value="jobs" class="text-caption font-weight-bold">
              <v-icon start>mdi-briefcase</v-icon>
              Jobs ({{ jobs.length }})
            </v-tab>
            <v-tab value="credits" class="text-caption font-weight-bold">
              <v-icon start>mdi-currency-usd</v-icon>
              Store Credits ({{ credits.length }})
            </v-tab>
            <v-tab value="sheets" class="text-caption font-weight-bold">
              <v-icon start>mdi-file-document-multiple</v-icon>
              Custom Sheets ({{ customSheets.length }})
            </v-tab>
          </v-tabs>

          <v-divider></v-divider>

          <!-- Tabs Windows -->
          <v-card-text class="pa-0">
            <v-window v-model="activeTab">
              <!-- Jobs Tab Window -->
              <v-window-item value="jobs">
                <v-table hover fixed-header class="history-table">
                  <thead>
                    <tr>
                      <th class="text-left font-weight-bold text-caption py-2">Job ID</th>
                      <th class="text-left font-weight-bold text-caption py-2">Estimate</th>
                      <th class="text-left font-weight-bold text-caption py-2">Created</th>
                      <th class="text-left font-weight-bold text-caption py-2">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingHistory" class="text-center">
                      <td colspan="4" class="py-6">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      </td>
                    </tr>
                    <tr v-else-if="jobs.length === 0" class="text-center">
                      <td colspan="4" class="py-6 text-medium-emphasis text-caption italic">
                        No jobs found for this customer.
                      </td>
                    </tr>
                    <tr
                      v-else
                      v-for="job in jobs"
                      :key="job.id"
                      class="cursor-pointer transition-row"
                      @click="goToJob(job.id)"
                    >
                      <td class="font-weight-bold text-primary">#{{ job.id }}</td>
                      <td>${{ (job.estimate || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                      <td class="text-medium-emphasis text-caption">{{ formatDate(job.created_at) }}</td>
                      <td>
                        {{ job.due_date || 'No due date' }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-window-item>

              <!-- Credits Tab Window -->
              <v-window-item value="credits">
                <v-table hover fixed-header class="history-table">
                  <thead>
                    <tr>
                      <th class="text-left font-weight-bold text-caption py-2">Credit ID</th>
                      <th class="text-left font-weight-bold text-caption py-2">Gold CAD Value</th>
                      <th class="text-left font-weight-bold text-caption py-2">Plat CAD Value</th>
                      <th class="text-left font-weight-bold text-caption py-2">Created</th>
                      <th class="text-left font-weight-bold text-caption py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingHistory" class="text-center">
                      <td colspan="5" class="py-6">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      </td>
                    </tr>
                    <tr v-else-if="credits.length === 0" class="text-center">
                      <td colspan="5" class="py-6 text-medium-emphasis text-caption italic">
                        No store credits found for this customer.
                      </td>
                    </tr>
                    <tr
                      v-else
                      v-for="credit in credits"
                      :key="credit.id"
                      class="cursor-pointer transition-row"
                      @click="goToCredit(credit.id)"
                    >
                      <td class="font-weight-bold text-primary">#{{ credit.id }}</td>
                      <td>${{ (credit.gold_cad || 0).toFixed(2) }}</td>
                      <td>${{ (credit.plat_cad || 0).toFixed(2) }}</td>
                      <td class="text-medium-emphasis text-caption">{{ formatDate(credit.created_at) }}</td>
                      <td>
                        <v-chip
                          :color="credit.used ? 'success' : 'info'"
                          size="x-small"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          {{ credit.used ? 'Redeemed' : 'Active' }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-window-item>

              <!-- Custom Sheets Tab Window -->
              <v-window-item value="sheets">
                <v-table hover fixed-header class="history-table">
                  <thead>
                    <tr>
                      <th class="text-left font-weight-bold text-caption py-2">Sheet ID</th>
                      <th class="text-left font-weight-bold text-caption py-2">Sheet Name</th>
                      <th class="text-left font-weight-bold text-caption py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingHistory" class="text-center">
                      <td colspan="3" class="py-6">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      </td>
                    </tr>
                    <tr v-else-if="customSheets.length === 0" class="text-center">
                      <td colspan="3" class="py-6 text-medium-emphasis text-caption italic">
                        No custom sheets found for this customer.
                      </td>
                    </tr>
                    <tr
                      v-else
                      v-for="sheet in customSheets"
                      :key="sheet.id"
                      class="cursor-pointer transition-row"
                      @click="goToCustomSheet(sheet.id)"
                    >
                      <td class="font-weight-bold text-primary">#{{ sheet.id }}</td>
                      <td class="font-weight-medium">{{ sheet.name }}</td>
                      <td class="text-medium-emphasis text-caption">{{ formatDate(sheet.created_at) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Master Customer Directory (When no customer is selected) -->
    <v-row v-else>
      <v-col cols="12">
        <v-card elevation="2" class="directory-card rounded-lg">
          <v-card-item class="bg-primary text-white py-3">
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
                  color="white"
                  variant="flat"
                  prepend-icon="mdi-account-plus"
                  size="small"
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
                <th class="font-weight-bold text-subtitle-2 py-3">Name</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Phone</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Email</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Location</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Last Active</th>
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
                class="cursor-pointer transition-row hover-shadow"
                @click="navigateTo('customers', { selectedCustomerId: cust.id })"
              >
                <td class="font-weight-bold text-body-2 text-primary py-3">
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
          <li><strong>{{ credits.length }}</strong> Store Credits</li>
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

// Persisted navigation-friendly states
const activeTab = computed({
  get: () => sessionState.customerActiveSubTab,
  set: (val) => { sessionState.customerActiveSubTab = val }
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

const paginatedDirectory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredDirectory.value.slice(start, start + itemsPerPage)
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
    
    jobs.value = jobsData || []
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
  const q = directorySearch.value.trim().toLowerCase()
  if (!q) return customersDirectory.value

  return customersDirectory.value.filter(c => {
    const fname = (c.fname || '').toLowerCase()
    const lname = (c.lname || '').toLowerCase()
    const phone = (c.phone || '').toLowerCase()
    const email = (c.email || '').toLowerCase()
    const city = (c.addr_city || '').toLowerCase()
    return (
      fname.includes(q) ||
      lname.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      city.includes(q)
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
    navigateTo('employees', { activeSheetId: 0, selectedCustomerId: selectedId.value })
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
    const result = await api.delete(`/customers/${selectedId.value}`)
    if (result) {
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



// Navigation links to view existing records
const goToJob = (jobId) => {
  console.log('Navigating to job ID:', jobId)
  navigateTo('jobs', { activeJobId: jobId, selectedCustomerId: selectedId.value })
}

const goToCredit = (creditId) => {
  console.log('Navigating to credit ID:', creditId)
  navigateTo('credits', { activeCreditId: creditId, selectedCustomerId: selectedId.value })
}

const goToCustomSheet = (sheetId) => {
  console.log('Navigating to custom sheet ID:', sheetId)
  navigateTo('employees', { activeSheetId: sheetId, selectedCustomerId: selectedId.value })
}

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

.history-table :deep(th),
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
</style>
