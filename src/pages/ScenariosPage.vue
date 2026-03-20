<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ScenarioStatus } from '@/models/types'
import { useCampaignStore } from '@/stores/campaignStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useFlowchartStore } from '@/stores/flowchartStore'
import { useAchievementStore } from '@/stores/achievementStore'

const router = useRouter()
const route = useRoute()
const campaignStore = useCampaignStore()
const scenarioStore = useScenarioStore()
const flowchartStore = useFlowchartStore()
const achievementStore = useAchievementStore()

const search = ref('')

/* ── Modal ── */
type ScenarioItem = (typeof scenarioStore.allScenarios)['value'][number]
const selectedScenario = ref<ScenarioItem | null>(null)

function openModal(s: ScenarioItem) {
  selectedScenario.value = s
}
function closeModal() {
  selectedScenario.value = null
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

function linkedScenarioName(id: number): string {
  const def = scenarioStore.getDefinition(String(id))
  return def ? `#${id} ${def.name}` : `#${id}`
}

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
    const scenario = scenarioStore.allScenarios.find(s => s.id === openId)
    if (scenario) {
      openModal(scenario)
    }
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
      return s.name.toLowerCase().includes(q) || s.id.includes(q)
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
          <span class="text-xs text-gray-500">Zamčeno <span class="text-gray-400 font-medium">{{ scenarioStore.allScenarios.length - scenarioStore.completedScenarios.length - scenarioStore.availableScenarios.length }}</span></span>
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
    <div class="flex flex-wrap gap-1.5 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
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
              <span class="text-sm font-medium text-gray-300 truncate">{{ s.name }}</span>
              <span v-if="s.isSide" class="shrink-0 text-[10px] text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">vedlejší</span>
            </div>
            <div class="flex items-center gap-3 text-[11px] text-gray-600">
              <span v-if="s.location">{{ s.location }}</span>
              <!-- reward hints -->
              <span v-if="s.rewards.gold" class="flex items-center gap-0.5">
                <svg class="w-3 h-3 text-yellow-500/50" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
                {{ s.rewards.gold }}
              </span>
              <span v-if="s.rewards.xp" class="flex items-center gap-0.5">
                <svg class="w-3 h-3 text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"/></svg>
                {{ s.rewards.xp }} ZK
              </span>
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
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <!-- backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          <!-- modal panel -->
          <div class="relative w-full max-w-lg bg-gh-card border border-gh-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
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
                  <h2 class="text-lg font-semibold text-gray-200">{{ selectedScenario.name }}</h2>
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

              <!-- rewards -->
              <div v-if="selectedScenario.rewards.gold || selectedScenario.rewards.xp || selectedScenario.rewards.reputation || selectedScenario.rewards.prosperity">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Odměny</h3>
                <div class="flex flex-wrap gap-2">
                  <span v-if="selectedScenario.rewards.gold" class="inline-flex items-center gap-1.5 bg-yellow-900/20 text-yellow-400 text-xs px-2.5 py-1.5 rounded-lg border border-yellow-800/30">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>
                    {{ selectedScenario.rewards.gold }} zlaťáků
                  </span>
                  <span v-if="selectedScenario.rewards.xp" class="inline-flex items-center gap-1.5 bg-blue-900/20 text-blue-400 text-xs px-2.5 py-1.5 rounded-lg border border-blue-800/30">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"/></svg>
                    {{ selectedScenario.rewards.xp }} ZK
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
              </div>

              <!-- item designs -->
              <div v-if="selectedScenario.rewards.itemDesigns?.length">
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

              <!-- treasures -->
              <div v-if="selectedScenario.treasures?.length">
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
                    <span class="text-gray-400">{{ t.description }}</span>
                    <span v-if="selectedScenario.state.treasuresLooted.includes(t.id)" class="text-yellow-500/60 text-[10px]">vyzvednuto</span>
                  </div>
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

            <!-- footer -->
            <div class="px-6 py-4 border-t border-gh-border flex items-center justify-between gap-3">
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
