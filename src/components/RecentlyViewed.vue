<template>
  <v-card class="recently-viewed-card rounded-lg" elevation="2" border>
    <!-- Header -->
    <v-card-item class="bg-accent1 py-3" :class="headerTextClass">
      <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
        <v-icon start class="mr-2">mdi-history</v-icon>
        Recently Viewed Records
      </v-card-title>
      <template v-slot:append v-if="records.length > 0">
        <v-btn
          :color="headerIconColor"
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
      <UnifiedRecordTable
        :records="paginatedRecords"
        empty-icon="mdi-clock-outline"
        empty-title="No Recent Activity"
        empty-subtitle="Records you view will appear here for quick access."
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
import { ref, computed, watch } from 'vue'
import { useDirectoryTheme } from '../composables/useDirectoryTheme'
import { recentlyViewedState, clearRecentlyViewed } from '../store/recentlyViewed'
import UnifiedRecordTable from './UnifiedRecordTable.vue'
import DirectoryPagination from './DirectoryPagination.vue'

const { isDark, headerTextClass, headerIconColor } = useDirectoryTheme()

const currentPage = ref(1)
const itemsPerPage = 10

// Computed records list
const records = computed(() => recentlyViewedState.records || [])

const totalItems = computed(() => records.value.length)

// Slice the records for the current page
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return records.value.slice(start, start + itemsPerPage)
})

// Ensure currentPage remains valid when records change
watch(totalItems, (newTotal) => {
  const pages = Math.ceil(newTotal / itemsPerPage) || 1
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

// Clear local storage history
function clearHistory() {
  clearRecentlyViewed()
  currentPage.value = 1
}
</script>

<style scoped>
.recently-viewed-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}
</style>
