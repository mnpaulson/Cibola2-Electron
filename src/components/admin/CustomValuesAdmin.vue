<template>
  <div>
    <!-- Custom Sheets Config Section -->
    <div v-if="section === 'custom-sheet'">
      <div class="d-flex align-center justify-end mb-3">
        <v-checkbox
          v-model="hideInactiveCustomSheets"
          label="Hide Inactive"
          hide-details
          density="compact"
          color="primary"
        ></v-checkbox>
      </div>
      <v-card variant="outlined" class="border-light">
        <v-card-text class="pa-0">
          <v-table hover class="config-table">
            <thead>
              <tr>
                <th class="font-weight-bold" style="width: 17%">Name</th>
                <th class="font-weight-bold" style="width: 14%">
                  Category
                  <v-tooltip activator="parent" location="bottom">Category headers group estimate parameters (Use 'Extra' for dynamic buttons)</v-tooltip>
                </th>
                <th class="font-weight-bold" style="width: 10%">
                  Base Price
                  <v-tooltip activator="parent" location="bottom">Static price fallback if no metal calculations are used</v-tooltip>
                </th>
                <th class="font-weight-bold" style="width: 15%">
                  Metal Type
                  <v-tooltip activator="parent" location="bottom">Set to 'Gold' or 'Plat' to bound calculations to cached metal rates</v-tooltip>
                </th>
                <th class="font-weight-bold" style="width: 9%">
                  Markup
                  <v-tooltip activator="parent" location="bottom">The markup factor applied to calculations</v-tooltip>
                </th>
                <th class="font-weight-bold" style="width: 9%">
                  Default Quantity
                  <v-tooltip activator="parent" location="bottom">The default item quantity for estimates</v-tooltip>
                </th>
                <th class="font-weight-bold text-center" style="width: 10%">Active</th>
                <th class="text-right font-weight-bold" style="width: 16%">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="val in filteredCustomSheets" :key="val.tempId">
                <td class="py-1">
                  <v-text-field
                    v-model="val.name"
                    density="compact"
                    variant="underlined"
                    hide-details
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <v-combobox
                    v-model="val.value1"
                    :items="categoryNames"
                    density="compact"
                    variant="underlined"
                    hide-details
                    @input="markPending(val)"
                    @update:model-value="onComboboxChange(val)"
                  ></v-combobox>
                </td>
                <td class="py-1">
                  <v-text-field
                    v-model="val.value2"
                    density="compact"
                    variant="underlined"
                    hide-details
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <v-select
                    v-model="val.value3"
                    :items="['Gold', 'Plat', 'Silver']"
                    density="compact"
                    variant="underlined"
                    hide-details
                    clearable
                    placeholder="Select"
                    @update:model-value="onComboboxChange(val)"
                  ></v-select>
                </td>
                <td class="py-1">
                  <v-text-field
                    v-model="val.markup"
                    density="compact"
                    variant="underlined"
                    hide-details
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <v-text-field
                    v-model="val.default"
                    density="compact"
                    variant="underlined"
                    hide-details
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <div class="d-flex justify-center">
                    <v-switch
                      :model-value="val.active === 1"
                      @update:model-value="toggleValueActive(val)"
                      color="success"
                      density="compact"
                      hide-details
                      inset
                      :loading="val.saveStatus === 'saving'"
                      :disabled="val.saveStatus === 'saving'"
                    ></v-switch>
                  </div>
                </td>
                <td class="text-right py-1">
                  <div class="d-inline-flex align-center justify-end">
                    <v-tooltip location="bottom">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          v-bind="props"
                          :color="getStatusColor(val.saveStatus)"
                          class="mr-3"
                          size="small"
                        >
                          {{ getStatusIcon(val.saveStatus) }}
                        </v-icon>
                      </template>
                      <span>{{ getStatusTooltip(val.saveStatus) }}</span>
                    </v-tooltip>
                    <v-btn
                      color="error"
                      variant="outlined"
                      size="small"
                      class="text-none font-weight-medium rounded-pill"
                      prepend-icon="mdi-trash-can-outline"
                      @click="confirmDeleteValue(val)"
                    >
                      Delete
                    </v-btn>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredCustomSheets.length === 0">
                <td colspan="8" class="text-center py-6 text-medium-emphasis">
                  {{ customSheets.length === 0 ? 'No custom sheet items configured.' : 'No active custom sheet items found matching the filter.' }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-btn
        variant="outlined"
        color="primary"
        class="mt-4 text-none font-weight-medium"
        prepend-icon="mdi-plus"
        @click="newValue(3)"
      >
        New Custom Sheet Item
      </v-btn>
    </div>

    <!-- Custom Sheet Categories Config Section -->
    <div v-else-if="section === 'custom-sheet-categories'">
      <div class="d-flex align-center justify-end mb-3">
        <v-checkbox
          v-model="hideInactiveCategories"
          label="Hide Inactive"
          hide-details
          density="compact"
          color="primary"
        ></v-checkbox>
      </div>
      <v-card variant="outlined" class="border-light">
        <v-card-text class="pa-0">
          <v-table hover class="config-table">
            <thead>
              <tr>
                <th class="font-weight-bold" style="width: 45%">Category Name</th>
                <th class="font-weight-bold" style="width: 20%">
                  Order
                  <v-tooltip activator="parent" location="bottom">Set display ordering index of custom sheet categories</v-tooltip>
                </th>
                <th class="font-weight-bold text-center" style="width: 15%">Active</th>
                <th class="text-right font-weight-bold" style="width: 20%">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(val, index) in filteredCustomSheetCategories" :key="val.tempId">
                <td class="py-1">
                  <v-text-field
                    v-model="val.name"
                    density="compact"
                    variant="underlined"
                    hide-details
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <div class="d-flex align-center" style="gap: 8px;">
                    <v-text-field
                      v-model="val.order"
                      density="compact"
                      variant="underlined"
                      hide-details
                      type="number"
                      style="max-width: 60px;"
                      @input="markPending(val)"
                      @blur="saveIfPending(val)"
                    ></v-text-field>
                    <div class="d-flex flex-column align-center justify-center">
                      <v-btn
                        icon="mdi-chevron-up"
                        variant="text"
                        size="x-small"
                        density="compact"
                        :disabled="index === 0"
                        @click="moveCategory(val, 'up')"
                        class="ma-0 pa-0"
                        style="font-size: 14px; height: 16px; width: 16px;"
                      ></v-btn>
                      <v-btn
                        icon="mdi-chevron-down"
                        variant="text"
                        size="x-small"
                        density="compact"
                        :disabled="index === filteredCustomSheetCategories.length - 1"
                        @click="moveCategory(val, 'down')"
                        class="ma-0 pa-0"
                        style="font-size: 14px; height: 16px; width: 16px;"
                      ></v-btn>
                    </div>
                  </div>
                </td>
                <td class="py-1">
                  <div class="d-flex justify-center">
                    <v-switch
                      :model-value="val.active === 1"
                      @update:model-value="toggleValueActive(val)"
                      color="success"
                      density="compact"
                      hide-details
                      inset
                      :loading="val.saveStatus === 'saving'"
                      :disabled="val.saveStatus === 'saving'"
                    ></v-switch>
                  </div>
                </td>
                <td class="text-right py-1">
                  <div class="d-inline-flex align-center justify-end">
                    <v-tooltip location="bottom">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          v-bind="props"
                          :color="getStatusColor(val.saveStatus)"
                          class="mr-3"
                          size="small"
                        >
                          {{ getStatusIcon(val.saveStatus) }}
                        </v-icon>
                      </template>
                      <span>{{ getStatusTooltip(val.saveStatus) }}</span>
                    </v-tooltip>
                    <v-btn
                      color="error"
                      variant="outlined"
                      size="small"
                      class="text-none font-weight-medium rounded-pill"
                      prepend-icon="mdi-trash-can-outline"
                      @click="confirmDeleteValue(val)"
                    >
                      Delete
                    </v-btn>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredCustomSheetCategories.length === 0">
                <td colspan="4" class="text-center py-6 text-medium-emphasis">
                  {{ customSheetCategories.length === 0 ? 'No custom sheet categories configured.' : 'No active custom sheet categories found matching the filter.' }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-btn
        variant="outlined"
        color="primary"
        class="mt-4 text-none font-weight-medium"
        prepend-icon="mdi-plus"
        @click="newValue(4)"
      >
        New Category
      </v-btn>
    </div>

    <!-- Gold Credits Config Section -->
    <div v-else-if="section === 'gold-credit'">
      <v-card variant="outlined" class="border-light">
        <v-card-text class="pa-0">
          <v-table hover class="config-table">
            <thead>
              <tr>
                <th class="font-weight-bold" style="width: 22%">Name</th>
                <th class="font-weight-bold" style="width: 18%">
                  Metal Price Multiplier
                  <v-tooltip activator="parent" location="bottom">Multiplied by the spot rate (e.g. 14k = 0.585)</v-tooltip>
                </th>
                <th class="font-weight-bold" style="width: 12%">
                  Markup
                  <v-tooltip activator="parent" location="bottom">Value factor multiplied to metal price and weight</v-tooltip>
                </th>
                <th class="font-weight-bold" style="width: 12%">
                  Metal Type
                  <v-tooltip activator="parent" location="bottom">Assigns 'Gold' or 'Platinum' spot prices to evaluate item value</v-tooltip>
                </th>
                <th class="font-weight-bold" style="width: 8%">Order</th>
                <th class="font-weight-bold text-center" style="width: 10%">Active</th>
                <th class="text-right font-weight-bold" style="width: 18%">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="val in goldCredits" :key="val.tempId">
                <td class="py-1">
                  <v-text-field
                    v-model="val.name"
                    density="compact"
                    variant="underlined"
                    hide-details
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <v-text-field
                    v-model="val.value1"
                    density="compact"
                    variant="underlined"
                    hide-details
                    type="number"
                    step="0.001"
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <v-text-field
                    v-model="val.value2"
                    density="compact"
                    variant="underlined"
                    hide-details
                    type="number"
                    step="0.01"
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <v-text-field
                    v-model="val.value3"
                    density="compact"
                    variant="underlined"
                    hide-details
                    placeholder="Gold or Platinum"
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <v-text-field
                    v-model="val.order"
                    density="compact"
                    variant="underlined"
                    hide-details
                    type="number"
                    @input="markPending(val)"
                    @blur="saveIfPending(val)"
                  ></v-text-field>
                </td>
                <td class="py-1">
                  <div class="d-flex justify-center">
                    <v-switch
                      :model-value="val.active === 1"
                      @update:model-value="toggleValueActive(val)"
                      color="success"
                      density="compact"
                      hide-details
                      inset
                      :loading="val.saveStatus === 'saving'"
                      :disabled="val.saveStatus === 'saving'"
                    ></v-switch>
                  </div>
                </td>
                <td class="text-right py-1">
                  <div class="d-inline-flex align-center justify-end">
                    <v-tooltip location="bottom">
                      <template v-slot:activator="{ props }">
                        <v-icon
                          v-bind="props"
                          :color="getStatusColor(val.saveStatus)"
                          class="mr-3"
                          size="small"
                        >
                          {{ getStatusIcon(val.saveStatus) }}
                        </v-icon>
                      </template>
                      <span>{{ getStatusTooltip(val.saveStatus) }}</span>
                    </v-tooltip>
                    <v-btn
                      color="error"
                      variant="outlined"
                      size="small"
                      class="text-none font-weight-medium rounded-pill"
                      prepend-icon="mdi-trash-can-outline"
                      @click="confirmDeleteValue(val)"
                    >
                      Delete
                    </v-btn>
                  </div>
                </td>
              </tr>
              <tr v-if="goldCredits.length === 0">
                <td colspan="7" class="text-center py-6 text-medium-emphasis">No gold credit items configured.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-btn
        variant="outlined"
        color="primary"
        class="mt-4 text-none font-weight-medium"
        prepend-icon="mdi-plus"
        @click="newValue(1)"
      >
        New Gold Credit Item
      </v-btn>
    </div>

    <!-- Dialog: Delete Custom Value Item Confirmation -->
    <v-dialog v-model="valueDeleteDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-toolbar color="error" dark flat>
          <v-toolbar-title class="font-weight-bold">
            <v-icon start>mdi-alert-circle</v-icon>
            Delete Configuration Item
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-6">
          <p class="mb-0">
            Are you sure you want to delete <strong class="text-error">{{ valueToDelete?.name || 'this item' }}</strong> from configuration? This will permanently remove its calculations.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-btn
            variant="text"
            color="medium-emphasis"
            class="text-none font-weight-medium px-4"
            @click="valueDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="flat"
            class="text-none font-weight-medium px-4"
            prepend-icon="mdi-trash-can"
            @click="handleDeleteValue"
          >
            Delete Item
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { api } from '../../utils/api'
import { showToast } from '../../store/toast'
import { refreshMetadata } from '../../store/metadata'

const props = defineProps({
  section: {
    type: String,
    required: true
  }
})

// Custom Values State
const valuesList = ref([])
const customSheets = ref([])
const customSheetCategories = ref([])
const goldCredits = ref([])
const valueDeleteDialog = ref(false)
const valueToDelete = ref(null)
const hideInactiveCustomSheets = ref(true)
const hideInactiveCategories = ref(true)

const filteredCustomSheets = computed(() => {
  if (hideInactiveCustomSheets.value) {
    return customSheets.value.filter(val => val.active === 1 || !val.id || val.justDeactivated)
  }
  return customSheets.value
})

const filteredCustomSheetCategories = computed(() => {
  if (hideInactiveCategories.value) {
    return customSheetCategories.value.filter(val => val.active === 1 || !val.id || val.justDeactivated)
  }
  return customSheetCategories.value
})

const categoryNames = computed(() => {
  return customSheetCategories.value.map(c => c.name).filter(Boolean)
})

const showSnackbar = (text, color = 'success') => {
  showToast(text, color)
}

const getValues = async () => {
  try {
    const currentStatuses = {}
    const deactivatedStates = {}
    valuesList.value.forEach(v => {
      const key = v.id || v.tempId
      if (key) {
        currentStatuses[key] = v.saveStatus
        deactivatedStates[key] = v.justDeactivated
      }
    })

    // Keep track of unsaved local items
    const unsavedSheets = customSheets.value.filter(v => !v.id)
    const unsavedCategories = customSheetCategories.value.filter(v => !v.id)
    const unsavedCredits = goldCredits.value.filter(v => !v.id)

    const data = await api.get('/values')
    valuesList.value = (data || []).map(v => {
      const tempId = `val-${v.id}`
      return {
        ...v,
        tempId,
        saveStatus: currentStatuses[v.id] || null,
        justDeactivated: deactivatedStates[v.id] || false
      }
    })
    
    // Categorize custom values
    customSheets.value = [
      ...valuesList.value.filter(v => v.type_id === 3),
      ...unsavedSheets
    ]
    goldCredits.value = [
      ...valuesList.value.filter(v => v.type_id === 1),
      ...unsavedCredits
    ]
    
    const dbCategories = valuesList.value.filter(v => v.type_id === 4)
    customSheetCategories.value = [
      ...dbCategories.sort((a, b) => {
        const orderA = a.order !== null && a.order !== undefined && a.order !== '' ? Number(a.order) : -999
        const orderB = b.order !== null && b.order !== undefined && b.order !== '' ? Number(b.order) : -999
        return orderB - orderA
      }),
      ...unsavedCategories
    ]
  } catch (err) {
    console.error('Failed to load values configuration:', err)
  }
}

const toggleValueActive = async (val) => {
  const newActive = val.active === 1 ? 0 : 1
  val.active = newActive
  if (newActive === 0) {
    val.justDeactivated = true
  } else {
    val.justDeactivated = false
  }
  
  if (val.id) {
    await saveValue(val)
  }
}

const markPending = (val) => {
  if (val.saveStatus !== 'saving') {
    val.saveStatus = 'pending'
  }
}

const saveIfPending = async (val) => {
  if (val.saveStatus === 'pending') {
    if (!val.name || !val.name.trim()) {
      val.saveStatus = null
      return
    }
    await saveValue(val)
  }
}

const onComboboxChange = async (val) => {
  markPending(val)
  await saveIfPending(val)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'saving': return 'info'
    case 'saved': return 'success'
    case 'error': return 'error'
    default: return 'medium-emphasis'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return 'mdi-cloud-upload-outline'
    case 'saving': return 'mdi-cloud-sync-outline'
    case 'saved': return 'mdi-check-circle-outline'
    case 'error': return 'mdi-alert-circle-outline'
    default: return 'mdi-cloud-check-outline'
  }
}

const getStatusTooltip = (status) => {
  switch (status) {
    case 'pending': return 'Changes pending (press Tab or click outside to save)'
    case 'saving': return 'Saving changes to database...'
    case 'saved': return 'All changes saved'
    case 'error': return 'Failed to save changes'
    default: return 'Saved'
  }
}

const newValue = (typeId) => {
  const newItem = {
    id: null,
    tempId: `new-${Date.now()}-${Math.random()}`,
    type_id: typeId,
    name: '',
    value1: '',
    value2: '',
    value3: typeId === 1 ? 'Gold' : '',
    order: '',
    markup: '',
    default: '',
    active: 1,
    saveStatus: null
  }
  
  if (typeId === 1) {
    goldCredits.value.push(newItem)
  } else if (typeId === 3) {
    customSheets.value.push(newItem)
  } else if (typeId === 4) {
    customSheetCategories.value.push(newItem)
  }
}

const saveValue = async (value) => {
  if (!value.name.trim()) {
    showSnackbar('Item name is required', 'warning')
    return
  }

  value.saveStatus = 'saving'
  try {
    const payload = {
      name: value.name.trim(),
      value1: value.value1 !== null && value.value1 !== undefined ? String(value.value1).trim() : null,
      value2: value.value2 !== null && value.value2 !== undefined ? String(value.value2).trim() : null,
      value3: value.value3 !== null && value.value3 !== undefined ? String(value.value3).trim() : null,
      order: value.order !== null && value.order !== undefined ? String(value.order).trim() : null,
      markup: value.markup !== null && value.markup !== undefined ? String(value.markup).trim() : null,
      default: value.default !== null && value.default !== undefined ? String(value.default).trim() : null,
      active: value.active === 0 || value.active === false ? 0 : 1
    }

    if (value.id) {
      await api.put(`/values/${value.id}`, payload)
      value.saveStatus = 'saved'
    } else {
      payload.type_id = value.type_id
      const data = await api.post('/values', payload)
      value.id = data.id
      value.saveStatus = 'saved'
    }

    setTimeout(() => {
      const item = valuesList.value.find(v => v.id === value.id)
      if (item) {
        item.saveStatus = null
      } else {
        value.saveStatus = null
      }
    }, 3000)

    await refreshMetadata()
    await getValues()
  } catch (err) {
    value.saveStatus = null
    showSnackbar('Failed to write value: ' + err.message, 'error')
  }
}

const confirmDeleteValue = (value) => {
  valueToDelete.value = value
  valueDeleteDialog.value = true
}

const handleDeleteValue = async () => {
  if (!valueToDelete.value) return
  const val = valueToDelete.value
  
  if (!val.id) {
    if (val.type_id === 1) {
      goldCredits.value = goldCredits.value.filter(v => v !== val)
    } else if (val.type_id === 3) {
      customSheets.value = customSheets.value.filter(v => v !== val)
    } else if (val.type_id === 4) {
      customSheetCategories.value = customSheetCategories.value.filter(v => v !== val)
    }
    valueDeleteDialog.value = false
    valueToDelete.value = null
    return
  }

  try {
    await api.delete(`/values/${val.id}`)
    showSnackbar('Item removed successfully', 'success')
    await refreshMetadata()
    await getValues()
  } catch (err) {
    showSnackbar('Failed to delete item: ' + err.message, 'error')
  } finally {
    valueDeleteDialog.value = false
    valueToDelete.value = null
  }
}

const moveCategory = async (item, direction) => {
  const filteredList = filteredCustomSheetCategories.value
  const filteredIndex = filteredList.indexOf(item)
  if (filteredIndex === -1) return
  
  const targetFilteredIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1
  if (targetFilteredIndex < 0 || targetFilteredIndex >= filteredList.length) return
  
  const targetItem = filteredList[targetFilteredIndex]
  
  const mainList = customSheetCategories.value
  const index = mainList.indexOf(item)
  const targetIndex = mainList.indexOf(targetItem)
  if (index === -1 || targetIndex === -1) return
  
  mainList[index] = targetItem
  mainList[targetIndex] = item
  
  mainList.forEach((it, idx) => {
    it.order = mainList.length - idx
  })
  
  customSheetCategories.value = [...mainList]
  
  try {
    const itemsToSave = [item, targetItem].filter(it => it.id)
    for (const it of itemsToSave) {
      const payload = {
        name: it.name.trim(),
        value1: it.value1 !== null && it.value1 !== undefined ? String(it.value1).trim() : null,
        value2: it.value2 !== null && it.value2 !== undefined ? String(it.value2).trim() : null,
        value3: it.value3 !== null && it.value3 !== undefined ? String(it.value3).trim() : null,
        order: String(it.order),
        markup: it.markup !== null && it.markup !== undefined ? String(it.markup).trim() : null,
        default: it.default !== null && it.default !== undefined ? String(it.default).trim() : null,
        active: it.active === 0 || it.active === false ? 0 : 1
      }
      await api.put(`/values/${it.id}`, payload)
    }
    
    await refreshMetadata()
    await getValues()
    showSnackbar('Category order updated successfully', 'success')
  } catch (err) {
    showSnackbar('Failed to save category order: ' + err.message, 'error')
  }
}

onMounted(async () => {
  await getValues()
})

watch(() => props.section, () => {
  valuesList.value.forEach(v => {
    v.justDeactivated = false
  })
})

watch(hideInactiveCustomSheets, (newVal) => {
  if (newVal) {
    customSheets.value.forEach(v => {
      v.justDeactivated = false
    })
  }
})

watch(hideInactiveCategories, (newVal) => {
  if (newVal) {
    customSheetCategories.value.forEach(v => {
      v.justDeactivated = false
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

.config-table :deep(input) {
  text-align: left !important;
}

.config-table :deep(.v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  font-size: 0.9rem !important;
}
</style>
