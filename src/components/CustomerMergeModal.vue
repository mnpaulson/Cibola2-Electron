<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    persistent
    @update:model-value="val => emit('update:modelValue', val)"
  >
    <v-card class="merge-modal-card rounded-lg" elevation="3">
      <!-- Card Header -->
      <v-card-item class="bg-primary text-white pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon size="28" class="mr-3">mdi-merge</v-icon>
            <div>
              <h3 class="text-h6 font-weight-bold mb-0">Merge Duplicate Customer Records</h3>
              <span class="text-caption opacity-80">
                Compare customer details and select which values to preserve in the primary record.
              </span>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" density="compact" @click="closeModal"></v-btn>
        </div>
      </v-card-item>

      <v-card-text class="pa-6" v-if="loading">
        <div class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" size="40" class="mb-3"></v-progress-circular>
          <div class="text-subtitle-2 text-medium-emphasis">Loading customer details...</div>
        </div>
      </v-card-text>

      <v-card-text class="pa-6" v-else-if="primaryCust && secondaryCust">
        <!-- Re-linking Summary Alert -->
        <v-alert
          type="info"
          variant="tonal"
          color="primary"
          icon="mdi-information-outline"
          class="mb-6 rounded-lg"
          density="comfortable"
        >
          <div class="font-weight-medium">Related Records</div>
          <div class="text-caption">
            All related records on #{{ secondaryCust.id }}, Jobs ({{ secondaryCust.job_count || 0 }}), Gold Credits ({{ secondaryCust.credit_count || 0 }}), and Custom Sheets ({{ secondaryCust.custom_sheet_count || 0 }}) will be reassigned.
          </div>
        </v-alert>

        <!-- Swap Primary / Secondary Header Control -->
        <div class="d-flex align-center justify-space-between border rounded-lg pa-3 mb-4 surface-banner">
          <div class="d-flex align-center">
            <v-chip color="purple" variant="flat" size="small" class="font-weight-bold mr-2">
              Primary: #{{ primaryCust.id }}
            </v-chip>
            <span
              class="text-subtitle-2 font-weight-bold clickable-name"
              title="View Customer Profile"
              @click="goToCustomer(primaryCust.id)"
            >
              {{ primaryCust.fname }} {{ primaryCust.lname }}
            </span>
          </div>

          <v-btn
            size="small"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-swap-horizontal"
            @click="swapRoles"
          >
            Swap
          </v-btn>

          <div class="d-flex align-center">
            <v-chip color="grey" variant="tonal" size="small" class="font-weight-bold mr-2">
              Secondary: #{{ secondaryCust.id }}
            </v-chip>
            <span
              class="text-subtitle-2 font-weight-bold clickable-name"
              title="View Customer Profile"
              @click="goToCustomer(secondaryCust.id)"
            >
              {{ secondaryCust.fname }} {{ secondaryCust.lname }}
            </span>
          </div>
        </div>

        <!-- Field Selection Comparison Table -->
        <v-table class="merge-fields-table border rounded-lg">
          <thead>
            <tr>
              <th class="text-left font-weight-bold" style="width: 140px;">Field</th>
              <th class="text-left font-weight-bold" style="width: 40%;">
                #{{ primaryCust.id }}
              </th>
              <th class="text-left font-weight-bold" style="width: 40%;">
                #{{ secondaryCust.id }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- First Name -->
            <tr>
              <td class="font-weight-bold text-caption text-uppercase text-medium-emphasis">First Name</td>
              <td
                :class="isExactFname ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactFname && fieldOwners.fname === 'primary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactFname && (fieldOwners.fname = 'primary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactFname" :color="fieldOwners.fname === 'primary' ? 'primary' : 'grey'" class="mr-2">
                    {{ fieldOwners.fname === 'primary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactFname ? 'text-medium-emphasis' : ''">{{ primaryCust.fname || '(Empty)' }}</span>
                </div>
              </td>
              <td
                :class="isExactFname ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactFname && fieldOwners.fname === 'secondary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactFname && (fieldOwners.fname = 'secondary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactFname" :color="fieldOwners.fname === 'secondary' ? 'primary' : 'grey'" class="mr-2">
                    {{ fieldOwners.fname === 'secondary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactFname ? 'text-medium-emphasis' : ''">{{ secondaryCust.fname || '(Empty)' }}</span>
                </div>
              </td>
            </tr>

            <!-- Last Name -->
            <tr>
              <td class="font-weight-bold text-caption text-uppercase text-medium-emphasis">Last Name</td>
              <td
                :class="isExactLname ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactLname && fieldOwners.lname === 'primary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactLname && (fieldOwners.lname = 'primary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactLname" :color="fieldOwners.lname === 'primary' ? 'primary' : 'grey'" class="mr-2">
                    {{ fieldOwners.lname === 'primary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactLname ? 'text-medium-emphasis' : ''">{{ primaryCust.lname || '(Empty)' }}</span>
                </div>
              </td>
              <td
                :class="isExactLname ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactLname && fieldOwners.lname === 'secondary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactLname && (fieldOwners.lname = 'secondary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactLname" :color="fieldOwners.lname === 'secondary' ? 'primary' : 'grey'" class="mr-2">
                    {{ fieldOwners.lname === 'secondary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactLname ? 'text-medium-emphasis' : ''">{{ secondaryCust.lname || '(Empty)' }}</span>
                </div>
              </td>
            </tr>

            <!-- Phone -->
            <tr>
              <td class="font-weight-bold text-caption text-uppercase text-medium-emphasis">Phone</td>
              <td
                :class="isExactPhone ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactPhone && fieldOwners.phone === 'primary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactPhone && (fieldOwners.phone = 'primary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactPhone" :color="fieldOwners.phone === 'primary' ? 'primary' : 'grey'" class="mr-2">
                    {{ fieldOwners.phone === 'primary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactPhone ? 'text-medium-emphasis' : ''">{{ primaryCust.phone || '(Empty)' }}</span>
                </div>
              </td>
              <td
                :class="isExactPhone ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactPhone && fieldOwners.phone === 'secondary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactPhone && (fieldOwners.phone = 'secondary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactPhone" :color="fieldOwners.phone === 'secondary' ? 'primary' : 'grey'" class="mr-2">
                    {{ fieldOwners.phone === 'secondary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactPhone ? 'text-medium-emphasis' : ''">{{ secondaryCust.phone || '(Empty)' }}</span>
                </div>
              </td>
            </tr>

            <!-- Email -->
            <tr>
              <td class="font-weight-bold text-caption text-uppercase text-medium-emphasis">Email</td>
              <td
                :class="isExactEmail ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactEmail && fieldOwners.email === 'primary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactEmail && (fieldOwners.email = 'primary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactEmail" :color="fieldOwners.email === 'primary' ? 'primary' : 'grey'" class="mr-2">
                    {{ fieldOwners.email === 'primary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactEmail ? 'text-medium-emphasis' : ''">{{ primaryCust.email || '(Empty)' }}</span>
                </div>
              </td>
              <td
                :class="isExactEmail ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactEmail && fieldOwners.email === 'secondary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactEmail && (fieldOwners.email = 'secondary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactEmail" :color="fieldOwners.email === 'secondary' ? 'primary' : 'grey'" class="mr-2">
                    {{ fieldOwners.email === 'secondary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactEmail ? 'text-medium-emphasis' : ''">{{ secondaryCust.email || '(Empty)' }}</span>
                </div>
              </td>
            </tr>

            <!-- Street Address -->
            <tr>
              <td class="font-weight-bold text-caption text-uppercase text-medium-emphasis">Street Address</td>
              <td
                :class="isExactAddress ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactAddress && selectedAddressOwner === 'primary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactAddress && (selectedAddressOwner = 'primary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactAddress" :color="selectedAddressOwner === 'primary' ? 'primary' : 'grey'" class="mr-2">
                    {{ selectedAddressOwner === 'primary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactAddress ? 'text-medium-emphasis' : ''">{{ formatAddress(primaryCust) || '(Empty)' }}</span>
                </div>
              </td>
              <td
                :class="isExactAddress ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactAddress && selectedAddressOwner === 'secondary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactAddress && (selectedAddressOwner = 'secondary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactAddress" :color="selectedAddressOwner === 'secondary' ? 'primary' : 'grey'" class="mr-2">
                    {{ selectedAddressOwner === 'secondary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactAddress ? 'text-medium-emphasis' : ''">{{ formatAddress(secondaryCust) || '(Empty)' }}</span>
                </div>
              </td>
            </tr>

            <!-- Customer Notes -->
            <tr>
              <td class="font-weight-bold text-caption text-uppercase text-medium-emphasis">Customer Note</td>
              <td
                :class="isExactNote ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactNote && selectedNoteMode === 'primary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactNote && (selectedNoteMode = 'primary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactNote" :color="selectedNoteMode === 'primary' ? 'primary' : 'grey'" class="mr-2">
                    {{ selectedNoteMode === 'primary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactNote ? 'text-medium-emphasis' : ''">{{ primaryCust.note || '(No note)' }}</span>
                </div>
              </td>
              <td
                :class="isExactNote ? 'inactive-cell' : 'clickable-cell'"
                :style="!isExactNote && selectedNoteMode === 'secondary' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="!isExactNote && (selectedNoteMode = 'secondary')"
              >
                <div class="d-flex align-center pa-2">
                  <v-icon v-if="!isExactNote" :color="selectedNoteMode === 'secondary' ? 'primary' : 'grey'" class="mr-2">
                    {{ selectedNoteMode === 'secondary' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <v-icon v-else color="grey" class="mr-2" size="18">mdi-check-circle-outline</v-icon>
                  <span class="text-body-2" :class="isExactNote ? 'text-medium-emphasis' : ''">{{ secondaryCust.note || '(No note)' }}</span>
                </div>
              </td>
            </tr>

            <!-- Combine Notes Option -->
            <tr v-if="!isExactNote && primaryCust.note && secondaryCust.note && primaryCust.note.trim() !== secondaryCust.note.trim()">
              <td
                colspan="3"
                class="clickable-cell text-center pa-3"
                :style="selectedNoteMode === 'combine' ? 'background-color: rgba(var(--v-theme-primary), 0.12);' : ''"
                @click="selectedNoteMode = 'combine'"
              >
                <div class="d-flex align-center justify-center">
                  <v-icon :color="selectedNoteMode === 'combine' ? 'primary' : 'grey'" class="mr-2">
                    {{ selectedNoteMode === 'combine' ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
                  </v-icon>
                  <span class="text-body-2 font-weight-bold">
                    Combine Both Notes (Appends Secondary note to Primary note)
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Card Actions -->
      <v-card-actions class="pa-4 d-flex align-center justify-space-between flex-wrap gap-2">
        <v-btn
          size="small"
          color="grey"
          variant="outlined"
          prepend-icon="mdi-eye-off-outline"
          :disabled="submitting"
          @click="rejectPair"
        >
          Reject (Not Duplicate)
        </v-btn>

        <div class="d-flex align-center gap-2">
          <v-btn variant="text" color="grey" @click="closeModal" :disabled="submitting" class="mr-2">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-merge"
            :loading="submitting"
            @click="executeMerge"
          >
            Merge Records
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { api } from '../utils/api'
import { showToast } from '../store/toast'
import { navigateTo } from '../store/session'

function goToCustomer(id) {
  if (!id) return
  closeModal()
  navigateTo('customers', { selectedCustomerId: id })
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  customerId1: {
    type: [Number, String],
    required: true
  },
  customerId2: {
    type: [Number, String],
    required: true
  },
  pairId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'merged'])

const loading = ref(false)
const submitting = ref(false)
const primaryCust = ref(null)
const secondaryCust = ref(null)
const pairIdRef = ref(props.pairId || null)

const fieldOwners = reactive({
  fname: 'primary',
  lname: 'primary',
  phone: 'primary',
  email: 'primary'
})

const selectedAddressOwner = ref('primary')
const selectedNoteMode = ref('primary')

function formatAddress(cust) {
  if (!cust) return ''
  const parts = [cust.addr_st, cust.addr_city, cust.addr_prov, cust.addr_postal, cust.addr_country].filter(Boolean)
  return parts.join(', ')
}

const isExactFname = computed(() => {
  if (!primaryCust.value || !secondaryCust.value) return false
  const p = (primaryCust.value.fname || '').trim().toLowerCase()
  const s = (secondaryCust.value.fname || '').trim().toLowerCase()
  return p === s
})

const isExactLname = computed(() => {
  if (!primaryCust.value || !secondaryCust.value) return false
  const p = (primaryCust.value.lname || '').trim().toLowerCase()
  const s = (secondaryCust.value.lname || '').trim().toLowerCase()
  return p === s
})

const isExactPhone = computed(() => {
  if (!primaryCust.value || !secondaryCust.value) return false
  const p = (primaryCust.value.phone || '').replace(/\D/g, '')
  const s = (secondaryCust.value.phone || '').replace(/\D/g, '')
  return p === s
})

const isExactEmail = computed(() => {
  if (!primaryCust.value || !secondaryCust.value) return false
  const p = (primaryCust.value.email || '').trim().toLowerCase()
  const s = (secondaryCust.value.email || '').trim().toLowerCase()
  return p === s
})

const isExactAddress = computed(() => {
  if (!primaryCust.value || !secondaryCust.value) return false
  return formatAddress(primaryCust.value).trim().toLowerCase() === formatAddress(secondaryCust.value).trim().toLowerCase()
})

const isExactNote = computed(() => {
  if (!primaryCust.value || !secondaryCust.value) return false
  const p = (primaryCust.value.note || '').trim()
  const s = (secondaryCust.value.note || '').trim()
  return p === s
})

async function fetchCustomerDetails() {
  if (!props.customerId1 || !props.customerId2) return
  loading.value = true
  primaryCust.value = null
  secondaryCust.value = null
  pairIdRef.value = props.pairId || null

  try {
    const id1 = parseInt(props.customerId1)
    const id2 = parseInt(props.customerId2)
    const res1 = await api.get(`/customers/${id1}`)
    const res2 = await api.get(`/customers/${id2}`)
    
    if (!pairIdRef.value) {
      const dups = await api.get(`/customers/${id1}/duplicates`)
      if (dups && Array.isArray(dups)) {
        const found = dups.find(d => 
          (d.customer_id_1 === id1 && d.customer_id_2 === id2) ||
          (d.customer_id_1 === id2 && d.customer_id_2 === id1)
        )
        if (found) pairIdRef.value = found.id
      }
    }

    if (res1 && res2) {
      primaryCust.value = res1
      secondaryCust.value = res2
      initFields()
    } else {
      showToast('Failed to load customer profiles for merging', 'error')
      closeModal()
    }
  } catch (err) {
    showToast('Error loading customer profiles: ' + err.message, 'error')
    closeModal()
  } finally {
    loading.value = false
  }
}

async function rejectPair() {
  if (!pairIdRef.value) {
    showToast('Could not resolve duplicate pair ID for rejection', 'warning')
    return
  }
  submitting.value = true
  try {
    await api.post(`/customers/duplicates/${pairIdRef.value}/reject`, {})
    showToast('Marked pair as rejected', 'info')
    emit('merged')
    closeModal()
  } catch (err) {
    showToast('Error rejecting pair: ' + err.message, 'error')
  } finally {
    submitting.value = false
  }
}

function initFields() {
  if (!primaryCust.value || !secondaryCust.value) return
  const p = primaryCust.value
  const s = secondaryCust.value

  fieldOwners.fname = p.fname ? 'primary' : (s.fname ? 'secondary' : 'primary')
  fieldOwners.lname = p.lname ? 'primary' : (s.lname ? 'secondary' : 'primary')
  fieldOwners.phone = p.phone ? 'primary' : (s.phone ? 'secondary' : 'primary')
  fieldOwners.email = p.email ? 'primary' : (s.email ? 'secondary' : 'primary')

  if (p.addr_st || p.addr_city) {
    selectedAddressOwner.value = 'primary'
  } else if (s.addr_st || s.addr_city) {
    selectedAddressOwner.value = 'secondary'
  } else {
    selectedAddressOwner.value = 'primary'
  }

  if (p.note && s.note && p.note.trim() !== s.note.trim()) {
    selectedNoteMode.value = 'combine'
  } else if (p.note) {
    selectedNoteMode.value = 'primary'
  } else if (s.note) {
    selectedNoteMode.value = 'secondary'
  } else {
    selectedNoteMode.value = 'primary'
  }
}

function swapRoles() {
  const temp = primaryCust.value
  primaryCust.value = secondaryCust.value
  secondaryCust.value = temp
  initFields()
}

function closeModal() {
  emit('update:modelValue', false)
}

function computeMergedFields() {
  if (!primaryCust.value || !secondaryCust.value) return {}
  const p = primaryCust.value
  const s = secondaryCust.value

  const fname = isExactFname.value ? (p.fname || '') : (fieldOwners.fname === 'primary' ? p.fname : s.fname)
  const lname = isExactLname.value ? (p.lname || '') : (fieldOwners.lname === 'primary' ? p.lname : s.lname)
  const phone = isExactPhone.value ? (p.phone || null) : (fieldOwners.phone === 'primary' ? p.phone : s.phone)
  const email = isExactEmail.value ? (p.email || null) : (fieldOwners.email === 'primary' ? p.email : s.email)

  const addressSource = isExactAddress.value ? p : (selectedAddressOwner.value === 'primary' ? p : s)

  let noteValue = ''
  if (isExactNote.value) {
    noteValue = p.note || ''
  } else if (selectedNoteMode.value === 'primary') {
    noteValue = p.note || ''
  } else if (selectedNoteMode.value === 'secondary') {
    noteValue = s.note || ''
  } else if (selectedNoteMode.value === 'combine') {
    if (p.note && s.note) {
      noteValue = `${p.note}\n--- Merged Note from Customer #${s.id} ---\n${s.note}`
    } else {
      noteValue = p.note || s.note || ''
    }
  }

  return {
    fname,
    lname,
    phone,
    email,
    addr_st: addressSource.addr_st || null,
    addr_city: addressSource.addr_city || null,
    addr_prov: addressSource.addr_prov || null,
    addr_postal: addressSource.addr_postal || null,
    addr_country: addressSource.addr_country || null,
    note: noteValue || null
  }
}

async function executeMerge() {
  if (!primaryCust.value || !secondaryCust.value) return
  submitting.value = true
  try {
    const payload = {
      primaryId: primaryCust.value.id,
      secondaryId: secondaryCust.value.id,
      mergedFields: computeMergedFields()
    }
    const mergedCustomer = await api.post('/customers/merge', payload)
    showToast(`Merged Customer #${secondaryCust.value.id} into Customer #${primaryCust.value.id}`, 'success')
    emit('merged', mergedCustomer)
    closeModal()
  } catch (err) {
    showToast('Merge error: ' + err.message, 'error')
  } finally {
    submitting.value = false
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchCustomerDetails()
  }
})

watch(() => [props.customerId1, props.customerId2], () => {
  if (props.modelValue) {
    fetchCustomerDetails()
  }
})

onMounted(() => {
  if (props.modelValue) {
    fetchCustomerDetails()
  }
})
</script>

<style scoped>
.merge-modal-card {
  overflow: hidden;
}

.surface-banner {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.merge-fields-table tr td {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.clickable-cell {
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  user-select: none;
}

.clickable-cell:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.inactive-cell {
  cursor: default;
  background-color: rgba(var(--v-theme-on-surface), 0.03);
  opacity: 0.75;
  user-select: none;
}

.clickable-name {
  cursor: pointer;
  transition: color 0.15s ease-in-out;
}

.clickable-name:hover {
  color: rgb(var(--v-theme-primary)) !important;
  text-decoration: underline;
}
</style>
