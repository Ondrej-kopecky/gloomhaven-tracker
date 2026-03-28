<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ScenarioStatus } from '@/models/types'
import { useCampaignStore } from '@/stores/campaignStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useFlowchartStore } from '@/stores/flowchartStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { useCharacterStore } from '@/stores/characterStore'
import monstersData from '@/data/source/monsters-gh.json'
import scenarioMonstersData from '@/data/source/scenario-monsters-gh.json'
import monsterStatsData from '@/data/source/monster-stats-gh.json'

const router = useRouter()
const route = useRoute()
const campaignStore = useCampaignStore()
const scenarioStore = useScenarioStore()
const flowchartStore = useFlowchartStore()
const achievementStore = useAchievementStore()
const characterStore = useCharacterStore()

const search = ref('')

/* ── Modal ── */
const selectedScenarioId = ref<string | null>(null)
const selectedScenario = computed(() =>
  selectedScenarioId.value
    ? scenarioStore.allScenarios.find(s => s.id === selectedScenarioId.value) ?? null
    : null
)

// Lock body scroll when modal is open
watch(selectedScenarioId, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

function openModal(s: { id: string }) {
  selectedScenarioId.value = s.id
}
function closeModal() {
  selectedScenarioId.value = null
}
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}
onMounted(() => document.addEventListener('keydown', onEsc))
onUnmounted(() => document.removeEventListener('keydown', onEsc))

function achievementName(id: string): string {
  const gd = achievementStore.globalDefinitions.find(a => a.id === id)
  if (gd) return gd.name
  const pd = achievementStore.partyDefinitions.find(a => a.id === id)
  if (pd) return pd.name
  return id
}

function rewardTextStyle(text: string): string {
  if (/událost|balíčk/i.test(text)) return 'bg-cyan-900/20 text-cyan-400 border-cyan-800/30'
  if (/předmět|lektvar|design|Návrh/i.test(text)) return 'bg-orange-900/20 text-orange-400 border-orange-800/30'
  if (/obálk/i.test(text)) return 'bg-pink-900/20 text-pink-400 border-pink-800/30'
  if (/úkol|Splněn/i.test(text)) return 'bg-green-900/20 text-green-400 border-green-800/30'
  if (/✔/i.test(text)) return 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30'
  if (/důchod/i.test(text)) return 'bg-red-900/20 text-red-400 border-red-800/30'
  return 'bg-white/[0.04] text-gray-300 border-white/[0.08]'
}

function linkedScenarioName(id: number): string {
  const def = scenarioStore.getDefinition(String(id))
  return def ? `#${id} ${def.name}` : `#${id}`
}

const requirementLabels = computed(() => {
  const s = selectedScenario.value
  if (!s?.requiredBy?.length) return [] as { text: string; met: boolean }[]
  return s.requiredBy.flatMap((cond) => {
    const labels: { text: string; met: boolean }[] = []
    for (const id of cond.complete ?? []) {
      if (/^\d+$/.test(id)) {
        const name = scenarioStore.getDefinition(id)?.nameCz ?? scenarioStore.getDefinition(id)?.name ?? `#${id}`
        const met = scenarioStore.getScenarioStatus(id) === ScenarioStatus.COMPLETED
        labels.push({ text: `Dokončit scénář #${id} ${name}`, met })
      } else {
        const name = achievementName(id)
        const met = achievementStore.isGlobalAchieved(id) || achievementStore.isPartyAchieved(id)
        labels.push({ text: `Úspěch: ${name}`, met })
      }
    }
    for (const id of cond.incomplete ?? []) {
      if (/^\d+$/.test(id)) {
        const name = scenarioStore.getDefinition(id)?.nameCz ?? scenarioStore.getDefinition(id)?.name ?? `#${id}`
        const met = scenarioStore.getScenarioStatus(id) !== ScenarioStatus.COMPLETED
        labels.push({ text: `Nedokončený scénář #${id} ${name}`, met })
      } else {
        const name = achievementName(id)
        const met = !(achievementStore.isGlobalAchieved(id) || achievementStore.isPartyAchieved(id))
        labels.push({ text: `Bez úspěchu: ${name}`, met })
      }
    }
    return labels
  })
})

type FilterVal = 'all' | 'available' | 'completed' | 'attempted' | 'locked' | 'blocked'
const filterStatus = ref<FilterVal>('all')

const allFilterTabs: { key: FilterVal; label: string }[] = [
  { key: 'all', label: 'Vše' },
  { key: 'available', label: 'Dostupné' },
  { key: 'completed', label: 'Dokončeno' },
  { key: 'attempted', label: 'Pokus' },
  { key: 'locked', label: 'Zamčeno' },
  { key: 'blocked', label: 'Blokováno' },
]

const filterTabs = computed(() => {
  if (!campaignStore.hideSpoilers) return allFilterTabs
  // Spoiler mód: skrýt záložky pro zamčené a blokované
  return allFilterTabs.filter(t => t.key !== 'locked' && t.key !== 'blocked')
})

onMounted(async () => {
  if (!campaignStore.hasCampaign) {
    router.push('/kampan')
    return
  }
  await scenarioStore.loadScenarioData()

  // Open scenario detail if ?open=ID is in query
  const openId = route.query.open as string | undefined
  if (openId) {
    openModal({ id: openId })
  }
})

const SPOILER_VISIBLE_STATUSES = new Set([
  ScenarioStatus.AVAILABLE, ScenarioStatus.COMPLETED,
  ScenarioStatus.ATTEMPTED, ScenarioStatus.REQUIRED,
])

