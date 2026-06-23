<template>
  <v-card class="recently-created-card rounded-lg" elevation="2" border>
    <!-- Header -->
    <v-card-item class="bg-primary text-white py-3">
      <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
        <v-icon start class="mr-2">mdi-plus-circle-outline</v-icon>
        Recently Created Records
      </v-card-title>
      <template v-slot:append>
        <v-btn
          color="white"
          variant="text"
          density="comfortable"
          icon="mdi-refresh"
          title="Refresh"
          size="small"
          :loading="loading"
          @click="fetchRecords"
        ></v-btn>
      </template>
    </v-card-item>

    <v-divider></v-divider>

    <!-- Table of Records -->
    <v-card-text class="pa-0">
      <v-table hover fixed-header class="recently-created-table" style="table-layout: fixed; width: 100%;" v-if="records.length > 0">
        <thead>
          <tr>
            <th class="text-left font-weight-bold text-caption py-2" style="width: 55px;">Preview</th>
            <th class="text-left font-weight-bold text-caption py-2" style="width: 90px;">Type</th>
            <th class="text-left font-weight-bold text-caption py-2" style="width: 70px;">Record</th>
            <th class="text-left font-weight-bold text-caption py-2">Details</th>
            <th class="text-left font-weight-bold text-caption py-2" style="width: 90px;">Created</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in records"
            :key="item.type + '-' + item.id"
            class="cursor-pointer transition-row"
            @click="goToRecord(item)"
          >
            <!-- Preview / Thumbnail Column -->
            <td class="py-2">
              <v-img
                v-if="item.type === 'job' && item.thumbnail"
                :src="getImageUrl(item.thumbnail)"
                width="36"
                height="36"
                cover
                class="rounded border"
                bg-color="grey-lighten-4"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                    <v-progress-circular indeterminate size="12" width="2" color="primary"></v-progress-circular>
                  </div>
                </template>
              </v-img>
              <v-avatar v-else :color="getTypeColor(item.type)" variant="tonal" size="36" class="rounded border">
                <v-icon size="18">{{ getTypeIcon(item.type) }}</v-icon>
              </v-avatar>
            </td>

            <!-- Record Type Column -->
            <td class="py-2">
              <span class="text-body-2 font-weight-medium">{{ item.typeName }}</span>
            </td>

            <!-- Record ID Column -->
            <td class="py-2">
              <span class="font-weight-bold text-primary text-body-2">#{{ item.id }}</span>
            </td>

            <!-- Details Column -->
            <td class="py-2">
              <div class="text-body-2 font-weight-medium text-truncate" style="max-width: 120px;">
                {{ item.details }}
              </div>
              <div
                v-if="item.customerName && item.type !== 'customer'"
                class="text-caption text-medium-emphasis text-truncate"
                style="max-width: 120px;"
              >
                <v-icon size="12" class="mr-0.5">mdi-account</v-icon>
                {{ item.customerName }}
              </div>
            </td>

            <!-- Created Date Column -->
            <td class="py-2 text-medium-emphasis text-caption">
              {{ formatDate(item.created_at) }}
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Empty State / Loading State -->
      <div v-else-if="loading" class="d-flex flex-column align-center justify-center py-12">
        <v-progress-circular indeterminate size="36" color="primary"></v-progress-circular>
        <div class="mt-2 text-caption text-medium-emphasis">Fetching recently created records...</div>
      </div>
      <div v-else class="d-flex flex-column align-center justify-center py-12 text-center">
        <v-avatar color="grey-lighten-3" size="64" class="mb-3">
          <v-icon size="32" color="grey-darken-1">mdi-plus-circle-outline</v-icon>
        </v-avatar>
        <div class="text-subtitle-2 font-weight-bold text-medium-emphasis">No Created Records</div>
        <div class="text-caption text-medium-emphasis px-4">
          No recently created records found in the database.
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { api } from '../utils/api'
import { navigateTo, sessionState } from '../store/session'
import { settingsState } from '../store/settings'
import { formatLocalDate } from '../utils/dates'

const records = ref([])
const loading = ref(false)
let intervalId = null

