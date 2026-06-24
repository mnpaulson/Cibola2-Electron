import { computed } from 'vue'
import { useTheme } from 'vuetify'

/**
 * Shared composable for directory/manager header and search-bar theming.
 * Centralises the logic for adapting accent1 card headers and frosted-glass
 * search inputs between dark mode (pale text on dark slate) and light mode
 * (dark text on pale blue).
 *
 * Usage:
 *   import { useDirectoryTheme } from '../composables/useDirectoryTheme'
 *   const { isDark, headerTextClass, searchBgColor } = useDirectoryTheme()
 */
export function useDirectoryTheme() {
  const theme = useTheme()
  const isDark = computed(() => theme.global.current.value.dark)

  /** Applied to `bg-accent1` card-item headers so text/icons stay readable. */
  const headerTextClass = computed(() =>
    isDark.value ? 'text-white' : 'text-grey-darken-4'
  )

  /**
   * Frosted-glass background for solo search inputs embedded in accent1 headers.
   * Dark: subtle white tint; Light: subtle dark tint.
   */
  const searchBgColor = computed(() =>
    isDark.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.06)'
  )

  /** Applied to icon buttons inside `bg-accent1` card headers. */
  const headerIconColor = computed(() =>
    isDark.value ? 'white' : 'grey-darken-3'
  )

  return { isDark, headerTextClass, searchBgColor, headerIconColor }
}
