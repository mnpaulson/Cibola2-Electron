<template>
  <div>
    <!-- Workspace Layout: Credit Form (When a credit is active or customer is selected) -->
    <v-row v-if="isWorkspaceActive">
      <v-col cols="12">
        <CreditForm
          v-model:creditId="sessionState.activeCreditId"
          v-model:customerId="sessionState.selectedCustomerId"
          @saved="handleCreditSaved"
        />
      </v-col>
    </v-row>

    <!-- Master Gold Credit Directory Listing -->
    <v-row v-else>
      <v-col cols="12">
        <v-card elevation="2" class="directory-card rounded-lg">
          <!-- Directory Header -->
          <v-card-item class="bg-accent1 text-white py-3">
            <v-row no-gutters align="center" justify="space-between">
              <v-col class="text-h6 font-weight-bold d-flex align-center">
                <v-icon start class="mr-2">mdi-credit-card-outline</v-icon>
                Gold Credits Directory
              </v-col>
              <v-col cols="12" sm="4" class="mt-2 mt-sm-0">
                <v-text-field
                  v-model="directorySearch"
                  placeholder="Filter credits (ID, customer, employee)..."
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
                  color="credit"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  height="40"
                  @click="startNewCredit"
                >
                  New Credit
                </v-btn>
              </v-col>
            </v-row>
          </v-card-item>

          <v-divider></v-divider>

          <!-- Table Content -->
          <v-table hover fixed-header class="directory-table">
            <thead>
              <tr>
                <th class="font-weight-bold text-subtitle-2 py-3">Credit ID</th>
                <th
                  class="font-weight-bold text-subtitle-2 py-3 sortable-header"
                  @click="toggleSort('customer_name')"
                >
                  <div class="d-flex align-center">
                    Customer
                    <v-icon size="small" class="ml-1" v-if="sortBy === 'customer_name'">
                      {{ sortDesc ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
                    </v-icon>
                  </div>
                </th>
                <th class="font-weight-bold text-subtitle-2 py-3">Payout Value</th>
                <th class="font-weight-bold text-subtitle-2 py-3">Assigned Employee</th>
                <th
                  class="font-weight-bold text-subtitle-2 py-3 sortable-header"
                  @click="toggleSort('created_at')"
                >
                  <div class="d-flex align-center">
                    Created
                    <v-icon size="small" class="ml-1" v-if="sortBy === 'created_at'">
                      {{ sortDesc ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
                    </v-icon>
                  </div>
                </th>
                <th class="font-weight-bold text-subtitle-2 py-3">Used</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="text-center">
                <td colspan="6" class="py-12">
                  <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
                  <div class="mt-3 text-caption text-medium-emphasis">Loading gold credits...</div>
                </td>
              </tr>
              <tr v-else-if="filteredCredits.length === 0" class="text-center">
                <td colspan="6" class="py-12 text-medium-emphasis italic">
                  No gold credits found.
                </td>
              </tr>
              <tr
                v-else
                v-for="credit in paginatedCredits"
                :key="credit.id"
                class="cursor-pointer transition-row hover-shadow accent-border-row record-accent-credit"
                @click="openCreditEditor(credit)"
              >
                <td class="font-weight-bold text-body-2 py-3 text-credit">
                  #{{ credit.id }}
                </td>
                <td class="text-body-2 font-weight-medium">
                  {{ credit.customer ? `${credit.customer.fname} ${credit.customer.lname}` : '—' }}
                </td>
                <td class="text-body-2 font-weight-bold text-success">
                  ${{ (calculateGrandTotal(credit) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>
                <td class="text-body-2">
                  {{ credit.employee ? credit.employee.name : 'Unassigned' }}
                </td>
                <td class="text-caption text-medium-emphasis">
                  {{ formatDate(credit.created_at) }}
                </td>
                <td class="text-body-2">
                  <v-chip
                    :color="credit.used ? 'warning' : 'success'"
                    size="small"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    {{ credit.used ? 'Used' : 'Active' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Local Pagination Controls -->
          <v-divider v-if="filteredCredits.length > 0"></v-divider>
          <DirectoryPagination
            v-model="currentPage"
            :total-items="filteredCredits.length"
            :items-per-page="itemsPerPage"
          />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { api } from '../utils/api'
import { sessionState, navigateTo } from '../store/session'
import { formatLocalDate } from '../utils/dates'
import CreditForm from './CreditForm.vue'
import DirectoryPagination from './DirectoryPagination.vue'

// Theme & styling control
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

// Local State
const creditsList = ref([])
const loading = ref(false)
const itemsPerPage = 15

// Persisted navigation states
const directorySearch = computed({
  get: () => sessionState.creditSearchQuery,
  set: (val) => { sessionState.creditSearchQuery = val }
})

const currentPage = computed({
  get: () => sessionState.creditCurrentPage,
  set: (val) => { sessionState.creditCurrentPage = val }
})

// Check if workspace editor is active
const isWorkspaceActive = computed(() => {
  return sessionState.activeCreditId !== null || sessionState.selectedCustomerId !== null
})

// Fetch all credits from backend SQLite DB
const fetchCredits = async () => {
  loading.value = true
  try {
    const data = await api.get('/goldcredits')
    creditsList.value = data || []
  } catch (err) {
    console.error('Failed to load gold credits directory:', err)
  } finally {
    loading.value = false
  }
}

// Compute grand total payout from credit items
const calculateGrandTotal = (credit) => {
  if (!credit.credit_items) return 0
  return credit.credit_items.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0)
}

// Filtered list
const filteredCredits = computed(() => {
  const q = directorySearch.value.trim().toLowerCase()
  if (!q) return creditsList.value

  return creditsList.value.filter(credit => {
    const idMatch = String(credit.id).includes(q)
    const custFname = credit.customer ? (credit.customer.fname || '').toLowerCase() : ''
    const custLname = credit.customer ? (credit.customer.lname || '').toLowerCase() : ''
    const custName = `${custFname} ${custLname}`
    const empName = credit.employee ? (credit.employee.name || '').toLowerCase() : ''
    const typeName = (credit.credit_type || '').toLowerCase()

    return (
      idMatch ||
      custName.includes(q) ||
      empName.includes(q) ||
      typeName.includes(q)
    )
  })
})

// Sorting state
const sortBy = ref('created_at')
const sortDesc = ref(true)

const toggleSort = (field) => {
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = field
    sortDesc.value = field === 'created_at' ? true : false
  }
  currentPage.value = 1
}

const sortedCredits = computed(() => {
  const list = [...filteredCredits.value]
  return list.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'customer_name') {
      const nameA = a.customer ? `${a.customer.fname} ${a.customer.lname}`.trim().toLowerCase() : ''
      const nameB = b.customer ? `${b.customer.fname} ${b.customer.lname}`.trim().toLowerCase() : ''
      comparison = nameA.localeCompare(nameB)
    } else if (sortBy.value === 'created_at') {
      const dateA = a.created_at || ''
      const dateB = b.created_at || ''
      comparison = dateA.localeCompare(dateB)
    }
    return sortDesc.value ? -comparison : comparison
  })
})

// Paginated subset
const paginatedCredits = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedCredits.value.slice(start, start + itemsPerPage)
})

// Navigation triggers
const openCreditEditor = (credit) => {
  navigateTo('credits', { activeCreditId: credit.id, selectedCustomerId: credit.customer_id })
}

const startNewCredit = () => {
  navigateTo('credits', { activeCreditId: 0, selectedCustomerId: null })
}

const handleCreditSaved = (savedCredit) => {
  if (savedCredit && savedCredit.id) {
    sessionState.activeCreditId = savedCredit.id
  }
  fetchCredits()
}

const formatDate = (dateStr) => formatLocalDate(dateStr, 'long')

// Load directory on mounting
onMounted(() => {
  fetchCredits()
})

// Re-fetch directory when returning to list state
watch(isWorkspaceActive, (active) => {
  if (!active) {
    fetchCredits()
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

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable-header:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}
</style>
