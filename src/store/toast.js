import { reactive } from 'vue'

export const toastState = reactive({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

/**
 * Trigger a global snackbar toast notification.
 * 
 * @param {string} text - Message to display
 * @param {string} color - Color theme ('success', 'error', 'warning', 'info')
 * @param {number} timeout - Timeout duration in ms
 */
export function showToast(text, color = 'success', timeout = 3000) {
  toastState.text = text
  toastState.color = color
  toastState.timeout = timeout
  toastState.show = true
}
