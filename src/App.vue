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
          @click="activeTab = item.value"
          active-color="primary"
          class="menu-item-transition"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app elevation="1" border="none">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
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
          <!-- Stats Grid -->
          <v-row>
            <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
              <v-card class="stat-card pa-4 mx-auto" elevation="2" hover>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold">{{ stat.title }}</span>
                    <h2 class="text-h4 font-weight-bold mt-1">{{ stat.value }}</h2>
                  </div>
                  <v-avatar :color="stat.color" variant="tonal" size="48">
                    <v-icon size="24">{{ stat.icon }}</v-icon>
                  </v-avatar>
                </div>
                <div class="mt-3 text-caption">
                  <span class="text-success font-weight-bold mr-1">{{ stat.trend }}</span>
                  <span class="text-medium-emphasis">since last week</span>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Main Content Grid -->
          <v-row class="mt-4">
            <!-- Repair Jobs Table -->
            <v-col cols="12" lg="8">
              <v-card class="pa-4" elevation="2">
                <div class="d-flex justify-space-between align-center mb-4">
                  <h3 class="text-h6 font-weight-bold">Recent Repair Jobs</h3>
                  <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-plus">
                    New Job
                  </v-btn>
                </div>
                <v-table hover>
                  <thead>
                    <tr>
                      <th class="text-left font-weight-bold">Job ID</th>
                      <th class="text-left font-weight-bold">Customer</th>
                      <th class="text-left font-weight-bold">Item</th>
                      <th class="text-left font-weight-bold">Status</th>
                      <th class="text-left font-weight-bold">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="job in recentJobs" :key="job.id">
                      <td>{{ job.id }}</td>
                      <td>{{ job.customer }}</td>
                      <td>{{ job.item }}</td>
                      <td>
                        <v-chip :color="getStatusColor(job.status)" size="small" variant="flat">
                           {{ job.status }}
                        </v-chip>
                      </td>
                      <td>${{ job.cost.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </v-col>

            <!-- Store credits alert / summary -->
            <v-col cols="12" lg="4">
              <v-card class="pa-4" elevation="2">
                <h3 class="text-h6 font-weight-bold mb-4">Quick Activities</h3>
                <v-list lines="two">
                  <v-list-item
                    v-for="act in activities"
                    :key="act.id"
                    :title="act.title"
                    :subtitle="act.time"
                    class="activity-item"
                  >
                    <template v-slot:prepend>
                      <v-avatar :color="act.color" variant="tonal" size="40">
                        <v-icon>{{ act.icon }}</v-icon>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
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
import { sessionState, startHeartbeat } from './store/session'
import { metadataState, refreshMetadata } from './store/metadata'
import ConnectionBanner from './components/ConnectionBanner.vue'
import Admin from './components/Admin.vue'

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
const activeTab = ref('dashboard')
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

const stats = [
  { title: 'Active Jobs', value: '24', icon: 'mdi-wrench-clock', color: 'info', trend: '+12%' },
  { title: 'New Customers', value: '142', icon: 'mdi-account-plus', color: 'success', trend: '+8%' },
  { title: 'Credits Issued', value: '$1,250', icon: 'mdi-wallet', color: 'warning', trend: '-2%' },
  { title: 'Closed Jobs', value: '98', icon: 'mdi-check-circle', color: 'primary', trend: '+15%' }
]

const recentJobs = [
  { id: 'JB-1042', customer: 'Sarah Jenkins', item: 'Diamond Ring resizing', status: 'In Progress', cost: 120.00 },
  { id: 'JB-1043', customer: 'Michael Chen', item: 'Rolex service', status: 'Pending Approval', cost: 450.00 },
  { id: 'JB-1044', customer: 'Emma Watson', item: 'Gold Necklace repair', status: 'Completed', cost: 85.00 },
  { id: 'JB-1045', customer: 'David Smith', item: 'Platinum Band engraving', status: 'In Progress', cost: 150.00 }
]

const activities = [
  { id: 1, title: 'Job #1044 marked Completed', time: '10 minutes ago', icon: 'mdi-check-circle', color: 'success' },
  { id: 2, title: 'New Customer John Doe added', time: '45 minutes ago', icon: 'mdi-account-plus', color: 'info' },
  { id: 3, title: 'Store credit $50.00 issued to Sarah Jenkins', time: '2 hours ago', icon: 'mdi-wallet', color: 'warning' }
]

const getStatusColor = (status) => {
  switch(status) {
    case 'Completed': return 'success'
    case 'In Progress': return 'info'
    case 'Pending Approval': return 'warning'
    default: return 'medium-emphasis'
  }
}
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
</style>
