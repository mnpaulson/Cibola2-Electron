<template>
  <!-- Small Display Mode for CreditForm -->
  <v-sheet v-if="small" border class="pa-3 rounded-lg bg-light-surface mb-4 position-relative">
    <!-- Top Right Action Buttons -->
    <div class="actions-container">
      <!-- Save Button (Only if modified) -->
      <v-btn
        v-if="!disabled && isModified"
        icon="mdi-content-save"
        variant="text"
        density="comfortable"
        color="success"
        title="Commit prices globally"
        :loading="isSaving"
        :disabled="isOffline"
        @click="saveSmallPrices"
      ></v-btn>

      <v-btn
        v-if="!disabled"
        icon="mdi-cached"
        variant="text"
        density="comfortable"
        color="primary"
        title="Sync from Market"
        :loading="isSyncing"
        :disabled="isOffline"
        @click="syncPrices"
      ></v-btn>
    </div>

    <div class="text-caption font-weight-bold mb-2 text-medium-emphasis">
      Spot Metal Prices (CAD/g)
    </div>
    <v-row dense>
      <v-col cols="6">
        <v-text-field
          v-model="localGold"
          label="Gold Spot"
          prefix="$"
          suffix="/g"
          variant="outlined"
          density="compact"
          hide-details
          type="number"
          step="0.01"
          :disabled="disabled"
          @input="onGoldInput"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="localPlat"
          label="Platinum Spot"
          prefix="$"
          suffix="/g"
          variant="outlined"
          density="compact"
          hide-details
          type="number"
          step="0.01"
          :disabled="disabled"
          @input="onPlatInput"
        ></v-text-field>
      </v-col>
    </v-row>
    <div class="d-flex align-center justify-space-between mt-3 flex-wrap">
      <span class="text-caption text-medium-emphasis" :class="{ 'text-error font-weight-bold': !disabled && priceAgeWarn }">
        <template v-if="disabled">
          Prices as of: {{ formatLocalDate(date, 'datetime') || 'Never' }}
        </template>
        <template v-else>
          Last Updated: {{ formatLocalDate(date, 'datetime') || 'Never' }}
        </template>
      </span>
    </div>
  </v-sheet>

  <!-- Large/Default Display Mode -->
  <v-card v-else class="metal-prices-card position-relative" elevation="2">
    <!-- Top Right Action Buttons -->
    <div class="actions-container">
      <!-- Refresh/Sync Button -->
      <v-btn
        v-if="!isEditing"
        icon="mdi-cached"
        variant="text"
        density="comfortable"
        color="primary"
        title="Sync from Market"
        :loading="isSyncing"
        :disabled="isOffline"
        @click="syncPrices"
      ></v-btn>
    </div>

    <!-- Prices Display / Inputs -->
    <v-card-text class="pa-4 pt-8">
      <v-row class="align-center">
        <!-- Gold Column -->
        <v-col cols="6" class="text-center border-r">
          <div class="text-caption text-medium-emphasis font-weight-bold">Gold</div>
          <div v-if="!isEditing" class="text-h6 font-weight-black text-amber-accent-4 mt-1">
            ${{ formatPrice(goldPrice) }} <span class="text-caption text-medium-emphasis font-weight-regular">/g</span>
          </div>
          <v-text-field
            v-else
            v-model="localPrices.gold"
            prefix="$"
            suffix="/g"
            density="compact"
            variant="outlined"
            hide-details
            type="number"
            step="0.01"
            class="mt-1 px-2 centered-input"
          ></v-text-field>
        </v-col>

        <!-- Platinum Column -->
        <v-col cols="6" class="text-center">
          <div class="text-caption text-medium-emphasis font-weight-bold">Platinum</div>
          <div v-if="!isEditing" class="text-h6 font-weight-black text-blue-grey-lighten-4 mt-1">
            ${{ formatPrice(platPrice) }} <span class="text-caption text-medium-emphasis font-weight-regular">/g</span>
          </div>
          <v-text-field
            v-else
            v-model="localPrices.plat"
            prefix="$"
            suffix="/g"
            density="compact"
            variant="outlined"
            hide-details
            type="number"
            step="0.01"
            class="mt-1 px-2 centered-input"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Silver Collapsible Section -->
      <v-expand-transition>
        <div v-show="isSilverExpanded || isEditing" class="mt-4 pt-4 border-t">
          <v-row justify="center">
            <v-col cols="12" md="6" class="text-center mx-auto">
              <div class="text-caption text-medium-emphasis font-weight-bold">Silver</div>
              <div v-if="!isEditing" class="text-h6 font-weight-black text-grey-lighten-1 mt-1">
                ${{ formatPrice(silverPrice) }} <span class="text-caption text-medium-emphasis font-weight-regular">/g</span>
              </div>
              <v-text-field
                v-else
                v-model="localPrices.silver"
                prefix="$"
                suffix="/g"
                density="compact"
                variant="outlined"
                hide-details
                type="number"
                step="0.01"
                class="mt-1 px-2 centered-input"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>

      <!-- Footer Actions & Info -->
      <div class="d-flex align-center justify-space-between mt-4">
        <div class="text-caption text-medium-emphasis">
          Updated: {{ lastUpdatedText }}
        </div>

        <div class="d-flex align-center gap-2">
          <!-- Edit Toggle Button (Only visible when expanded AND not editing) -->
          <v-btn
            v-if="!isEditing && isSilverExpanded"
            icon="mdi-pencil-outline"
            variant="text"
            density="comfortable"
            color="primary"
            title="Edit Prices"
            :disabled="isSyncing || isOffline"
            @click="startEdit"
          ></v-btn>

          <!-- Caret toggle for Silver (Only visible when not editing) -->
          <v-btn
            v-if="!isEditing"
            :icon="isSilverExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            variant="text"
            density="comfortable"
            color="medium-emphasis"
            @click="isSilverExpanded = !isSilverExpanded"
            title="Toggle Silver Price"
          ></v-btn>

          <!-- Edit Actions -->
          <template v-else>
            <v-btn
              size="small"
              variant="text"
              color="medium-emphasis"
              class="text-none"
              @click="cancelEdit"
              :disabled="isSaving"
            >
              Cancel
            </v-btn>
            <v-btn
              size="small"
              color="success"
              variant="flat"
              class="text-none font-weight-medium rounded"
              prepend-icon="mdi-check"
              @click="savePrices"
              :loading="isSaving"
              :disabled="isOffline || !isValid"
            >
              Save
            </v-btn>
          </template>
        </div>
      </div>

      <!-- Offline warning banner -->
      <v-alert
        v-if="isOffline"
        color="error"
        variant="tonal"
        density="compact"
        icon="mdi-wifi-off"
        class="mt-3 text-caption py-1 px-3"
      >
        Offline: Price updates disabled
      </v-alert>
    </v-card-text>

  </v-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { api } from '../utils/api'
