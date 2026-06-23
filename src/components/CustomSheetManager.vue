<template>
  <div>
    <!-- Workspace Layout: Custom Sheet Form -->
    <v-row v-if="isWorkspaceActive">
      <v-col cols="12">
        <CustomSheetForm
          v-model:sheetId="sessionState.activeSheetId"
          v-model:customerId="sessionState.selectedCustomerId"
          @saved="handleSheetSaved"
        />
      </v-col>
    </v-row>

    <!-- Master Custom Sheets Directory Listing -->
    <v-row v-else>
      <v-col cols="12">
        <v-card elevation="2" class="directory-card rounded-lg">
          <!-- Directory Header -->
          <v-card-item class="bg-accent1 text-white py-3">
            <v-row no-gutters align="center" justify="space-between">
              <v-col class="text-h6 font-weight-bold d-flex align-center">
                <v-icon start class="mr-2">mdi-list-box-outline</v-icon>
                Custom Sheets Directory
              </v-col>
              <v-col cols="12" sm="4" class="mt-2 mt-sm-0">
                <v-text-field
                  v-model="directorySearch"
                  placeholder="Filter sheets (ID, customer, sheet name)..."
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
                  color="sheet"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  height="40"
                  @click="startNewSheet"
                >
                  New Custom Sheet
                </v-btn>
              </v-col>
            </v-row>
          </v-card-item>

          <v-divider></v-divider>

          <!-- Table Content -->
          <v-table hover fixed-header class="directory-table">
            <thead>
              <tr>
                <th class="font-weight-bold text-subtitle-2 py-3">Sheet ID</th>
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
                <th class="font-weight-bold text-subtitle-2 py-3">Sheet Name</th>
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
                <th class="font-weight-bold text-subtitle-2 py-3">Primary Estimate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="text-center">
                <td colspan="5" class="py-12">
                  <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
                  <div class="mt-3 text-caption text-medium-emphasis">Loading custom sheets...</div>
                </td>
              </tr>
              <tr v-else-if="filteredSheets.length === 0" class="text-center">
                <td colspan="5" class="py-12 text-medium-emphasis italic">
                  No custom sheets found.
                </td>
              </tr>
              <tr
                v-else
                v-for="sheet in paginatedSheets"
                :key="sheet.id"
                class="cursor-pointer transition-row hover-shadow accent-border-row record-accent-sheet"
                @click="openSheetEditor(sheet)"
              >
                <td class="font-weight-bold text-body-2 py-3 text-sheet">
                  #{{ sheet.id }}
                </td>
                <td class="text-body-2 font-weight-medium">
                  {{ sheet.customer ? `${sheet.customer.fname} ${sheet.customer.lname}` : '—' }}
                </td>
                <td class="text-body-2 font-weight-bold text-blue-grey-darken-1">
                  {{ sheet.name || '—' }}
                </td>
                <td class="text-caption text-medium-emphasis">
                  {{ formatDate(sheet.created_at) }}
                </td>
                <td class="text-body-2">
                  <span v-if="getPrimaryEstimate(sheet)" class="font-weight-bold text-green-darken-2">
                    {{ getPrimaryEstimate(sheet).name }} (${{ (getPrimaryEstimate(sheet).total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }})
                  </span>
                  <span v-else class="text-medium-emphasis">—</span>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Local Pagination Controls -->
          <v-divider v-if="filteredSheets.length > 0"></v-divider>
          <DirectoryPagination
            v-model="currentPage"
            :total-items="filteredSheets.length"
            :items-per-page="itemsPerPage"
          />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../utils/api'
import { sessionState, navigateTo } from '../store/session'
import { formatLocalDate } from '../utils/dates'
import CustomSheetForm from './CustomSheetForm.vue'
import DirectoryPagination from './DirectoryPagination.vue'

// Local State
const sheetsList = ref([])
const loading = ref(false)
const itemsPerPage = 15

// Persisted navigation states
const directorySearch = computed({
  get: () => sessionState.sheetSearchQuery,
  set: (val) => { sessionState.sheetSearchQuery = val }
})

const currentPage = computed({
  get: () => sessionState.sheetCurrentPage,
  set: (val) => { sessionState.sheetCurrentPage = val }
})

// Check if workspace editor is active
const isWorkspaceActive = computed(() => {
  return sessionState.activeSheetId !== null || sessionState.selectedCustomerId !== null
})

// Fetch all sheets from backend
const fetchSheets = async () => {
  loading.value = true
  try {
    const data = await api.get('/customsheets')
    // We want to calculate the totals for estimates nested inside
    const list = data || []
    list.forEach(sheet => {
      if (Array.isArray(sheet.estimates)) {
        sheet.estimates.forEach(est => {
          let total = 0
          if (Array.isArray(est.estValues)) {
            est.estValues.forEach(val => {
              const amt = parseFloat(val.amt) || 0
              const pricePer = parseFloat(val.pricePer) || 0
              total += amt * pricePer
            })
          }
          est.total = Math.round(total * 100) / 100
        })
      }
    })
    sheetsList.value = list
  } catch (err) {
    console.error('Failed to load custom sheets directory:', err)
  } finally {
    loading.value = false
  }
}

// Find primary estimate in custom sheet
const getPrimaryEstimate = (sheet) => {
  if (!sheet.estimates) return null
  return sheet.estimates.find(e => !!e.isPrimary) || sheet.estimates[0] || null
}

// Filtered list
const filteredSheets = computed(() => {
  const q = directorySearch.value.trim().toLowerCase()
  if (!q) return sheetsList.value

  return sheetsList.value.filter(sheet => {
    const idMatch = String(sheet.id).includes(q)
    const custFname = sheet.customer ? (sheet.customer.fname || '').toLowerCase() : ''
    const custLname = sheet.customer ? (sheet.customer.lname || '').toLowerCase() : ''
    const custName = `${custFname} ${custLname}`
    const sheetName = (sheet.name || '').toLowerCase()

    return (
      idMatch ||
      custName.includes(q) ||
      sheetName.includes(q)
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

const sortedSheets = computed(() => {
  const list = [...filteredSheets.value]
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
const paginatedSheets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedSheets.value.slice(start, start + itemsPerPage)
})

// Navigation triggers
const openSheetEditor = (sheet) => {
  navigateTo('custom', { activeSheetId: sheet.id, selectedCustomerId: sheet.customer_id })
}

const startNewSheet = () => {
  navigateTo('custom', { activeSheetId: 0, selectedCustomerId: null })
}

const handleSheetSaved = (savedSheet) => {
  if (savedSheet && savedSheet.id) {
    sessionState.activeSheetId = savedSheet.id
  }
  fetchSheets()
}

const formatDate = (dateStr) => formatLocalDate(dateStr, 'long')

// Load directory on mounting
onMounted(() => {
  fetchSheets()
})

// Re-fetch directory when returning to list state
watch(isWorkspaceActive, (active) => {
  if (!active) {
    fetchSheets()
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
