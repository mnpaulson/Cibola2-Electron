<template>
  <v-expand-transition>
    <div v-if="isOffline" class="connection-banner pa-3 d-flex align-center justify-center">
      <v-icon color="white" class="mr-2" size="20">mdi-wifi-off</v-icon>
      <span class="text-subtitle-2 font-weight-medium text-white mr-4">
        Connection lost. The app is offline. Attempts to save changes will fail until connection is restored.
      </span>
      <v-btn
        variant="flat"
        color="white"
        size="small"
        class="text-error font-weight-bold text-none px-4 rounded-pill"
        prepend-icon="mdi-cached"
        :loading="isLoading"
        @click="retryConnection"
      >
        Retry Connection
      </v-btn>
    </div>
  </v-expand-transition>
</template>

<script setup>
import { computed } from 'vue'
import { sessionState, startHeartbeat } from '../store/session'
import { settingsState } from '../store/settings'
import { metadataState, refreshMetadata } from '../store/metadata'

const isOffline = computed(() => sessionState.connectionStatus === 'offline')
const isLoading = computed(() => metadataState.isLoading)

const retryConnection = async () => {
  startHeartbeat(settingsState.serverURL)
  try {
    await refreshMetadata()
  } catch (err) {
    console.warn('Retry connection failed to fetch metadata:', err)
  }
}
</script>

<style scoped>
.connection-banner {
  background: linear-gradient(90deg, rgba(211, 47, 47, 0.95) 0%, rgba(198, 40, 40, 0.95) 100%);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1005; /* Above navigation drawer and app-bar if needed, or placed within layout */
  width: 100%;
}
.text-error {
  color: #c62828 !important;
}
</style>
