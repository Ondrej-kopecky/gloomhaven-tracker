<script setup lang="ts">
const items = [
  { label: 'Dokončeno', color: '#22c55e' },
  { label: 'Dostupné', color: '#3b82f6' },
  { label: 'Zamčeno', color: '#374151' },
  { label: 'Blokováno', color: '#ef4444' },
  { label: 'Vyžadováno', color: '#eab308' },
  { label: 'Pokus', color: '#f97316' },
]
</script>

<template>
  <div class="flex flex-wrap gap-3 text-xs text-gray-400">
    <div v-for="item in items" :key="item.label" class="flex items-center gap-1.5">
      <span
        class="w-3 h-3 rounded-full border"
        :style="{ backgroundColor: item.color + '30', borderColor: item.color }"
      />
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>