const filteredScenarios = computed(() => {
  return scenarioStore.allScenarios.filter((s) => {
    // Spoiler mód: skrýt zamčené, hidden a blokované scénáře
    if (campaignStore.hideSpoilers && !SPOILER_VISIBLE_STATUSES.has(s.computedStatus)) return false

    if (filterStatus.value !== 'all') {
      const statusMap: Record<string, string[]> = {
        available: [ScenarioStatus.AVAILABLE, ScenarioStatus.REQUIRED],
        completed: [ScenarioStatus.COMPLETED],
        attempted: [ScenarioStatus.ATTEMPTED],
        locked: [ScenarioStatus.LOCKED, ScenarioStatus.HIDDEN],
        blocked: [ScenarioStatus.BLOCKED],
      }
      const allowed = statusMap[filterStatus.value]
      if (allowed && !allowed.includes(s.computedStatus)) return false
    }
    if (search.value) {
      const q = search.value.toLowerCase()
      return s.displayName.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.id.includes(q)
    }
    return true
  })
})

const statusLabels: Record<string, string> = {
  [ScenarioStatus.HIDDEN]: 'Skryto',
  [ScenarioStatus.COMPLETED]: 'Dokončeno',
  [ScenarioStatus.AVAILABLE]: 'Dostupné',
  [ScenarioStatus.LOCKED]: 'Zamčeno',
  [ScenarioStatus.BLOCKED]: 'Blokováno',
  [ScenarioStatus.REQUIRED]: 'Vyžadováno',
  [ScenarioStatus.ATTEMPTED]: 'Pokus',
}

const gameTagTranslations: Record<string, string> = {
  '{POISON}': 'Otrava',
  '{WOUND}': 'Zranění',
  '{STUN}': 'Omráčení',
  '{MUDDLE}': 'Zmatení',
  '{IMMOBILIZE}': 'Znehybnění',
  '{DISARM}': 'Odzbrojení',
  '{CURSE}': 'Kletba',
  '{BLESS}': 'Požehnání',
  '{INVISIBLE}': 'Neviditelnost',
  '{PUSH}': 'Odstrčení',
  '{PULL}': 'Přitažení',
  '{PIERCE}': 'Průraznost',
  '{SHIELD}': 'Obrana',
  '{HEAL}': 'Léčení',
  '{FIRE}': 'Oheň',
  '{ICE}': 'Led',
  '{AIR}': 'Vzduch',
  '{EARTH}': 'Země',
  '{LIGHT}': 'Světlo',
  '{DARK}': 'Tma',
}

function translateGameTags(text: string): string {
  return text.replace(/\{[A-Z_]+\}/g, (tag) => gameTagTranslations[tag] ?? tag)
}

const statusAccentColors: Record<string, string> = {
  [ScenarioStatus.HIDDEN]: 'bg-gray-700',
  [ScenarioStatus.COMPLETED]: 'bg-green-500',
  [ScenarioStatus.AVAILABLE]: 'bg-blue-500',
  [ScenarioStatus.LOCKED]: 'bg-gray-600',
  [ScenarioStatus.BLOCKED]: 'bg-red-500',
  [ScenarioStatus.REQUIRED]: 'bg-yellow-500',
  [ScenarioStatus.ATTEMPTED]: 'bg-orange-500',
}

const statusBadgeColors: Record<string, string> = {
  [ScenarioStatus.HIDDEN]: 'bg-gray-800/40 text-gray-600',
  [ScenarioStatus.COMPLETED]: 'bg-green-900/25 text-green-400 border border-green-800/40',
  [ScenarioStatus.AVAILABLE]: 'bg-blue-900/25 text-blue-400 border border-blue-800/40',
  [ScenarioStatus.LOCKED]: 'bg-white/5 text-gray-500 border border-gh-border',
  [ScenarioStatus.BLOCKED]: 'bg-red-900/25 text-red-400 border border-red-800/40',
  [ScenarioStatus.REQUIRED]: 'bg-yellow-900/25 text-yellow-400 border border-yellow-800/40',
  [ScenarioStatus.ATTEMPTED]: 'bg-orange-900/25 text-orange-400 border border-orange-800/40',
}

const statusCardBorder: Record<string, string> = {
  [ScenarioStatus.HIDDEN]: 'border-gh-border',
  [ScenarioStatus.COMPLETED]: 'border-green-800/30',
  [ScenarioStatus.AVAILABLE]: 'border-blue-800/30',
  [ScenarioStatus.LOCKED]: 'border-gh-border',
  [ScenarioStatus.BLOCKED]: 'border-red-800/30',
  [ScenarioStatus.REQUIRED]: 'border-yellow-800/30',
  [ScenarioStatus.ATTEMPTED]: 'border-orange-800/30',
}

function pctBar(a: number, b: number): number {
  return b === 0 ? 0 : Math.round((a / b) * 100)
}

function inputValue(e: Event): string {
  return (e.target as HTMLTextAreaElement).value
}

function goToFlowchart(id: string) {
  flowchartStore.selectNode(id)
  router.push('/prehled')
}

// ── Monster data ──────────────────────────────────────────────────────

const monsterMap = new Map(monstersData.map((m) => [m.id, m]))
const allScenarioMonsters = scenarioMonstersData as Record<string, { monsters: string[]; rooms: { roomNumber: number; monster: { name: string; type?: string; player2?: string; player3?: string; player4?: string }[] }[] }>

const playerCount = computed(() => {
  const count = characterStore.activeCharacters.length
  return count >= 2 && count <= 4 ? count : 2
})

