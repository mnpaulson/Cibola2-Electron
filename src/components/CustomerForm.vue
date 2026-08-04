<template>
  <v-card
    class="customer-card"
    :class="{ 
      'flat-customer-card': flat && currentState === 'search',
      'record-accent-customer': currentState === 'info'
    }"
    :elevation="(flat && currentState === 'search') ? 0 : 3"
    :variant="(flat && currentState === 'search') ? 'flat' : 'elevated'"
    :loading="loading"
  >
    <v-card-text :class="(flat && currentState === 'search') ? 'pa-0' : 'pa-4'">
      <!-- 1. SEARCH STATE -->
      <v-fade-transition hide-on-leave>
        <div v-if="currentState === 'search'">
          <v-autocomplete
            v-model="selectedSearchItem"
            v-model:search="searchQuery"
            :loading="loading"
            :items="formattedCandidates"
            item-title="displayName"
            item-value="id"
            return-object
            placeholder="Customer Search"
            prepend-inner-icon="mdi-account-search"
            menu-icon=""
            no-filter
            clearable
            variant="outlined"
            density="comfortable"
            hide-details
            @keydown.enter.prevent="handleEnterKey"
          >
            <template v-slot:append-inner>
              <v-btn
                color="primary"
                icon="mdi-account-plus"
                variant="text"
                density="comfortable"
                title="Add New Customer"
                @click.stop="initCreateForm"
              ></v-btn>
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
              >
                <template v-slot:prepend v-if="item.raw.isRecent">
                  <v-icon color="grey-darken-1" class="mr-n2">mdi-history</v-icon>
                </template>
                <template v-slot:title>
                  <span v-html="highlightText(`${item.raw.fname} ${item.raw.lname}`, searchQuery)"></span>
                </template>
                <template v-slot:subtitle>
                  <div class="d-flex align-center justify-space-between">
                    <span v-if="item.raw.phone" v-html="highlightText(item.raw.phone, searchQuery)"></span>
                    <span v-else class="text-medium-emphasis">No phone number</span>
                    <span v-if="item.raw.isRecent" class="text-caption text-grey-darken-1 font-italic ml-2">Recently Viewed</span>
                  </div>
                </template>
              </v-list-item>
            </template>
            <template v-slot:no-data>
              <v-list-item v-if="searchQuery && searchQuery.length >= 2">
                <span class="text-medium-emphasis">No customers found. Press Enter to add.</span>
              </v-list-item>
              <v-list-item v-else>
                <span class="text-medium-emphasis">Type at least 2 characters to search...</span>
              </v-list-item>
            </template>
          </v-autocomplete>
        </div>
      </v-fade-transition>

      <!-- 2. INFO / DETAILS STATE -->
      <v-fade-transition hide-on-leave>
        <div v-if="currentState === 'info'" class="customer-info-container">
          <v-row>
            <v-col cols="12" :md="(hideNotes || (!startingNote && !isNoteExpanded)) ? 12 : 7" class="py-1">
              <div class="mb-1">
                <div>
                  <h3
                    class="text-h6 font-weight-bold mb-0 d-inline-block"
                    :class="{ 'clickable-title': clickableName }"
                    @click="clickableName && $emit('click-name', customer.id)"
                  >
                    {{ customer.fname }} {{ customer.lname }}
                  </h3>
                  <span v-if="!hideId" class="text-caption text-medium-emphasis d-block">Customer ID: #{{ customer.id }}</span>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="my-2 text-body-2 d-flex flex-wrap align-center gap-4">
                <div v-if="customer.phone" class="d-flex align-center text-medium-emphasis">
                  <v-icon size="16" start class="mr-1">mdi-phone</v-icon>
                  <span>{{ customer.phone }}</span>
                </div>
                <div v-if="customer.email" class="d-flex align-center text-medium-emphasis">
                  <v-icon size="16" start class="mr-1">mdi-email</v-icon>
                  <span class="text-truncate">{{ customer.email }}</span>
                </div>
              </div>

              <!-- Address Block -->
              <div v-if="hasAddress" class="mt-2">
                <div class="d-flex align-start text-caption text-medium-emphasis">
                  <v-icon size="16" start class="mr-2 mt-1">mdi-map-marker</v-icon>
                  <div>
                    <span v-if="customer.addr_st">{{ customer.addr_st }}<br /></span>
                    <span v-if="customer.addr_city">{{ customer.addr_city }}, </span>
                    <span v-if="customer.addr_prov">{{ customer.addr_prov }} </span>
                    <span v-if="customer.addr_postal">{{ customer.addr_postal }}<br /></span>
                    <span v-if="customer.addr_country">{{ customer.addr_country }}</span>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- Customer Notes -->
            <v-col cols="12" :md="5" class="py-1" v-if="!hideNotes && (startingNote || isNoteExpanded)">
              <div class="d-flex align-stretch position-relative w-100">
                <!-- Full-height vertical indicator strip attached to the left edge -->
                <v-btn
                  v-if="startingNote"
                  variant="flat"
                  :color="isNoteHidden ? 'grey-darken-1' : 'warning'"
                  class="note-strip-btn d-flex align-center justify-center pa-0 min-w-0"
                  :class="{ 'pulsing-strip': !isNoteHidden }"
                  style="width: 36px; min-width: 36px; border-radius: 8px 0 0 8px; align-self: stretch; height: auto;"
                  @click="isNoteHidden = !isNoteHidden"
                  :title="isNoteHidden ? 'Customer Note Hidden (Click to show)' : 'Customer Note Present (Click to hide)'"
                >
                  <v-icon size="20" color="white">{{ isNoteHidden ? 'mdi-eye-off-outline' : 'mdi-alert-decagram' }}</v-icon>
                </v-btn>

                <!-- Textarea input area -->
                <v-textarea
                  v-if="!isNoteHidden"
                  v-model="customer.note"
                  :readonly="isNotesLocked"
                  :class="['flex-grow-1', { 'locked-textarea': isNotesLocked }, { 'attached-textarea': startingNote }]"
                  variant="outlined"
                  rows="2"
                  auto-grow
                  max-rows="4"
                  density="comfortable"
                  placeholder="Add private customer notes here..."
                  hide-details="auto"
                ></v-textarea>

                <!-- Hidden State Bar placeholder when note is hidden -->
                <div
                  v-else
                  class="flex-grow-1 d-flex align-center px-3 py-2 text-caption text-medium-emphasis bg-grey-lighten-4 rounded-e"
                  style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-left: none; cursor: pointer;"
                  @click="isNoteHidden = false"
                >
                  <em>Customer note hidden for privacy (Click to view)</em>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-fade-transition>

      <!-- 3. FORM / EDIT / CREATE STATE -->
      <v-fade-transition hide-on-leave>
        <v-form v-if="currentState === 'form'" ref="formRef" v-model="isFormValid" lazy-validation>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="customer.fname"
                label="First Name *"
                :rules="nameRules"
                required
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="customer.lname"
                label="Last Name *"
                :rules="nameRules"
                required
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="customer.phone"
                label="Phone"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="customer.email"
                label="E-Mail"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            
            <!-- Physical Address Section -->
            <v-col cols="12" class="py-1">
              <div v-if="!showAddressFields" class="d-flex justify-start">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-map-marker-plus-outline"
                  class="text-none font-weight-medium px-1"
                  @click="showAddressFields = true"
                >
                  + Add Physical Address
                </v-btn>
              </div>
            </v-col>

            <template v-if="showAddressFields">
              <v-col cols="12">
                <v-text-field
                  v-model="customer.addr_st"
                  label="Street Address"
                  prepend-inner-icon="mdi-home"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="customer.addr_city"
                  label="City"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="customer.addr_prov"
                  label="Province/State"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="customer.addr_postal"
                  label="Postal Code"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="customer.addr_country"
                  label="Country"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </template>

            <v-col cols="12" v-if="!hideNotes">
              <v-textarea
                v-model="customer.note"
                label="Customer Notes"
                variant="outlined"
                rows="2"
                no-resize
                density="compact"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-fade-transition>
    </v-card-text>

    <!-- Card Actions -->
    <v-divider v-if="currentState !== 'search'"></v-divider>
    <v-card-actions class="pa-3 bg-light-surface d-flex align-center justify-space-between flex-wrap gap-2" v-if="currentState !== 'search'">
      <!-- Left side: Activity Summary (Single-Row) -->
      <div v-if="currentState === 'info' && showActivity" class="d-flex align-center gap-2 flex-wrap">
        <div class="stat-pill d-inline-flex align-center px-2 py-1 rounded-lg">
          <v-icon size="16" color="job" class="mr-1">mdi-briefcase-outline</v-icon>
          <span class="text-caption text-medium-emphasis mr-1">Jobs:</span>
          <span class="text-caption font-weight-bold text-job">{{ customer.job_count ?? 0 }}</span>
        </div>
        <div class="stat-pill d-inline-flex align-center px-2 py-1 rounded-lg">
          <v-icon size="16" color="credit" class="mr-1">mdi-credit-card-outline</v-icon>
          <span class="text-caption text-medium-emphasis mr-1">Credits:</span>
          <span class="text-caption font-weight-bold text-credit">{{ customer.credit_count ?? 0 }}</span>
        </div>
        <div class="stat-pill d-inline-flex align-center px-2 py-1 rounded-lg">
          <v-icon size="16" color="sheet" class="mr-1">mdi-list-box-outline</v-icon>
          <span class="text-caption text-medium-emphasis mr-1">Sheets:</span>
          <span class="text-caption font-weight-bold text-sheet">{{ customer.custom_sheet_count ?? 0 }}</span>
        </div>
      </div>
      <div v-else></div>

      <!-- Right side: Actions -->
      <div class="d-flex align-center gap-2">
        <!-- Actions for Details state -->
        <template v-if="currentState === 'info'">
          <!-- Note Editing Actions -->
          <template v-if="showNoteToolbar">
            <v-btn
              color="grey-darken-1"
              variant="outlined"
              size="small"
              @click="discardNotesOnly"
            >
              Discard
            </v-btn>
            <v-btn
              color="success"
              variant="flat"
              size="small"
              prepend-icon="mdi-content-save"
              :disabled="!isNoteDirty"
              :loading="savingNote"
              @click="saveNotesOnly"
            >
              Save Note
            </v-btn>
          </template>

          <!-- Standard Actions -->
          <template v-else>
            <v-btn
              v-if="!hideNotes && !startingNote && !isNoteExpanded"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-note-plus-outline"
              size="small"
              @click="isNoteExpanded = true; isNotesLocked = false"
            >
              Add Note
            </v-btn>
            <v-btn
              v-if="!hideNotes && startingNote && lockNotes && isNotesLocked"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-pencil"
              size="small"
              @click="isNotesLocked = false"
            >
              Edit Note
            </v-btn>
            <v-btn
              v-if="clearable"
              color="grey-darken-1"
              variant="outlined"
              prepend-icon="mdi-account-switch"
              size="small"
              @click="clearSelectedCustomer"
            >
              Change
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-pencil"
              size="small"
              @click="startEditForm"
            >
              Edit
            </v-btn>
          </template>
        </template>

        <!-- Actions for Form state -->
        <template v-if="currentState === 'form'">
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            size="small"
            @click="cancelForm"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            size="small"
            :disabled="!isFormValid"
            prepend-icon="mdi-content-save"
            @click="saveCustomer"
          >
            {{ customer.id ? 'Save Changes' : 'Create Customer' }}
          </v-btn>
        </template>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { api } from '../utils/api'
