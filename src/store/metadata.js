import { reactive } from 'vue'
import { api } from '../utils/api'

export const metadataState = reactive({
  employees: [],
  assignableEmployees: [],
  customSheets: [],
  goldCredits: [],
  metalPrices: [],
  customSheetCategories: [],
  payoutMarkups: [],
  isLoading: false,
  isLoaded: false,
  error: null
})

export async function refreshMetadata() {
  metadataState.isLoading = true
  metadataState.error = null
  try {
    const [employeesData, assignableData, valuesData] = await Promise.all([
      api.get('/employees?active=true'),
      api.get('/employees/assignable'),
      api.get('/values')
    ])

    metadataState.employees = employeesData || []
    metadataState.assignableEmployees = assignableData || []

    const values = valuesData || []
    metadataState.customSheets = values.filter(v => v.type_id === 3)
    metadataState.goldCredits = values.filter(v => v.type_id === 1)
    metadataState.metalPrices = values.filter(v => v.type_id === 2)
    metadataState.customSheetCategories = values.filter(v => v.type_id === 4)
    metadataState.payoutMarkups = values.filter(v => v.type_id === 5)

    metadataState.isLoaded = true
    console.log('[Metadata Store] Successfully loaded cache')
  } catch (err) {
    metadataState.error = err.message || 'Failed to load metadata configuration'
    console.error('[Metadata Store] Failed to load metadata:', err)
    throw err
  } finally {
    metadataState.isLoading = false
  }
}
