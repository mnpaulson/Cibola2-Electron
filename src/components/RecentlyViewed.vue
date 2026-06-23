<template>
  <v-card class="recently-viewed-card rounded-lg" elevation="2" border>
    <!-- Header -->
    <v-card-item class="bg-accent1 text-white py-3">
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
      <UnifiedRecordTable
        :records="records"
        empty-icon="mdi-clock-outline"
        empty-title="No Recent Activity"
        empty-subtitle="Records you view will appear here for quick access."
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { recentlyViewedState, clearRecentlyViewed } from '../store/recentlyViewed'
import UnifiedRecordTable from './UnifiedRecordTable.vue'

// Computed records list
const records = computed(() => recentlyViewedState.records || [])

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
</style>
