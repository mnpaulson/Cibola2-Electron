<template>
  <v-card class="recently-viewed-card rounded-lg" elevation="2" border>
    <!-- Header -->
    <v-card-item class="bg-accent1 py-3" :class="headerTextClass">
      <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
        <v-icon start class="mr-2">mdi-history</v-icon>
        Recently Viewed
      </v-card-title>
      <template v-slot:append>
        <div class="d-flex align-center">
          <v-btn-toggle
            v-model="viewMode"
            density="compact"
            mandatory
            variant="outlined"
            class="view-toggle mr-1"
          >
            <v-btn value="all" size="x-small" class="text-caption font-weight-bold px-2">
              All
            </v-btn>
            <v-btn value="local" size="x-small" class="text-caption font-weight-bold px-2">
              Local
            </v-btn>
          </v-btn-toggle>

          <v-btn
            :color="headerIconColor"
            variant="text"
            density="comfortable"
            icon="mdi-refresh"
            title="Refresh"
            size="small"
            :loading="recentlyViewedState.loadingGlobal"
            @click="handleRefresh"
          ></v-btn>
        </div>
      </template>
    </v-card-item>

    <v-divider></v-divider>

    <!-- Table of Records -->
    <v-card-text class="pa-0">
      <UnifiedRecordTable
        :records="paginatedRecords"
        :loading="viewMode === 'all' && recentlyViewedState.loadingGlobal"
        loading-text="Fetching recently viewed records..."
        empty-icon="mdi-clock-outline"
        :empty-title="viewMode === 'all' ? 'No Recent Activity' : 'No Local Activity'"
        :empty-subtitle="viewMode === 'all' ? 'Records viewed across any terminal will appear here.' : 'Records you view on this device will appear here.'"
      />
      <v-divider v-if="totalItems > itemsPerPage"></v-divider>
      <DirectoryPagination
        v-model="currentPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDirectoryTheme } from '../composables/useDirectoryTheme'
import { sessionState } from '../store/session'
import { recentlyViewedState, fetchGlobalRecentlyViewed } from '../store/recentlyViewed'
import UnifiedRecordTable from './UnifiedRecordTable.vue'
import DirectoryPagination from './DirectoryPagination.vue'

const { isDark, headerTextClass, headerIconColor } = useDirectoryTheme()

// Mode toggle: 'all' (default on startup) or 'local'
const viewMode = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10
let intervalId = null

// Computed records list based on active mode
const records = computed(() => {
  if (viewMode.value === 'all') {
    return recentlyViewedState.globalRecords || []
  }
  return recentlyViewedState.records || []
})

const totalItems = computed(() => records.value.length)

// Slice the records for the current page
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return records.value.slice(start, start + itemsPerPage)
})

// Reset page to 1 when switching view modes
watch(viewMode, () => {
  currentPage.value = 1
  if (viewMode.value === 'all') {
    fetchGlobalRecentlyViewed()
  }
})

// Ensure currentPage remains valid when records change
watch(totalItems, (newTotal) => {
  const pages = Math.ceil(newTotal / itemsPerPage) || 1
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

// Manual refresh handler
async function handleRefresh() {
  if (viewMode.value === 'all') {
    await fetchGlobalRecentlyViewed()
  }
}

// Watch connection status to auto-fetch when connection is established
watch(
  () => sessionState.connectionStatus,
  (status) => {
    if (status === 'connected' && viewMode.value === 'all') {
      fetchGlobalRecentlyViewed()
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchGlobalRecentlyViewed()
  // Periodic background refresh every 45 seconds while dashboard is open
  intervalId = setInterval(() => {
    if (viewMode.value === 'all') {
      fetchGlobalRecentlyViewed()
    }
  }, 45 * 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.recently-viewed-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}

.view-toggle {
  height: 28px !important;
}

.view-toggle :deep(.v-btn) {
  height: 28px !important;
  min-width: 46px !important;
  font-size: 0.75rem !important;
  text-transform: none;
}
</style>