function resolveStat(val: number | string | undefined): string {
  if (val == null) return '-'
  if (typeof val === 'number') return String(val)
  const pc = playerCount.value
  const s = val.replace(/C/g, String(pc))
  const mulDivMatch = s.match(/^(\d+)x(\d+)\/(\d+)$/)
  if (mulDivMatch) return String(Math.ceil(Number(mulDivMatch[1]) * Number(mulDivMatch[2]) / Number(mulDivMatch[3])))
  const mulMatch = s.match(/^(\d+)x(\d+)$/)
  if (mulMatch) return String(Number(mulMatch[1]) * Number(mulMatch[2]))
  const addMatch = s.match(/^(\d+)\+(\d+)$/)
  if (addMatch) return String(Number(addMatch[1]) + Number(addMatch[2]))
  return s
}

interface MonsterCount {
  id: string
  nameCz: string
  name: string
  isBoss: boolean
  flies: boolean
  normal: number
  elite: number
}

function getMonstersForScenario(scenarioId: string): MonsterCount[] {
  const data = allScenarioMonsters[scenarioId]
  if (!data) return []

  const pc = playerCount.value as 2 | 3 | 4
  const pcKey = `player${pc}` as 'player2' | 'player3' | 'player4'
  const counts = new Map<string, { normal: number; elite: number }>()

  for (const room of data.rooms) {
    for (const m of room.monster) {
      const baseId = m.name.replace(/-scenario-\d+$/, '').replace(/:[^:]+$/, '')
      let type: string | undefined
      if (m.type) type = m.type
      else if (m[pcKey]) type = m[pcKey]

      if (type) {
        if (!counts.has(baseId)) counts.set(baseId, { normal: 0, elite: 0 })
        const c = counts.get(baseId)!
        if (type === 'elite') c.elite++
        else if (type === 'normal') c.normal++
        else if (type === 'boss') c.normal = Math.max(c.normal, 1)
      }
    }
  }

  const result: MonsterCount[] = []
  for (const [id, c] of counts) {
    const info = monsterMap.get(id)
    result.push({
      id,
      nameCz: info?.nameCz ?? id,
      name: info?.name ?? id,
      isBoss: info?.isBoss ?? false,
      flies: (info as any)?.flies ?? false,
      normal: info?.isBoss ? 0 : c.normal,
      elite: info?.isBoss ? 0 : c.elite,
    })
  }

  return result.sort((a, b) => {
    if (a.isBoss !== b.isBoss) return a.isBoss ? 1 : -1
    return a.nameCz.localeCompare(b.nameCz, 'cs')
  })
}

const selectedMonsters = computed(() =>
  selectedScenario.value ? getMonstersForScenario(selectedScenario.value.id) : []
)

const selectedMonsterTotalCount = computed(() =>
  selectedMonsters.value.reduce((sum, m) => sum + m.normal + m.elite + (m.isBoss ? 1 : 0), 0)
)

// Monster detail popup
const selectedMonsterId = ref<string | null>(null)
const allMonsterStats = monsterStatsData as Record<string, { count: number; flying: boolean; boss: boolean; immunities?: string[]; stats: { level: number; type: string; health: number | string; movement?: number; attack: number; range?: number; actions?: any[] }[] }>

const scenarioLevel = computed(() => {
  const avg = characterStore.averageLevel
  return Math.ceil(avg / 2)
})

const ACTION_LABELS: Record<string, string> = {
  shield: 'Štít',
  retaliate: 'Odveta',
  target: 'Cíle',
  pierce: 'Průraz',
  push: 'Odstrčení',
  pull: 'Přitažení',
  heal: 'Léčení',
  range: 'Dostřel',
  move: 'Pohyb',
  attack: 'Útok',
  condition: '',
}

const CONDITION_LABELS: Record<string, string> = {
  wound: 'Zranění',
  poison: 'Otrava',
  muddle: 'Zmatení',
  immobilize: 'Znehybnění',
  disarm: 'Odzbrojení',
  stun: 'Omráčení',
  curse: 'Kletba',
  bless: 'Požehnání',
  strengthen: 'Posílení',
  invisible: 'Neviditelnost',
  pierce: 'Průraz',
  push: 'Odstrčení',
  pull: 'Přitažení',
}

function formatActions(actions?: any[]): string[] {
  if (!actions) return []
  return actions.map((a: any) => {
    if (a.type === 'condition') return CONDITION_LABELS[a.value] ?? a.value
    const label = ACTION_LABELS[a.type] ?? a.type
    return `${label} ${a.value}`
  })
}

const ACTION_ICONS: Record<string, string> = {
  target: '/img/icons/general/target.png',
  shield: '/img/icons/general/shield.png',
  retaliate: '/img/icons/general/retaliate.png',
  pierce: '/img/icons/status/pierce.png',
  push: '/img/icons/status/push.png',
  pull: '/img/icons/status/pull.png',
}

const CONDITION_ICONS: Record<string, string> = {
  wound: '/img/icons/status/wound.png',
  poison: '/img/icons/status/poison.png',
  muddle: '/img/icons/status/muddle.png',
  immobilize: '/img/icons/status/immobilize.png',
  disarm: '/img/icons/status/disarm.png',
  stun: '/img/icons/status/stun.png',
  curse: '/img/icons/status/curse.png',
  bless: '/img/icons/status/bless.png',
  strengthen: '/img/icons/status/strengthen.png',
  invisible: '/img/icons/status/invisible.png',
}