import Fuse from 'fuse.js'
import { showToast } from '../store/toast'
import { recentlyViewedState, removeRecentRecord } from '../store/recentlyViewed'
import { sessionState, navigateBack } from '../store/session'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  },
  hideNotes: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  initialState: {
    type: String,
    default: 'search' // 'search', 'info', 'form'
  },
  prefillQuery: {
    type: String,
    default: ''
  },
  flat: {
    type: Boolean,
    default: false
  },
  clickableName: {
    type: Boolean,
    default: false
  },
  lockNotes: {
    type: Boolean,
    default: true
  },
  showActivity: {
    type: Boolean,
    default: false
  },
  hideId: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'select', 'newCustomer', 'cancel', 'click-name', 'dirty-state-change'])

// State Variables
const currentState = ref('search') // 'search', 'info', 'form'
const loading = ref(false)
const searchQuery = ref('')
const lastSearchText = ref('')
const selectedSearchItem = ref(null)
const rawCandidates = ref([])
const isFormValid = ref(true)
const formRef = ref(null)
const startingNote = ref('')
const isNotesLocked = ref(false)
const savingNote = ref(false)
const isNoteHidden = ref(false)
const isNoteExpanded = ref(false)
const showAddressFields = ref(false)

function startEditForm() {
  showAddressFields.value = hasAddress.value
  currentState.value = 'form'
}

