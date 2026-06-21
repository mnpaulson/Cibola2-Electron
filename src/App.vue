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
        prepend-avatar="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
        title="Cibola2"
        :class="isRail ? 'px-2 py-4' : 'pa-4'"
      ></v-list-item>

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
          color="primary"
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
      
      <!-- Back button visible when history stack is > 1 -->
      <v-btn
        v-if="sessionState.navigationHistory.length > 1"
        icon="mdi-arrow-left"
        class="mr-2"
        color="primary"
        variant="text"
        title="Go Back"
        @click="navigateBack"
      ></v-btn>

      <v-app-bar-title class="font-weight-bold text-gradient">
        {{ currentMenuTitle }}
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-bell-outline</v-icon>
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
          <!-- Welcome Header -->
          <div class="d-flex flex-column align-center justify-center py-8 text-center">
            <h1 class="text-h3 font-weight-bold mb-3 text-gradient">Cibola 2</h1>
          </div>

          <v-row justify="center" class="mt-2">
            <!-- Left Column: Search & Quick Actions -->
            <v-col cols="12" md="6" lg="5" class="mb-6 mb-md-0">
              <MetalPricesCard class="mb-6" />

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
                      color="primary"
                      icon="mdi-plus"
                      variant="text"
                      density="comfortable"
                      title="Start New Job"
                      @click.stop="startNewJobFromDashboard"
                    ></v-btn>
                  </template>
                </v-text-field>
              </div>

              <!-- New Job Quick Action Button (Minimalist Tonal style) -->
              <div class="text-center">
                <v-btn
                  color="primary"
                  size="large"
                  prepend-icon="mdi-briefcase-clock"
                  variant="tonal"
                  block
                  @click="startNewJobFromDashboard"
                >
                  New Job
                </v-btn>
              </div>
            </v-col>

            <!-- Right Column: Recently Viewed & Recently Created Records -->
            <v-col cols="12" md="6" lg="5">
              <RecentlyViewed class="mb-6" />
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
  </v-app>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { settingsState, loadSettings } from './store/settings'
import { sessionState, startHeartbeat, navigateTo, navigateBack } from './store/session'
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

const theme = useTheme()

onMounted(async () => {
  await loadSettings()
  if (settingsState.serverURL) {
    startHeartbeat(settingsState.serverURL)
  }
  loadRecentlyViewed()
})

// Watch serverURL settings to restart heartbeat if URL changes
watch(() => settingsState.serverURL, (newUrl) => {
  if (newUrl) {
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

const handleTabClick = (value) => {
  // Sidebar clicking navigates to the top-level list of that tab (resets parameters)
  navigateTo(value)
}
const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
}

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', value: 'dashboard' },
  { title: 'Gold Credits', icon: 'mdi-currency-usd', value: 'credits' },
  { title: 'Custom Sheets', icon: 'mdi-clock-outline', value: 'custom' },
  { title: 'Jobs', icon: 'mdi-briefcase', value: 'jobs' },
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

.stat-card {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2) !important;
}

.activity-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
</style>
