<template>
  <div v-if="totalItems > 0" class="directory-pagination d-flex align-center justify-space-between pa-3 bg-light-surface flex-wrap gap-2">
    <span class="text-caption text-medium-emphasis">
      Showing {{ pageStart }} to {{ pageEnd }} of {{ totalItems }} entries
    </span>
    <div class="d-flex align-center gap-2">
      <v-btn
        icon="mdi-chevron-left"
        variant="outlined"
        size="x-small"
        color="primary"
        :disabled="modelValue === 1"
        @click="updatePage(modelValue - 1)"
      ></v-btn>
      <span class="text-caption font-weight-bold">
        Page {{ modelValue }} of {{ totalPages }}
      </span>
      <v-btn
        icon="mdi-chevron-right"
        variant="outlined"
        size="x-small"
        color="primary"
        :disabled="modelValue === totalPages"
        @click="updatePage(modelValue + 1)"
      ></v-btn>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
    default: 1
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0
  },
  itemsPerPage: {
    type: Number,
    default: 15
  }
})

const emit = defineEmits(['update:modelValue'])

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage) || 1
})

const pageStart = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.modelValue - 1) * props.itemsPerPage + 1
})

const pageEnd = computed(() => {
  const end = props.modelValue * props.itemsPerPage
  return end > props.totalItems ? props.totalItems : end
})

function updatePage(newPage) {
  if (newPage >= 1 && newPage <= totalPages.value) {
    emit('update:modelValue', newPage)
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.bg-light-surface {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}
</style>
