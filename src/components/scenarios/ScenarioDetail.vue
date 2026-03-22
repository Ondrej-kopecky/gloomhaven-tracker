<script setup lang="ts">
import { computed, ref } from 'vue'
import { ScenarioStatus } from '@/models/types'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useCampaignStore } from '@/stores/campaignStore'
import type { ItemDefinition } from '@/models/Item'
import itemsData from '@/data/items.json'

const props = defineProps<{
  scenarioId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const scenarioStore = useScenarioStore()
const achievementStore = useAchievementStore()
const characterStore = useCharacterStore()
const campaignStore = useCampaignStore()

const allItems = itemsData as ItemDefinition[]
const itemSearch = ref('')
const showItemPicker = ref(false)

// Nákresy předmětů jsou #71–95 (Random Item Design deck)
const designItems = allItems.filter((item) => item.id >= 71 && item.id <= 95)

const itemSearchResults = computed(() => {
  const q = itemSearch.value.toLowerCase().trim()
  if (!q) return designItems
  return designItems.filter((item) =>
    item.name.toLowerCase().includes(q) || String(item.id) === q
  )
})

function unlockItem(itemId: number) {
  campaignStore.unlockItemDesign(itemId)
  itemSearch.value = ''
  showItemPicker.value = false
}

function removeItem(itemId: number) {
  campaignStore.removeItemDesign(itemId)
}

function getItemName(itemId: number): string {
  return allItems.find((i) => i.id === itemId)?.name ?? `#${itemId}`
}

const scenarioUnlockedItems = computed(() => {
  return campaignStore.unlockedItemDesigns
    .map((id) => allItems.find((i) => i.id === id))
    .filter((i): i is ItemDefinition => !!i)
})

const hasRandomItemTreasure = computed(() =>
  scenario.value?.treasures.some((t) => /náhodný design předmětu/i.test(t.description)) ?? false
)

const hasRandomScenarioTreasure = computed(() =>
  scenario.value?.treasures.some((t) => /náhodný vedlejší scénář/i.test(t.description)) ?? false
)

const scenarioSearch = ref('')
const showScenarioPicker = ref(false)

const scenarioSearchResults = computed(() => {
  const q = scenarioSearch.value.toLowerCase().trim()
  if (!q) return []
  return scenarioStore.allScenarios
    .filter((s) => {
      const name = s.displayName.toLowerCase()
      return name.includes(q) || s.id === q
    })
    .slice(0, 8)
})

const manuallyUnlockedScenariosList = computed(() => {
  return campaignStore.manuallyUnlockedScenarios
    .map((id) => {
      const def = scenarioStore.getDefinition(id)
      return def ? { id: def.id, name: def.nameCz ?? def.name } : null
    })
    .filter((s): s is { id: string; name: string } => !!s)
})

function unlockRandomScenario(id: string) {
  campaignStore.manuallyUnlockScenario(id)
  scenarioSearch.value = ''
  showScenarioPicker.value = false
}

function removeUnlockedScenario(id: string) {
  campaignStore.removeManuallyUnlockedScenario(id)
}

function onTreasureLoot(treasureId: string, description: string) {
  const wasLooted = state.value.treasuresLooted.includes(treasureId)
  scenarioStore.lootTreasure(scenario.value!.id, treasureId)
  if (!wasLooted) {
    if (/náhodný vedlejší scénář/i.test(description)) {
      showScenarioPicker.value = true
    } else if (/náhodný design předmětu/i.test(description)) {
      showItemPicker.value = true
    }
  }
}

const scenario = computed(() => scenarioStore.getDefinition(props.scenarioId))
const state = computed(() => scenarioStore.getState(props.scenarioId))
const status = computed(() => scenarioStore.getScenarioStatus(props.scenarioId))
const linksFrom = computed(() => scenarioStore.getLinksFrom(props.scenarioId))
const linksTo = computed(() => scenarioStore.getLinksTo(props.scenarioId))

const scenarioLevel = computed(() => {
  const avg = characterStore.averageLevel
  return Math.ceil(avg / 2)
})

const requirementLabels = computed(() => {
  const s = scenario.value
  if (!s?.requiredBy?.length) return [] as { text: string; met: boolean }[]
  return s.requiredBy.flatMap((cond) => {
    const labels: { text: string; met: boolean }[] = []
    for (const id of cond.complete ?? []) {
      if (/^\d+$/.test(id)) {
        const name = scenarioStore.getDefinition(id)?.nameCz ?? scenarioStore.getDefinition(id)?.name ?? `#${id}`
        const met = scenarioStore.getScenarioStatus(id) === ScenarioStatus.COMPLETED
        labels.push({ text: `Dokončit scénář #${id} ${name}`, met })
      } else {
        const name = achievementStore.getName(id)
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
        const name = achievementStore.getName(id)
        const met = !(achievementStore.isGlobalAchieved(id) || achievementStore.isPartyAchieved(id))
        labels.push({ text: `Bez úspěchu: ${name}`, met })
      }
    }
    return labels
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

const statusColors: Record<string, string> = {
  [ScenarioStatus.HIDDEN]: 'text-gray-600 bg-gray-900/50',
  [ScenarioStatus.COMPLETED]: 'text-green-400 bg-green-900/25',
  [ScenarioStatus.AVAILABLE]: 'text-blue-400 bg-blue-900/25',
  [ScenarioStatus.LOCKED]: 'text-gray-400 bg-gray-800/50',
  [ScenarioStatus.BLOCKED]: 'text-red-400 bg-red-900/25',
  [ScenarioStatus.REQUIRED]: 'text-yellow-400 bg-yellow-900/25',
  [ScenarioStatus.ATTEMPTED]: 'text-orange-400 bg-orange-900/25',
}

const isCompleted = computed(() => status.value === ScenarioStatus.COMPLETED)
const isAvailable = computed(() => status.value === ScenarioStatus.AVAILABLE)
const isAttempted = computed(() => status.value === ScenarioStatus.ATTEMPTED)
const isLocked = computed(() => status.value === ScenarioStatus.LOCKED || status.value === ScenarioStatus.BLOCKED)

function unlock() {
  scenarioStore.unlockScenario(props.scenarioId)
}

function complete() {
  scenarioStore.completeScenario(props.scenarioId)
}

function markAttempted() {
  scenarioStore.markAttempted(props.scenarioId)
}

function reset() {
  scenarioStore.resetScenario(props.scenarioId)
}

function setChoice(chosenId: number) {
  scenarioStore.setChoice(props.scenarioId, chosenId)
}

function inputValue(e: Event): string {
  return (e.target as HTMLInputElement).value
}
</script>

<template>
  <div
    v-if="scenario"
    class="bg-gh-dark/95 backdrop-blur-xl border border-gh-border rounded-2xl w-full lg:w-80 h-full lg:h-auto lg:max-h-[80vh] shadow-2xl shadow-black/60 flex flex-col"
  >
    <!-- Header (fixed) -->
    <div class="px-5 pt-5 pb-3 shrink-0">
      <div class="flex items-start justify-between mb-3">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="font-display text-2xl font-bold text-gh-primary">#{{ scenario.id }}</span>
            <span :class="statusColors[status]" class="gh-badge">
              {{ statusLabels[status] }}
            </span>
          </div>
          <h3 class="font-display text-lg font-semibold text-gray-200 mt-1.5 tracking-wide">{{ scenario.nameCz ?? scenario.name }}</h3>
          <div class="flex items-center gap-2 mt-0.5">
            <p class="text-xs text-gray-500">{{ scenario.location }}</p>
            <span v-if="characterStore.activeCharacters.length > 0" class="text-xs text-gray-500">
              · Úroveň scénáře: <span class="text-gh-primary font-semibold">{{ scenarioLevel }}</span>
            </span>
          </div>
        </div>
        <button
          class="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
          @click="emit('close')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tags -->
      <div v-if="scenario.isSide || scenario.hasBoss || scenario.choices?.length || scenario.quests?.length" class="flex flex-wrap gap-1.5">
        <span v-if="scenario.isSide" class="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-gray-500 border border-gh-border/60">
          vedlejší
        </span>
        <span v-if="scenario.hasBoss" class="text-[10px] px-2 py-0.5 rounded-full bg-red-900/20 text-red-400/80 border border-red-900/30">
          boss
        </span>
        <span v-if="scenario.choices?.length" class="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/20 text-purple-400/80 border border-purple-900/30">
          rozhodnutí
        </span>
        <span v-if="scenario.quests?.length" class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/20 text-cyan-400/80 border border-cyan-900/30">
          quest
        </span>
      </div>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto overscroll-contain px-5 pb-2 min-h-0">
      <!-- Summary (only when completed) -->
      <div v-if="scenario.summary && isCompleted" class="mb-4 p-3 rounded-lg bg-white/[0.02] border border-gh-border/40">
        <p class="text-sm text-gray-400 italic leading-relaxed">{{ scenario.summary }}</p>
      </div>

      <!-- Requirements (conditions to play) -->
      <div v-if="requirementLabels.length > 0" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Podmínky pro zahrání</h4>
        <div v-for="(req, i) in requirementLabels" :key="i" class="text-sm py-0.5 flex items-center gap-1.5">
          <span v-if="req.met" class="text-green-400/90 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ req.text }}
          </span>
          <span v-else class="text-yellow-400/90 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {{ req.text }}
          </span>
        </div>
      </div>

      <!-- Rewards (hidden until completed) -->
      <div v-if="scenario.rewards && isCompleted" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Odměny</h4>
        <div class="grid grid-cols-2 gap-1.5 text-sm">
          <div v-if="scenario.rewards.gold" class="text-yellow-400/90 flex items-center gap-1.5">
            <span class="w-1 h-1 rounded-full bg-yellow-400/60" />{{ scenario.rewards.gold }} zl.
          </div>
          <div v-if="scenario.rewards.xp" class="text-blue-400/90 flex items-center gap-1.5">
            <span class="w-1 h-1 rounded-full bg-blue-400/60" />{{ scenario.rewards.xp }} ZK
          </div>
          <div v-if="scenario.rewards.reputation" class="text-purple-400/90 flex items-center gap-1.5">
            <span class="w-1 h-1 rounded-full bg-purple-400/60" />{{ scenario.rewards.reputation > 0 ? '+' : '' }}{{ scenario.rewards.reputation }} reputace
          </div>
          <div v-if="scenario.rewards.prosperity" class="text-green-400/90 flex items-center gap-1.5">
            <span class="w-1 h-1 rounded-full bg-green-400/60" />+{{ scenario.rewards.prosperity }} blahobyt
          </div>
        </div>
        <div v-if="scenario.rewards.itemDesigns?.length" class="mt-2 text-xs text-gray-400">
          Designy předmětů: {{ scenario.rewards.itemDesigns.join(', ') }}
        </div>
        <div v-if="scenario.rewards.text?.length" class="mt-1.5">
          <p v-for="(t, i) in scenario.rewards.text" :key="i" class="text-xs text-gray-400">{{ t }}</p>
        </div>
      </div>

      <!-- Random item design picker (only for scenarios with random item treasures) -->
      <div v-if="isCompleted && hasRandomItemTreasure" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Vylosovaný předmět</h4>

        <div v-if="scenarioUnlockedItems.length > 0" class="flex flex-col gap-1 mb-2">
          <div v-for="item in scenarioUnlockedItems" :key="item.id" class="flex items-center justify-between text-sm bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-gh-border/30">
            <span class="text-gray-300">
              <span class="text-yellow-400/70 font-display">#{{ item.id }}</span> {{ item.name }}
            </span>
            <button
              class="text-gray-600 hover:text-red-400 transition-colors p-0.5"
              @click="removeItem(item.id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="showItemPicker" class="relative">
          <input
            v-model="itemSearch"
            type="text"
            placeholder="Hledat předmět (název nebo #)..."
            class="gh-input w-full text-sm"
          />
          <div v-if="itemSearchResults.length > 0" class="mt-1 rounded-lg border border-gh-border bg-gh-dark/98 overflow-hidden max-h-48 overflow-y-auto">
            <button
              v-for="item in itemSearchResults"
              :key="item.id"
              class="w-full text-left px-3 py-2 text-sm hover:bg-white/[0.06] transition-colors border-b border-gh-border/20 last:border-0"
              @click="unlockItem(item.id)"
            >
              <span class="text-yellow-400/70 font-display">#{{ item.id }}</span>
              <span class="text-gray-300 ml-1">{{ item.name }}</span>
              <span class="text-gray-600 text-xs ml-1">{{ item.slot }}</span>
            </button>
          </div>
        </div>
        <button
          v-if="!showItemPicker"
          class="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
          @click="showItemPicker = true"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Vybrat vylosovaný předmět
        </button>
      </div>

      <!-- Random scenario unlock (only for scenarios with random scenario treasures) -->
      <div v-if="isCompleted && hasRandomScenarioTreasure" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Vylosovaný scénář</h4>

        <div v-if="manuallyUnlockedScenariosList.length > 0" class="flex flex-col gap-1 mb-2">
          <div v-for="s in manuallyUnlockedScenariosList" :key="s.id" class="flex items-center justify-between text-sm bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-gh-border/30">
            <span class="text-gray-300">
              <span class="text-gh-primary/70 font-display">#{{ s.id }}</span> {{ s.name }}
            </span>
            <button
              class="text-gray-600 hover:text-red-400 transition-colors p-0.5"
              @click="removeUnlockedScenario(s.id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="showScenarioPicker" class="relative">
          <input
            v-model="scenarioSearch"
            type="text"
            placeholder="Hledat scénář (název nebo #)..."
            class="gh-input w-full text-sm"
          />
          <div v-if="scenarioSearchResults.length > 0" class="mt-1 rounded-lg border border-gh-border bg-gh-dark/98 overflow-hidden max-h-48 overflow-y-auto">
            <button
              v-for="s in scenarioSearchResults"
              :key="s.id"
              class="w-full text-left px-3 py-2 text-sm hover:bg-white/[0.06] transition-colors border-b border-gh-border/20 last:border-0"
              @click="unlockRandomScenario(s.id)"
            >
              <span class="text-gh-primary/70 font-display">#{{ s.id }}</span>
              <span class="text-gray-300 ml-1">{{ s.displayName }}</span>
            </button>
          </div>
        </div>
        <button
          v-if="!showScenarioPicker"
          class="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
          @click="showScenarioPicker = true"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Vybrat vylosovaný scénář
        </button>
      </div>

      <!-- Achievements awarded -->
      <div v-if="scenario.achievementsAwarded?.length" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Udělené úspěchy</h4>
        <div v-for="a in scenario.achievementsAwarded" :key="a" class="text-sm text-green-400/90 flex items-center gap-1.5">
          <span class="w-1 h-1 rounded-full bg-green-400/60" /> {{ achievementStore.getName(a) }}
        </div>
      </div>

      <!-- Achievements lost -->
      <div v-if="scenario.achievementsLost?.length" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Ztracené úspěchy</h4>
        <div v-for="a in scenario.achievementsLost" :key="a" class="text-sm text-red-400/90 flex items-center gap-1.5">
          <span class="w-1 h-1 rounded-full bg-red-400/60" /> {{ achievementStore.getName(a) }}
        </div>
      </div>

      <!-- Treasures (hidden until completed) -->
      <div v-if="scenario.treasures.length > 0 && isCompleted" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Poklady</h4>
        <div v-for="t in scenario.treasures" :key="t.id" class="flex items-center gap-2 text-sm py-1">
          <input
            type="checkbox"
            :checked="state.treasuresLooted.includes(t.id)"
            class="accent-yellow-400 rounded"
            @change="onTreasureLoot(t.id, t.description)"
          />
          <span class="text-gray-300">#{{ t.id }} <span v-if="t.description" class="text-gray-500">- {{ t.description }}</span></span>
        </div>
      </div>

      <!-- Choices (decision prompt) -->
      <div v-if="scenario.choices?.length && isCompleted" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Rozhodnutí</h4>
        <p v-if="scenario.prompt" class="text-xs text-gray-400 italic mb-2">{{ scenario.prompt }}</p>
        <div class="flex flex-col gap-1.5">
          <button
            v-for="choiceId in scenario.choices"
            :key="choiceId"
            class="text-left text-sm px-3 py-2 rounded-lg border transition-all duration-200"
            :class="state.choice === choiceId
              ? 'bg-purple-900/25 border-purple-600/40 text-purple-300'
              : 'bg-white/[0.02] border-gh-border text-gray-400 hover:border-gh-border-light'"
            @click="setChoice(choiceId)"
          >
            Scénář #{{ choiceId }}
            <span class="text-gray-500 text-xs">
              {{ scenarioStore.getDefinition(String(choiceId))?.nameCz ?? scenarioStore.getDefinition(String(choiceId))?.name }}
            </span>
          </button>
        </div>
      </div>

      <!-- Connections: links to (hidden until completed) -->
      <div v-if="linksFrom.length > 0 && isCompleted" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Odemyká</h4>
        <div v-for="s in linksFrom" :key="s.id" class="text-sm text-gray-400 py-0.5">
          <span class="text-gh-primary/60 font-display">#{{ s.id }}</span>
          <span class="text-gray-600 ml-1">{{ s.nameCz ?? s.name }}</span>
        </div>
      </div>

      <!-- Connections: linked from -->
      <div v-if="linksTo.length > 0" class="mb-4">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Odemčeno z</h4>
        <div v-for="s in linksTo" :key="s.id" class="text-sm text-gray-400 py-0.5">
          <span class="text-gh-primary/60 font-display">#{{ s.id }}</span>
          <span class="text-gray-600 ml-1">{{ s.nameCz ?? s.name }}</span>
        </div>
      </div>

      <!-- Notes -->
      <div class="mb-2">
        <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Poznámky</h4>
        <textarea
          :value="state.notes"
          placeholder="Poznámky ke scénáři..."
          class="gh-input w-full resize-y min-h-[60px] text-sm"
          @input="scenarioStore.setNotes(scenario.id, inputValue($event))"
        />
      </div>
    </div>

    <!-- Actions (fixed footer) -->
    <div class="shrink-0 px-5 pb-5 pt-3 border-t border-gh-border/40 flex flex-col gap-2">
      <button
        v-if="isLocked"
        class="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all text-sm"
        @click="unlock"
      >
        Odemknout scénář
      </button>
      <button
        v-if="isAvailable || isAttempted"
        class="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-[0_0_20px_rgba(34,197,94,0.25)] transition-all text-sm"
        @click="complete"
      >
        Označit jako dokončené
      </button>
      <button
        v-if="isAvailable"
        class="w-full py-2 bg-orange-600/15 text-orange-400 border border-orange-600/30 rounded-lg font-medium hover:bg-orange-600/25 transition-colors text-sm"
        @click="markAttempted"
      >
        Označit jako pokus
      </button>
      <button
        v-if="isCompleted || isAttempted"
        class="w-full py-1.5 bg-white/[0.03] text-gray-500 rounded-lg text-xs hover:bg-white/[0.06] hover:text-gray-400 transition-colors border border-gh-border/40"
        @click="reset"
      >
        Resetovat scénář
      </button>
    </div>
  </div>
</template>