// Sync notes locked state when lockNotes prop is passed or changed
watch(() => props.lockNotes, (newVal) => {
  isNotesLocked.value = newVal
}, { immediate: true })

const customer = reactive({
  id: null,
  fname: '',
  lname: '',
  phone: '',
  email: '',
  addr_st: '',
  addr_city: '',
  addr_prov: '',
  addr_postal: '',
  addr_country: '',
  note: '',
  job_count: 0,
  credit_count: 0,
  custom_sheet_count: 0
})

// Validation Rules
const nameRules = [
  v => !!v || 'Name is required',
  v => (v && v.trim().length > 0) || 'Name cannot be blank'
]



const hasAddress = computed(() => {
  return (
    customer.addr_st ||
    customer.addr_city ||
    customer.addr_prov ||
    customer.addr_postal ||
    customer.addr_country
  )
})

const recentCustomers = computed(() => {
  return (recentlyViewedState.records || [])
    .filter(r => r.type === 'customer')
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      fname: r.fname || (r.details ? r.details.split(' ')[0] : ''),
      lname: r.lname || (r.details ? r.details.split(' ').slice(1).join(' ') : ''),
      phone: r.phone || '',
      isRecent: true
    }))
})

// Perform client-side fuzzy match and ranking instantly as the user types
const filteredCandidates = computed(() => {
  const query = searchQuery.value || ''
  if (!query || query.trim().length === 0) {
    return recentCustomers.value
  }
  if (query.trim().length < 2) {
    return []
  }

  const queryWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean)

  const candidatesWithFullName = rawCandidates.value.map(c => ({
    ...c,
    fullName: `${c.fname || ''} ${c.lname || ''}`.trim()
  }))

  const fuseInstance = new Fuse(candidatesWithFullName, {
    keys: [
      { name: 'fullName', weight: 0.8 },
      { name: 'fname', weight: 0.1 },
      { name: 'lname', weight: 0.1 },
      { name: 'phone', weight: 0.2 }
    ],
    threshold: 0.4,
    distance: 100,
    includeScore: true,
    ignoreLocation: true
  })

  const result = fuseInstance.search(query)

  const scoreCandidate = (c, words) => {
    const fname = (c.fname || '').toLowerCase()
    const lname = (c.lname || '').toLowerCase()
    const fullName = `${fname} ${lname}`
    const phone = (c.phone || '').toLowerCase()
    
    let score = 0
    let matchedWordsCount = 0

    for (const word of words) {
      let wordScore = 0
      let matched = false
      
      if (fname === word || lname === word) {
        wordScore += 10
        matched = true
      } else if (fname.startsWith(word) || lname.startsWith(word)) {
        wordScore += 5
        matched = true
      } else if (fullName.includes(word)) {
        wordScore += 2
        matched = true
      } else if (phone.includes(word)) {
        wordScore += 1
        matched = true
      }
      
      if (matched) {
        matchedWordsCount++
        score += wordScore
      }
    }
    
    score += matchedWordsCount * 100
    return score
  }

  const sorted = [...result].sort((a, b) => {
    const scoreA = scoreCandidate(a.item, queryWords)
    const scoreB = scoreCandidate(b.item, queryWords)
    
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }
    return (a.score || 0) - (b.score || 0)
  })

  return sorted.map(r => r.item)
})