// Fetch recent records from backend API
async function fetchRecords() {
  if (sessionState.connectionStatus !== 'connected') return

  loading.value = true
  try {
    const [jobsData, creditsData, sheetsData, customersData] = await Promise.all([
      api.get('/jobs?page=1&limit=10&sortBy=created_at&descending=true'),
      api.get('/goldcredits?page=1&limit=10&sortBy=created_at&descending=true'),
      api.get('/customsheets?page=1&limit=10&sortBy=created_at&descending=true'),
      api.get('/customers')
    ])

    // 1. Normalize Jobs
    const formattedJobs = (jobsData || []).map(job => ({
      id: job.id,
      type: 'job',
      typeName: 'Job',
      details: job.estimate && Number(job.estimate) !== 0
        ? `Estimate: $${Number(job.estimate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'No Estimate',
      customerId: job.customer_id,
      customerName: job.customer ? `${job.customer.fname} ${job.customer.lname}`.trim() : '',
      created_at: job.created_at || '',
      thumbnail: null
    }))

    // 2. Normalize Credits
    const formattedCredits = (creditsData || []).map(credit => ({
      id: credit.id,
      type: 'credit',
      typeName: 'Store Credit',
      details: credit.credit_value && Number(credit.credit_value) !== 0
        ? `Payout: $${Number(credit.credit_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'No Final Credit',
      customerId: credit.customer_id,
      customerName: credit.customer ? `${credit.customer.fname} ${credit.customer.lname}`.trim() : '',
      created_at: credit.created_at || '',
      thumbnail: null
    }))

    // 3. Normalize Sheets
    const formattedSheets = (sheetsData || []).map(sheet => ({
      id: sheet.id,
      type: 'sheet',
      typeName: 'Custom Sheet',
      details: sheet.name || '',
      customerId: sheet.customer_id,
      customerName: sheet.customer ? `${sheet.customer.fname} ${sheet.customer.lname}`.trim() : '',
      created_at: sheet.created_at || '',
      thumbnail: null
    }))

    // 4. Normalize Customers
    const formattedCustomers = (customersData || []).map(cust => ({
      id: cust.id,
      type: 'customer',
      typeName: 'Customer',
      details: `${cust.fname} ${cust.lname}`.trim(),
      customerId: cust.id,
      customerName: `${cust.fname} ${cust.lname}`.trim(),
      created_at: cust.created_at || '',
      thumbnail: null
    }))

    // Combine and sort by created_at descending
    const combined = [
      ...formattedJobs,
      ...formattedCredits,
      ...formattedSheets,
      ...formattedCustomers
    ]

    combined.sort((a, b) => {
      const dateA = a.created_at || ''
      const dateB = b.created_at || ''
      return dateB.localeCompare(dateA)
    })

    // Take top 10
    const top10 = combined.slice(0, 10)

    // Load thumbnails for top 10 jobs
    records.value = await Promise.all(
      top10.map(async (record) => {
        if (record.type === 'job') {
          try {
            const fullJob = await api.get(`/jobs/${record.id}`)
            if (fullJob && fullJob.job_images && fullJob.job_images.length > 0) {
              record.thumbnail = fullJob.job_images[0].image
            }
          } catch (err) {
            console.error('[RecentlyCreated] Failed to load job thumbnail:', err)
          }
        }
        return record
      })
    )
  } catch (err) {
    console.error('[RecentlyCreated] Failed to fetch recently created records:', err)
  } finally {
    loading.value = false
  }
}

// Resolve absolute image URL for thumbnails
function getImageUrl(imgStr) {
  if (!imgStr) return ''
  if (imgStr.startsWith('data:')) {
    return imgStr
  }
  const base = settingsState.serverURL?.replace(/\/$/, '') || ''
  const path = imgStr.startsWith('/') ? imgStr : `/${imgStr}`
  return `${base}${path}`
}

// Map record type to standard icon
function getTypeIcon(type) {
  switch (type) {
    case 'job':
      return 'mdi-briefcase-outline'
    case 'credit':
      return 'mdi-credit-card-outline'
    case 'sheet':
      return 'mdi-list-box-outline'
    case 'customer':
      return 'mdi-account'
    default:
      return 'mdi-help-circle'
  }
}

// Map record type to harmonious color
function getTypeColor(type) {
  switch (type) {
    case 'job':
      return 'primary'
    case 'credit':
      return 'warning'
    case 'sheet':
      return 'info'
    case 'customer':
      return 'secondary'
    default:
      return 'grey'
  }
}

// Format date
const formatDate = (dateStr) => formatLocalDate(dateStr, 'empty-dash')

// Navigate to selected record
function goToRecord(item) {
  if (item.type === 'job') {
    navigateTo('jobs', { activeJobId: item.id, selectedCustomerId: item.customerId })
  } else if (item.type === 'credit') {
    navigateTo('credits', { activeCreditId: item.id, selectedCustomerId: item.customerId })
  } else if (item.type === 'sheet') {
    navigateTo('custom', { activeSheetId: item.id, selectedCustomerId: item.customerId })
  } else if (item.type === 'customer') {
    navigateTo('customers', { selectedCustomerId: item.id })
  }
}

// Watch connection status to auto-fetch once connected
watch(
  () => sessionState.connectionStatus,
  (status) => {
    if (status === 'connected') {
      fetchRecords()
    }
  },
  { immediate: true }
)

onMounted(() => {
  // Setup 5-minute auto-refresh
  intervalId = setInterval(fetchRecords, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.recently-created-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}

.recently-created-table :deep(th) {
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

.border {
  border: 1px solid rgba(var(--v-border-color), 0.12) !important;
}
</style>
