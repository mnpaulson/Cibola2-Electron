<template>
  <v-card class="credit-card" elevation="3" :loading="loading">
    <!-- Header -->
    <v-card-item class="bg-primary text-white py-3">
      <v-card-title class="font-weight-bold text-subtitle-1 d-flex align-center">
        <v-icon start class="mr-2">mdi-currency-usd</v-icon>
        {{ credit.id ? `Edit Gold Credit #${credit.id}` : 'New Gold Credit Payout' }}
        <v-spacer></v-spacer>
        <span v-if="credit.created_at" class="text-caption font-weight-medium">
          Date: {{ formatDate(credit.created_at) }}
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
          :hide-notes="true"
          :clickable-name="true"
          @select="handleCustomerSelect"
          @click-name="navigateTo('customers', { selectedCustomerId: credit.customer_id })"
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
              v-model="credit.creditDate"
              label="Transaction Date"
              type="date"
              prepend-inner-icon="mdi-calendar"
              variant="outlined"
              density="compact"
              :disabled="disabled"
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
    <v-divider></v-divider>
    <v-card-actions class="pa-3 bg-light-surface d-flex flex-wrap justify-end gap-2">
      <v-btn
        color="grey-darken-2"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        size="small"
        @click="discardCredit"
      >
        Discard
      </v-btn>
      <v-btn
        v-if="credit.id"
        color="error"
        variant="outlined"
        prepend-icon="mdi-delete"
        size="small"
        @click="isDeleteOpen = true"
      >
        Delete
      </v-btn>
      <v-btn
        color="secondary"
        variant="elevated"
        prepend-icon="mdi-camera"
        size="small"
        :disabled="disabled"
        @click="attachedImagesRef?.openCamera()"
      >
        Capture
      </v-btn>
      <v-btn
        color="info"
        variant="elevated"
        prepend-icon="mdi-printer"
        size="small"
        :disabled="!credit.id"
        @click="printOnly"
      >
        Print
      </v-btn>
      <v-btn
        v-if="!credit.id"
        color="success"
        variant="flat"
        prepend-icon="mdi-content-save-all"
        size="small"
        :disabled="!isFormValid"
        @click="saveOrUpdateCredit(false, false)"
      >
        Save Credit
      </v-btn>
      <v-btn
        v-else
        color="success"
        variant="flat"
        prepend-icon="mdi-content-save"
        size="small"
        @click="saveOrUpdateCredit(false, false)"
      >
        Update Notes
      </v-btn>
      <v-btn
        v-if="!credit.id"
        color="primary"
        variant="flat"
        prepend-icon="mdi-check-all"
        size="small"
        :disabled="!isFormValid"
        @click="saveOrUpdateCredit(true, true)"
      >
        Print & Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { api } from '../utils/api'
import { settingsState } from '../store/settings'
import { metadataState, refreshMetadata } from '../store/metadata'
import { navigateBack, navigateTo } from '../store/session'
import { formatLocalDate } from '../utils/dates'
import { logoBase64 } from '../utils/logo'
import { showToast } from '../store/toast'
import { calculateGoldCreditValue, getAdjustedMarkup } from '../utils/pricing'
import AttachedImages from './AttachedImages.vue'
import CustomerForm from './CustomerForm.vue'
import DeleteConfirmationDialog from './DeleteConfirmationDialog.vue'
import MetalPricesCard from './MetalPricesCard.vue'

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

// Form models
const credit = reactive({
  id: null,
  customer_id: null,
  employee_id: 1, // Default 'Unassigned'
  gold_cad: 0,
  plat_cad: 0,
  metalPriceDate: '',
  creditDate: '',
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
          unitPrice: element.weight > 0 ? Math.round((element.value / element.weight) * 100) / 100 : 0,
          value: element.value
        }
      })
      
      recalculateTotal()
    }
  } catch (err) {
    console.error('Failed to load credit payout details:', err)
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
  item.unitPrice = w > 0 ? Math.round((item.value / w) * 100) / 100 : 0
  
  recalculateTotal()
}



