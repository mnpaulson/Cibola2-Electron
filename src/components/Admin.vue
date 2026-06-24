<template>
  <div class="admin-container">
    <v-card class="admin-main-card mb-6" elevation="2">
      <!-- Card Header -->
      <v-card-item class="admin-header pa-6">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="48" class="mr-4">
            <v-icon size="24">mdi-cog</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h5 font-weight-bold">System Settings & Defaults</h2>
          </div>
        </div>
      </v-card-item>

      <v-divider></v-divider>

      <!-- Sidebar Layout with flexbox -->
      <div class="d-flex" style="min-height: 600px;">
        <!-- Left Side Navigation Sidebar -->
        <div class="admin-sidebar border-r py-4 px-2">
          <v-list density="comfortable" nav class="pa-0" bg-color="transparent">
            <!-- Local Settings -->
            <v-list-item
              title="Local Settings"
              value="local"
              :active="activeSection === 'local'"
              @click="activeSection = 'local'"
              class="menu-item-transition"
            ></v-list-item>

            <!-- Employees -->
            <v-list-item
              title="Employees"
              value="employees"
              :active="activeSection === 'employees'"
              @click="activeSection = 'employees'"
              class="menu-item-transition"
            ></v-list-item>

            <!-- Custom Values Header -->
            <v-list-subheader class="text-uppercase text-caption font-weight-bold text-medium-emphasis mt-3 pl-3">
              Custom Values
            </v-list-subheader>

            <!-- Custom Sheets -->
            <v-list-item
              title="Custom Sheets"
              value="custom-sheet"
              :active="activeSection === 'custom-sheet'"
              @click="activeSection = 'custom-sheet'"
              class="pl-4 menu-item-transition"
            ></v-list-item>

            <!-- Custom Sheet Categories -->
            <v-list-item
              title="Sheet Categories"
              value="custom-sheet-categories"
              :active="activeSection === 'custom-sheet-categories'"
              @click="activeSection = 'custom-sheet-categories'"
              class="pl-4 menu-item-transition"
            ></v-list-item>

            <!-- Gold Credits -->
            <v-list-item
              title="Gold Credits"
              value="gold-credit"
              :active="activeSection === 'gold-credit'"
              @click="activeSection = 'gold-credit'"
              class="pl-4 menu-item-transition"
            ></v-list-item>
          </v-list>
        </div>

        <!-- Right Side Main Content Panel -->
        <div class="flex-grow-1 pa-6 overflow-hidden">
          <v-window v-model="activeSection" :touch="false">
            <v-window-item value="local" :transition="false" :reverse-transition="false">
              <LocalSettingsAdmin />
            </v-window-item>
            <v-window-item value="employees" :transition="false" :reverse-transition="false">
              <EmployeesAdmin />
            </v-window-item>
            <v-window-item value="custom-sheet" :transition="false" :reverse-transition="false">
              <CustomValuesAdmin section="custom-sheet" />
            </v-window-item>
            <v-window-item value="custom-sheet-categories" :transition="false" :reverse-transition="false">
              <CustomValuesAdmin section="custom-sheet-categories" />
            </v-window-item>
            <v-window-item value="gold-credit" :transition="false" :reverse-transition="false">
              <CustomValuesAdmin section="gold-credit" />
            </v-window-item>
          </v-window>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { sessionState } from '../store/session'
import LocalSettingsAdmin from './admin/LocalSettingsAdmin.vue'
import EmployeesAdmin from './admin/EmployeesAdmin.vue'
import CustomValuesAdmin from './admin/CustomValuesAdmin.vue'

const activeSection = computed({
  get: () => sessionState.configActiveSection || 'local',
  set: (val) => {
    sessionState.configActiveSection = val
  }
})
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-main-card {
  border-radius: 16px !important;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.admin-header {
  background: linear-gradient(135deg, rgba(24, 103, 192, 0.08) 0%, rgba(92, 187, 246, 0.03) 100%);
}

.admin-sidebar {
  width: 250px;
  flex-shrink: 0;
  overflow-x: hidden !important;
}

.admin-sidebar :deep(.v-list) {
  overflow-x: hidden !important;
}

.border-r {
  border-right: 1px solid rgba(var(--v-border-color), 0.12) !important;
}

.menu-item-transition {
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.menu-item-transition:hover {
  transform: translateX(4px);
}
</style>
