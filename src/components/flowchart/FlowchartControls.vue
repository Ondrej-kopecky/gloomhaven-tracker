<script setup lang="ts">
import { ScenarioStatus } from '@/models/types'
import { useFlowchartStore, type StatusFilter, type StoryFilter } from '@/stores/flowchartStore'

const flowchartStore = useFlowchartStore()

const emit = defineEmits<{
  fitView: []
}>()

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: 'Vše', value: 'all' },
  { label: 'Dostupné', value: ScenarioStatus.AVAILABLE },
  { label: 'Dokončené', value: ScenarioStatus.COMPLETED },
  { label: 'Zamčené', value: ScenarioStatus.LOCKED },
  { label: 'Blokované', value: ScenarioStatus.BLOCKED },
]

const storyFilters: { label: string; value: StoryFilter }[] = [
  { label: 'Hlavní', value: 'main' },
  { label: 'Vedlejší', value: 'side' },
  { label: 'Vše', value: 'all' },
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Story filter -->
    <div class="flex gap-0.5 bg-black/30 rounded-lg p-0.5 border border-gh-border">
      <button
        v-for="f in storyFilters"
        :key="f.value"
        class="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200"
        :class="flowchartStore.storyFilter === f.value
          ? 'bg-gh-primary/20 text-gh-primary shadow-sm'
          : 'text-gray-500 hover:text-gray-300'"
        @click="flowchartStore.setStoryFilter(f.value)"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Status filter -->
    <div class="flex gap-0.5 bg-black/30 rounded-lg p-0.5 border border-gh-border">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        class="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200"
        :class="flowchartStore.filterStatus === f.value
          ? 'bg-white/10 text-gray-200 shadow-sm'
          : 'text-gray-500 hover:text-gray-300'"
        @click="flowchartStore.setFilter(f.value)"
      >
        {{ f.label }}
      </button>
    </div>

    <button
      class="px-2.5 py-1 bg-black/30 border border-gh-border rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all"
      title="Přizpůsobit zobrazení"
      @click="emit('fitView')"
    >
      ⊡ Přizpůsobit
    </button>
  </div>
</template>
