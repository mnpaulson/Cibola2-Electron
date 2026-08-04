<template>
  <div class="customer-orphans-admin">
    <!-- Header Card -->
    <v-card class="mb-4 rounded-lg" elevation="1">
      <v-card-item class="pa-6">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <h3 class="text-h6 font-weight-bold">Unused Customer Cleanup</h3>
            <p class="text-subtitle-2 text-medium-emphasis mb-0">
              Review and delete customer profiles that have no linked jobs, gold credits, or custom sheets.
            </p>
          </div>

          <div class="d-flex align-center ga-3 flex-wrap">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-magnify-scan"
              :loading="scanning"
              :disabled="deleting"
              @click="runScanForUnusedCustomers"
            >
              Scan for Unused Customers
            </v-btn>

            <v-btn
              color="error"
              variant="elevated"
              prepend-icon="mdi-delete-sweep"
              :disabled="scanning || deleting || !hasScanned || orphanCustomers.length === 0"
              @click="showBulkDeleteWarning = true"
            >
              Bulk Delete All Unused ({{ orphanCustomers.length }})
            </v-btn>
          </div>
        </div>
      </v-card-item>
    </v-card>

    <!-- Search & Filter Card (Shown only after scanning) -->
    <v-card v-if="hasScanned" class="mb-4 rounded-lg" elevation="1">
      <v-card-text class="pa-3">
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          placeholder="Filter unused customers by name, ID, phone, email, or address..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
        ></v-text-field>
      </v-card-text>
    </v-card>

    <!-- Initial Unscanned State -->
    <v-card v-if="!hasScanned && !scanning" class="pa-12 text-center rounded-lg" elevation="1">
      <v-icon size="64" color="primary" class="mb-3">mdi-account-search-outline</v-icon>
      <h4 class="text-h6 font-weight-bold">Scan Database for Unused Customers</h4>
      <p class="text-subtitle-2 text-medium-emphasis mb-0">
        Click "Scan for Unused Customers" above to search for customer profiles with no active jobs, gold credits, or custom sheets.
      </p>
    </v-card>

    <!-- Loading State -->
    <v-card v-else-if="scanning" class="pa-12 text-center rounded-lg" elevation="1">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
      <div class="text-subtitle-1 text-medium-emphasis">Scanning for unused customer records...</div>
    </v-card>

    <!-- Empty State (After Scanning) -->
    <v-card v-else-if="hasScanned && filteredOrphans.length === 0" class="pa-12 text-center rounded-lg" elevation="1">
      <v-icon size="64" color="success" class="mb-3">mdi-check-decagram-outline</v-icon>
      <h4 class="text-h6 font-weight-bold">No Unused Customers Found</h4>
      <p class="text-subtitle-2 text-medium-emphasis mb-0">
        {{ searchQuery ? 'No unused customer records match your filter query.' : 'All customer profiles currently have active transaction history.' }}
      </p>
    </v-card>

    <!-- Customers List (After Scanning) -->
    <div v-else-if="hasScanned" class="d-flex flex-column gap-4">
      <v-card
        v-for="cust in paginatedOrphans"
        :key="cust.id"
        class="orphan-card rounded-lg border pa-4"
        elevation="1"
      >
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <div class="d-flex align-center ga-3">
            <v-avatar color="grey-lighten-3" size="40" class="mr-1">
              <v-icon color="grey-darken-1">mdi-account-off-outline</v-icon>
            </v-avatar>
            <div>
              <div
                class="text-subtitle-1 font-weight-bold text-high-emphasis clickable-name"
                title="View Customer Profile"
                @click="goToCustomer(cust.id)"
              >
                #{{ cust.id }}: {{ cust.fname }} {{ cust.lname }}
                <v-icon size="16" color="primary" class="ml-1">mdi-open-in-new</v-icon>
              </div>

              <div class="d-flex align-center flex-wrap ga-3 text-caption text-medium-emphasis mt-1">
                <span v-if="cust.phone"><v-icon size="14" class="mr-1">mdi-phone</v-icon>{{ cust.phone }}</span>
                <span v-if="cust.email"><v-icon size="14" class="mr-1">mdi-email</v-icon>{{ cust.email }}</span>
                <span v-if="formatAddress(cust)"><v-icon size="14" class="mr-1">mdi-map-marker</v-icon>{{ formatAddress(cust) }}</span>
                <span v-if="cust.created_at"><v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>Created: {{ formatDate(cust.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="d-flex align-center ga-2">
            <v-chip color="grey" variant="tonal" size="small" class="font-weight-medium">
              No History (0 Jobs, 0 Credits, 0 Sheets)
            </v-chip>

            <v-btn
              size="small"
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete-outline"
              :disabled="deleting"
              @click="confirmDeleteSingle(cust)"
            >
              Delete
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Directory Pagination -->
      <DirectoryPagination
        v-model="currentPage"
        :total-items="filteredOrphans.length"
        :items-per-page="itemsPerPage"
        class="rounded-lg border"
      />
    </div>

    <!-- Single Delete Confirmation Dialog -->
    <v-dialog v-model="showSingleDeleteDialog" max-width="500" persistent>
      <v-card class="rounded-lg" elevation="3">
        <v-card-item class="bg-error text-white pa-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon size="28" class="mr-3">mdi-alert-outline</v-icon>
              <h3 class="text-h6 font-weight-bold mb-0">Delete Customer Record</h3>
            </div>
            <v-btn icon="mdi-close" variant="text" color="white" density="compact" @click="showSingleDeleteDialog = false" :disabled="deleting"></v-btn>
          </div>
        </v-card-item>

        <v-card-text class="pa-6 text-body-2" v-if="targetCustomer">
          Are you sure you want to permanently delete customer <strong>#{{ targetCustomer.id }}: {{ targetCustomer.fname }} {{ targetCustomer.lname }}</strong>?
          <div class="mt-2 text-caption text-medium-emphasis">
            This customer has no associated jobs, gold credits, or custom sheets.
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end ga-2">
          <v-btn variant="text" color="grey" @click="showSingleDeleteDialog = false" :disabled="deleting">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            prepend-icon="mdi-delete"
            :loading="deleting"
            @click="executeSingleDelete"
          >
            Delete Customer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bulk Delete Warning Modal -->
    <v-dialog v-model="showBulkDeleteWarning" max-width="600" persistent>
      <v-card class="rounded-lg" elevation="4">
        <v-card-item class="bg-error text-white pa-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon size="32" class="mr-3">mdi-alert-decagram</v-icon>
              <div>
                <h3 class="text-h6 font-weight-bold mb-0">Bulk Delete All Unused Customers?</h3>
                <span class="text-caption opacity-90">Permanent Database Maintenance</span>
              </div>
            </div>
            <v-btn icon="mdi-close" variant="text" color="white" density="compact" @click="showBulkDeleteWarning = false" :disabled="deleting"></v-btn>
          </div>
        </v-card-item>

        <v-card-text class="pa-6">
          <v-alert type="error" variant="tonal" color="error" class="mb-4 rounded-lg" icon="mdi-alert-outline" density="comfortable">
            <div class="font-weight-bold">Permanent Deletion Warning</div>
            <div class="text-caption">
              You are about to permanently delete <strong>{{ orphanCustomers.length }}</strong> customer profiles that have no associated transaction history.
            </div>
          </v-alert>

          <div class="text-body-2 mb-4">
            <div class="font-weight-bold mb-2">Summary of action:</div>
            <ul class="pl-4">
              <li class="mb-1">All {{ orphanCustomers.length }} unused customer profiles will be purged from the database.</li>
              <li class="mb-1">Any associated duplicate pair records will be permanently removed.</li>
              <li class="mb-1">Active customer records with jobs, credits, or custom sheets will <strong>not</strong> be affected.</li>
            </ul>
          </div>

          <div class="pa-3 rounded bg-grey-lighten-4 dark:bg-grey-darken-3 border text-center font-weight-bold text-error">
            <v-icon color="error" class="mr-1">mdi-shield-alert-outline</v-icon>
            This operation cannot be undone!
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 justify-end ga-2">
          <v-btn variant="text" color="grey" @click="showBulkDeleteWarning = false" :disabled="deleting">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            prepend-icon="mdi-delete-sweep"
            :loading="deleting"
            @click="executeBulkDelete"
          >
            Confirm & Delete {{ orphanCustomers.length }} Records
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '../../utils/api'
import { showToast } from '../../store/toast'
import { navigateTo } from '../../store/session'
import { formatLocalDate } from '../../utils/dates'
import DirectoryPagination from '../DirectoryPagination.vue'

function goToCustomer(id) {
  if (!id) return
  navigateTo('customers', { selectedCustomerId: id })
}

const scanning = ref(false)
const hasScanned = ref(false)
const deleting = ref(false)
const searchQuery = ref('')

const orphanCustomers = ref([])
const currentPage = ref(1)
const itemsPerPage = 10

const showSingleDeleteDialog = ref(false)
const targetCustomer = ref(null)
const showBulkDeleteWarning = ref(false)

function formatAddress(cust) {
  if (!cust) return ''
  const parts = [cust.addr_st, cust.addr_city, cust.addr_prov, cust.addr_postal, cust.addr_country].filter(Boolean)
  return parts.join(', ')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return formatLocalDate(dateStr, 'medium')
}

const filteredOrphans = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return orphanCustomers.value

  return orphanCustomers.value.filter(c => {
    return (
      String(c.id || '').includes(q) ||
      (c.fname || '').toLowerCase().includes(q) ||
      (c.lname || '').toLowerCase().includes(q) ||
      `${c.fname || ''} ${c.lname || ''}`.toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.addr_st || '').toLowerCase().includes(q)
    )
  })
})

