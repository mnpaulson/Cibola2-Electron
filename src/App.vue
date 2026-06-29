<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      v-model:rail="isRail"
      permanent
      app
      border="none"
      elevation="2"
    >
      <v-list-item
        title="Cibola2"
        :class="isRail ? 'px-2 py-4' : 'pa-4'"
      >
        <template v-slot:prepend>
          <v-avatar rounded="0" size="40" :class="isRail ? 'mr-0' : 'mr-3'">
            <v-img src="256x256.png" alt="Cibola2 Icon"></v-img>
          </v-avatar>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav class="mt-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.value"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          :active="activeTab === item.value"
          @click="handleTabClick(item.value)"
          :color="getMenuItemColor(item.value)"
          class="menu-item-transition"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="drawer-append">
          <v-divider></v-divider>
          <v-list density="compact" nav class="drawer-append-list">
            <v-list-item
              :prepend-icon="isRail ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'"
              title="Collapse"
              @click="isRail = !isRail"
              class="menu-item-transition"
            ></v-list-item>
          </v-list>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app elevation="1" border="none">
      
      <!-- Back button present on all views, disabled when no history -->
      <v-btn
        icon="mdi-arrow-left"
        class="mr-2"
        color="primary"
        variant="text"
        title="Go Back"
        :disabled="sessionState.navigationHistory.length <= 1"
        @click="navigateBack"
      ></v-btn>

      <!-- Forward button present on all views, disabled when no forward history -->
      <v-btn
        icon="mdi-arrow-right"
        class="mr-2"
        color="primary"
        variant="text"
        title="Go Forward"
        :disabled="!sessionState.forwardHistory || sessionState.forwardHistory.length === 0"
        @click="navigateForward"
      ></v-btn>

      <v-app-bar-title class="font-weight-bold text-gradient">
        {{ currentMenuTitle }}
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Notifications Menu -->
      <v-menu v-if="notificationsState.list.length > 0" offset-y transition="slide-y-transition" close-on-content-click>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" title="Notifications">
            <v-badge :content="notificationsState.list.length" color="error" overlap>
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <v-list width="350" class="pa-0 rounded-lg elevation-4">
          <v-list-subheader class="bg-primary text-white py-3 px-4 font-weight-bold d-flex justify-space-between align-center">
            <span class="text-subtitle-1">Notifications</span>
            <v-btn
              v-if="notificationsState.list.some(n => !n.persistent)"
              variant="text" density="compact" size="small" color="white"
              class="text-none font-weight-medium"
              @click.stop="clearAllNotifications"
            >
              Clear All
            </v-btn>
          </v-list-subheader>
          <v-divider></v-divider>
          <v-list-item
            v-for="notif in notificationsState.list"
            :key="notif.id"
            :title="notif.title"
            :subtitle="notif.message"
            class="py-3 cursor-pointer"
            @click="handleNotificationClick(notif)"
          >
            <template v-slot:prepend>
              <v-avatar :color="notif.color || 'primary'" variant="tonal" size="36" class="mr-3">
                <v-icon size="20">{{ notif.icon || 'mdi-information' }}</v-icon>
              </v-avatar>
            </template>
            <template v-slot:append>
              <v-btn
                v-if="!notif.persistent"
                icon="mdi-close"
                variant="text"
                density="comfortable"
                size="small"
                color="medium-emphasis"
                @click.stop="removeNotification(notif.id)"
                title="Dismiss"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn icon title="Submit Feedback" @click="isFeedbackOpen = true">
        <v-icon>mdi-comment-text-outline</v-icon>
      </v-btn>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-surface-variant-light">
      <ConnectionBanner />
      <v-container fluid class="pa-6">
        
        <!-- Dashboard / Overview -->
        <div v-if="activeTab === 'dashboard'">
          <v-row class="mt-4">
            <!-- Left Column: Search & Quick Actions -->
            <v-col cols="12" md="4" class="mb-6 mb-md-0">

              <div class="mb-6">
                <!-- Direct flat customer search component -->
                <CustomerForm
                  initial-state="search"
                  :clearable="false"
                  :hide-notes="true"
                  :flat="true"
                  @select="handleDashboardCustomerSelect"
                />
              </div>

              <!-- Job Number Search & Quick Create (Right below customer search) -->
              <div class="mb-6">
                <v-text-field
                  v-model="jobNumberInput"
                  placeholder="Job Number"
                  prepend-inner-icon="mdi-briefcase-search"
                  clearable
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  :loading="isSearchingJob"
                  @keydown.enter.prevent="handleJobNumberEnter"
                >
                  <template v-slot:append-inner>
                    <v-btn
                      color="job"
                      icon="mdi-plus"
                      variant="text"
                      density="comfortable"
                      title="Start New Job"
                      @click.stop="startNewJobFromDashboard"
                    ></v-btn>
                  </template>
                </v-text-field>
              </div>

              <!-- Quick Action Buttons -->
              <div class="d-flex flex-column">
                <v-btn
                  color="job"
                  size="large"
                  prepend-icon="mdi-briefcase-outline"
                  variant="tonal"
                  block
                  @click="startNewJobFromDashboard"
                >
                  New Job
                </v-btn>
                <v-btn
                  color="credit"
                  size="large"
                  prepend-icon="mdi-credit-card-outline"
                  variant="tonal"
                  block
                  @click="startNewCreditFromDashboard"
                  class="mt-3"
                >
                  New Credit
                </v-btn>
                <v-btn
                  color="sheet"
                  size="large"
                  prepend-icon="mdi-list-box-outline"
                  variant="tonal"
                  block
                  @click="startNewCustomSheetFromDashboard"
                  class="mt-3"
                >
                  New Sheet
                </v-btn>
              </div>

              <MetalPricesCard class="mb-6 mt-6" />

            </v-col>

            <!-- Middle Column: Recently Viewed Records -->
            <v-col cols="12" md="4" class="mb-6 mb-md-0">
              <RecentlyViewed />
            </v-col>

            <!-- Right Column: Recently Created Records -->
            <v-col cols="12" md="4">
              <RecentlyCreated />
            </v-col>
          </v-row>
        </div>

        <!-- Customers Tab -->
        <div v-else-if="activeTab === 'customers'">
          <CustomerManager />
        </div>

        <!-- Gold Credits Tab -->
        <div v-else-if="activeTab === 'credits'">
          <CreditManager />
        </div>

        <!-- Jobs Tab -->
        <div v-else-if="activeTab === 'jobs'">
          <JobManager />
        </div>

        <!-- Custom Sheets Tab -->
        <div v-else-if="activeTab === 'custom'">
          <CustomSheetManager />
        </div>

        <!-- Configuration / Settings Tab -->
        <div v-else-if="activeTab === 'config'">
          <Admin />
        </div>

        <!-- Fallback message for other tabs -->
        <div v-else class="d-flex flex-column align-center justify-center py-12">
          <v-avatar color="primary" variant="tonal" size="80" class="mb-4">
            <v-icon size="40">{{ currentMenuIcon }}</v-icon>
          </v-avatar>
          <h2 class="text-h5 font-weight-bold mb-2">{{ currentMenuTitle }} Module</h2>
          <p class="text-body-1 text-medium-emphasis text-center max-width-500">
            This module is ready to load data from the backend API.
            Configure backend database connection at <code>{{ settingsState.serverURL }}</code>.
          </p>
          <v-btn
            color="primary"
            class="mt-6"
            prepend-icon="mdi-cached"
            @click="handleManualLoad"
            :loading="metadataState.isLoading"
          >
            Load Data
          </v-btn>
        </div>

      </v-container>
    </v-main>

    <!-- Global Snackbar Toasts -->
    <v-snackbar
      v-model="toastState.show"
      :color="toastState.color"
      :timeout="toastState.timeout"
      elevation="4"
    >
      {{ toastState.text }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="toastState.show = false"></v-btn>
      </template>
    </v-snackbar>

    <!-- Feedback Modal Dialog -->
    <FeedbackDialog v-model="isFeedbackOpen" />
  </v-app>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { settingsState, loadSettings, saveSettings } from './store/settings'
import { sessionState, startHeartbeat, navigateTo, navigateBack, navigateForward } from './store/session'
import { metadataState, refreshMetadata } from './store/metadata'
import { api } from './utils/api'
import ConnectionBanner from './components/ConnectionBanner.vue'
import Admin from './components/Admin.vue'
import CustomerManager from './components/CustomerManager.vue'
import JobManager from './components/JobManager.vue'
import CustomerForm from './components/CustomerForm.vue'
import MetalPricesCard from './components/MetalPricesCard.vue'
import CreditManager from './components/CreditManager.vue'
import CustomSheetManager from './components/CustomSheetManager.vue'
import RecentlyViewed from './components/RecentlyViewed.vue'
import RecentlyCreated from './components/RecentlyCreated.vue'
import { loadRecentlyViewed } from './store/recentlyViewed'
import { toastState, showToast } from './store/toast'
import FeedbackDialog from './components/FeedbackDialog.vue'
import {
  notificationsState,
  removeNotification,
  clearAllNotifications,
  initUpdaterListeners,
  checkUpdates
} from './store/notifications'

const theme = useTheme()

let unsubscribeNavigation = null

onMounted(async () => {
  await loadSettings()
  // Apply the persisted theme preference immediately after settings load
  theme.global.name.value = settingsState.isDark ? 'dark' : 'light'
  isDark.value = settingsState.isDark
  if (settingsState.serverURL) {
    startHeartbeat(settingsState.serverURL)
  }
  loadRecentlyViewed()

  // Initialize auto-updater IPC listeners
  initUpdaterListeners()

  // Initial update check after 5 seconds
  setTimeout(() => {
    checkUpdates(true) // Silent check
  }, 5000)

  // Periodic check every 30 minutes
  const updateIntervalId = setInterval(() => {
    checkUpdates(true)
  }, 30 * 60 * 1000)

  let lastBackTime = 0
  const throttleBack = () => {
    const now = Date.now()
    if (now - lastBackTime > 300) {
      lastBackTime = now
      navigateBack()
    }
  }

  let lastForwardTime = 0
  const throttleForward = () => {
    const now = Date.now()
    if (now - lastForwardTime > 300) {
      lastForwardTime = now
      navigateForward()
    }
  }

  // Handle IPC navigate-back command from main process
  const ipcBackUnsubscribe = window.electronAPI && typeof window.electronAPI.onAppNavigateBack === 'function'
    ? window.electronAPI.onAppNavigateBack(() => {
        if (sessionState.navigationHistory.length > 1) {
          throttleBack()
        }
      })
    : null

  // Handle IPC navigate-forward command from main process
  const ipcForwardUnsubscribe = window.electronAPI && typeof window.electronAPI.onAppNavigateForward === 'function'
    ? window.electronAPI.onAppNavigateForward(() => {
        if (sessionState.forwardHistory && sessionState.forwardHistory.length > 0) {
          throttleForward()
        }
      })
    : null

  // Capture mouseup event globally (capturing phase) to catch mouse back/forward button clicks
  const handleMouseUp = (e) => {
    if (e.button === 3) {
      if (sessionState.navigationHistory.length > 1) {
        e.preventDefault()
        throttleBack()
      }
    } else if (e.button === 4) {
      if (sessionState.forwardHistory && sessionState.forwardHistory.length > 0) {
        e.preventDefault()
        throttleForward()
      }
    }
  }
  window.addEventListener('mouseup', handleMouseUp, true)

  unsubscribeNavigation = () => {
    window.removeEventListener('mouseup', handleMouseUp, true)
    if (ipcBackUnsubscribe) {
      ipcBackUnsubscribe()
    }
    if (ipcForwardUnsubscribe) {
      ipcForwardUnsubscribe()
    }
    if (updateIntervalId) {
      clearInterval(updateIntervalId)
    }
  }
})

onUnmounted(() => {
  if (unsubscribeNavigation) {
    unsubscribeNavigation()
  }
})

// Watch serverURL settings to restart heartbeat if URL changes
watch(() => settingsState.serverURL, (newUrl) => {
  if (newUrl && settingsState.isLoaded) {
    startHeartbeat(newUrl)
  }
})

// Proactively load metadata cache as soon as we establish connection
watch(() => sessionState.connectionStatus, async (status) => {
  if (status === 'connected' && !metadataState.isLoaded && !metadataState.isLoading) {
    try {
      await refreshMetadata()
    } catch (err) {
      console.error('Initial metadata load failed:', err)
    }
  }
})

const handleManualLoad = async () => {
  try {
    if (sessionState.connectionStatus !== 'connected') {
      startHeartbeat(settingsState.serverURL)
    }
    await refreshMetadata()
  } catch (err) {
    console.error('Manual metadata load failed:', err)
  }
}

const drawer = ref(true)
const isRail = ref(false)
const activeTab = computed({
  get: () => sessionState.activeTab,
  set: (val) => navigateTo(val)
})

const isFeedbackOpen = ref(false)

// Job Number search state & handlers
const jobNumberInput = ref('')
const isSearchingJob = ref(false)

const showSnackbar = (text, color = 'success') => {
  showToast(text, color)
}

const handleJobNumberEnter = async () => {
  const id = jobNumberInput.value?.trim()
  if (!id) return

  isSearchingJob.value = true
  try {
    const job = await api.get(`/jobs/${id}`)
    if (job && job.id) {
      navigateTo('jobs', { activeJobId: job.id, selectedCustomerId: job.customer_id })
      jobNumberInput.value = ''
    } else {
      showSnackbar(`Job #${id} not found`, 'warning')
    }
  } catch (err) {
    console.error('Failed to open job:', err)
    showSnackbar(`Job #${id} not found`, 'error')
  } finally {
    isSearchingJob.value = false
  }
}

const handleDashboardCustomerSelect = (customer) => {
  if (customer && customer.id) {
    navigateTo('customers', { selectedCustomerId: customer.id })
  }
}

const startNewJobFromDashboard = () => {
  navigateTo('jobs', { activeJobId: 0, selectedCustomerId: null })
}

const startNewCreditFromDashboard = () => {
  navigateTo('credits', { activeCreditId: 0, selectedCustomerId: null })
}

const startNewCustomSheetFromDashboard = () => {
  navigateTo('custom', { activeSheetId: 0, selectedCustomerId: null })
}

const handleNotificationClick = (notif) => {
  if (notif.id === 'new-version' || notif.id === 'new-version-downloaded') {
    navigateTo('config')
  }
  if (!notif.persistent) {
    removeNotification(notif.id)
  }
}

const handleTabClick = (value) => {
  // Sidebar clicking navigates to the top-level list of that tab (resets parameters)
  if (value === 'config') {
    sessionState.configActiveSection = 'local'
  }
  navigateTo(value)
}
const isDark = ref(true)

const toggleTheme = async () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
  // Persist the new preference immediately alongside other local settings
  settingsState.isDark = isDark.value
  try {
    await saveSettings({
      serverURL: settingsState.serverURL,
      camera: { ...settingsState.camera },
      printers: { ...settingsState.printers },
      isDark: settingsState.isDark
    })
  } catch (err) {
    console.error('Failed to persist theme preference:', err)
  }
}

