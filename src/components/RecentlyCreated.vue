<template>
  <v-card class="recently-created-card rounded-lg" elevation="2" border>
    <!-- Header -->
    <v-card-item class="bg-accent1 py-3" :class="headerTextClass">
      <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
        <v-icon start class="mr-2">mdi-plus-circle-outline</v-icon>
        Recently Created Records
      </v-card-title>
      <template v-slot:append>
        <v-btn
          :color="headerIconColor"
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
      <UnifiedRecordTable
        :records="records"
        :loading="loading"
        loading-text="Fetching recently created records..."
        empty-icon="mdi-plus-circle-outline"
        empty-title="No Created Records"
        empty-subtitle="No recently created records found in the database."
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useDirectoryTheme } from '../composables/useDirectoryTheme'
import { api } from '../utils/api'
import { sessionState } from '../store/session'
import UnifiedRecordTable from './UnifiedRecordTable.vue'

const { isDark, headerTextClass, headerIconColor } = useDirectoryTheme()

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

    const customerMap = new Map((customersData || []).map(c => [c.id, `${c.fname} ${c.lname}`.trim()]))

    // 1. Normalize Jobs
    const formattedJobs = (jobsData || []).map(job => ({
      id: job.id,
      type: 'job',
      typeName: 'Job',
      details: job.estimate && Number(job.estimate) !== 0
        ? `Estimate: $${Number(job.estimate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'No Estimate',
      customerId: job.customer_id,
      customerName: job.customer ? `${job.customer.fname} ${job.customer.lname}`.trim() : (customerMap.get(job.customer_id) || ''),
      created_at: job.created_at || '',
      thumbnail: null
    }))

    // 2. Normalize Credits
    const formattedCredits = (creditsData || []).map(credit => ({
      id: credit.id,
      type: 'credit',
      typeName: 'Credit',
      details: credit.total && Number(credit.total) !== 0
        ? `Payout: $${Number(credit.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'No Final Credit',
      customerId: credit.customer_id,
      customerName: credit.customer ? `${credit.customer.fname} ${credit.customer.lname}`.trim() : (customerMap.get(credit.customer_id) || ''),
      created_at: credit.created_at || '',
      thumbnail: null
    }))

    // 3. Normalize Sheets
    const formattedSheets = (sheetsData || []).map(sheet => ({
      id: sheet.id,
      type: 'sheet',
      typeName: 'Sheet',
      details: sheet.name || '',
      customerId: sheet.customer_id,
      customerName: sheet.customer ? `${sheet.customer.fname} ${sheet.customer.lname}`.trim() : (customerMap.get(sheet.customer_id) || ''),
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
</style>
