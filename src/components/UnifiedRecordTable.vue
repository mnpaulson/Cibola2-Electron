<template>
  <div class="unified-record-table-container">
    <v-table hover fixed-header class="unified-record-table" style="table-layout: fixed; width: 100%;" v-if="!loading && processedRecords.length > 0">
      <thead>
        <tr>
          <th class="text-left font-weight-bold text-caption py-2" style="width: 50px;">Preview</th>
          <th
            class="text-left font-weight-bold text-caption py-2"
            :class="{ 'sortable-header': sortable }"
            style="width: 80px;"
            @click="toggleSort('type')"
          >
            <div class="d-flex align-center">
              Type
              <v-icon size="small" class="ml-1" v-if="sortable && sortBy === 'type'">
                {{ sortDesc ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
              </v-icon>
            </div>
          </th>
          <th
            class="text-left font-weight-bold text-caption py-2"
            :class="{ 'sortable-header': sortable }"
            style="width: 65px;"
            @click="toggleSort('id')"
          >
            <div class="d-flex align-center">
              Record
              <v-icon size="small" class="ml-1" v-if="sortable && sortBy === 'id'">
                {{ sortDesc ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
              </v-icon>
            </div>
          </th>
          <th
            class="text-left font-weight-bold text-caption py-2"
            :class="{ 'sortable-header': sortable }"
            style="overflow: hidden; max-width: 0;"
            @click="toggleSort('details')"
          >
            <div class="d-flex align-center">
              Details
              <v-icon size="small" class="ml-1" v-if="sortable && sortBy === 'details'">
                {{ sortDesc ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
              </v-icon>
            </div>
          </th>
          <th
            class="text-left font-weight-bold text-caption py-2"
            :class="{ 'sortable-header': sortable }"
            style="width: 108px;"
            @click="toggleSort('created_at')"
          >
            <div class="d-flex align-center">
              Created
              <v-icon size="small" class="ml-1" v-if="sortable && sortBy === 'created_at'">
                {{ sortDesc ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
              </v-icon>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in processedRecords"
          :key="item.type + '-' + item.id"
          class="cursor-pointer transition-row accent-border-row"
          :class="'record-accent-' + (item.type === 'custom' ? 'sheet' : item.type)"
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
            <span class="text-body-2 font-weight-bold" :class="'text-' + getTypeColor(item.type)">{{ item.typeName }}</span>
          </td>

          <!-- Record ID Column -->
          <td class="py-2">
            <span class="font-weight-bold text-medium-emphasis text-body-2">#{{ item.id }}</span>
          </td>

          <!-- Details Column -->
          <td class="py-2" style="overflow: hidden; max-width: 0;">
            <div class="text-body-2 font-weight-medium text-truncate" style="max-width: 100%;">
              {{ showCustomerName ? item.customerName : item.details }}
            </div>
          </td>

          <!-- Created Date Column -->
          <td class="py-2 text-medium-emphasis text-caption">
            {{ formatDate(item.created_at) }}
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Loading State -->
    <div v-else-if="loading" class="d-flex flex-column align-center justify-center py-12">
      <v-progress-circular indeterminate size="36" color="primary"></v-progress-circular>
      <div v-if="loadingText" class="mt-2 text-caption text-medium-emphasis">{{ loadingText }}</div>
    </div>

    <!-- Empty State -->
    <div v-else class="d-flex flex-column align-center justify-center py-12 text-center">
      <v-avatar color="grey-lighten-3" size="64" class="mb-3">
        <v-icon size="32" color="grey-darken-1">{{ emptyIcon }}</v-icon>
      </v-avatar>
      <div class="text-subtitle-2 font-weight-bold text-medium-emphasis">{{ emptyTitle }}</div>
      <div v-if="emptySubtitle" class="text-caption text-medium-emphasis px-4">
        {{ emptySubtitle }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { navigateTo } from '../store/session'
import { settingsState } from '../store/settings'
import { formatLocalDate } from '../utils/dates'

const props = defineProps({
  records: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  },
  sortable: {
    type: Boolean,
    default: false
  },
  showCustomerName: {
    type: Boolean,
    default: true
  },
  emptyIcon: {
    type: String,
    default: 'mdi-file-outline'
  },
  emptyTitle: {
    type: String,
    default: 'No Records Found'
  },
  emptySubtitle: {
    type: String,
    default: ''
  },
  initialSortBy: {
    type: String,
    default: 'created_at'
  },
  initialSortDesc: {
    type: Boolean,
    default: true
  }
})

// Sorting state
const sortBy = ref(props.initialSortBy)
const sortDesc = ref(props.initialSortDesc)

function toggleSort(field) {
  if (!props.sortable) return
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = field
    sortDesc.value = field === 'created_at' ? true : false
  }
}

// Client-side sorting logic
const processedRecords = computed(() => {
  if (!props.sortable || !sortBy.value) {
    return props.records
  }

  const list = [...props.records]
  return list.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'id') {
      comparison = a.id - b.id
    } else if (sortBy.value === 'type') {
      const typeA = a.typeName || ''
      const typeB = b.typeName || ''
      comparison = typeA.localeCompare(typeB)
    } else if (sortBy.value === 'details') {
      const detailsA = a.details || ''
      const detailsB = b.details || ''
      comparison = detailsA.localeCompare(detailsB)
    } else if (sortBy.value === 'created_at') {
      const dateA = a.created_at || ''
      const dateB = b.created_at || ''
      comparison = dateA.localeCompare(dateB)
    }
    return sortDesc.value ? -comparison : comparison
  })
})

// Resolve absolute image URL for job thumbnails
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
    case 'custom':
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
      return 'job'
    case 'credit':
      return 'credit'
    case 'sheet':
    case 'custom':
      return 'sheet'
    case 'customer':
      return 'customer'
    default:
      return 'grey'
  }
}

// Format creation date
const formatDate = (dateStr) => formatLocalDate(dateStr, 'empty-dash')

// Navigate to selected record
function goToRecord(item) {
  if (item.type === 'job') {
    navigateTo('jobs', { activeJobId: item.id, selectedCustomerId: item.customerId })
  } else if (item.type === 'credit') {
    navigateTo('credits', { activeCreditId: item.id, selectedCustomerId: item.customerId })
  } else if (item.type === 'sheet' || item.type === 'custom') {
    navigateTo('custom', { activeSheetId: item.id, selectedCustomerId: item.customerId })
  } else if (item.type === 'customer') {
    navigateTo('customers', { selectedCustomerId: item.id })
  }
}
</script>

<style scoped>
.unified-record-table :deep(th) {
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

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable-header:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}
</style>