// Format candidates list for v-autocomplete dropdown display
const formattedCandidates = computed(() => {
  return filteredCandidates.value.map(c => ({
    ...c,
    displayName: `${c.fname} ${c.lname} ${c.phone ? ' - ' + c.phone : ''}`
  }))
})

// Highlight matched substring helper for autocomplete template
const highlightText = (text, query) => {
  if (!text) return ''
  if (!query) return text

  const tokens = query.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return text

  // Sort tokens by length descending to prevent shorter matches inside the regex from overriding longer ones
  tokens.sort((a, b) => b.length - a.length)

  const escapedTokens = tokens.map(token => token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi')

  return text.replace(regex, '<span style="background-color: rgba(var(--v-theme-primary), 0.18); color: rgb(var(--v-theme-primary)); font-weight: 600; padding: 0 2px; border-radius: 2px;">$1</span>')
}

// Search watcher with debounced backend fetching + local instant filtering
let debounceTimeout = null
watch(searchQuery, (newVal) => {
  if (newVal && newVal.trim().length > 0) {
    lastSearchText.value = newVal
  }

  if (debounceTimeout) clearTimeout(debounceTimeout)
  
  if (!newVal || newVal.trim().length < 2) {
    rawCandidates.value = []
    return
  }

  debounceTimeout = setTimeout(() => {
    fetchCandidates(newVal)
  }, 350)
})

// Fetch raw candidates matching the query tokens
async function fetchCandidates(queryText) {
  loading.value = true
  try {
    const data = await api.get(`/customers?q=${encodeURIComponent(queryText)}`)
    rawCandidates.value = data || []
  } catch (err) {
    console.error('Failed to search customers:', err)
  } finally {
    loading.value = false
  }
}

// Watch selection from autocomplete
watch(selectedSearchItem, (newItem) => {
  if (newItem && newItem.id) {
    loadCustomer(newItem.id)
  }
})

// Load customer from backend
async function loadCustomer(id) {
  if (!id) return
  loading.value = true
  try {
    const data = await api.get(`/customers/${id}`)
    if (data) {
      Object.assign(customer, data)
      customer.job_count = data.job_count ?? 0
      customer.credit_count = data.credit_count ?? 0
      customer.custom_sheet_count = data.custom_sheet_count ?? 0
      startingNote.value = data.note || ''
      currentState.value = 'info'
      isNotesLocked.value = props.lockNotes
      isNoteHidden.value = false
      isNoteExpanded.value = false
      emit('update:modelValue', data.id)
      emit('select', data)
    }
  } catch (err) {
    console.error('Failed to load customer:', err)
    showToast('Failed to load customer details: ' + err.message, 'error')
    removeRecentRecord('customer', id)
    emit('update:modelValue', null)
    emit('select', null)
    if (sessionState.activeTab === 'customers') {
      navigateBack()
    }
  } finally {
    loading.value = false
  }
}

// Watch modelValue change (external synchronization)
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== customer.id) {
    loadCustomer(newVal)
  } else if (!newVal) {
    resetState()
    currentState.value = props.initialState
  }
}, { immediate: true })

