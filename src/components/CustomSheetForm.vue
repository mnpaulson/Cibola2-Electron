<template>
  <v-card class="sheet-card pb-20" elevation="3" :loading="loading">
    <!-- Header -->
    <v-card-item class="bg-primary text-white py-3">
      <v-card-title class="font-weight-bold text-subtitle-1 d-flex align-center">
        <v-icon start class="mr-2">mdi-clock-outline</v-icon>
        {{ sheet.id ? `Edit Custom Sheet #${sheet.id}` : 'New Custom Sheet' }}
        <v-spacer></v-spacer>
        <span v-if="sheet.created_at" class="text-caption font-weight-medium">
          Created: {{ formatDate(sheet.created_at) }}
        </span>
      </v-card-title>
    </v-card-item>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Inline Customer Lookup Field -->
      <div class="mb-4">
        <CustomerForm
          v-model="sheet.customer_id"
          :clearable="!disabled"
          :hide-notes="true"
          :clickable-name="true"
          @select="handleCustomerSelect"
          @click-name="navigateTo('customers', { selectedCustomerId: sheet.customer_id })"
        />
      </div>

      <v-form ref="formRef" v-model="isFormValid" lazy-validation>
        <!-- Sheet metadata and spot prices -->
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="sheet.name"
              label="Custom Sheet Name *"
              placeholder="e.g. Graham's Custom Engagement Ring"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-format-title"
              :rules="requiredRules"
            ></v-text-field>

            <v-textarea
              v-model="sheet.note"
              label="Custom Sheet Note"
              placeholder="Add general details or requirements for this custom design..."
              variant="outlined"
              rows="3"
              no-resize
              density="compact"
              prepend-inner-icon="mdi-note-text-outline"
            ></v-textarea>
          </v-col>

          <v-col cols="12" md="6">
            <!-- Spot Prices Info & Manual Update -->
            <MetalPricesCard
              small
              :disabled="disabled"
              v-model:gold="localGoldSpot"
              v-model:platinum="localPlatSpot"
              v-model:date="localSpotDate"
            />
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              class="mt-2 w-100"
              prepend-icon="mdi-cached"
              @click="updateAllMetalPricesToNewest"
            >
              Update Estimates to Newest Spot Prices
            </v-btn>
          </v-col>
        </v-row>

        <!-- Estimates Carousel/List Selection -->
        <div class="mt-4 mb-2 d-flex align-center justify-space-between">
          <div class="text-subtitle-1 font-weight-bold d-flex align-center">
            <v-icon start color="primary" class="mr-1">mdi-file-document-multiple-outline</v-icon>
            Estimates Configured
          </div>
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-plus"
              size="small"
              @click="addEmptyEstimate"
            >
              Add Estimate
            </v-btn>
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-content-copy"
              size="small"
              :disabled="sheet.estimates.length === 0"
              @click="copyActiveEstimate"
            >
              Copy Active
            </v-btn>
          </div>
        </div>

        <v-row class="flex-nowrap overflow-x-auto pb-4 px-1 gap-4 select-estimate-row">
          <v-col
            v-for="(est, idx) in sheet.estimates"
            :key="est.id || idx"
            cols="auto"
            class="pa-0"
          >
            <v-card
              elevation="1"
              :class="[
                'estimate-tab-card rounded-lg pa-3 pb-2 d-flex flex-column justify-space-between',
                { 'active-estimate-card': idx === activeEstIndex }
              ]"
              @click="activeEstIndex = idx"
            >
              <div>
                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="text-subtitle-2 font-weight-bold text-truncate pr-2" style="max-width: 140px;">
                    {{ est.name || `Estimate ${idx + 1}` }}
                  </div>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    color="grey-darken-1"
                    size="x-small"
                    class="close-est-btn"
                    @click.stop="confirmDeleteEstimate(est)"
                  ></v-btn>
                </div>
                <div class="text-caption text-medium-emphasis text-truncate mb-2" style="max-width: 170px;">
                  {{ est.note || 'No notes' }}
                </div>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex align-center justify-space-between mt-auto">
                <div class="text-subtitle-2 font-weight-bold text-success">
                  ${{ (calculateEstimateTotal(est) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
                <v-checkbox
                  v-model="est.isPrimary"
                  label="Primary"
                  hide-details
                  density="compact"
                  color="success"
                  class="primary-checkbox-est"
                  @update:model-value="setPrimaryEstimate(idx)"
                  @click.stop
                ></v-checkbox>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Current Active Estimate Detail Form -->
        <v-expand-transition>
          <div v-if="activeEstimate" class="active-estimate-section mt-4 pa-4 rounded-lg bg-surface border">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="activeEstimate.name"
                  label="Estimate Option Name *"
                  placeholder="e.g. Option A: 14k White Gold"
                  variant="outlined"
                  density="compact"
                  :rules="requiredRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="activeEstimate.note"
                  label="Estimate Option Note"
                  placeholder="Specific details about this option (metal purity, stones added)..."
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <!-- Header row (visible on sm and up) -->
            <v-row v-if="activeEstimate.estValues.length > 0" class="d-none d-sm-flex text-caption font-weight-bold text-medium-emphasis border-b pb-1 mb-2 px-1">
              <v-col cols="3">Item / Description</v-col>
              <v-col cols="1">Amt/Weight</v-col>
              <v-col cols="2">Price Per</v-col>
              <v-col cols="2">Modifier</v-col>
              <v-col cols="1">Markup</v-col>
              <v-col cols="2" class="text-right pr-4">Total</v-col>
              <v-col cols="1" class="text-right"></v-col>
            </v-row>

            <!-- Line Items categories -->
            <div v-for="category in categories" :key="category" class="mb-6">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="text-subtitle-2 font-weight-bold text-primary d-flex align-center">
                  <v-icon size="18" class="mr-1">mdi-chevron-right</v-icon>
                  {{ category }}
                </div>
                <v-btn
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-plus"
                  size="small"
                  class="text-none"
                  @click="addEmptyItem(activeEstimate, category)"
                >
                  Add {{ category }}
                </v-btn>
              </div>

              <!-- List of items under category -->
              <div
                v-for="val in getItemsForCategory(activeEstimate, category)"
                :key="val.id"
                class="mb-3 line-item-container"
              >
                <v-row align="center" class="line-item-row my-1">
                  <!-- Combobox -->
                  <v-col cols="12" sm="3" md="3" class="py-1">
                    <v-combobox
                      v-model="val.selectedOption"
                      :items="getOptionsForCategory(category)"
                      item-title="name"
                      placeholder="Select item type or type custom"
                      variant="underlined"
                      density="compact"
                      hide-details
                      @update:model-value="onItemTypeChange(val)"
                    ></v-combobox>
                  </v-col>

                  <!-- Amt/Weight -->
                  <v-col cols="3" sm="1" md="1" class="py-1">
                    <v-text-field
                      v-model="val.amt"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      variant="underlined"
                      density="compact"
                      hide-details
                      @input="recalculateItem(val)"
                    ></v-text-field>
                  </v-col>

                  <!-- Price Per (basePrice) -->
                  <v-col cols="3" sm="2" md="2" class="py-1">
                    <v-text-field
                      v-model="val.basePrice"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      variant="underlined"
                      density="compact"
                      hide-details
                      prefix="$"
                      @input="onBasePriceManualChange(val)"
                    ></v-text-field>
                  </v-col>

                  <!-- Modifier (priceModifier) -->
                  <v-col cols="3" sm="2" md="2" class="py-1">
                    <v-text-field
                      v-model="val.priceModifier"
                      placeholder="1.00"
                      type="number"
                      step="0.01"
                      variant="underlined"
                      density="compact"
                      hide-details
                      @input="onModifierChange(val)"
                    ></v-text-field>
                  </v-col>

                  <!-- Markup (markup) -->
                  <v-col cols="3" sm="1" md="1" class="py-1">
                    <v-text-field
                      v-model="val.markup"
                      placeholder="1.00"
                      type="number"
                      step="0.01"
                      variant="underlined"
                      density="compact"
                      hide-details
                      @input="onModifierChange(val)"
                    ></v-text-field>
                  </v-col>

                  <!-- Total display -->
                  <v-col cols="12" sm="2" md="2" class="py-1 d-flex flex-sm-column align-center align-sm-end justify-space-between pr-4">
                    <span class="text-caption text-medium-emphasis d-sm-none">Total</span>
                    <span class="text-subtitle-2 font-weight-bold text-success">
                      ${{ (calculateItemTotal(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </span>
                  </v-col>

                  <!-- Delete Action -->
                  <v-col cols="12" sm="1" md="1" class="py-1 d-flex justify-end">
                    <v-btn
                      icon="mdi-trash-can-outline"
                      color="error"
                      variant="text"
                      density="comfortable"
                      @click="deleteItem(activeEstimate, val.id)"
                    ></v-btn>
                  </v-col>
                </v-row>
              </div>
            </div>

            <!-- Extras buttons -->
            <div v-if="extras.length > 0" class="mb-4">
              <div class="text-subtitle-2 font-weight-bold text-primary mb-3">
                Quick Extras
              </div>
              <div class="d-flex flex-wrap gap-2">
                <v-btn
                  v-for="extra in extras"
                  :key="extra.id"
                  variant="outlined"
                  color="secondary"
                  size="small"
                  class="text-none"
                  prepend-icon="mdi-plus"
                  @click="addExtraItem(activeEstimate, extra)"
                >
                  {{ extra.name }}
                </v-btn>
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- Grand Estimate Payout display -->
            <div class="d-flex align-center justify-end font-weight-bold text-h6">
              Total Estimate Value:
              <span class="text-success text-h5 ml-2 font-weight-bold">
                ${{ (calculateEstimateTotal(activeEstimate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
        </v-expand-transition>

      <!-- Attached Design Images Gallery -->
      <AttachedImages
        ref="attachedImagesRef"
        v-model="sheet.custom_images"
        delete-endpoint="/customsheets/images"
        title="Attached Design Photos"
      />
    </v-form>
    </v-card-text>

    <!-- Delete Sheet Modal -->
    <DeleteConfirmationDialog
      v-model="isDeleteSheetOpen"
      title="Delete Custom Sheet"
      warning-message="Are you sure you want to permanently delete this Custom Sheet and all its configured estimates? This action is permanent."
      :loading="loading"
      @confirm="submitDeleteSheet"
    />

    <!-- Delete Estimate Modal -->
    <v-dialog v-model="isDeleteEstimateOpen" max-width="450px">
      <v-card class="rounded-lg">
        <v-toolbar color="error" dark flat>
          <v-toolbar-title class="font-weight-bold">Delete Estimate Option</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-4">
          Are you sure you want to delete estimate <strong>{{ estimateToDelete?.name || 'this option' }}</strong>?
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn variant="text" color="medium-emphasis" @click="isDeleteEstimateOpen = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="flat" @click="submitDeleteEstimate">Delete Option</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Actions Footer Navigation -->
    <FormBottomNavigation
      :show-delete="!!sheet.id"
      :show-preview="true"
      :save-label="sheet.id ? 'Update Sheet' : 'Save Sheet'"
      :disable-save="!isFormValid"
      :show-print-close="false"
      :disable-print="!sheet.id"
      @discard="discardSheet"
      @delete="isDeleteSheetOpen = true"
      @capture="attachedImagesRef?.openCamera()"
      @print="printOnly"
      @preview="downloadPrintPreview"
      @save="saveOrUpdateSheet(false, false)"
    />
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { api } from '../utils/api'
import { settingsState } from '../store/settings'
import { metadataState } from '../store/metadata'
import { navigateBack, navigateTo } from '../store/session'
import { formatLocalDate } from '../utils/dates'
import { logoBase64 } from '../utils/logo'
import { showToast } from '../store/toast'
import { calculateCustomSheetPricePer, calculateCustomSheetItemTotal } from '../utils/pricing'
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
  sheetId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['customerId', 'update:sheetId', 'update:customerId', 'saved'])

// Form verification
const formRef = ref(null)
const loading = ref(false)
const isFormValid = ref(true)
const attachedImagesRef = ref(null)

// Modals
const isDeleteSheetOpen = ref(false)
const isDeleteEstimateOpen = ref(false)
const estimateToDelete = ref(null)

// Selection tracking
const activeEstIndex = ref(0)
const customerObj = ref(null)

// Spot prices (local reactive states matching Rule 17 sync protocols)
const localGoldSpot = ref(0)
const localPlatSpot = ref(0)
const localSilverSpot = ref(0)
const localSpotDate = ref('')

// ID Counters for client-side items
let estIdCounter = 1
let estValIdCounter = 1

// Form Models
const sheet = reactive({
  id: null,
  customer_id: null,
  name: '',
  note: '',
  created_at: '',
  estimates: [],
  estimatesToDelete: [],
  custom_images: []
})

// Rules
const requiredRules = [v => !!v || 'Required']

// Active Computed objects
const activeEstimate = computed(() => {
  if (sheet.estimates.length > 0 && activeEstIndex.value >= 0 && activeEstIndex.value < sheet.estimates.length) {
    return sheet.estimates[activeEstIndex.value]
  }
  return null
})

const disabled = computed(() => {
  return sheet.id !== null && sheet.id !== undefined && sheet.id !== 0
})

// Dynamic categories and option filters from cache
const categories = computed(() => {
  let cats = []
  if (Array.isArray(metadataState.customSheetCategories)) {
    const sortedCats = [...metadataState.customSheetCategories]
      .filter(c => c.active === 1)
      .sort((a, b) => {
        const orderA = a.order !== null && a.order !== undefined && a.order !== '' ? parseInt(a.order) : 999
        const orderB = b.order !== null && b.order !== undefined && b.order !== '' ? parseInt(b.order) : 999
        return orderA - orderB
      })
    cats = sortedCats.map(c => c.name)
  }

  // Merge with categories present in customSheets options
  const catsSet = new Set(cats)
  if (Array.isArray(metadataState.customSheets)) {
    metadataState.customSheets.forEach(item => {
      if (item.value1 && item.value1 !== 'Extra' && !catsSet.has(item.value1)) {
        catsSet.add(item.value1)
        cats.push(item.value1)
      }
    })
  }

  // Merge with categories present in loaded estimate values (to prevent missing loaded categories)
  if (Array.isArray(sheet.estimates)) {
    sheet.estimates.forEach(est => {
      if (Array.isArray(est.estValues)) {
        est.estValues.forEach(val => {
          if (val.type && val.type !== 'Extra' && !catsSet.has(val.type)) {
            catsSet.add(val.type)
            cats.push(val.type)
          }
        })
      }
    })
  }

  return cats.filter(c => c !== 'Extra')
})

const extras = computed(() => {
  if (!Array.isArray(metadataState.customSheets)) return []
  return metadataState.customSheets.filter(item => item.value1 === 'Extra')
})

function getOptionsForCategory(category) {
  if (!Array.isArray(metadataState.customSheets)) return []
  return metadataState.customSheets.filter(item => item.value1 === category)
}

function getItemsForCategory(est, category) {
  if (!est || !est.estValues) return []
  return est.estValues.filter(val => val.type === category)
}

// Calculate formulas
function calculatePricePer(val) {
  return calculateCustomSheetPricePer(val.basePrice, val.priceModifier, val.markup)
}

function calculateItemTotal(val) {
  return calculateCustomSheetItemTotal(val.amt, val.basePrice, val.priceModifier, val.markup)
}

function calculateEstimateTotal(est) {
  if (!est || !est.estValues) return 0
  const total = est.estValues.reduce((sum, val) => sum + calculateItemTotal(val), 0)
  return Math.round(total * 100) / 100
}

// Pricing formula evaluator
function recalculateItem(val) {
  if (val.isManualOverride) return // skip calculation if price was manually customized
  
  const spot = val.priceType === 'Gold' 
    ? parseFloat(localGoldSpot.value) || 0 
    : (val.priceType === 'Platinum' || val.priceType === 'Plat' 
      ? parseFloat(localPlatSpot.value) || 0 
      : (val.priceType === 'Silver' ? parseFloat(localSilverSpot.value) || 0 : 0))

  if (val.priceType === 'Gold' || val.priceType === 'Platinum' || val.priceType === 'Plat' || val.priceType === 'Silver') {
    val.basePrice = String(spot)
    val.priceModifier = val.optionBasePrice || 0
  } else {
    val.basePrice = String(val.optionBasePrice || 0)
    val.priceModifier = 1
  }
}

function onBasePriceManualChange(val) {
  val.isManualOverride = true
}

function onModifierChange(val) {
  val.isManualOverride = true
}

// Dropdown change trigger
function onItemTypeChange(val) {
  if (val.selectedOption && typeof val.selectedOption === 'object') {
    val.name = val.selectedOption.name
    val.priceType = val.selectedOption.value3 || ''
    val.formula = val.selectedOption.value4 || ''
    val.optionBasePrice = parseFloat(val.selectedOption.value2) || 0
    const optionMarkup = parseFloat(val.selectedOption.markup)
    val.markup = isNaN(optionMarkup) || optionMarkup <= 0 ? 1 : optionMarkup
    val.priceModifier = 1
    val.isManualOverride = false
    recalculateItem(val)
  } else if (typeof val.selectedOption === 'string') {
    val.name = val.selectedOption
    val.formula = 'BaseOnly'
    val.priceType = ''
    val.optionBasePrice = parseFloat(val.basePrice) || 0
    val.markup = 1
    val.priceModifier = 1
    val.isManualOverride = true
  }
}

// Model edits
function addEmptyEstimate() {
  const newEst = {
    id: `clientId-${estIdCounter++}`,
    name: `Estimate Option ${sheet.estimates.length + 1}`,
    note: '',
    isPrimary: sheet.estimates.length === 0,
    estValues: [],
    estValuesToDelete: []
  }
  sheet.estimates.push(newEst)
  activeEstIndex.value = sheet.estimates.length - 1
}

function copyActiveEstimate() {
  if (!activeEstimate.value) return

  const original = activeEstimate.value
  const copied = {
    id: `clientId-${estIdCounter++}`,
    name: `${original.name} (Copy)`,
    note: original.note,
    isPrimary: false,
    estValues: original.estValues.map(v => ({
      id: `clientId-${estValIdCounter++}`,
      type: v.type,
      name: v.name,
      amt: v.amt,
      basePrice: v.basePrice,
      markup: parseFloat(v.markup) || 1,
      priceModifier: v.priceModifier,
      priceType: v.priceType,
      selectedOption: v.selectedOption,
      formula: v.formula,
      optionBasePrice: v.optionBasePrice,
      isManualOverride: v.isManualOverride,
    })),
    estValuesToDelete: []
  }
  sheet.estimates.push(copied)
  activeEstIndex.value = sheet.estimates.length - 1
}

function setPrimaryEstimate(selectedIndex) {
  sheet.estimates.forEach((est, idx) => {
    est.isPrimary = idx === selectedIndex
  })
}

function addEmptyItem(est, category) {
  est.estValues.push({
    id: `clientId-${estValIdCounter++}`,
    type: category,
    name: '',
    amt: '1',
    basePrice: '0.00',
    markup: 1,
    priceModifier: 1,
    priceType: '',
    selectedOption: null,
    formula: 'BaseOnly',
    optionBasePrice: 0,
    isManualOverride: false,
  })
}

function addExtraItem(est, extraOption) {
  const markupVal = parseFloat(extraOption.markup)
  const newItem = {
    id: `clientId-${estValIdCounter++}`,
    type: 'Extra',
    name: extraOption.name,
    amt: '1',
    basePrice: String(parseFloat(extraOption.value2) || 0),
    markup: isNaN(markupVal) || markupVal <= 0 ? 1 : markupVal,
    priceModifier: 1,
    priceType: extraOption.value3 || '',
    selectedOption: extraOption,
    formula: extraOption.value4 || 'BaseOnly',
    optionBasePrice: parseFloat(extraOption.value2) || 0,
    isManualOverride: false,
    showModifiers: false
  }
  recalculateItem(newItem)
  est.estValues.push(newItem)
}

function deleteItem(est, valId) {
  const idx = est.estValues.findIndex(v => v.id === valId)
  if (idx !== -1) {
    const valObj = est.estValues[idx]
    if (typeof valObj.id === 'number') {
      est.estValuesToDelete.push(valObj.id)
    }
    est.estValues.splice(idx, 1)
  }
}

function confirmDeleteEstimate(est) {
  estimateToDelete.value = est
  isDeleteEstimateOpen.value = true
}

function submitDeleteEstimate() {
  if (!estimateToDelete.value) return
  
  const est = estimateToDelete.value
  const idx = sheet.estimates.indexOf(est)
  if (idx !== -1) {
    if (typeof est.id === 'number') {
      sheet.estimatesToDelete.push(est.id)
    }
    sheet.estimates.splice(idx, 1)
    
    // readjust active index
    if (activeEstIndex.value >= sheet.estimates.length) {
      activeEstIndex.value = Math.max(0, sheet.estimates.length - 1)
    }
    if (sheet.estimates.length === 0) {
      addEmptyEstimate()
    }
  }
  isDeleteEstimateOpen.value = false
  estimateToDelete.value = null
}

// Reset fields
function resetSheetFields() {
  sheet.id = null
  sheet.customer_id = props.customerId
  sheet.name = ''
  sheet.note = ''
  sheet.created_at = ''
  sheet.estimates = []
  sheet.estimatesToDelete = []
  sheet.custom_images = []
  localGoldSpot.value = 0
  localPlatSpot.value = 0
  localSilverSpot.value = 0
  localSpotDate.value = ''
  activeEstIndex.value = 0
}

// Load default spot prices
function loadDefaultSpotPrices() {
  if (Array.isArray(metadataState.metalPrices)) {
    const goldVal = metadataState.metalPrices.find(v => v.name === 'GoldCAD' || v.name === 'Gold')
    const platVal = metadataState.metalPrices.find(v => v.name === 'PlatCAD' || v.name === 'Platinum')
    const silverVal = metadataState.metalPrices.find(v => v.name === 'SilverCAD' || v.name === 'Silver')
    
    localGoldSpot.value = goldVal ? parseFloat(goldVal.value1) || 0 : 0
    localPlatSpot.value = platVal ? parseFloat(platVal.value1) || 0 : 0
    localSilverSpot.value = silverVal ? parseFloat(silverVal.value1) || 0 : 0
    localSpotDate.value = goldVal?.updated_at || platVal?.updated_at || silverVal?.updated_at || ''
  }
}

// Load existing sheet details
async function loadSheet(id) {
  loading.value = true
  try {
    loadDefaultSpotPrices() // load global defaults first as fallbacks
    const data = await api.get(`/customsheets/${id}`)
    if (data) {
      sheet.id = data.id
      sheet.customer_id = data.customer_id
      sheet.name = data.name || ''
      sheet.note = data.note || ''
      sheet.created_at = data.created_at || ''
      sheet.estimatesToDelete = []
      sheet.custom_images = data.custom_images || []
      localSpotDate.value = data.updated_at || data.created_at || ''
      
      sheet.estimates = (data.estimates || []).map(est => {
        return {
          id: est.id,
          name: est.name,
          note: est.note || '',
          isPrimary: !!est.isPrimary,
          estValuesToDelete: [],
          estValues: (est.estValues || []).map(val => {
            const opt = metadataState.customSheets?.find(o => o.name === val.name && o.value1 === val.type)
            const loadedMarkup = parseFloat(val.markup)
            return {
              id: val.id,
              type: val.type,
              name: val.name,
              amt: String(val.amt),
              basePrice: String(val.basePrice || 0),
              markup: isNaN(loadedMarkup) || loadedMarkup <= 0 ? 1 : loadedMarkup,
              priceModifier: parseFloat(val.priceModifier) || 0,
              priceType: val.priceType || '',
              selectedOption: opt || val.name,
              formula: opt ? opt.value4 : 'BaseOnly',
              optionBasePrice: opt ? parseFloat(opt.value2) || 0 : 0,
              isManualOverride: !opt,
              showModifiers: false
            }
          })
        }
      })
      
      if (sheet.estimates.length > 0) {
        const primary = sheet.estimates.find(e => e.isPrimary)
        activeEstIndex.value = primary ? sheet.estimates.indexOf(primary) : 0
      } else {
        addEmptyEstimate()
      }

      // Extract spot prices from loaded items if present
      let foundGold = false
      let foundPlat = false
      let foundSilver = false
      for (const est of sheet.estimates) {
        for (const val of est.estValues) {
          if (!foundGold && val.priceType === 'Gold' && val.basePrice) {
            const goldVal = parseFloat(val.basePrice)
            if (!isNaN(goldVal) && goldVal > 0) {
              localGoldSpot.value = goldVal
              foundGold = true
            }
          }
          if (!foundPlat && (val.priceType === 'Platinum' || val.priceType === 'Plat') && val.basePrice) {
            const platVal = parseFloat(val.basePrice)
            if (!isNaN(platVal) && platVal > 0) {
              localPlatSpot.value = platVal
              foundPlat = true
            }
          }
          if (!foundSilver && val.priceType === 'Silver' && val.basePrice) {
            const silverVal = parseFloat(val.basePrice)
            if (!isNaN(silverVal) && silverVal > 0) {
              localSilverSpot.value = silverVal
              foundSilver = true
            }
          }
        }
        if (foundGold && foundPlat && foundSilver) break
      }
    }
  } catch (err) {
    console.error('Failed to load custom sheet:', err)
    showToast('Failed to load custom sheet: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

// Watch customerId prop updates
watch(() => props.customerId, async (newId) => {
  if (newId && newId !== sheet.customer_id) {
    sheet.customer_id = newId
    try {
      customerObj.value = await api.get(`/customers/${newId}`)
      emit('customerId', newId)
    } catch (err) {
      console.error('Failed to load customer details:', err)
    }
  } else if (!newId && props.sheetId === null) {
    customerObj.value = null
    sheet.customer_id = null
  }
}, { immediate: true })

const handleCustomerSelect = (custObj) => {
  customerObj.value = custObj
  if (custObj) {
    sheet.customer_id = custObj.id
    emit('customerId', custObj.id)
    emit('update:customerId', custObj.id)
  } else {
    sheet.customer_id = null
    emit('customerId', null)
    emit('update:customerId', null)
  }
}

// Watch sheetId to load existing custom sheet details
watch(() => props.sheetId, (newId) => {
  resetSheetFields()
  if (newId && newId !== 0) {
    loadSheet(newId)
  } else {
    loadDefaultSpotPrices()
    addEmptyEstimate()
  }
}, { immediate: true })

// Watch metadataState.metalPrices to update new sheets reactively when global prices sync
watch(
  () => metadataState.metalPrices,
  (newVal, oldVal) => {
    if (!sheet.id) {
      const getVal = (prices, name) => {
        if (!Array.isArray(prices)) return 0
        const record = prices.find(p => p.name === name || p.name === name.replace('CAD', ''))
        return record ? parseFloat(record.value1) || 0 : 0
      }
      
      const oldGold = oldVal ? getVal(oldVal, 'GoldCAD') : 0
      const oldPlat = oldVal ? getVal(oldVal, 'PlatCAD') : 0
      const oldSilver = oldVal ? getVal(oldVal, 'SilverCAD') : 0
      
      if (
        (localGoldSpot.value === 0 || localGoldSpot.value === oldGold) &&
        (localPlatSpot.value === 0 || localPlatSpot.value === oldPlat) &&
        (localSilverSpot.value === 0 || localSilverSpot.value === oldSilver)
      ) {
        loadDefaultSpotPrices()
      }
    }
  },
  { deep: true }
)

// Watch local spot prices to recalculate all items instantly when prices change (due to sync or manual edit)
watch(
  () => [localGoldSpot.value, localPlatSpot.value, localSilverSpot.value],
  () => {
    if (!disabled.value) {
      sheet.estimates.forEach(est => {
        est.estValues.forEach(val => {
          if (val.priceType === 'Gold' || val.priceType === 'Platinum' || val.priceType === 'Plat' || val.priceType === 'Silver') {
            recalculateItem(val)
          }
        })
      })
    }
  }
)

// Recalculate formula-based prices when spot prices are manually updated to newest
function updateAllMetalPricesToNewest() {
  loadDefaultSpotPrices()
  sheet.estimates.forEach(est => {
    est.estValues.forEach(val => {
      if (val.priceType === 'Gold' || val.priceType === 'Platinum' || val.priceType === 'Plat' || val.priceType === 'Silver') {
        val.isManualOverride = false
        recalculateItem(val)
      }
    })
  })
  showToast('Estimates updated to newest spot prices', 'success')
}

// Format data helpers before save
function preparePayload() {
  return {
    customer_id: sheet.customer_id,
    name: sheet.name,
    note: sheet.note,
    estimatesToDelete: sheet.estimatesToDelete,
    estimates: sheet.estimates.map(est => ({
      id: typeof est.id === 'string' && est.id.startsWith('clientId-') ? null : est.id,
      name: est.name,
      note: est.note,
      isPrimary: est.isPrimary ? 1 : 0,
      estValuesToDelete: est.estValuesToDelete,
      estValues: est.estValues.map(val => ({
        id: typeof val.id === 'string' && val.id.startsWith('clientId-') ? null : val.id,
        name: val.name || 'unknown',
        type: val.type,
        priceType: val.priceType || null,
        amt: parseFloat(val.amt) || 0,
        basePrice: parseFloat(val.basePrice) || 0,
        markup: parseFloat(val.markup) || 0,
        discount: 0,
        priceModifier: parseFloat(val.priceModifier) || 0
      }))
    })),
    custom_images: sheet.custom_images.map(img => ({
      id: img.id,
      image: img.image,
      note: img.note
    }))
  }
}

// Save or Update submission
async function saveOrUpdateSheet(print = false, close = false) {
  if (formRef.value) {
    const validateRes = await formRef.value.validate()
    if (!validateRes.valid) return
  }

  if (!sheet.customer_id) {
    showToast('Please select a customer first.', 'warning')
    return
  }

  loading.value = true
  try {
    const payload = preparePayload()
    let savedSheet
    
    if (sheet.id) {
      // Update
      savedSheet = await api.put(`/customsheets/${sheet.id}`, payload)
    } else {
      // Create
      savedSheet = await api.post('/customsheets', payload)
    }

    if (savedSheet) {
      showToast(sheet.id ? 'Custom Sheet updated successfully' : 'Custom Sheet saved successfully', 'success')
      emit('update:sheetId', savedSheet.id)
      emit('saved', savedSheet)
      
      if (print) {
        await executeHeadlessPrint()
      }
      
      if (close) {
        navigateBack()
      } else {
        loadSheet(savedSheet.id)
      }
    }
  } catch (err) {
    console.error('Failed to save Custom Sheet:', err)
    showToast('Failed to save Custom Sheet: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

// Headless printing engine
async function printOnly() {
  if (!sheet.id) {
    await saveOrUpdateSheet(true, false)
  } else {
    await executeHeadlessPrint()
  }
}

async function executeHeadlessPrint() {
  if (!settingsState.printers.custom) {
    showToast('Please configure the target Custom Sheet Printer in Configuration settings first.', 'warning')
    return
  }

  const htmlContent = generatePrintHTML()

  try {
    const result = await window.electronAPI.printDocument({
      printerName: settingsState.printers.custom,
      htmlContent
    })
    
    if (!result || !result.success) {
      showToast('Printing failed: ' + (result?.error || 'Unknown printer queue error'), 'error')
    } else {
      showToast('Custom sheet estimate printed successfully', 'success')
    }
  } catch (err) {
    console.error('IPC printing error:', err)
    showToast('IPC connection failed: ' + err.message, 'error')
  }
}

function downloadPrintPreview() {
  const htmlContent = generatePrintHTML()
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `custom-sheet-${sheet.id || 'new'}-print-preview.html`
  a.click()
  URL.revokeObjectURL(url)
}

function discardSheet() {
  navigateBack()
}

async function submitDeleteSheet() {
  if (!sheet.id) return
  loading.value = true
  try {
    const res = await api.delete(`/customsheets/${sheet.id}`)
    if (res) {
      isDeleteSheetOpen.value = false
      showToast(`Custom Sheet #${sheet.id} deleted successfully`, 'warning')
      navigateBack()
    }
  } catch (err) {
    console.error('Failed to delete Custom Sheet:', err)
    showToast('Failed to delete Custom Sheet: ' + err.message, 'error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => formatLocalDate(dateStr, 'long')

// Generate HTML representation for Custom Sheet Estimates
function generatePrintHTML() {
  const customerName = customerObj.value ? `${customerObj.value.fname} ${customerObj.value.lname}` : '—'
  const customerPhone = customerObj.value?.phone || ''
  const customerEmail = customerObj.value?.email || ''
  const sheetDate = sheet.created_at ? formatLocalDate(sheet.created_at, 'long') : formatLocalDate(new Date().toISOString(), 'long')

  // Generate Estimate Columns
  let estimatesHTML = ''
  sheet.estimates.forEach(est => {
    let itemsHTML = ''
    est.estValues.forEach(val => {
      const amtVal = parseFloat(val.amt) || 0
      const priceVal = calculatePricePer(val)
      const totalVal = amtVal * priceVal
      
      itemsHTML += `
        <tr>
          <td class="item-name">${val.name || 'Unknown'}</td>
          <td class="item-type">${val.type || ''}</td>
          <td class="right">${amtVal.toFixed(2)}</td>
          <td class="right">$${priceVal.toFixed(2)}</td>
          <td class="right font-weight-bold">$${totalVal.toFixed(2)}</td>
        </tr>
      `
    })

    const estTotal = calculateEstimateTotal(est)
    const primaryBadge = est.isPrimary ? '<span class="primary-badge">PRIMARY OPTION</span>' : ''

    estimatesHTML += `
      <div class="estimate-section">
        <div class="estimate-header">
          <h3>${est.name} ${primaryBadge}</h3>
          <p class="estimate-note">${est.note || ''}</p>
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 35%;">Item / Description</th>
              <th style="width: 20%;">Category</th>
              <th style="width: 15%;" class="right">Amt / Weight(g)</th>
              <th style="width: 15%;" class="right">Price Per</th>
              <th style="width: 15%;" class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML || '<tr><td colspan="5" class="center italic">No items configured</td></tr>'}
          </tbody>
        </table>
        <div class="estimate-footer">
          Total Estimate Payout Value: <span class="total-amount">$${estTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    `
  })

  // Format attached images
  let imagesHTML = ''
  if (Array.isArray(sheet.custom_images)) {
    sheet.custom_images.forEach(img => {
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
  }

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
      font-family: Arial, sans-serif;
      padding: 0.4in;
      margin: 0;
      background: white;
      color: black;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    .store-logo {
      height: 60px;
    }
    .store-info {
      text-align: right;
      font-size: 11px;
      line-height: 1.4;
    }
    .sheet-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin: 15px 0 5px 0;
    }
    .metadata-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
    }
    .metadata-table td {
      padding: 10px;
      font-size: 13px;
      border: 1px solid #ddd;
    }
    .estimate-section {
      margin-bottom: 30px;
      border: 1px solid #ccc;
      border-radius: 6px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .estimate-header {
      background-color: #f1f1f1;
      padding: 12px 15px;
      border-bottom: 1px solid #ccc;
    }
    .estimate-header h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .primary-badge {
      background-color: #4caf50;
      color: white;
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 10px;
      font-weight: bold;
    }
    .estimate-note {
      margin: 0;
      font-size: 12px;
      color: #666;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th {
      background-color: #fafafa;
      text-align: left;
      font-size: 12px;
      font-weight: bold;
      padding: 8px 15px;
      border-bottom: 1px solid #eee;
    }
    .items-table td {
      padding: 8px 15px;
      font-size: 12px;
      border-bottom: 1px solid #eee;
    }
    .right {
      text-align: right;
    }
    .center {
      text-align: center;
    }
    .italic {
      font-style: italic;
    }
    .estimate-footer {
      background-color: #fafafa;
      padding: 12px 15px;
      text-align: right;
      font-size: 14px;
      font-weight: bold;
      border-top: 1px solid #eee;
    }
    .total-amount {
      color: #2e7d32;
      font-size: 18px;
      margin-left: 5px;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 30px;
      margin-bottom: 30px;
      page-break-inside: avoid;
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
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 10px;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
    .signature-container {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 45%;
      border-top: 1px solid #999;
      text-align: center;
      padding-top: 5px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td>
        <img src="${logoBase64}" class="store-logo" />
      </td>
      <td class="store-info">
        <strong>Cibola II Admin Terminal</strong><br/>
        Jewelry Custom Design & Estimates<br/>
        Phone: (123) 456-7890 | Email: support@cibola.com
      </td>
    </tr>
  </table>

  <div class="sheet-title">Custom Design Sheet Estimate</div>
  
  <table class="metadata-table">
    <tr>
      <td style="width: 15%;"><strong>Sheet ID:</strong></td>
      <td style="width: 35%;">#${sheet.id || 'Draft'}</td>
      <td style="width: 15%;"><strong>Date:</strong></td>
      <td style="width: 35%;">${sheetDate}</td>
    </tr>
    <tr>
      <td><strong>Customer:</strong></td>
      <td>${customerName}</td>
      <td><strong>Contact:</strong></td>
      <td>${customerPhone} ${customerPhone && customerEmail ? '|' : ''} ${customerEmail}</td>
    </tr>
    <tr>
      <td><strong>Description:</strong></td>
      <td colspan="3">${sheet.name} ${sheet.note ? `<br/><small>${sheet.note}</small>` : ''}</td>
    </tr>
  </table>

  ${estimatesHTML}

  ${imagesHTML ? `
  <div style="font-weight:bold; margin-top:20px; margin-bottom:5px;">Attached Design Photos:</div>
  <div class="images-grid">${imagesHTML}</div>
  ` : ''}

  <div class="signature-container">
    <div class="signature-box" style="margin-top: 30px;">
      Consultant Signature
    </div>
    <div class="signature-box" style="margin-top: 30px;">
      Customer Authorization
    </div>
  </div>

  <div class="footer">
    <p>This document is a design estimation sheet. Final jewelry purchase and processing prices may vary based on market changes. Thank you for your business!</p>
  </div>
</body>
</html>
  `
}

onMounted(() => {
  loadDefaultSpotPrices()
})
</script>

<script>
// Prevent immediate watcher reference issues by defining setup items properly
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.sheet-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}
.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
.select-estimate-row {
  max-width: 100%;
}
.estimate-tab-card {
  cursor: pointer;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  width: 220px;
  height: 120px;
}
.estimate-tab-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}
.active-estimate-card {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.03) !important;
}
.active-estimate-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(45deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
}
.close-est-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0.7;
}
.close-est-btn:hover {
  opacity: 1;
}
.active-estimate-section {
  border: 1px solid rgba(var(--v-border-color), 0.15);
  background-color: rgba(var(--v-theme-surface-variant), 0.02);
}
.line-item-container {
  border-bottom: 1px dashed rgba(var(--v-border-color), 0.08);
  padding-bottom: 12px;
}
.line-item-container:last-of-type {
  border-bottom: none;
}
.modifiers-drawer {
  border: 1px dashed rgba(var(--v-border-color), 0.15) !important;
  background-color: rgba(var(--v-theme-surface-variant), 0.04) !important;
}
.primary-checkbox-est :deep(.v-selection-control) {
  min-height: unset !important;
}
</style>