import { metadataState, refreshMetadata } from '../store/metadata'
import { sessionState } from '../store/session'
import { formatLocalDate } from '../utils/dates'
import { showToast } from '../store/toast'

const props = defineProps({
  small: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  gold: {
    type: Number,
    default: null
  },
  platinum: {
    type: Number,
    default: null
  },
  date: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:gold', 'update:platinum', 'update:date'])

const localGold = ref('')
const localPlat = ref('')
const isManuallyEdited = ref(false)

watch(() => props.gold, (newVal) => {
  if (newVal !== parseFloat(localGold.value)) {
    localGold.value = newVal !== null && newVal !== undefined ? String(newVal) : '0'
    isManuallyEdited.value = false
  }
}, { immediate: true })

watch(() => props.platinum, (newVal) => {
  if (newVal !== parseFloat(localPlat.value)) {
    localPlat.value = newVal !== null && newVal !== undefined ? String(newVal) : '0'
    isManuallyEdited.value = false
  }
}, { immediate: true })

function onGoldInput() {
  isManuallyEdited.value = true
  emit('update:gold', parseFloat(localGold.value) || 0)
}

function onPlatInput() {
  isManuallyEdited.value = true
  emit('update:platinum', parseFloat(localPlat.value) || 0)
}

const isModified = computed(() => {
  if (!isManuallyEdited.value) return false
  const g = parseFloat(localGold.value) || 0
  const p = parseFloat(localPlat.value) || 0
  return g !== goldPrice.value || p !== platPrice.value
})

const saveSmallPrices = async () => {
  if (isOffline.value) {
    showToast('Cannot save changes while offline', 'error')
    return
  }

  const g = parseFloat(localGold.value)
  const p = parseFloat(localPlat.value)
  if (isNaN(g) || g < 0 || isNaN(p) || p < 0) {
    showToast('Please enter valid price values', 'warning')
    return
  }

  isSaving.value = true
  try {
    const updates = []
    
    if (goldRecord.value) {
      updates.push(
        api.put(`/values/${goldRecord.value.id}`, {
          ...goldRecord.value,
          value1: String(g)
        })
      )
    }
    if (platRecord.value) {
      updates.push(
        api.put(`/values/${platRecord.value.id}`, {
          ...platRecord.value,
          value1: String(p)
        })
      )
    }

    await Promise.all(updates)
    await refreshMetadata()
    showToast('Global spot prices updated successfully', 'success')
    isManuallyEdited.value = false
    
    emit('update:gold', g)
    emit('update:platinum', p)
    emit('update:date', lastUpdatedRaw.value)
  } catch (err) {
    console.error('Failed to update metal prices:', err)
    showToast('Failed to save prices: ' + err.message, 'error')
  } finally {
    isSaving.value = false
  }
}

const priceAgeWarn = computed(() => {
  if (!props.date) return true
  try {
    let cleanDate = props.date
    if (cleanDate.includes(' ') && !cleanDate.includes('T')) {
      cleanDate = cleanDate.replace(' ', 'T') + 'Z'
    }
    const age = new Date() - Date.parse(cleanDate)
    return age > 86400000 // More than 24 hours
  } catch {
    return true
  }
})

// State variables
const isEditing = ref(false)
const isSaving = ref(false)
const isSyncing = ref(false)
const isSilverExpanded = ref(false)

const localPrices = reactive({
  gold: '',
  plat: '',
  silver: ''
})



// Check if network is offline
const isOffline = computed(() => {
  return sessionState.connectionStatus === 'offline'
})

// Retrieve records from store
const goldRecord = computed(() => {
  return metadataState.metalPrices.find(p => p.name === 'GoldCAD' || p.name === 'Gold')
})

const platRecord = computed(() => {
  return metadataState.metalPrices.find(p => p.name === 'PlatCAD' || p.name === 'Platinum')
})

const silverRecord = computed(() => {
  return metadataState.metalPrices.find(p => p.name === 'SilverCAD' || p.name === 'Silver')
})

// Extract numeric values safely
const goldPrice = computed(() => {
  return goldRecord.value ? parseFloat(goldRecord.value.value1) || 0 : 0
})

const platPrice = computed(() => {
  return platRecord.value ? parseFloat(platRecord.value.value1) || 0 : 0
})

const silverPrice = computed(() => {
  return silverRecord.value ? parseFloat(silverRecord.value.value1) || 0 : 0
})

// Validation for inputs
const isValid = computed(() => {
  const g = parseFloat(localPrices.gold)
  const p = parseFloat(localPrices.plat)
  const s = parseFloat(localPrices.silver)
  return !isNaN(g) && g >= 0 &&
         !isNaN(p) && p >= 0 &&
         !isNaN(s) && s >= 0
})

// Formatter for prices
const formatPrice = (val) => {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Compute the latest updated timestamp in raw UTC format
const lastUpdatedRaw = computed(() => {
  const prices = metadataState.metalPrices
  if (!prices || prices.length === 0) return ''

  let maxDate = null
  let maxDateStr = null
  for (const p of prices) {
    if (!p.updated_at) continue
    let parseableStr = p.updated_at.trim()
    if (parseableStr.includes(' ') && !parseableStr.includes('T')) {
      parseableStr = parseableStr.replace(' ', 'T') + 'Z'
    }
    const d = new Date(parseableStr)
    if (!isNaN(d.getTime())) {
      if (!maxDate || d > maxDate) {
        maxDate = d
        maxDateStr = p.updated_at
      }
    }
  }

  return maxDateStr || ''
})

// Compute the latest updated timestamp among the entries as a local formatted string
const lastUpdatedText = computed(() => {
  if (!lastUpdatedRaw.value) return 'Never'
  return formatLocalDate(lastUpdatedRaw.value, 'datetime')
})

// Methods
const startEdit = () => {
  localPrices.gold = goldRecord.value ? String(goldRecord.value.value1) : '0'
  localPrices.plat = platRecord.value ? String(platRecord.value.value1) : '0'
  localPrices.silver = silverRecord.value ? String(silverRecord.value.value1) : '0'
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const savePrices = async () => {
  if (isOffline.value) {
    showToast('Cannot save changes while offline', 'error')
    return
  }
  if (!isValid.value) {
    showToast('Please enter valid price values', 'warning')
    return
  }

  isSaving.value = true
  try {
    const updates = []
    
    if (goldRecord.value) {
      updates.push(
        api.put(`/values/${goldRecord.value.id}`, {
          ...goldRecord.value,
          value1: String(parseFloat(localPrices.gold))
        })
      )
    }
    if (platRecord.value) {
      updates.push(
        api.put(`/values/${platRecord.value.id}`, {
          ...platRecord.value,
          value1: String(parseFloat(localPrices.plat))
        })
      )
    }
    if (silverRecord.value) {
      updates.push(
        api.put(`/values/${silverRecord.value.id}`, {
          ...silverRecord.value,
          value1: String(parseFloat(localPrices.silver))
        })
      )
    }

    await Promise.all(updates)
    await refreshMetadata()
    showToast('Prices updated successfully', 'success')
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update metal prices:', err)
    showToast('Failed to save prices: ' + err.message, 'error')
  } finally {
    isSaving.value = false
  }
}

const syncPrices = async () => {
  if (isOffline.value) {
    showToast('Cannot sync prices while offline', 'error')
    return
  }

  isSyncing.value = true
  try {
    await api.post('/values/sync')
    await refreshMetadata()
    showToast('Successfully synced spot prices with market', 'success')
    isManuallyEdited.value = false
    
    if (props.small) {
      emit('update:gold', goldPrice.value)
      emit('update:platinum', platPrice.value)
      emit('update:date', lastUpdatedRaw.value)
    }
  } catch (err) {
    console.error('Failed to sync metal prices:', err)
    showToast('Failed to sync prices: ' + err.message, 'error')
  } finally {
    isSyncing.value = false
  }
}

onMounted(async () => {
  // If metadata is not loaded yet, wait or fetch it
  if (!metadataState.isLoaded && !metadataState.isLoading) {
    try {
      await refreshMetadata()
    } catch (err) {
      console.error('Failed to load initial metadata in card:', err)
    }
  }

  // If in small mode, do NOT perform automatic background sync of global prices
  if (props.small) return

  // Check if we can sync (must be online)
  if (isOffline.value) return

  const prices = metadataState.metalPrices
  if (!prices || prices.length === 0) {
    // No prices seeded/available locally, sync immediately
    syncPrices()
    return
  }

  // Find the latest updated_at time
  let maxTimeMs = 0
  for (const p of prices) {
    if (!p.updated_at) continue
    let parseableStr = p.updated_at.trim()
    if (parseableStr.includes(' ') && !parseableStr.includes('T')) {
      parseableStr = parseableStr.replace(' ', 'T') + 'Z'
    }
    const d = new Date(parseableStr)
    if (!isNaN(d.getTime())) {
      if (d.getTime() > maxTimeMs) {
        maxTimeMs = d.getTime()
      }
    }
  }

  const fifteenMinutesMs = 15 * 60 * 1000
  const nowMs = Date.now()

  if (maxTimeMs === 0 || (nowMs - maxTimeMs) > fifteenMinutesMs) {
    console.log('[MetalPricesCard] Prices are older than 15 minutes or missing. Auto-refreshing...')
    syncPrices()
  }
})
</script>

<style scoped>
.metal-prices-card {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(30, 30, 35, 0.6) !important;
  backdrop-filter: blur(10px);
}

.position-relative {
  position: relative;
}

.actions-container {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  z-index: 2;
}

.border-r {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.border-t {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.centered-input :deep(input) {
  text-align: center !important;
}

.centered-input :deep(.v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