function getActionEntries(actions?: any[]): { icon: string | null; label: string; value?: string }[] {
  if (!actions) return []
  return actions.map((a: any) => {
    if (a.type === 'condition') {
      return {
        icon: CONDITION_ICONS[a.value] ?? null,
        label: CONDITION_LABELS[a.value] ?? a.value,
      }
    }
    return {
      icon: ACTION_ICONS[a.type] ?? null,
      label: ACTION_LABELS[a.type] ?? a.type,
      value: a.value != null ? String(a.value) : undefined,
    }
  })
}

const selectedMonsterDetail = computed(() => {
  if (!selectedMonsterId.value) return null
  const info = monsterMap.get(selectedMonsterId.value)
  if (!info) return null

  // Find all scenarios where this monster appears
  const appearsIn: { id: string; name: string }[] = []
  for (const [sid, data] of Object.entries(allScenarioMonsters)) {
    if (data.monsters.some((m: string) => m === info.id || m.replace(/-scenario-\d+$/, '') === info.id)) {
      const def = scenarioStore.getDefinition(sid)
      appearsIn.push({ id: sid, name: def?.nameCz ?? def?.name ?? `Scénář ${sid}` })
    }
  }

  // Get stats for current scenario level
  const statsData = allMonsterStats[info.id]
  const level = scenarioLevel.value
  let normalStats = null
  let eliteStats = null

  if (statsData) {
    normalStats = statsData.stats.find(s => s.level === level && s.type === 'normal') ?? null
    eliteStats = statsData.stats.find(s => s.level === level && s.type === 'elite') ?? null
    if (statsData.boss) {
      normalStats = statsData.stats.find(s => s.level === level) ?? null
    }
  }

  return { ...info, appearsIn, statsData, normalStats, eliteStats, level }
})

function openMonsterDetail(monsterId: string) {
  selectedMonsterId.value = monsterId
}

function closeMonsterDetail() {
  selectedMonsterId.value = null
}
</script>

