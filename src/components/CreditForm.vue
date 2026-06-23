<template>
  <v-card class="credit-card pb-20" elevation="3" :loading="loading">
    <!-- Header -->
    <v-card-item class="bg-accent1 text-white py-3">
      <v-card-title class="font-weight-bold d-flex align-center">
        <v-icon start class="mr-2">mdi-credit-card-outline</v-icon>
        {{ credit.id ? `Edit Gold Credit #${credit.id}` : 'New Gold Credit Payout' }}
        <v-spacer></v-spacer>
        <span v-if="credit.created_at" class="font-weight-medium">
          Credit Date: {{ formatDate(credit.created_at) }}
        </span>
      </v-card-title>
    </v-card-item>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Inline Customer Lookup Field -->
      <div class="mb-4">
        <CustomerForm
          v-model="credit.customer_id"
          :clearable="!disabled"
          :hide-notes="false"
          :clickable-name="true"
          :lock-notes="true"
          :show-activity="true"
          @select="handleCustomerSelect"
          @click-name="navigateTo('customers', { selectedCustomerId: credit.customer_id })"
          @dirty-state-change="isCustomerDirty = $event"
        />
      </div>

      <v-form ref="formRef" v-model="isFormValid" lazy-validation>
        <v-row>
          <!-- Left Column: Settings and Metadata -->
          <v-col cols="12" md="6">
            <v-select
              v-model="credit.employee_id"
              :items="activeEmployees"
              item-title="name"
              item-value="id"
              label="Employee Selection *"
              prepend-inner-icon="mdi-account-tie"
              :rules="requiredRules"
              variant="outlined"
              density="compact"
              :disabled="disabled"
            ></v-select>

            <v-text-field
              ref="dateInputRef"
              v-model="credit.creditDate"
              label="Transaction Date"
              type="date"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              :disabled="disabled"
              @click:prepend-inner="showDatePicker"
              @click="showDatePicker"
              class="custom-date-field"
            ></v-text-field>

            <div class="d-flex align-center gap-4 mb-4">
              <v-radio-group
                v-model="credit.credit_type"
                inline
                label="Payout Type *"
                hide-details
                :disabled="disabled"
              >
                <v-radio label="Credit" value="credit" class="mr-3"></v-radio>
                <v-radio label="Split" value="split" class="mr-3"></v-radio>
                <v-radio label="Cash" value="cash"></v-radio>
              </v-radio-group>

            </div>

            <!-- Spot Prices Info & Manual Update -->
            <MetalPricesCard
              small
              :disabled="disabled"
              v-model:gold="credit.gold_cad"
              v-model:platinum="credit.plat_cad"
              v-model:date="credit.metalPriceDate"
            />
          </v-col>

          <!-- Right Column: Note and Value Readouts -->
          <v-col cols="12" md="6" class="d-flex flex-column">
            <v-sheet border class="pa-4 rounded-lg bg-surface-variant-light flex-grow-1 d-flex align-center justify-space-between mb-4">
              <!-- Sum Item(s) Value -->
              <div class="d-flex flex-column align-center justify-center flex-grow-1" style="width: 42%;">
                <div class="text-caption text-medium-emphasis mb-1">Sum Item(s) Value</div>
                <div class="text-h4 font-weight-bold text-grey-darken-1">
                  ${{ credit.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
              </div>

              <!-- Swap/Copy Button -->
              <div class="d-flex align-center justify-center px-1">
                <v-btn
                  icon="mdi-swap-horizontal"
                  variant="tonal"
                  color="primary"
                  density="comfortable"
                  title="Copy Sum to Final Amount"
                  :disabled="disabled"
                  @click="copySumValue"
                ></v-btn>
              </div>

              <!-- Final Credit Amount -->
              <div class="d-flex flex-column align-center justify-center flex-grow-1" style="width: 42%;">
                <div class="text-caption text-medium-emphasis mb-1">Final Credit Amount</div>
                <div class="d-flex align-center">
                  <span class="text-h4 font-weight-bold text-success">$</span>
                  <input
                    v-model="credit.credit_value"
                    type="number"
                    step="0.01"
                    class="final-credit-input text-h4 font-weight-bold text-success"
                    placeholder="0.00"
                    :disabled="disabled"
                  />
                </div>
              </div>
            </v-sheet>

            <v-textarea
              v-model="credit.note"
              label="Transaction Note (Visible on customer printed record)"
              variant="outlined"
              rows="3"
              no-resize
              density="compact"
            ></v-textarea>
          </v-col>
        </v-row>

        <!-- Scrap Payout Items breakdown -->
        <v-card border flat class="mb-4">
          <v-card-item class="bg-light-surface py-2">
            <v-card-title class="text-subtitle-2 font-weight-bold d-flex align-center">
              <v-icon start class="mr-1" color="primary">mdi-format-list-bulleted</v-icon>
                Items
            </v-card-title>
          </v-card-item>
          <v-divider></v-divider>
          <v-card-text class="pa-3">
            <v-table density="comfortable" hover>
              <thead>
                <tr>
                  <th style="width: 25%;">Item / Karat</th>
                  <th style="width: 15%;">Weight (g) / Qty</th>
                  <th style="width: 12%;" class="text-center">Multiplier</th>
                  <th style="width: 12%;" class="text-center">Markup</th>
                  <th style="width: 16%;" class="text-center">Unit Price</th>
                  <th style="width: 15%;" class="text-right pr-2">Calculated Value</th>
                  <th style="width: 5%;"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="itemList.length === 0" class="text-center">
                  <td colspan="7" class="py-6 text-medium-emphasis italic">
                    No items added. Click "Add Item" to begin payout.
                  </td>
                </tr>
                <tr v-else v-for="(item, idx) in itemList" :key="idx">
                  <td>
                    <v-select
                      v-model="item.itemObj"
                      :items="selectableKaratItems"
                      item-title="name"
                      return-object
                      placeholder="Select Metal Type"
                      variant="underlined"
                      density="compact"
                      hide-details
                      :disabled="disabled"
                      @update:model-value="onItemTypeChange(item)"
                    ></v-select>
                  </td>
                  <td>
                    <v-text-field
                      v-model="item.weight"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      variant="underlined"
                      density="compact"
                      hide-details
                      :disabled="disabled"
                      :rules="decimalRules"
                      @input="recalculateItem(item)"
                    ></v-text-field>
                  </td>
                  <td>
                    <div class="text-body-2 font-weight-bold text-center">
                      {{ item.multiplier || '—' }}
                    </div>
                  </td>
                  <td>
                    <div class="text-body-2 font-weight-bold text-center">
                      {{ item.markup || '—' }}
                    </div>
                  </td>
                  <td>
                    <div class="text-body-2 font-weight-bold text-center text-blue-grey-darken-1">
                      ${{ (item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
                    </div>
                  </td>
                  <td>
                    <div class="text-body-2 font-weight-bold text-success text-right pr-2">
                      ${{ (item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </div>
                  </td>
                  <td>
                    <v-btn
                      v-if="!disabled"
                      icon="mdi-delete"
                      color="error"
                      variant="text"
                      density="comfortable"
                      title="Remove Item"
                      @click="removeItem(idx)"
                    ></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div class="d-flex justify-start mt-3" v-if="!disabled">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-plus"
                size="small"
                @click="addNewItem"
              >
                Add Item
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Attached Images Gallery -->
        <AttachedImages
          ref="attachedImagesRef"
          v-model="credit.credit_images"
          delete-endpoint="/goldcredits/images"
          :disable-add="disabled"
        />
      </v-form>
    </v-card-text>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationDialog
      v-model="isDeleteOpen"
      title="Delete Gold Credit Payout"
      warning-message="Are you sure you want to permanently delete this credit payout and all its database image attachments? This action is not reversible."
      :loading="loading"
      @confirm="submitDeleteCredit"
    />

    <!-- Actions Footer Navigation -->
    <FormBottomNavigation
      :show-delete="!!credit.id"
      :show-preview="false"
      :save-label="!credit.id ? 'Save Credit' : 'Update Notes'"
      :save-icon="!credit.id ? 'mdi-content-save-all' : 'mdi-content-save'"
      :disable-save="(!credit.id ? !isFormValid : false) || isCustomerDirty"
      :show-print-close="!credit.id"
      :disable-print-close="!isFormValid || isCustomerDirty"
      :disable-capture="disabled"
      :disable-print="!credit.id || isCustomerDirty"
      :customer-dirty="isCustomerDirty"
      @discard="discardCredit"
      @delete="isDeleteOpen = true"
      @capture="attachedImagesRef?.openCamera()"
      @print="printOnly"
      @save="saveOrUpdateCredit(false, false)"
      @save-print-close="saveOrUpdateCredit(true, true)"
    />
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { api } from '../utils/api'
import { settingsState } from '../store/settings'
import { metadataState, refreshMetadata } from '../store/metadata'
import { navigateBack, navigateTo } from '../store/session'
import { formatLocalDate } from '../utils/dates'
import { generateCreditPrintHTML } from '../utils/creditPrintTemplate'
import { showToast } from '../store/toast'
import { removeRecentRecord, refreshRecentRecord } from '../store/recentlyViewed'
import { calculateGoldCreditValue, getAdjustedMarkup, calculateGoldCreditUnitPrice } from '../utils/pricing'
import AttachedImages from './AttachedImages.vue'
import CustomerForm from './CustomerForm.vue'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import MetalPricesCard from './MetalPricesCard.vue'
import FormBottomNavigation from './FormBottomNavigation.vue'

// Props & Emits
const props = defineProps({
  customerId: {
    type: Number,
    default: null
  },
  creditId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['customerId', 'update:creditId', 'update:customerId', 'saved'])

// Component Local State
const formRef = ref(null)
const loading = ref(false)
const isFormValid = ref(true)
const attachedImagesRef = ref(null)
const isDeleteOpen = ref(false)
const customerObj = ref(null)
const itemList = ref([])
const isCustomerDirty = ref(false)
const dateInputRef = ref(null)

function showDatePicker() {
  if (disabled.value) return
  const input = dateInputRef.value?.$el.querySelector('input')
  if (input && typeof input.showPicker === 'function') {
    input.showPicker()
  }
}

// Form models
const credit = reactive({
  id: null,
  customer_id: null,
  employee_id: 1, // Default 'Unassigned'
  gold_cad: 0,
  plat_cad: 0,
  metalPriceDate: '',
  creditDate: '',
  created_at: '',
  used: false,
  note: '',
  credit_type: 'cash',
  credit_value: 0,
  total: 0,
  credit_images: []
})

// Rules
const requiredRules = [v => !!v || 'Required']
const decimalRules = [
  v => {
    if (v === undefined || v === null || v === '') return true
    const val = parseFloat(v)
    return (!isNaN(val) && val >= 0) || 'Must be a valid positive number'
  }
]

// Date conversion
const formatDate = (dateStr) => formatLocalDate(dateStr, 'short')

// Computed checks
const activeEmployees = computed(() => {
  return metadataState.employees || []
})

const selectableKaratItems = computed(() => {
  return metadataState.goldCredits || []
})

const disabled = computed(() => {
  return credit.id !== null && credit.id !== undefined && credit.id !== 0
})

const todayString = computed(() => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Load default spot prices from cached metadata
function loadDefaultSpotPrices() {
  const goldVal = metadataState.metalPrices.find(v => v.name === 'GoldCAD' || v.name === 'Gold')
  const platVal = metadataState.metalPrices.find(v => v.name === 'PlatCAD' || v.name === 'Platinum')
  
  credit.gold_cad = goldVal ? parseFloat(goldVal.value1) || 0 : 0
  credit.plat_cad = platVal ? parseFloat(platVal.value1) || 0 : 0
  credit.metalPriceDate = goldVal?.updated_at || platVal?.updated_at || ''
}

function resetCreditFields() {
  credit.id = null
  credit.customer_id = props.customerId
  credit.employee_id = 1
  credit.gold_cad = 0
  credit.plat_cad = 0
  credit.metalPriceDate = ''
  credit.creditDate = todayString.value
  credit.created_at = ''
  credit.used = false
  credit.note = ''
  credit.credit_type = 'cash'
  credit.credit_value = 0
  credit.total = 0
  credit.credit_images = []
  itemList.value = []
}

// Item row events
function addNewItem() {
  itemList.value.push({
    id: null,
    itemObj: null,
    itemId: null,
    weight: '',
    multiplier: 0,
    markup: 0,
    unitPrice: 0,
    value: 0
  })
}

function recalculateTotal() {
  const sum = itemList.value.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0)
  credit.total = Math.round(sum * 100) / 100
}

// Load single credit details from backend
async function loadCredit(id) {
  loading.value = true
  try {
    const data = await api.get(`/goldcredits/${id}`)
    if (data) {
      credit.id = data.id
      credit.customer_id = data.customer_id
      credit.employee_id = data.employee_id
      credit.gold_cad = data.gold_cad || 0
      credit.plat_cad = data.plat_cad || 0
      credit.metalPriceDate = data.gold_date || ''
      credit.creditDate = data.created_at ? data.created_at.split(' ')[0] : ''
      credit.created_at = data.created_at || ''
      credit.used = !!data.used
      credit.note = data.note || ''
      credit.credit_type = data.credit_type || 'credit'
      credit.credit_value = data.credit_value || 0
      credit.credit_images = data.credit_images || []
      
      // Load and map items
      itemList.value = (data.credit_items || []).map(element => {
        const itemVal = selectableKaratItems.value.find(v => v.id === element.itemId)
        return {
          id: element.id,
          itemObj: itemVal || null,
          itemId: element.itemId,
          markup: element.markup,
          multiplier: element.multiplier,
          weight: element.weight,
          unitPrice: calculateGoldCreditUnitPrice(element.value, element.weight),
          value: element.value
        }
      })
      
      recalculateTotal()
    }
  } catch (err) {
    console.error('Failed to load credit payout details:', err)
    showToast('Failed to load credit: ' + err.message, 'error')
    removeRecentRecord('credit', id)
    navigateBack()
  } finally {
    loading.value = false
  }
}

// Watch customerId prop updates
watch(() => props.customerId, async (newId) => {
  if (newId && newId !== credit.customer_id) {
    credit.customer_id = newId
    try {
      customerObj.value = await api.get(`/customers/${newId}`)
      emit('customerId', newId)
    } catch (err) {
      console.error('Failed to load customer details:', err)
      showToast('Failed to load customer details: ' + err.message, 'warning')
    }
  } else if (!newId && props.creditId === null) {
    customerObj.value = null
    credit.customer_id = null
  }
}, { immediate: true })

const handleCustomerSelect = (custObj) => {
  customerObj.value = custObj
  if (custObj) {
    credit.customer_id = custObj.id
    emit('customerId', custObj.id)
    emit('update:customerId', custObj.id)
  } else {
    credit.customer_id = null
    emit('customerId', null)
    emit('update:customerId', null)
  }
}

// Watch creditId to load existing transaction details
watch(() => props.creditId, (newId) => {
  resetCreditFields()
  if (newId && newId !== 0) {
    loadCredit(newId)
  } else {
    loadDefaultSpotPrices()
    addNewItem()
  }
}, { immediate: true })

// Watch transaction type to recalculate all items instantly
watch(() => credit.credit_type, () => {
  if (!disabled.value) {
    itemList.value.forEach(item => {
      recalculateItem(item)
    })
    recalculateTotal()
  }
})

// Watch metadataState.metalPrices to update new credits reactively when global prices sync
watch(
  () => metadataState.metalPrices,
  (newVal, oldVal) => {
    if (!credit.id) {
      // Find old/new metadata prices safely
      const getVal = (prices, name) => {
        if (!Array.isArray(prices)) return 0
        const record = prices.find(p => p.name === name || p.name === name.replace('CAD', ''))
        return record ? parseFloat(record.value1) || 0 : 0
      }
      
      const oldGold = oldVal ? getVal(oldVal, 'GoldCAD') : 0
      const oldPlat = oldVal ? getVal(oldVal, 'PlatCAD') : 0
      
      // If parent values are 0 or still match the old metadata defaults, update them
      if (
        (credit.gold_cad === 0 || credit.gold_cad === oldGold) &&
        (credit.plat_cad === 0 || credit.plat_cad === oldPlat)
      ) {
        loadDefaultSpotPrices()
      }
    }
  },
  { deep: true }
)

// Watch spot prices to recalculate all items instantly when prices change
watch(
  () => [credit.gold_cad, credit.plat_cad],
  () => {
    if (!disabled.value) {
      itemList.value.forEach(item => {
        recalculateItem(item)
      })
      recalculateTotal()
    }
  }
)





const copySumValue = () => {
  credit.credit_value = credit.total
}







function removeItem(index) {
  itemList.value.splice(index, 1)
  recalculateTotal()
}

function onItemTypeChange(item) {
  if (item.itemObj) {
    item.itemId = item.itemObj.id
    item.multiplier = parseFloat(item.itemObj.value1) || 0
    item.markup = getAdjustedMarkup(item.itemObj.name, item.itemObj.value2, credit.credit_type)
    recalculateItem(item)
  } else {
    item.itemId = null
    item.multiplier = 0
    item.markup = 0
    item.unitPrice = 0
    item.value = 0
  }
  recalculateTotal()
}

function recalculateItem(item) {
  if (!item.itemObj) return
  
  const w = parseFloat(item.weight) || 0
  
  // Re-adjust markup factor locally based on active credit_type
  item.markup = getAdjustedMarkup(item.itemObj.name, item.itemObj.value2, credit.credit_type)
  
  // Identify spot price per gram
  let spot = 1
  if (item.itemObj.value3 === 'Gold') {
    spot = parseFloat(credit.gold_cad) || 0
  } else if (item.itemObj.value3 === 'Platinum') {
    spot = parseFloat(credit.plat_cad) || 0
  }
  
  item.value = calculateGoldCreditValue(w, item.multiplier, item.markup, spot)
  item.unitPrice = calculateGoldCreditUnitPrice(item.value, w)
  
  recalculateTotal()
}



// Create/Update submission
async function saveOrUpdateCredit(print = false, close = false) {
  if (isCustomerDirty.value) {
    showToast('Please save or discard customer note/profile changes first.', 'warning')
    return
  }

  // Validate
  if (formRef.value) {
    const validateRes = await formRef.value.validate()
    if (!validateRes.valid) return
  }
  
  if (!credit.customer_id) {
    showToast('Please select a customer first.', 'warning')
    return
  }

  if ((parseFloat(credit.credit_value) || 0) === 0) {
    credit.credit_value = credit.total
  }
  
  loading.value = true
  try {
    let savedCredit
    if (credit.id) {
      // Update
      savedCredit = await api.put(`/goldcredits/${credit.id}`, {
        customer_id: credit.customer_id,
        note: credit.note,
        used: credit.used ? 1 : 0,
        credit_type: credit.credit_type,
        credit_value: credit.credit_value
      })
    } else {
      // Create
      const payload = {
        customer_id: credit.customer_id,
        employee_id: credit.employee_id,
        goldCAD: credit.gold_cad,
        platCAD: credit.plat_cad,
        metalPriceDate: credit.metalPriceDate,
        note: credit.note,
        used: credit.used ? 1 : 0,
        credit_type: credit.credit_type,
        credit_value: credit.credit_value,
        credit_items: itemList.value.map(item => ({
          item: item.itemId,
          markup: item.markup,
          multiplier: item.multiplier,
          value: item.value,
          weight: item.weight
        })),
        credit_images: credit.credit_images.map(img => ({
          image: img.image,
          note: img.note
        }))
      }
      savedCredit = await api.post('/goldcredits', payload)
    }
    
    if (savedCredit) {
      Object.assign(credit, savedCredit)
      emit('update:creditId', savedCredit.id)
      emit('saved', savedCredit)
      refreshRecentRecord('credit', savedCredit.id)
      
      if (print) {
        await executeHeadlessPrint()
      }
      
      if (close) {
        navigateBack()
      } else if (!credit.id) {
        loadCredit(savedCredit.id)
      }
    }
  } catch (err) {
    console.error('Failed to save credit payout:', err)
    showToast('Failed to save credit payout: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

// Print handling
async function printOnly() {
  if (isCustomerDirty.value) {
    showToast('Please save or discard customer note/profile changes first.', 'warning')
    return
  }
  if (!credit.id) {
    await saveOrUpdateCredit(true, false)
  } else {
    await executeHeadlessPrint()
  }
}

async function executeHeadlessPrint() {
  if (!settingsState.printers.credit) {
    showToast('Please configure the target Credit printer in Configuration settings first.', 'warning')
    return
  }
  
  const htmlContent = generateCreditPrintHTML({
    credit,
    customer: customerObj.value,
    itemList: itemList.value,
    activeEmployees: activeEmployees.value
  })
  
  try {
    const result = await window.electronAPI.printDocument({
      printerName: settingsState.printers.credit,
      htmlContent
    })
    
    if (!result || !result.success) {
      showToast('Printing failed: ' + (result?.error || 'Unknown printer queue error'), 'error')
    }
  } catch (err) {
    console.error('IPC printing error:', err)
    showToast('IPC connection failed: ' + err.message, 'error')
  }
}

function discardCredit() {
  navigateBack()
}

async function submitDeleteCredit() {
  if (!credit.id) return
  loading.value = true
  try {
    const creditIdToDelete = credit.id
    const res = await api.delete(`/goldcredits/${creditIdToDelete}`)
    if (res) {
      removeRecentRecord('credit', creditIdToDelete)
      isDeleteOpen.value = false
      navigateBack()
    }
  } catch (err) {
    console.error('Failed to delete credit payout:', err)
    showToast('Failed to delete credit payout: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.credit-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}
.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
.bg-surface-variant-light {
  background-color: rgba(var(--v-theme-surface-variant), 0.03);
}
.text-gradient-payout {
  background: linear-gradient(45deg, #2E7D32, #4CAF50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.italic {
  font-style: italic;
}
.final-credit-input {
  background: transparent;
  border: none;
  border-bottom: 2px dashed rgba(var(--v-theme-success), 0.5);
  color: inherit;
  width: 140px;
  text-align: center;
  outline: none;
  transition: border-bottom-color 0.2s ease;
}
.final-credit-input:focus {
  border-bottom: 2px solid rgb(var(--v-theme-success));
}
.final-credit-input:disabled {
  border-bottom: none;
  opacity: 0.8;
}
/* Hide number input spinners */
.final-credit-input::-webkit-outer-spin-button,
.final-credit-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.final-credit-input[type=number] {
  -moz-appearance: textfield;
}
.custom-date-field :deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  display: none;
  -webkit-appearance: none;
}
</style>
