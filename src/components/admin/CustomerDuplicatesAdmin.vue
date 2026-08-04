<template>
  <div class="customer-duplicates-admin">
    <!-- Header Card -->
    <v-card class="mb-4 rounded-lg" elevation="1">
      <v-card-item class="pa-6">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <h3 class="text-h6 font-weight-bold">Duplicate Contact Management</h3>
            <p class="text-subtitle-2 text-medium-emphasis mb-0">
              Identify, review, and merge potential duplicate customer records.
            </p>
          </div>

          <div class="d-flex align-center ga-3 flex-wrap">
            <v-btn
              color="warning"
              variant="elevated"
              prepend-icon="mdi-flash-auto"
              :disabled="scanning || batchMerging || unreviewedPairs.length === 0"
              @click="showBatchMergeWarning = true"
            >
              Merge All Exact Matches
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-magnify-scan"
              :loading="scanning"
              :disabled="batchMerging"
              @click="runDatabaseScan"
            >
              Scan Database for Duplicates
            </v-btn>
          </div>
        </div>
      </v-card-item>
    </v-card>

    <!-- Search & Filter Card -->
    <v-card class="mb-4 rounded-lg" elevation="1">
      <v-card-text class="pa-3">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          placeholder="Filter candidate records by customer name, ID, phone, email, address, or match reason..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
        ></v-text-field>
      </v-card-text>
    </v-card>

    <!-- Navigation Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-4">
      <v-tab value="unreviewed" class="font-weight-bold">
        <v-icon start>mdi-alert-outline</v-icon>
        Potential Duplicates
        <v-chip color="error" size="x-small" class="ml-2 font-weight-bold" v-if="filteredUnreviewedPairs.length">
          {{ filteredUnreviewedPairs.length }}
        </v-chip>
      </v-tab>
      <v-tab value="rejected" class="font-weight-bold">
        <v-icon start>mdi-eye-off-outline</v-icon>
        Rejected Pairs
        <v-chip color="grey" size="x-small" class="ml-2 font-weight-bold" v-if="filteredRejectedPairs.length">
          {{ filteredRejectedPairs.length }}
        </v-chip>
      </v-tab>
    </v-tabs>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-12 text-center rounded-lg" elevation="1">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
      <div class="text-subtitle-1 text-medium-emphasis">Fetching duplicate pairs...</div>
    </v-card>

    <!-- Tab Content -->
    <div v-else>
      <!-- Unreviewed Pairs View -->
      <div v-if="activeTab === 'unreviewed'">
        <v-card v-if="filteredUnreviewedPairs.length === 0" class="pa-12 text-center rounded-lg" elevation="1">
          <v-icon size="64" color="success" class="mb-3">mdi-check-circle-outline</v-icon>
          <h4 class="text-h6 font-weight-bold">No Unreviewed Duplicates</h4>
          <p class="text-subtitle-2 text-medium-emphasis mb-0">
            {{ searchQuery ? 'No candidate pairs match your filter query.' : 'No duplicates currently detected.' }}
          </p>
        </v-card>

        <div v-else class="d-flex flex-column gap-4">
          <v-card
            v-for="pair in paginatedUnreviewed"
            :key="pair.id"
            class="pair-card rounded-lg border pa-4"
            elevation="1"
          >
            <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-3 px-1">
              <div class="d-flex align-center flex-wrap ga-2">
                <v-chip :color="getScoreColor(pair.similarity_score)" class="font-weight-bold mr-2" size="small">
                  {{ Math.round(pair.similarity_score) }}% Match Score
                </v-chip>
                <div class="d-flex align-center flex-wrap ga-1">
                  <v-chip
                    v-for="(reason, idx) in pair.match_reasons"
                    :key="idx"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    class="mr-1 mb-1"
                  >
                    {{ reason }}
                  </v-chip>
                </div>
              </div>

              <div class="d-flex align-center ga-1">
                <v-btn
                  size="small"
                  color="grey"
                  variant="outlined"
                  prepend-icon="mdi-eye-off-outline"
                  class="mr-2"
                  @click="rejectPair(pair.id)"
                >
                  Reject (Not Duplicate)
                </v-btn>
                <v-btn
                  size="small"
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-merge"
                  @click="openMergeModal(pair.customer_id_1, pair.customer_id_2, pair.id)"
                >
                  Review & Merge
                </v-btn>
              </div>
            </div>

            <!-- Customer Comparison Cards -->
            <v-row density="compact">
              <v-col cols="12" md="6">
                <div class="surface-card-bg pa-3 rounded border">
                  <div
                    class="text-subtitle-2 font-weight-bold text-high-emphasis mb-1 clickable-name"
                    title="View Customer Profile"
                    @click="goToCustomer(pair.customer1.id)"
                  >
                    #{{ pair.customer1.id }}: {{ pair.customer1.fname }} {{ pair.customer1.lname }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    <div><v-icon size="14" class="mr-1">mdi-phone</v-icon>{{ pair.customer1.phone || 'No phone' }}</div>
                    <div><v-icon size="14" class="mr-1">mdi-email</v-icon>{{ pair.customer1.email || 'No email' }}</div>
                    <div v-if="pair.customer1.addr_st"><v-icon size="14" class="mr-1">mdi-map-marker</v-icon>{{ pair.customer1.addr_st }}</div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="surface-card-bg pa-3 rounded border">
                  <div
                    class="text-subtitle-2 font-weight-bold text-high-emphasis mb-1 clickable-name"
                    title="View Customer Profile"
                    @click="goToCustomer(pair.customer2.id)"
                  >
                    #{{ pair.customer2.id }}: {{ pair.customer2.fname }} {{ pair.customer2.lname }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    <div><v-icon size="14" class="mr-1">mdi-phone</v-icon>{{ pair.customer2.phone || 'No phone' }}</div>
                    <div><v-icon size="14" class="mr-1">mdi-email</v-icon>{{ pair.customer2.email || 'No email' }}</div>
                    <div v-if="pair.customer2.addr_st"><v-icon size="14" class="mr-1">mdi-map-marker</v-icon>{{ pair.customer2.addr_st }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- Directory Pagination -->
          <DirectoryPagination
            v-model="currentPageUnreviewed"
            :total-items="filteredUnreviewedPairs.length"
            :items-per-page="10"
            class="rounded-lg border"
          />
        </div>
      </div>

      <!-- Rejected Pairs View -->
      <div v-if="activeTab === 'rejected'">
        <v-card v-if="filteredRejectedPairs.length === 0" class="pa-12 text-center rounded-lg" elevation="1">
          <v-icon size="64" color="grey" class="mb-3">mdi-archive-cancel-outline</v-icon>
          <h4 class="text-h6 font-weight-bold">No Rejected Pairs</h4>
          <p class="text-subtitle-2 text-medium-emphasis mb-0">
            {{ searchQuery ? 'No rejected pairs match your filter query.' : 'No duplicate customer pairs have been marked as rejected.' }}
          </p>
        </v-card>

        <div v-else class="d-flex flex-column gap-4">
          <v-card
            v-for="pair in paginatedRejected"
            :key="pair.id"
            class="pair-card rounded-lg border pa-4 opacity-80"
            elevation="1"
          >
            <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-3 px-1">
              <div class="d-flex align-center">
                <v-chip color="grey" class="font-weight-bold mr-3" size="small">
                  Rejected Pair ({{ Math.round(pair.similarity_score) }}% Match)
                </v-chip>
              </div>

              <div class="d-flex align-center gap-2">
                <v-btn
                  size="small"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-undo"
                  @click="unrejectPair(pair.id)"
                >
                  Undo Rejection
                </v-btn>
              </div>
            </div>

            <!-- Customer Comparison Cards -->
            <v-row density="compact">
              <v-col cols="12" md="6">
                <div class="surface-card-bg pa-3 rounded border">
                  <div
                    class="text-subtitle-2 font-weight-bold text-high-emphasis clickable-name"
                    title="View Customer Profile"
                    @click="goToCustomer(pair.customer1.id)"
                  >
                    Customer #{{ pair.customer1.id }}: {{ pair.customer1.fname }} {{ pair.customer1.lname }}
                    <v-icon size="14" color="primary" class="ml-1">mdi-open-in-new</v-icon>
                  </div>
                  <div class="text-caption text-medium-emphasis">Phone: {{ pair.customer1.phone || 'N/A' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="surface-card-bg pa-3 rounded border">
                  <div
                    class="text-subtitle-2 font-weight-bold text-high-emphasis clickable-name"
                    title="View Customer Profile"
                    @click="goToCustomer(pair.customer2.id)"
                  >
                    Customer #{{ pair.customer2.id }}: {{ pair.customer2.fname }} {{ pair.customer2.lname }}
                    <v-icon size="14" color="primary" class="ml-1">mdi-open-in-new</v-icon>
                  </div>
                  <div class="text-caption text-medium-emphasis">Phone: {{ pair.customer2.phone || 'N/A' }}</div>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- Directory Pagination -->
          <DirectoryPagination
            v-model="currentPageRejected"
            :total-items="filteredRejectedPairs.length"
            :items-per-page="10"
            class="rounded-lg border"
          />
        </div>
      </div>
    </div>

    <!-- Reusable Side-by-Side Merge Comparison Modal -->
    <CustomerMergeModal
      v-if="selectedPair"
      v-model="showMergeModal"
      :customer-id1="selectedPair.id1"
      :customer-id2="selectedPair.id2"
      :pair-id="selectedPair.pairId"
      @merged="handleMerged"
    />

    <!-- Big Warning Dialog for Merge All Exact Matches -->
    <v-dialog v-model="showBatchMergeWarning" max-width="650" persistent>
      <v-card class="rounded-lg" elevation="4">
        <v-card-item class="bg-warning text-white pa-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon size="32" class="mr-3">mdi-alert-decagram</v-icon>
              <div>
                <h3 class="text-h6 font-weight-bold mb-0">Merge All Exact Matching Customers?</h3>
                <span class="text-caption opacity-90">Bulk Customer Consolidation</span>
              </div>
            </div>
            <v-btn icon="mdi-close" variant="text" color="white" density="compact" @click="showBatchMergeWarning = false" :disabled="batchMerging"></v-btn>
          </div>
        </v-card-item>

        <v-card-text class="pa-6">
          <v-alert type="warning" variant="tonal" color="warning" class="mb-4 rounded-lg" icon="mdi-alert-outline" density="comfortable">
            <div class="font-weight-bold">Automatic Bulk Consolidation Warning</div>
            <div class="text-caption">
              This will inspect all unreviewed duplicate candidate pairs in the database. Any pair where <strong>First Name, Last Name, Phone, Email, and Address</strong> match 100% (or are empty) will be merged automatically.
            </div>
          </v-alert>

          <div class="text-body-2 mb-4">
            <div class="font-weight-bold mb-2">What happens during bulk auto-merge?</div>
            <ul class="pl-4">
              <li class="mb-1">Primary customer profiles will be updated with all consolidated contact details.</li>
              <li class="mb-1">All historical <strong>Jobs, Gold Credits, Custom Sheets, Estimates, and Images</strong> on secondary records will be re-linked to the primary customer ID.</li>
              <li class="mb-1">Secondary duplicate customer records will be <strong>permanently deleted</strong>.</li>
            </ul>
          </div>

          <div class="pa-3 rounded surface-card-bg border text-center font-weight-bold text-error">
            <v-icon color="error" class="mr-1">mdi-shield-alert-outline</v-icon>
            This action cannot be undone!
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end ga-2">
          <v-btn variant="text" color="grey" @click="showBatchMergeWarning = false" :disabled="batchMerging">
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            prepend-icon="mdi-flash-auto"
            :loading="batchMerging"
            @click="executeBatchMergeExact"
          >
            Confirm & Merge All Exact Matches
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../../utils/api'
import { showToast } from '../../store/toast'
import { navigateTo } from '../../store/session'
import CustomerMergeModal from '../CustomerMergeModal.vue'
import DirectoryPagination from '../DirectoryPagination.vue'

function goToCustomer(id) {
  if (!id) return
  navigateTo('customers', { selectedCustomerId: id })
}

const activeTab = ref('unreviewed')
const loading = ref(false)
const scanning = ref(false)
const batchMerging = ref(false)
const showBatchMergeWarning = ref(false)
const searchQuery = ref('')

const unreviewedPairs = ref([])
const rejectedPairs = ref([])

const currentPageUnreviewed = ref(1)
const currentPageRejected = ref(1)

const itemsPerPage = 10

function matchesSearch(pair, query) {
  if (!query) return true
  const q = query.toLowerCase()
  const c1 = pair.customer1 || {}
  const c2 = pair.customer2 || {}

  const matchC1 = (
    String(c1.id || '').includes(q) ||
    (c1.fname || '').toLowerCase().includes(q) ||
    (c1.lname || '').toLowerCase().includes(q) ||
    `${c1.fname || ''} ${c1.lname || ''}`.toLowerCase().includes(q) ||
    (c1.phone || '').toLowerCase().includes(q) ||
    (c1.email || '').toLowerCase().includes(q) ||
    (c1.addr_st || '').toLowerCase().includes(q)
  )

  const matchC2 = (
    String(c2.id || '').includes(q) ||
    (c2.fname || '').toLowerCase().includes(q) ||
    (c2.lname || '').toLowerCase().includes(q) ||
    `${c2.fname || ''} ${c2.lname || ''}`.toLowerCase().includes(q) ||
    (c2.phone || '').toLowerCase().includes(q) ||
    (c2.email || '').toLowerCase().includes(q) ||
    (c2.addr_st || '').toLowerCase().includes(q)
  )

  const matchReasons = (pair.match_reasons || []).join(' ').toLowerCase().includes(q)
  const matchScore = String(Math.round(pair.similarity_score || 0)).includes(q)

  return matchC1 || matchC2 || matchReasons || matchScore
}

const filteredUnreviewedPairs = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return unreviewedPairs.value
  return unreviewedPairs.value.filter(pair => matchesSearch(pair, q))
})

const filteredRejectedPairs = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return rejectedPairs.value
  return rejectedPairs.value.filter(pair => matchesSearch(pair, q))
})