<template>
  <div v-if="campaignStore.hasCampaign" class="max-w-4xl mx-auto">
    <!-- Page header -->
    <div class="gh-page-header">
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Scénáře</h1>
    </div>

    <!-- ── Progress overview ── -->
    <div class="bg-gh-card border border-gh-border rounded-2xl p-5 mb-6">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-400 font-medium">Postup kampaní</span>
        <span class="font-display text-gh-primary text-lg font-bold">
          {{ scenarioStore.completedScenarios.length }}<span class="text-gray-600">/{{ scenarioStore.allScenarios.length }}</span>
        </span>
      </div>
      <div class="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden mb-4">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          :style="{ width: pctBar(scenarioStore.completedScenarios.length, scenarioStore.allScenarios.length) + '%', background: 'linear-gradient(90deg, #c4a35a, #e8d48b)' }"
        ></div>
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-1">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span class="text-xs text-gray-500">Dokončeno <span class="text-green-400 font-medium">{{ scenarioStore.completedScenarios.length }}</span></span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
          <span class="text-xs text-gray-500">Dostupné <span class="text-blue-400 font-medium">{{ scenarioStore.availableScenarios.length }}</span></span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
          <span class="text-xs text-gray-500">Zamčeno <span class="text-gray-400 font-medium">{{ scenarioStore.allScenarios.filter(s => s.computedStatus === 'locked' || s.computedStatus === 'hidden').length }}</span></span>
        </div>
      </div>
    </div>

    <!-- ── Search ── -->
    <div class="mb-4">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Hledat scénář..."
          class="gh-input w-full !pl-10"
        />
      </div>
    </div>

    <!-- ── Filter tabs ── -->
    <div class="flex overflow-x-auto scrollbar-hide gap-1.5 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0"
        :class="filterStatus === tab.key
          ? 'bg-gh-primary/20 text-gh-primary'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'"
        @click="filterStatus = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Scenario cards ── -->
    <div class="space-y-2.5">
      <div
        v-for="s in filteredScenarios"
        :key="s.id"
        class="group relative bg-gh-card border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/[0.02] active:scale-[0.995]"
        :class="statusCardBorder[s.computedStatus] ?? 'border-gh-border'"
        @click="openModal(s)"
      >
        <!-- left accent -->
        <div
          class="absolute left-0 top-0 bottom-0 w-[3px]"
          :class="statusAccentColors[s.computedStatus] ?? 'bg-gray-700'"
        ></div>

        <div class="flex items-center gap-4 px-5 py-3.5">
          <!-- number -->
          <div class="font-display font-bold text-lg text-gh-primary/60 w-8 text-center shrink-0">
            {{ s.id }}
          </div>

          <!-- info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-sm font-medium text-gray-300 truncate">{{ s.displayName }}</span>
              <span v-if="s.isSide" class="shrink-0 text-[10px] text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">vedlejší</span>
            </div>
            <div class="flex items-center gap-3 text-[11px] text-gray-600">
              <span v-if="s.location">{{ s.location }}</span>
              <!-- reward hints (hidden for uncompleted scenarios in spoiler mode) -->
              <template v-if="!campaignStore.hideSpoilers || s.computedStatus === 'completed'">
                <span v-if="s.rewards.gold" class="flex items-center gap-0.5">
                  <svg class="w-3 h-3 text-yellow-500/50" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
                  {{ s.rewards.gold }}
                </span>
                <span v-if="s.rewards.xp" class="flex items-center gap-0.5">
                  <svg class="w-3 h-3 text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"/></svg>
                  {{ s.rewards.xp }} ZK
                </span>
              </template>
            </div>
          </div>

          <!-- status badge -->
          <span
            class="gh-badge shrink-0"
            :class="statusBadgeColors[s.computedStatus] ?? 'bg-white/5 text-gray-500'"
          >
            {{ statusLabels[s.computedStatus] ?? s.computedStatus }}
          </span>

          <!-- arrow -->
          <svg class="w-4 h-4 text-gray-700 group-hover:text-gh-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </div>

    <!-- empty state -->
    <div v-if="filteredScenarios.length === 0" class="text-center py-16 text-gray-600">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <p class="text-sm">Žádné scénáře nenalezeny</p>
    </div>

    <!-- ── Scenario detail modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedScenario"
          class="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4"
          @click.self="closeModal"
        >
          <!-- backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          <!-- modal panel -->
          <div class="relative w-full h-full rounded-none lg:max-w-lg lg:max-h-[85vh] lg:rounded-2xl bg-gh-card border border-gh-border shadow-2xl overflow-hidden flex flex-col">
            <!-- header -->
            <div class="relative px-6 pt-5 pb-4 border-b border-gh-border">
              <!-- left accent -->
              <div
                class="absolute left-0 top-0 bottom-0 w-1"
                :class="statusAccentColors[selectedScenario.computedStatus] ?? 'bg-gray-700'"
              ></div>

              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-display text-gh-primary text-xl font-bold">#{{ selectedScenario.id }}</span>
                    <span
                      class="gh-badge text-[10px]"
                      :class="statusBadgeColors[selectedScenario.computedStatus] ?? 'bg-white/5 text-gray-500'"
                    >
                      {{ statusLabels[selectedScenario.computedStatus] ?? selectedScenario.computedStatus }}
                    </span>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-200">{{ selectedScenario.displayName }}</h2>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="selectedScenario.location" class="text-xs text-gray-500">{{ selectedScenario.location }}</span>
                    <span v-if="selectedScenario.isSide" class="text-[10px] text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">vedlejší</span>
                    <span v-if="selectedScenario.hasBoss" class="text-[10px] text-red-400/70 bg-red-900/15 px-1.5 py-0.5 rounded border border-red-800/20">boss</span>
                  </div>
                </div>
                <!-- close button -->
                <button
                  class="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-colors"
                  @click="closeModal"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- body (scrollable) -->
            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4 modal-scroll">
              <!-- summary -->
              <div v-if="selectedScenario.summary" class="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                <p class="text-sm text-gray-300 leading-relaxed italic">{{ selectedScenario.summary }}</p>
              </div>

              <!-- requirements -->
              <div v-if="requirementLabels.length > 0">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Podmínky pro zahrání</h3>
                <div class="space-y-1">
                  <div v-for="(req, i) in requirementLabels" :key="i" class="flex items-center gap-1.5 text-sm">
                    <span v-if="req.met" class="text-green-400/90 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ req.text }}
                    </span>
                    <span v-else class="text-yellow-400/90 flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      {{ req.text }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- rewards (hidden for uncompleted in spoiler mode) -->
              <div v-if="(!campaignStore.hideSpoilers || selectedScenario.computedStatus === 'completed') && (selectedScenario.rewards.gold || selectedScenario.rewards.xp || selectedScenario.rewards.reputation || selectedScenario.rewards.prosperity)">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Odměny</h3>
                <div class="flex flex-wrap gap-2">
                  <span v-if="selectedScenario.rewards.gold" class="inline-flex items-center gap-1.5 bg-yellow-900/20 text-yellow-400 text-xs px-2.5 py-1.5 rounded-lg border border-yellow-800/30">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
                    {{ selectedScenario.rewards.gold }} zl. {{ selectedScenario.rewards.goldType === 'collective' ? 'celkem' : 'každý' }}
                  </span>
                  <span v-if="selectedScenario.rewards.xp" class="inline-flex items-center gap-1.5 bg-blue-900/20 text-blue-400 text-xs px-2.5 py-1.5 rounded-lg border border-blue-800/30">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"/></svg>
                    {{ selectedScenario.rewards.xp }} ZK každý
                  </span>
                  <span v-if="selectedScenario.rewards.reputation" class="inline-flex items-center gap-1.5 bg-purple-900/20 text-purple-400 text-xs px-2.5 py-1.5 rounded-lg border border-purple-800/30">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>
                    {{ selectedScenario.rewards.reputation > 0 ? '+' : '' }}{{ selectedScenario.rewards.reputation }} reputace
                  </span>
                  <span v-if="selectedScenario.rewards.prosperity" class="inline-flex items-center gap-1.5 bg-gh-primary/10 text-gh-primary text-xs px-2.5 py-1.5 rounded-lg border border-gh-primary/20">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg>
                    +{{ selectedScenario.rewards.prosperity }} prosperita
                  </span>
                </div>
                <!-- Additional text rewards -->
                <div v-if="selectedScenario.rewards.text?.length" class="flex flex-wrap gap-1.5 mt-2">
                  <span
                    v-for="(t, i) in selectedScenario.rewards.text"
                    :key="i"
                    class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border"
                    :class="rewardTextStyle(t)"
                  >{{ t }}</span>
                </div>
                <div class="mt-3 px-2.5 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-white/60 italic">Zlato a ZK přidejte ručně svým postavám, reputaci a prosperitu v nastavení družiny.</div>
              </div>

              <!-- item designs (hidden for uncompleted in spoiler mode) -->
              <div v-if="(!campaignStore.hideSpoilers || selectedScenario.computedStatus === 'completed') && selectedScenario.rewards.itemDesigns?.length">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Návrhy předmětů</h3>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="item in selectedScenario.rewards.itemDesigns"
                    :key="item"
                    class="text-xs bg-white/[0.04] text-gray-400 px-2 py-1 rounded-lg border border-white/[0.06]"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>

              <!-- achievements awarded -->
              <div v-if="selectedScenario.achievementsAwarded?.length">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Udělené úspěchy</h3>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="achId in selectedScenario.achievementsAwarded"
                    :key="achId"
                    class="inline-flex items-center gap-1 text-xs bg-green-900/20 text-green-400 px-2.5 py-1 rounded-lg border border-green-800/30"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    {{ achievementName(achId) }}
                  </span>
                </div>
              </div>

              <!-- achievements lost -->
              <div v-if="selectedScenario.achievementsLost?.length">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ztracené úspěchy</h3>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="achId in selectedScenario.achievementsLost"
                    :key="achId"
                    class="inline-flex items-center gap-1 text-xs bg-red-900/20 text-red-400 px-2.5 py-1 rounded-lg border border-red-800/30"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                    {{ achievementName(achId) }}
                  </span>
                </div>
              </div>

              <!-- treasures (hidden for uncompleted in spoiler mode) -->
              <div v-if="selectedScenario.treasures?.length && (!campaignStore.hideSpoilers || selectedScenario.computedStatus === 'completed')">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Poklady</h3>
                <div class="space-y-1.5">
                  <div
                    v-for="t in selectedScenario.treasures"
                    :key="t.id"
                    class="flex items-center gap-2 text-xs"
                  >
                    <span
                      class="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                      :class="selectedScenario.state.treasuresLooted.includes(t.id)
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-700/30'
                        : 'bg-white/[0.04] text-gray-500 border border-white/[0.06]'"
                    >
                      {{ t.id }}
                    </span>
                    <span class="text-gray-400">{{ translateGameTags(t.description) }}</span>
                    <span v-if="selectedScenario.state.treasuresLooted.includes(t.id)" class="text-yellow-500/60 text-[10px]">vyzvednuto</span>
                  </div>
                </div>
              </div>

              <!-- monsters -->
              <div v-if="selectedMonsters.length > 0">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Příšery
                  <span class="text-gray-600 normal-case font-normal ml-1">· {{ playerCount }} hráči · {{ selectedMonsterTotalCount }} celkem</span>
                </h3>
                <div class="grid grid-cols-2 gap-1.5">
                  <button
                    v-for="m in selectedMonsters"
                    :key="m.id"
                    class="rounded-lg px-2.5 py-2 border text-left transition-colors"
                    :class="m.isBoss
                      ? 'bg-red-900/15 border-red-900/30 col-span-2 hover:bg-red-900/25'
                      : 'bg-white/[0.03] border-gh-border/30 hover:bg-white/[0.06]'"
                    @click.stop="openMonsterDetail(m.id)"
                  >
                    <div class="flex items-center gap-1.5 text-sm leading-tight" :class="m.isBoss ? 'text-red-400 font-semibold' : 'text-gray-300'">
                      {{ m.nameCz }}
                      <img v-if="m.flies" src="/img/icons/general/flying.png" alt="Létá" class="w-3.5 h-3.5 opacity-50" />
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <template v-if="m.isBoss">
                        <span class="px-1.5 py-0.5 rounded bg-red-900/30 text-red-400/90 font-display text-[11px]">BOSS</span>
                      </template>
                      <template v-else>
                        <div v-if="m.elite > 0" class="flex items-center gap-0.5" :title="`${m.elite}× elitní`">
                          <svg class="w-4 h-4 text-yellow-400/90" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3 6h6l-4.5 4 1.5 6L12 15l-6 3 1.5-6L3 8h6z" />
                          </svg>
                          <span class="text-xs font-semibold text-yellow-400/90">{{ m.elite }}</span>
                        </div>
                        <div v-if="m.normal > 0" class="flex items-center gap-0.5" :title="`${m.normal}× běžný`">
                          <svg class="w-4 h-4 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="8" />
                          </svg>
                          <span class="text-xs text-gray-200">{{ m.normal }}</span>
                        </div>
                      </template>
                    </div>
                  </button>
                </div>
              </div>

              <!-- linked scenarios (linksTo) -->
              <div v-if="selectedScenario.linksTo?.length">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Odemyká scénáře</h3>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="linkId in selectedScenario.linksTo"
                    :key="linkId"
                    class="text-xs bg-white/[0.04] text-blue-400 px-2.5 py-1 rounded-lg border border-blue-800/20 hover:bg-blue-900/20 hover:border-blue-700/30 transition-colors cursor-pointer"
                    @click="closeModal(); goToFlowchart(String(linkId))"
                  >
                    {{ linkedScenarioName(linkId) }}
                  </button>
                </div>
              </div>

              <!-- linked from -->
              <div v-if="selectedScenario.linkedFrom?.length">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Odemčeno z</h3>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="linkId in selectedScenario.linkedFrom"
                    :key="linkId"
                    class="text-xs bg-white/[0.04] text-gray-400 px-2.5 py-1 rounded-lg border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer"
                    @click="closeModal(); goToFlowchart(String(linkId))"
                  >
                    {{ linkedScenarioName(linkId) }}
                  </button>
                </div>
              </div>

              <!-- notes -->
              <div>
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Poznámky</h3>
                <textarea
                  :value="selectedScenario.state.notes"
                  placeholder="Poznámky ke scénáři..."
                  rows="3"
                  class="gh-input w-full text-sm resize-none"
                  @input="scenarioStore.setNotes(selectedScenario?.id ?? '', inputValue($event))"
                ></textarea>
              </div>
            </div>

            <!-- actions -->
            <div class="px-6 py-4 border-t border-gh-border space-y-3">
              <div class="flex flex-col gap-2">
                <button
                  v-if="selectedScenario.computedStatus === ScenarioStatus.LOCKED || selectedScenario.computedStatus === ScenarioStatus.BLOCKED"
                  class="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all text-sm"
                  @click="scenarioStore.unlockScenario(selectedScenario.id)"
                >
                  Odemknout scénář
                </button>
                <button
                  v-if="selectedScenario.computedStatus === ScenarioStatus.AVAILABLE || selectedScenario.computedStatus === ScenarioStatus.ATTEMPTED"
                  class="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] transition-all text-sm"
                  @click="scenarioStore.completeScenario(selectedScenario.id)"
                >
                  Označit jako dokončené
                </button>
                <button
                  v-if="selectedScenario.computedStatus === ScenarioStatus.AVAILABLE"
                  class="w-full py-2 bg-orange-600/15 text-orange-400 border border-orange-600/30 rounded-lg font-medium hover:bg-orange-600/25 transition-colors text-sm"
                  @click="scenarioStore.markAttempted(selectedScenario.id)"
                >
                  Označit jako pokus
                </button>
                <button
                  v-if="selectedScenario.computedStatus === ScenarioStatus.COMPLETED || selectedScenario.computedStatus === ScenarioStatus.ATTEMPTED"
                  class="w-full py-1.5 bg-white/[0.03] text-gray-500 rounded-lg text-xs hover:bg-white/[0.06] hover:text-gray-400 transition-colors border border-gh-border/40"
                  @click="scenarioStore.resetScenario(selectedScenario.id)"
                >
                  Resetovat scénář
                </button>
              </div>
              <div class="flex items-center justify-between gap-3">
                <button
                  class="text-xs text-gray-500 hover:text-gh-primary transition-colors flex items-center gap-1.5"
                  @click="closeModal(); goToFlowchart(selectedScenario?.id ?? '')"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5" />
                  </svg>
                  Zobrazit na diagramu
                </button>
                <button
                  class="gh-btn-secondary text-xs px-4 py-2"
                  @click="closeModal"
                >
                  Zavřít
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Monster detail popup -->
      <Transition name="modal">
        <div
          v-if="selectedMonsterDetail"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4"
          @click.self="closeMonsterDetail"
        >
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-sm bg-gh-card border border-gh-border rounded-2xl shadow-2xl overflow-hidden">
            <!-- header -->
            <div class="px-5 pt-5 pb-3 border-b border-gh-border/50">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-display text-lg font-bold" :class="selectedMonsterDetail.isBoss ? 'text-red-400' : 'text-gray-200'">
                    {{ selectedMonsterDetail.nameCz }}
                  </h3>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs text-gray-500">{{ selectedMonsterDetail.name }}</span>
                    <span v-if="(selectedMonsterDetail as any).type" class="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-500 border border-gh-border/30">
                      {{ (selectedMonsterDetail as any).type }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="(selectedMonsterDetail as any).flies" class="px-2 py-0.5 rounded-full bg-sky-900/25 text-sky-400 text-[10px] border border-sky-900/30 flex items-center gap-1">
                    <img src="/img/icons/general/flying.png" alt="" class="w-3 h-3" />
                    létá
                  </span>
                  <span v-if="selectedMonsterDetail.isBoss" class="px-2 py-0.5 rounded-full bg-red-900/25 text-red-400 text-[10px] font-display border border-red-900/30">
                    BOSS
                  </span>
                  <button class="p-1 text-gray-600 hover:text-gray-300 transition-colors" @click="closeMonsterDetail">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- body -->
            <div class="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-4">
              <!-- description -->
              <p v-if="(selectedMonsterDetail as any).description" class="text-sm text-gray-400 leading-relaxed italic">
                {{ (selectedMonsterDetail as any).description }}
              </p>

              <!-- stats -->
              <div v-if="selectedMonsterDetail.normalStats || selectedMonsterDetail.eliteStats">
                <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Staty
                  <span class="text-gray-600 normal-case font-normal">· úroveň {{ selectedMonsterDetail.level }}</span>
                </h4>
                <div class="grid gap-2" :class="selectedMonsterDetail.eliteStats ? 'grid-cols-2' : 'grid-cols-1'">
                  <!-- Normal / Boss stats -->
                  <div v-if="selectedMonsterDetail.normalStats" class="rounded-lg border p-3" :class="selectedMonsterDetail.isBoss ? 'border-red-900/30 bg-red-900/10' : 'border-gh-border/30 bg-white/[0.02]'">
                    <div class="text-[10px] font-semibold uppercase tracking-wider mb-2" :class="selectedMonsterDetail.isBoss ? 'text-red-400' : 'text-gray-200'">
                      {{ selectedMonsterDetail.isBoss ? 'Boss' : 'Běžný' }}
                    </div>
                    <div class="space-y-1 text-xs">
                      <div class="flex justify-between items-center">
                        <span class="flex items-center gap-1 text-gray-500"><img src="/img/icons/general/heal.png" class="w-3.5 h-3.5 opacity-60" alt="" /> Životy</span>
                        <span class="font-medium" :class="selectedMonsterDetail.isBoss ? 'text-red-400' : 'text-gray-200'">{{ resolveStat(selectedMonsterDetail.normalStats.health) }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="flex items-center gap-1 text-gray-500"><img src="/img/icons/general/attack.png" class="w-3.5 h-3.5 opacity-60" alt="" /> Útok</span>
                        <span class="font-medium" :class="selectedMonsterDetail.isBoss ? 'text-red-400' : 'text-gray-200'">{{ resolveStat(selectedMonsterDetail.normalStats.attack) }}</span>
                      </div>
                      <div v-if="selectedMonsterDetail.normalStats.movement !== undefined" class="flex justify-between items-center">
                        <span class="flex items-center gap-1 text-gray-500"><img src="/img/icons/general/move.png" class="w-3.5 h-3.5 opacity-60" alt="" /> Pohyb</span>
                        <span class="font-medium" :class="selectedMonsterDetail.isBoss ? 'text-red-400' : 'text-gray-200'">{{ selectedMonsterDetail.normalStats.movement }}</span>
                      </div>
                      <div v-if="selectedMonsterDetail.normalStats.range" class="flex justify-between items-center">
                        <span class="flex items-center gap-1 text-gray-500"><img src="/img/icons/general/range.png" class="w-3.5 h-3.5 opacity-60" alt="" /> Dostřel</span>
                        <span class="font-medium" :class="selectedMonsterDetail.isBoss ? 'text-red-400' : 'text-gray-200'">{{ selectedMonsterDetail.normalStats.range }}</span>
                      </div>
                      <div v-if="getActionEntries(selectedMonsterDetail.normalStats.actions).length" class="pt-1.5 mt-1.5 border-t border-white/[0.06] space-y-1">
                        <div v-for="(a, i) in getActionEntries(selectedMonsterDetail.normalStats.actions)" :key="i" class="flex items-center gap-1.5" :class="selectedMonsterDetail.isBoss ? 'text-red-400/80' : 'text-gray-400'">
                          <img v-if="a.icon" :src="a.icon" class="w-3.5 h-3.5" alt="" />
                          <span>{{ a.label }}</span>
                          <span v-if="a.value" class="font-medium" :class="selectedMonsterDetail.isBoss ? 'text-red-400' : 'text-gray-200'">{{ a.value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Elite stats -->
                  <div v-if="selectedMonsterDetail.eliteStats" class="rounded-lg border border-yellow-900/30 bg-yellow-900/10 p-3">
                    <div class="text-[10px] font-semibold uppercase tracking-wider text-yellow-400 mb-2">Elitní</div>
                    <div class="space-y-1 text-xs">
                      <div class="flex justify-between items-center">
                        <span class="flex items-center gap-1 text-gray-500"><img src="/img/icons/general/heal.png" class="w-3.5 h-3.5 opacity-60" alt="" /> Životy</span>
                        <span class="text-yellow-300/90 font-medium">{{ resolveStat(selectedMonsterDetail.eliteStats.health) }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="flex items-center gap-1 text-gray-500"><img src="/img/icons/general/attack.png" class="w-3.5 h-3.5 opacity-60" alt="" /> Útok</span>
                        <span class="text-yellow-300/90 font-medium">{{ resolveStat(selectedMonsterDetail.eliteStats.attack) }}</span>
                      </div>
                      <div v-if="selectedMonsterDetail.eliteStats.movement !== undefined" class="flex justify-between items-center">
                        <span class="flex items-center gap-1 text-gray-500"><img src="/img/icons/general/move.png" class="w-3.5 h-3.5 opacity-60" alt="" /> Pohyb</span>
                        <span class="text-yellow-300/90 font-medium">{{ selectedMonsterDetail.eliteStats.movement }}</span>
                      </div>
                      <div v-if="selectedMonsterDetail.eliteStats.range" class="flex justify-between items-center">
                        <span class="flex items-center gap-1 text-gray-500"><img src="/img/icons/general/range.png" class="w-3.5 h-3.5 opacity-60" alt="" /> Dostřel</span>
                        <span class="text-yellow-300/90 font-medium">{{ selectedMonsterDetail.eliteStats.range }}</span>
                      </div>
                      <div v-if="getActionEntries(selectedMonsterDetail.eliteStats.actions).length" class="pt-1.5 mt-1.5 border-t border-white/[0.06] space-y-1">
                        <div v-for="(a, i) in getActionEntries(selectedMonsterDetail.eliteStats.actions)" :key="i" class="flex items-center gap-1.5 text-yellow-400/80">
                          <img v-if="a.icon" :src="a.icon" class="w-3.5 h-3.5" alt="" />
                          <span>{{ a.label }}</span>
                          <span v-if="a.value" class="text-yellow-300/90 font-medium">{{ a.value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- immunities (bosses) -->
              <div v-if="selectedMonsterDetail.statsData?.immunities?.length">
                <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Imunity</h4>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="imm in selectedMonsterDetail.statsData.immunities"
                    :key="imm"
                    class="text-[11px] px-2 py-0.5 rounded bg-purple-900/20 text-purple-400/90 border border-purple-900/30 flex items-center gap-1"
                  >
                    <img v-if="CONDITION_ICONS[imm]" :src="CONDITION_ICONS[imm]" class="w-3.5 h-3.5" alt="" />
                    {{ CONDITION_LABELS[imm] ?? imm }}
                  </span>
                </div>
              </div>

              <!-- scenarios -->
              <div>
                <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Výskyt ve scénářích
                  <span class="text-gray-600 normal-case font-normal">({{ selectedMonsterDetail.appearsIn.length }})</span>
                </h4>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="s in selectedMonsterDetail.appearsIn"
                    :key="s.id"
                    class="text-xs px-2 py-1 rounded-lg border transition-colors cursor-pointer"
                    :class="selectedScenario?.id === s.id
                      ? 'bg-gh-primary/15 text-gh-primary border-gh-primary/30'
                      : 'bg-white/[0.04] text-gray-400 border-gh-border/30 hover:bg-white/[0.06]'"
                    @click="closeMonsterDetail(); openModal({ id: s.id })"
                  >
                    #{{ s.id }} {{ s.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-scroll::-webkit-scrollbar {
  width: 4px;
}
.modal-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.modal-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
</style>
