<template>
  <v-card class="recently-viewed-card rounded-lg" elevation="2" border>
    <!-- Header -->
    <v-card-item class="bg-primary text-white py-3">
      <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
        <v-icon start class="mr-2">mdi-history</v-icon>
        Recently Viewed Records
      </v-card-title>
      <template v-slot:append v-if="records.length > 0">
        <v-btn
          color="white"
          variant="text"
          density="comfortable"
          icon="mdi-broom"
          title="Clear History"
          size="small"
          @click="clearHistory"
        ></v-btn>
      </template>
    </v-card-item>

    <v-divider></v-divider>

    <!-- Table of Records -->
    <v-card-text class="pa-0">
      <v-table hover fixed-header class="recently-viewed-table" style="table-layout: fixed; width: 100%;" v-if="records.length > 0">
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

      <!-- Empty State -->
      <div v-else class="d-flex flex-column align-center justify-center py-12 text-center">
        <v-avatar color="grey-lighten-3" size="64" class="mb-3">
          <v-icon size="32" color="grey-darken-1">mdi-clock-outline</v-icon>
        </v-avatar>
        <div class="text-subtitle-2 font-weight-bold text-medium-emphasis">No Recent Activity</div>
        <div class="text-caption text-medium-emphasis px-4">
          Records you view will appear here for quick access.
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { recentlyViewedState, clearRecentlyViewed } from '../store/recentlyViewed'
import { navigateTo } from '../store/session'
import { settingsState } from '../store/settings'
import { formatLocalDate } from '../utils/dates'

// Computed records list
const records = computed(() => recentlyViewedState.records || [])

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
      return 'primary' // blue
    case 'credit':
      return 'warning' // amber
    case 'sheet':
      return 'info' // teal
    case 'customer':
      return 'secondary' // purple
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
  } else if (item.type === 'sheet') {
    navigateTo('custom', { activeSheetId: item.id, selectedCustomerId: item.customerId })
  } else if (item.type === 'customer') {
    navigateTo('customers', { selectedCustomerId: item.id })
  }
}

// Clear local storage history
function clearHistory() {
  clearRecentlyViewed()
}
</script>

<style scoped>
.recently-viewed-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}

.recently-viewed-table :deep(th) {
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

.mt-0.5 {
  margin-top: 2px;
}
</style>