const paginatedUnreviewed = computed(() => {
  const start = (currentPageUnreviewed.value - 1) * itemsPerPage
  return filteredUnreviewedPairs.value.slice(start, start + itemsPerPage)
})

const paginatedRejected = computed(() => {
  const start = (currentPageRejected.value - 1) * itemsPerPage
  return filteredRejectedPairs.value.slice(start, start + itemsPerPage)
})

const showMergeModal = ref(false)
const selectedPair = ref(null)

function getScoreColor(score) {
  if (score >= 90) return 'error'
  if (score >= 80) return 'warning'
  return 'info'
}

async function fetchDuplicates() {
  loading.value = true
  try {
    const unrev = await api.get('/customers/duplicates?status=unreviewed')
    const rej = await api.get('/customers/duplicates?status=rejected')

    unreviewedPairs.value = unrev || []
    rejectedPairs.value = rej || []
    currentPageUnreviewed.value = 1
    currentPageRejected.value = 1
  } catch (err) {
    showToast('Failed to fetch duplicate customer pairs: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

async function runDatabaseScan() {
  scanning.value = true
  try {
    const res = await api.post('/customers/duplicates/scan', {})
    showToast(`Scan complete: Scanned ${res.totalCustomers} customers. Flagged ${res.flaggedPairs} potential duplicate pairs.`, 'success')
    await fetchDuplicates()
  } catch (err) {
    showToast('Scan error: ' + err.message, 'error')
  } finally {
    scanning.value = false
  }
}

async function executeBatchMergeExact() {
  batchMerging.value = true
  try {
    const res = await api.post('/customers/merge-exact', {})
    const count = res.mergedCount || 0
    if (count > 0) {
      showToast(`Successfully merged ${count} exact duplicate customer records!`, 'success')
    } else {
      showToast('No exact matching customer pairs were found to auto-merge.', 'info')
    }
    showBatchMergeWarning.value = false
    await fetchDuplicates()
  } catch (err) {
    showToast('Batch merge error: ' + err.message, 'error')
  } finally {
    batchMerging.value = false
  }
}

async function rejectPair(pairId) {
  try {
    await api.post(`/customers/duplicates/${pairId}/reject`, {})
    showToast('Marked pair as rejected', 'info')
    await fetchDuplicates()
  } catch (err) {
    showToast('Error rejecting pair: ' + err.message, 'error')
  }
}

async function unrejectPair(pairId) {
  try {
    await api.post(`/customers/duplicates/${pairId}/unreject`, {})
    showToast('Restored pair to unreviewed list', 'success')
    await fetchDuplicates()
  } catch (err) {
    showToast('Error restoring pair: ' + err.message, 'error')
  }
}

function openMergeModal(id1, id2, pairId = null) {
  selectedPair.value = { id1, id2, pairId }
  showMergeModal.value = true
}

function handleMerged() {
  fetchDuplicates()
}

watch([searchQuery, activeTab], () => {
  currentPageUnreviewed.value = 1
  currentPageRejected.value = 1
})

onMounted(() => {
  fetchDuplicates()
})
</script>

<style scoped>
.customer-duplicates-admin {
  width: 100%;
}
.pair-card {
  transition: all 0.2s ease-in-out;
}
.pair-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
}
.surface-card-bg {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
.clickable-name {
  cursor: pointer;
  transition: color 0.15s ease-in-out;
}
.clickable-name:hover {
  color: rgb(var(--v-theme-primary)) !important;
  text-decoration: underline;
}
.gap-2, .ga-2 {
  gap: 8px !important;
}
.gap-4, .ga-4 {
  gap: 16px !important;
}
.ga-3 {
  gap: 12px !important;
}
</style>