const getMenuItemColor = (value) => {
  if (value === 'customers') return 'customer'
  if (value === 'jobs') return 'job'
  if (value === 'credits') return 'credit'
  if (value === 'custom') return 'sheet'
  return 'primary'
}

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', value: 'dashboard' },
  { title: 'Jobs', icon: 'mdi-briefcase-outline', value: 'jobs' },
  { title: 'Gold Credits', icon: 'mdi-credit-card-outline', value: 'credits' },
  { title: 'Custom Sheets', icon: 'mdi-list-box-outline', value: 'custom' },
  { title: 'Customers', icon: 'mdi-account-group', value: 'customers' },
  { title: 'Configuration', icon: 'mdi-cog', value: 'config' }
]

const currentMenuTitle = computed(() => {
  return menuItems.find(item => item.value === activeTab.value)?.title || 'Cibola2'
})

const currentMenuIcon = computed(() => {
  return menuItems.find(item => item.value === activeTab.value)?.icon || 'mdi-help-circle'
})

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap');

/* Apply font to whole app */
.v-application {
  font-family: 'Outfit', sans-serif !important;
}

/* Premium Styling custom rules */
.text-gradient {
  background: linear-gradient(45deg, #1867C0, #5CBBF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animations & Transitions */
.menu-item-transition {
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.menu-item-transition:hover {
  transform: translateX(4px);
}

:deep(.v-navigation-drawer), :deep(.v-navigation-drawer__content) {
  overflow-x: hidden !important;
}

.stat-card {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
  border-radius: 12px !important;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2) !important;
}

.activity-item {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}
.activity-item:last-child {
  border-bottom: none;
}

.max-width-500 {
  max-width: 500px;
}

.max-width-600 {
  max-width: 600px;
}

.drawer-append {
  height: 64px;
  display: flex;
  flex-direction: column;
}

.drawer-append-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 !important;
  margin: 0 !important;
}

/* Global Record Left Accent Highlighting classes */
.record-accent-job {
  border-left: 4px solid var(--v-theme-job) !important;
}
.record-accent-credit {
  border-left: 4px solid var(--v-theme-credit) !important;
}
.record-accent-sheet {
  border-left: 4px solid var(--v-theme-sheet) !important;
}
.record-accent-customer {
  border-left: 4px solid var(--v-theme-customer) !important;
}

/* Styling to align the accent table borders nicely */
.accent-border-row td:first-child {
  position: relative;
}

/* Tone down intensity of white font on bg-accent1 headers in dark mode only */
.v-theme--dark .bg-accent1,
.v-theme--dark .bg-accent1 .v-card-title,
.v-theme--dark .bg-accent1 .v-icon,
.v-theme--dark .bg-accent1 .v-btn {
  color: rgba(255, 255, 255, 0.82) !important;
}

/* ── Directory / Manager shared styles ───────────────────────────────────── */

.directory-card,
.history-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}

.directory-table th {
  background-color: rgba(var(--v-theme-surface-variant), 0.04) !important;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}
.sortable-header:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.cursor-pointer { cursor: pointer; }

.transition-row {
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.transition-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.hover-shadow { transition: box-shadow 0.2s ease; }
.hover-shadow:hover { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); }

/* ── Frosted-glass search bar (embedded in accent1 headers) ──────────────── */

.search-bar-input {
  border-radius: 4px;
}

/* Dark mode: white text on dark slate header */
.v-theme--dark .search-bar-input .v-field,
.v-theme--dark .search-bar-input .v-field__input {
  color: white !important;
}
.v-theme--dark .search-bar-input .v-field {
  box-shadow: none !important;
}

/* Light mode: dark text on pale blue header */
.v-theme--light .search-bar-input .v-field,
.v-theme--light .search-bar-input .v-field__input {
  color: rgba(0, 0, 0, 0.87) !important;
}
.v-theme--light .search-bar-input .v-field {
  box-shadow: none !important;
}
.v-theme--light .search-bar-input .v-field__prepend-inner .v-icon {
  color: rgba(0, 0, 0, 0.54) !important;
}
</style>