// Helper to parse query into fname, lname, and phone
function parseSearchQuery(query) {
  const result = { fname: '', lname: '', phone: '' }
  if (!query) return result
  
  const cleanQuery = query.trim()
  
  // Matches phone numbers with digits, dashes, parentheses, or spaces, minimum 7 digits
  const phoneMatch = cleanQuery.match(/(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{7,12}\b/)
  
  let remainingQuery = cleanQuery
  if (phoneMatch) {
    result.phone = phoneMatch[0].trim()
    remainingQuery = cleanQuery.replace(phoneMatch[0], '').trim()
  }
  
  if (remainingQuery) {
    const nameParts = remainingQuery.split(/\s+/).filter(Boolean)
    if (nameParts.length > 1) {
      result.fname = nameParts[0]
      result.lname = nameParts.slice(1).join(' ')
    } else if (nameParts.length === 1) {
      result.fname = nameParts[0]
    }
  }
  
  return result
}

// Initialize the "Create New" state with prepopulated names/phone if possible
function initCreateForm() {
  resetFormFields()
  showAddressFields.value = false
  
  const query = searchQuery.value || lastSearchText.value || props.prefillQuery || ''
  if (query.trim().length > 0) {
    const parsed = parseSearchQuery(query)
    customer.fname = parsed.fname
    customer.lname = parsed.lname
    customer.phone = parsed.phone
  }

  currentState.value = 'form'
}

// Reset form values
function resetFormFields() {
  customer.id = null
  customer.fname = ''
  customer.lname = ''
  customer.phone = ''
  customer.email = ''
  customer.addr_st = ''
  customer.addr_city = ''
  customer.addr_prov = ''
  customer.addr_postal = ''
  customer.addr_country = ''
  customer.note = ''
  customer.job_count = 0
  customer.credit_count = 0
  customer.custom_sheet_count = 0
  startingNote.value = ''
  isNotesLocked.value = props.lockNotes // relock
  isNoteHidden.value = false
  isNoteExpanded.value = false
  showAddressFields.value = false
}

function resetState() {
  resetFormFields()
  selectedSearchItem.value = null
  searchQuery.value = ''
  lastSearchText.value = ''
  rawCandidates.value = []
  currentState.value = 'search'
}

function clearSelectedCustomer() {
  resetState()
  emit('update:modelValue', null)
  emit('select', null)
}

function cancelForm() {
  if (customer.id) {
    currentState.value = 'info'
  } else {
    resetState()
    emit('cancel')
  }
}

// Save or Create customer
async function saveCustomer() {
  if (!isFormValid.value) return
  
  loading.value = true
  try {
    let responseData
    if (customer.id) {
      // Update
      responseData = await api.put(`/customers/${customer.id}`, customer)
    } else {
      // Create
      responseData = await api.post('/customers', customer)
      emit('newCustomer', responseData.id)
    }

    if (responseData) {
      const currentJobCount = customer.job_count
      const currentCreditCount = customer.credit_count
      const currentSheetCount = customer.custom_sheet_count

      Object.assign(customer, responseData)

      customer.job_count = responseData.job_count ?? currentJobCount
      customer.credit_count = responseData.credit_count ?? currentCreditCount
      customer.custom_sheet_count = responseData.custom_sheet_count ?? currentSheetCount

      startingNote.value = responseData.note || ''
      currentState.value = 'info'
      emit('update:modelValue', responseData.id)
      emit('select', responseData)
    }
  } catch (err) {
    console.error('Failed to save customer:', err)
  } finally {
    loading.value = false
  }
}


const isNoteDirty = computed(() => {
  const current = customer.note || ''
  const starting = startingNote.value || ''
  return !!customer.id && current !== starting
})

const showNoteToolbar = computed(() => {
  return !isNotesLocked.value || isNoteDirty.value || (!startingNote.value && isNoteExpanded.value)
})

const isProfileEditing = computed(() => {
  return currentState.value === 'form'
})

const hasUnsavedChanges = computed(() => {
  return isNoteDirty.value || isProfileEditing.value
})

// Watch hasUnsavedChanges and emit 'dirty-state-change'
watch(hasUnsavedChanges, (newVal) => {
  emit('dirty-state-change', newVal)
}, { immediate: true })

async function saveNotesOnly() {
  const current = customer.note || ''
  const starting = startingNote.value || ''
  if (!customer.id || current === starting) return
  
  savingNote.value = true
  try {
    const data = await api.put(`/customers/${customer.id}`, {
      ...customer,
      note: customer.note
    })
    if (data) {
      startingNote.value = data.note || ''
      showToast('Customer note saved successfully', 'success')
      isNotesLocked.value = props.lockNotes // relock
      if (!data.note) {
        isNoteExpanded.value = false
      }
    }
  } catch (err) {
    console.error('Failed to save notes:', err)
    showToast('Failed to save customer note: ' + err.message, 'error')
  } finally {
    savingNote.value = false
  }
}

function discardNotesOnly() {
  customer.note = startingNote.value
  isNotesLocked.value = props.lockNotes // relock
  if (!startingNote.value) {
    isNoteExpanded.value = false
  }
}

const handleEnterKey = () => {
  if (formattedCandidates.value.length === 0) {
    initCreateForm()
  } else {
    selectedSearchItem.value = formattedCandidates.value[0]
  }
}

onMounted(() => {
  if (props.modelValue) {
    loadCustomer(props.modelValue)
  } else {
    currentState.value = props.initialState
    if (props.initialState === 'form' && props.prefillQuery) {
      const parsed = parseSearchQuery(props.prefillQuery)
      customer.fname = parsed.fname
      customer.lname = parsed.lname
      customer.phone = parsed.phone
    }
  }
})
</script>

<style scoped>
.customer-card {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  transition: box-shadow 0.3s ease;
  overflow: hidden;
}

.flat-customer-card {
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  overflow: visible !important;
}

.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.gap-2 {
  gap: 8px;
}

.italic {
  font-style: italic;
}

.clickable-title {
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
  display: inline-block;
}
.clickable-title:hover {
  text-decoration: underline;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--v-theme-warning), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0);
  }
}
.pulsing-alert {
  border-left: 6px solid rgb(var(--v-theme-warning)) !important;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-strip {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0.5);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--v-theme-warning), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0);
  }
}

