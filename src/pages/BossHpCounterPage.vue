<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/characterStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import monstersData from '@/data/source/monsters-gh.json'
import monsterStatsData from '@/data/source/monster-stats-gh.json'

const route = useRoute()
const router = useRouter()
const characterStore = useCharacterStore()
const scenarioStore = useScenarioStore()

const monsterMap = new Map(monstersData.map((m) => [m.id, m]))
const monsterStats = monsterStatsData as Record<string, { stats: { level: number; type: string; health: number | string; movement?: number; attack: number | string; range?: number }[] }>

const playerCount = computed(() => {
  const count = characterStore.activeCharacters.length
  return count >= 2 && count <= 4 ? count : 2
})

const scenarioLevel = computed(() => Math.ceil(characterStore.averageLevel / 2))

function resolveHp(val: number | string | undefined): number {
  if (val == null) return 0
  if (typeof val === 'number') return val
  const pc = playerCount.value
  const s = val.replace(/C/g, String(pc))
  const mulMatch = s.match(/^(\d+)x(\d+)$/)
  if (mulMatch) return Number(mulMatch[1]) * Number(mulMatch[2])
  const addMatch = s.match(/^(\d+)\+(\d+)$/)
  if (addMatch) return Number(addMatch[1]) + Number(addMatch[2])
  return Number(s) || 0
}

const bossId = computed(() => route.params.bossId as string)
const scenarioId = computed(() => route.params.scenarioId as string)

const isCustom = computed(() => bossId.value === 'custom')

const bossName = computed(() => {
  if (isCustom.value) return 'Vlastní'
  return monsterMap.get(bossId.value)?.nameCz ?? bossId.value
})

const bossScenarioName = computed(() => {
  if (isCustom.value) return ''
  const def = scenarioStore.getDefinition(scenarioId.value)
  return def ? `#${scenarioId.value} ${def.nameCz ?? def.name}` : ''
})

const maxHp = computed(() => {
  if (isCustom.value) return Number(scenarioId.value) || 0
  const data = monsterStats[bossId.value]
  if (!data) return 0
  const boss = data.stats.find((s) => s.level === scenarioLevel.value && s.type === 'boss')
  return resolveHp(boss?.health)
})

const currentHp = ref(0)

onMounted(() => {
  currentHp.value = maxHp.value
})

function adjust(delta: number) {
  currentHp.value = Math.max(0, Math.min(maxHp.value, currentHp.value + delta))
}

function reset() {
  currentHp.value = maxHp.value
}

const hpPercent = computed(() => {
  if (maxHp.value === 0) return 100
  return (currentHp.value / maxHp.value) * 100
})

const hpColor = computed(() => {
  if (currentHp.value === 0) return 'text-gray-600'
  if (hpPercent.value <= 25) return 'text-red-500'
  if (hpPercent.value <= 50) return 'text-yellow-400'
  return 'text-gray-100'
})

const ringBorder = computed(() => {
  if (currentHp.value === 0) return 'border-gray-700'
  if (hpPercent.value <= 25) return 'border-red-500'
  if (hpPercent.value <= 50) return 'border-yellow-500'
  return 'border-gh-primary'
})

const ringGlow = computed(() => {
  if (currentHp.value === 0) return ''
  if (hpPercent.value <= 25) return 'shadow-[0_0_40px_rgba(239,68,68,0.3)]'
  if (hpPercent.value <= 50) return 'shadow-[0_0_40px_rgba(234,179,8,0.2)]'
  return 'shadow-[0_0_40px_rgba(196,163,90,0.2)]'
})
</script>

<template>
  <div class="min-h-screen bg-gh-dark flex flex-col select-none">
    <!-- Boss info bar -->
    <div class="flex items-center justify-between px-4 py-3 bg-gh-dark/80 border-b border-gh-border/20 shrink-0 safe-area-top">
      <button
        class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors min-h-[44px] pr-4"
        @click="router.push('/boss-hp')"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Zpět
      </button>
      <div class="text-center">
        <div class="font-display text-sm font-bold text-red-400 uppercase tracking-wider">{{ bossName }}</div>
        <div v-if="bossScenarioName" class="text-[10px] text-gray-600">{{ bossScenarioName }} · úr. {{ scenarioLevel }}</div>
      </div>
      <button
        class="text-sm text-gray-600 hover:text-gray-300 transition-colors min-h-[44px] pl-4"
        @click="reset"
      >
        Reset
      </button>
    </div>

    <!-- PLUS zone (top half) -->
    <div
      class="flex-1 flex items-center justify-center bg-green-900/10 active:bg-green-900/25 transition-colors relative cursor-pointer"
      @click="adjust(1)"
    >
      <svg class="w-20 h-20 text-green-500/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <!-- +5 -->
      <div
        class="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-green-900/20 border border-green-900/30 text-green-400/70 text-xl font-bold flex items-center justify-center active:bg-green-900/40 transition-colors cursor-pointer"
        @click.stop="adjust(5)"
      >
        +5
      </div>
    </div>

    <!-- Center: HP circle -->
    <div class="relative z-10 flex items-center justify-center -my-[4.5rem]">
      <div
        class="w-36 h-36 rounded-full flex flex-col items-center justify-center border-[3px] bg-gh-dark transition-all duration-300"
        :class="[ringBorder, ringGlow]"
      >
        <div
          class="font-display text-5xl font-bold tabular-nums transition-colors duration-300 leading-none"
          :class="hpColor"
        >
          {{ currentHp }}
        </div>
        <div class="text-[11px] text-gray-600 font-display mt-0.5">/ {{ maxHp }}</div>
        <!-- Dead -->
        <div v-if="currentHp === 0" class="absolute -bottom-7 font-display text-xs text-red-500 uppercase tracking-widest">
          Poražen!
        </div>
      </div>
    </div>

    <!-- MINUS zone (bottom half) -->
    <div
      class="flex-1 flex items-center justify-center bg-red-900/10 active:bg-red-900/25 transition-colors relative cursor-pointer"
      @click="adjust(-1)"
    >
      <svg class="w-20 h-20 text-red-500/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
      </svg>
      <!-- -5 -->
      <div
        class="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-red-900/20 border border-red-900/30 text-red-400/70 text-xl font-bold flex items-center justify-center active:bg-red-900/40 transition-colors cursor-pointer"
        @click.stop="adjust(-5)"
      >
        −5
      </div>
    </div>
  </div>
</template>
