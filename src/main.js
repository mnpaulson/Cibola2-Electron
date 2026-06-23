import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          accent1: '#1a2935', // Dark Slate Blue for Headers
          // Core Record Types (Jewel / Mineral Tones)
          customer: '#B066FF', // Amethyst Purple
          job: '#42A5F5',      // Cobalt Blue
          credit: '#c9aa48',   // Amber Gold
          sheet: '#66BB6A',    // Emerald Green
        },
      },
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          accent1: '#0c74e9', // Vibrant blue for light headers
          // Core Record Types (Jewel / Mineral Tones)
          customer: '#7B1FA2', // Deeper Amethyst Purple
          job: '#1565C0',      // Deeper Cobalt Blue
          credit: '#E65100',   // Deeper Amber Gold
          'on-credit': '#ffffff', // Light text for gold credit in light mode
          sheet: '#2E7D32',    // Deeper Emerald Green
        },
      },
    },
  },
})

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
