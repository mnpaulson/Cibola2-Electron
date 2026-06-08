<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app border="none" elevation="2">
      <v-list-item
        prepend-avatar="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
        title="Cibola2 Admin"
        subtitle="Jewelry Repair & Sales"
        class="pa-4"
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
          active-color="primary"
          class="menu-item-transition"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app elevation="1" border="none">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
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
            <h1 class="text-h3 font-weight-bold mb-3 text-gradient">Cibola2 Workspace</h1>
            <p class="text-subtitle-1 text-medium-emphasis max-width-600">
              Lookup customers, create profiles, or start a new repair job from this minimalist workspace.
            </p>
          </div>

          <v-row justify="center" class="mt-2">
            <!-- Customer Search & Create Card -->
            <v-col cols="12" md="8" lg="6">
              <v-card elevation="3" class="rounded-lg border mb-4">
                <v-card-item class="bg-primary text-white py-3">
                  <v-card-title class="font-weight-bold text-subtitle-1 d-flex align-center">
                    <v-icon start class="mr-2">mdi-account-search</v-icon>
                    Customer Search & Registration
                  </v-card-title>
                </v-card-item>
                <v-divider></v-divider>
                <v-card-text class="pa-4">
                  <!-- Reuse CustomerForm directly on the dashboard -->
                  <CustomerForm
                    initial-state="search"
                    :clearable="false"
                    :hide-notes="true"
                    @select="handleDashboardCustomerSelect"
                  />
                </v-card-text>
              </v-card>

              <!-- New Repair Job Quick Action Button -->
              <v-card elevation="2" class="rounded-lg border pa-4 text-center">
                <div class="text-subtitle-1 font-weight-bold mb-2 text-medium-emphasis">
                  Ready to check in a jewelry piece?
                </div>
                <v-btn
                  color="primary"
                  size="large"
                  prepend-icon="mdi-wrench-clock"
                  variant="elevated"
                  block
                  @click="startNewJobFromDashboard"
                >
                  Start New Repair Job
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Customers Tab -->
        <div v-else-if="activeTab === 'customers'">
          <CustomerManager />
        </div>

        <!-- Repair Jobs Tab -->
        <div v-else-if="activeTab === 'jobs'">
          <JobManager />
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
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'
import { settingsState, loadSettings } from './store/settings'
import { sessionState, startHeartbeat, navigateTo, navigateBack } from './store/session'
import { metadataState, refreshMetadata } from './store/metadata'
import ConnectionBanner from './components/ConnectionBanner.vue'
import Admin from './components/Admin.vue'
import CustomerManager from './components/CustomerManager.vue'
import JobManager from './components/JobManager.vue'
import CustomerForm from './components/CustomerForm.vue'

const theme = useTheme()

onMounted(async () => {
  await loadSettings()
  if (settingsState.serverURL) {
    startHeartbeat(settingsState.serverURL)
  }
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
const activeTab = computed({
  get: () => sessionState.activeTab,
  set: (val) => navigateTo(val)
})

const handleDashboardCustomerSelect = (customer) => {
  if (customer && customer.id) {
    sessionState.selectedCustomerId = customer.id
    navigateTo('customers')
  }
}

const startNewJobFromDashboard = () => {
  sessionState.activeJobId = 0
  sessionState.selectedCustomerId = null
  sessionState.enteredJobEditFromList = false
  navigateTo('jobs')
}

const handleTabClick = (value) => {
  if (value === 'jobs') {
    sessionState.activeJobId = null
    sessionState.selectedCustomerId = null
    sessionState.enteredJobEditFromList = false
  } else if (value === 'credits') {
    sessionState.activeCreditId = null
    sessionState.selectedCustomerId = null
    sessionState.enteredCreditEditFromList = false
  }
  activeTab.value = value
}
const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
}

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', value: 'dashboard' },
  { title: 'Customers', icon: 'mdi-account-group', value: 'customers' },
  { title: 'Repair Jobs', icon: 'mdi-wrench', value: 'jobs' },
  { title: 'Employee Sheets', icon: 'mdi-clock-outline', value: 'employees' },
  { title: 'Store Credits', icon: 'mdi-currency-usd', value: 'credits' },
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
</style>
