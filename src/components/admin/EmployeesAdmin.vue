<template>
  <div>
    <v-row>
      <!-- Left Panel: Add/Edit Form -->
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="border-light pa-4">
          <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold text-gradient">
            {{ currentEmployee.id ? 'Edit Employee' : 'Add Employee' }}
          </v-card-title>
          
          <v-card-text class="px-0 pb-0 pt-4">
            <v-text-field
              label="Employee Name"
              v-model="currentEmployee.name"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              hide-details
              @keyup.enter="handleSaveEmployee"
            ></v-text-field>

            <v-select
              v-if="currentEmployee.id"
              label="Status"
              v-model="currentEmployee.active"
              :items="[
                { title: 'Active', value: 1 },
                { title: 'Inactive', value: 0 }
              ]"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hide-details
            ></v-select>

            <div class="d-flex justify-end gap-2 mt-4">
              <v-btn
                v-if="currentEmployee.id"
                variant="text"
                color="medium-emphasis"
                class="text-none mr-2"
                @click="clearCurrentEmployee"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                class="text-none font-weight-medium"
                prepend-icon="mdi-check"
                :loading="isSavingEmployee"
                @click="handleSaveEmployee"
              >
                {{ currentEmployee.id ? 'Update' : 'Add Employee' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Panel: Employee List -->
      <v-col cols="12" md="8">
        <v-card variant="outlined" class="border-light">
          <v-card-title class="px-4 py-3 text-subtitle-1 font-weight-bold d-flex justify-space-between align-center border-b">
            <div class="d-flex align-center">
              <span>Store Directory</span>
              <v-checkbox
                v-model="hideInactiveEmployees"
                label="Hide Inactive"
                hide-details
                density="compact"
                color="primary"
                class="ml-4"
              ></v-checkbox>
            </div>
            <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
              {{ filteredEmployees.length }} Employees
            </v-chip>
          </v-card-title>

          <v-table hover density="comfortable">
            <thead>
              <tr>
                <th class="text-left font-weight-bold">Name</th>
                <th class="text-center font-weight-bold">Status</th>
                <th class="text-right font-weight-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in filteredEmployees" :key="emp.id" class="employee-row">
                <td class="font-weight-medium">
                  {{ emp.name }}
                  <v-chip v-if="emp.id === 1" size="x-small" color="warning" class="ml-2 font-weight-bold" variant="flat">
                    System Default
                  </v-chip>
                </td>
                <td class="text-center">
                  <div class="d-flex justify-center">
                    <v-switch
                      :model-value="emp.active === 1"
                      @update:model-value="toggleEmployeeActive(emp)"
                      color="success"
                      density="compact"
                      hide-details
                      inset
                      :loading="emp.loadingActive"
                      :disabled="emp.id === 1 || emp.loadingActive"
                    ></v-switch>
                  </div>
                </td>
                <td class="text-right">
                  <v-btn
                    icon="mdi-pencil-outline"
                    variant="text"
                    color="primary"
                    density="comfortable"
                    class="mr-1"
                    @click="editEmployee(emp)"
                    :disabled="emp.id === 1"
                  ></v-btn>
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    class="text-none font-weight-medium rounded-pill"
                    prepend-icon="mdi-trash-can-outline"
                    @click="confirmDeleteEmployee(emp)"
                    :disabled="emp.id === 1"
                  >
                    Delete
                  </v-btn>
                </td>
              </tr>
              <tr v-if="filteredEmployees.length === 0">
                <td colspan="3" class="text-center py-6 text-medium-emphasis">
                  {{ employees.length === 0 ? 'No employees found. Check connection parameters.' : 'No active employees found matching the filter.' }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog: Delete Employee Confirmation -->
    <v-dialog v-model="employeeDeleteDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-toolbar color="error" dark flat>
          <v-toolbar-title class="font-weight-bold">
            <v-icon start>mdi-alert-circle</v-icon>
            Delete Employee
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="mb-4">
            Are you sure you want to permanently delete employee <strong class="text-error">{{ employeeToDelete?.name }}</strong>?
          </p>
          <v-alert
            color="error"
            variant="tonal"
            icon="mdi-shield-alert-outline"
            class="text-caption font-weight-medium mb-0"
          >
            Any active jobs or gold credits assigned to this employee will be automatically reassigned to <strong>Unassigned</strong>. This action cannot be undone.
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-btn
            variant="text"
            color="medium-emphasis"
            class="text-none font-weight-medium px-4"
            @click="employeeDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            class="text-none font-weight-medium px-4"
            prepend-icon="mdi-trash-can"
            @click="handleDeleteEmployee"
          >
            Delete Employee
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { api } from '../../utils/api'
import { showToast } from '../../store/toast'

// Employees State
const employees = ref([])
const currentEmployee = reactive({
  id: null,
  name: '',
  active: 1
})
const isSavingEmployee = ref(false)
const employeeDeleteDialog = ref(false)
const employeeToDelete = ref(null)
const hideInactiveEmployees = ref(true)

const filteredEmployees = computed(() => {
  if (hideInactiveEmployees.value) {
    return employees.value.filter(emp => emp.active === 1 || emp.justDeactivated)
  }
  return employees.value
})

const showSnackbar = (text, color = 'success') => {
  showToast(text, color)
}

const getEmployees = async () => {
  try {
    const deactivatedStates = {}
    employees.value.forEach(emp => {
      if (emp.id) {
        deactivatedStates[emp.id] = emp.justDeactivated
      }
    })

    const data = await api.get('/employees')
    employees.value = (data || []).map(emp => ({
      ...emp,
      loadingActive: false,
      justDeactivated: deactivatedStates[emp.id] || false
    }))
  } catch (err) {
    console.error('Failed to load employees:', err)
  }
}

const handleSaveEmployee = async () => {
  const name = currentEmployee.name.trim()
  if (!name) {
    showSnackbar('Employee name is required', 'warning')
    return
  }

  isSavingEmployee.value = true
  try {
    if (currentEmployee.id) {
      await api.put(`/employees/${currentEmployee.id}`, {
        name,
        active: currentEmployee.active
      })
      showSnackbar('Employee settings updated', 'success')
    } else {
      await api.post('/employees', { name })
      showSnackbar('Employee added successfully', 'success')
    }
    clearCurrentEmployee()
    await getEmployees()
  } catch (err) {
    showSnackbar('Failed to save employee: ' + err.message, 'error')
  } finally {
    isSavingEmployee.value = false
  }
}

const toggleEmployeeActive = async (emp) => {
  if (emp.loadingActive) return
  emp.loadingActive = true
  try {
    const newActive = emp.active === 1 ? 0 : 1
    await api.put(`/employees/${emp.id}`, {
      name: emp.name,
      active: newActive
    })
    emp.active = newActive
    if (newActive === 0) {
      emp.justDeactivated = true
    } else {
      emp.justDeactivated = false
    }
    showSnackbar(`Employee ${newActive ? 'activated' : 'deactivated'}`, 'success')
  } catch (err) {
    showSnackbar('Failed to toggle status: ' + err.message, 'error')
  } finally {
    emp.loadingActive = false
  }
}

const editEmployee = (emp) => {
  if (emp.id === 1) return
  currentEmployee.id = emp.id
  currentEmployee.name = emp.name
  currentEmployee.active = emp.active
}

const clearCurrentEmployee = () => {
  currentEmployee.id = null
  currentEmployee.name = ''
  currentEmployee.active = 1
}

const confirmDeleteEmployee = (emp) => {
  if (emp.id === 1) return
  employeeToDelete.value = emp
  employeeDeleteDialog.value = true
}

const handleDeleteEmployee = async () => {
  if (!employeeToDelete.value) return
  try {
    await api.delete(`/employees/${employeeToDelete.value.id}`)
    showSnackbar('Employee removed successfully', 'success')
    if (currentEmployee.id === employeeToDelete.value.id) {
      clearCurrentEmployee()
    }
    await getEmployees()
  } catch (err) {
    showSnackbar('Failed to delete employee: ' + err.message, 'error')
  } finally {
    employeeDeleteDialog.value = false
    employeeToDelete.value = null
  }
}

onMounted(() => {
  getEmployees()
})

watch(hideInactiveEmployees, (newVal) => {
  if (newVal) {
    employees.value.forEach(emp => {
      emp.justDeactivated = false
    })
  }
})
</script>

<style scoped>
.border-light {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.02) !important;
}

.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.text-gradient {
  background: linear-gradient(45deg, #1867C0, #5CBBF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gap-2 {
  gap: 8px;
}

.employee-row {
  transition: background-color 0.2s ease;
}

.employee-row:hover {
  background-color: rgba(255, 255, 255, 0.02) !important;
}
</style>