// Create/Update submission
async function saveOrUpdateCredit(print = false, close = false) {
  // Validate
  if (formRef.value) {
    const validateRes = await formRef.value.validate()
    if (!validateRes.valid) return
  }
  
  if (!credit.customer_id) {
    showToast('Please select a customer first.', 'warning')
    return
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
  
  const htmlContent = generatePrintHTML()
  
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

// Generate the printable standard letter-size layout (portrait)
function generatePrintHTML() {
  const emp = activeEmployees.value.find(e => e.id === credit.employee_id)
  const employeeName = emp ? emp.name : 'Unassigned'
  const customerName = customerObj.value ? `${customerObj.value.fname} ${customerObj.value.lname}` : '—'
  const creditDate = credit.created_at ? formatLocalDate(credit.created_at, 'long') : formatLocalDate(new Date().toISOString(), 'long')
  const itemsTotal = `$${credit.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const finalPayout = `$${(credit.credit_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  
  // Format breakdown rows
  let itemsHTML = ''
  itemList.value.forEach(item => {
    const itemName = item.itemObj ? item.itemObj.name : 'Unknown Item'
    const unitText = item.itemObj?.value3 === 'Other' ? 'units' : 'g'
    itemsHTML += `
      <tr>
        <td>${itemName}</td>
        <td class="right">${item.weight} ${unitText}</td>
        <td class="right">${item.multiplier}</td>
        <td class="right">${item.markup}</td>
        <td class="right">$${item.unitPrice.toFixed(2)}/${unitText}</td>
        <td class="right font-weight-bold">$${item.value.toFixed(2)}</td>
      </tr>
    `
  })
  
  // Format attached images
  let imagesHTML = ''
  credit.credit_images.forEach(img => {
    // Resolve full URL
    let fullUrl = ''
    if (img.image) {
      if (img.image.startsWith('data:')) {
        fullUrl = img.image
      } else {
        const base = settingsState.serverURL.replace(/\/$/, '')
        const path = img.image.startsWith('/') ? img.image : `/${img.image}`
        fullUrl = `${base}${path}`
      }
    }
    
    imagesHTML += `
      <div class="image-card">
        <img src="${fullUrl}" />
        <p>${img.note || ''}</p>
      </div>
    `
  })
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      box-sizing: border-box;
    }
    body {
      width: 8.5in;
      height: 11in;
      margin: 0;
      padding: 0.5in;
      font-family: Arial, sans-serif;
      color: black;
      background: white;
    }
    @page {
      size: letter;
      margin: 0mm;
    }
    .print-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .logo {
      max-height: 1.2in;
      object-fit: contain;
    }
    .title {
      font-size: 1.8em;
      font-weight: bold;
      text-transform: uppercase;
      text-align: right;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .meta-table td {
      padding: 6px;
      font-size: 1.1em;
    }
    .meta-label {
      font-weight: bold;
      color: #555;
      width: 15%;
    }
    .meta-value {
      border-bottom: 1px solid #ccc;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th, .items-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .items-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .items-table td.right, .items-table th.right {
      text-align: right;
    }
    .total-row {
      font-weight: bold;
      font-size: 1.2em;
      background-color: #eee;
    }
    .warning-box {
      border: 2px solid red;
      color: red;
      font-weight: bold;
      text-align: center;
      padding: 10px;
      font-size: 1.2em;
      margin-bottom: 30px;
      text-transform: uppercase;
    }
    .notes-box {
      border: 1px solid #ccc;
      padding: 15px;
      min-height: 100px;
      margin-bottom: 30px;
      font-size: 1em;
      background-color: #fafafa;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 40px;
    }
    .image-card {
      border: 1px solid #ccc;
      padding: 4px;
      display: flex;
      flex-direction: column;
    }
    .image-card img {
      width: 100%;
      height: 1.2in;
      object-fit: cover;
    }
    .image-card p {
      font-size: 0.8em;
      margin: 4px 0 0 0;
      text-align: center;
      color: #666;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 20px;
    }
    .sig-line {
      width: 45%;
      border-top: 1.5px solid black;
      text-align: center;
      padding-top: 6px;
      font-weight: bold;
      font-size: 1em;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div>
      <table class="header-table">
        <tr>
          <td><img class="logo" src="${logoBase64}" alt="Logo"></td>
          <td class="title">Scrap Gold Credit Record</td>
        </tr>
      </table>

      <table class="meta-table">
        <tr>
          <td class="meta-label">Customer:</td>
          <td class="meta-value" colspan="3">${customerName}</td>
        </tr>
        <tr>
          <td class="meta-label">Date:</td>
          <td class="meta-value">${creditDate}</td>
          <td class="meta-label" style="padding-left:20px;">Employee:</td>
          <td class="meta-value">${employeeName}</td>
        </tr>
        <tr>
          <td class="meta-label">Type:</td>
          <td class="meta-value" style="text-transform: capitalize;">${credit.credit_type}</td>
          <td class="meta-label" style="padding-left:20px;">Cheque/Invoice:</td>
          <td class="meta-value"></td>
        </tr>
      </table>

      <div class="warning-box">
        ALL PURCHASES ARE FINAL - NO EXCEPTIONS
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item / Karat</th>
            <th class="right">Weight (g) / Qty</th>
            <th class="right">Multiplier</th>
            <th class="right">Markup</th>
            <th class="right">Unit Price</th>
            <th class="right">Total Value</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr class="total-row">
            <td colspan="5" class="right">Items Value Sum:</td>
            <td class="right">${itemsTotal}</td>
          </tr>
          <tr class="total-row" style="background-color: #e2f0d9;">
            <td colspan="5" class="right">Finalized Credit Amount:</td>
            <td class="right">${finalPayout}</td>
          </tr>
        </tbody>
      </table>

      ${credit.note ? `
      <div style="font-weight:bold; margin-bottom:5px;">Credit Notes:</div>
      <div class="notes-box">${credit.note}</div>
      ` : ''}

      ${imagesHTML ? `
      <div style="font-weight:bold; margin-bottom:5px;">Attached Photos:</div>
      <div class="images-grid">${imagesHTML}</div>
      ` : ''}
    </div>

    <div class="signatures">
      <div class="sig-line">Customer Signature</div>
      <div class="sig-line">Operator Signature</div>
    </div>
  </div>
</body>
</html>
  `
}

function discardCredit() {
  navigateBack()
}

async function submitDeleteCredit() {
  if (!credit.id) return
  loading.value = true
  try {
    const res = await api.delete(`/goldcredits/${credit.id}`)
    if (res) {
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
/* Hide number input spinners */
.final-credit-input::-webkit-outer-spin-button,
.final-credit-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.final-credit-input[type=number] {
  -moz-appearance: textfield;
}
</style>