const paginatedOrphans = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredOrphans.value.slice(start, start + itemsPerPage)
})

async function runScanForUnusedCustomers() {
  scanning.value = true
  try {
    const res = await api.get('/customers/orphans')
    orphanCustomers.value = res || []
    hasScanned.value = true
    currentPage.value = 1
    if (orphanCustomers.value.length > 0) {
      showToast(`Scan complete: Found ${orphanCustomers.value.length} unused customer records.`, 'info')
    } else {
      showToast('Scan complete: No unused customer records found.', 'success')
    }
  } catch (err) {
    showToast('Error scanning for unused customers: ' + err.message, 'error')
  } finally {
    scanning.value = false
  }
}

function confirmDeleteSingle(cust) {
  targetCustomer.value = cust
  showSingleDeleteDialog.value = true
}

async function executeSingleDelete() {
  if (!targetCustomer.value) return
  deleting.value = true
  const id = targetCustomer.value.id
  try {
    await api.delete(`/customers/orphans/${id}`)
    showToast(`Deleted customer #${id}`, 'success')
    showSingleDeleteDialog.value = false
    targetCustomer.value = null
    await runScanForUnusedCustomers()
  } catch (err) {
    showToast('Delete error: ' + err.message, 'error')
  } finally {
    deleting.value = false
  }
}

async function executeBulkDelete() {
  deleting.value = true
  try {
    const res = await api.post('/customers/orphans/delete-bulk', {})
    const count = res.deletedCount || 0
    showToast(`Successfully bulk deleted ${count} unused customer records!`, 'success')
    showBulkDeleteWarning.value = false
    await runScanForUnusedCustomers()
  } catch (err) {
    showToast('Bulk delete error: ' + err.message, 'error')
  } finally {
    deleting.value = false
  }
}

watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.customer-orphans-admin {
  width: 100%;
}
.orphan-card {
  transition: all 0.2s ease-in-out;
}
.orphan-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
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
.gap-3, .ga-3 {
  gap: 12px !important;
}
.gap-4, .ga-4 {
  gap: 16px !important;
}
</style>