.pulsing-strip {
  animation: pulse-strip 2s infinite;
}

.locked-textarea :deep(.v-field__outline) {
  display: none !important;
}
.locked-textarea :deep(textarea) {
  cursor: default !important;
  opacity: 0.8;
}
.locked-textarea :deep(.v-field) {
  background-color: rgba(var(--v-theme-on-surface), 0.03) !important;
  border-radius: 8px;
}

.attached-textarea :deep(.v-field),
.attached-textarea :deep(.v-field__outline),
.attached-textarea :deep(.v-field__outline__start) {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

.stat-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(var(--v-border-color), 0.08);
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(var(--v-theme-on-surface), 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

@media (min-width: 960px) {
  .border-left-md {
    border-left: 1px solid rgba(var(--v-border-color), 0.12);
  }
}

.tracking-wider {
  letter-spacing: 0.08em;
}

.stat-pill {
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background: rgba(var(--v-theme-on-surface), 0.03);
  font-size: 0.8125rem;
}
.stat-pill:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.edit-note-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
  z-index: 2;
  background: rgba(var(--v-theme-surface), 0.85);
  backdrop-filter: blur(4px);
  border-radius: 4px;
}

.bg-job-avatar {
  background-color: rgb(var(--v-theme-job)) !important;
}

.bg-credit-avatar {
  background-color: rgb(var(--v-theme-credit)) !important;
}

.bg-sheet-avatar {
  background-color: rgb(var(--v-theme-sheet)) !important;
}
</style>
