<script setup lang="ts">
import { computed } from 'vue'
import { ScenarioStatus } from '@/models/types'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useAchievementStore } from '@/stores/achievementStore'

const props = defineProps<{
  scenarioId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const scenarioStore = useScenarioStore()
const achievementStore = useAchievementStore()

const scenario = computed(() => scenarioStore.getDefinition(props.scenarioId))
const state = computed(() => scenarioStore.getState(props.scenarioId))
const status = computed(() => scenarioStore.getScenarioStatus(props.scenarioId))
const linksFrom = computed(() => scenarioStore.getLinksFrom(props.scenarioId))
const linksTo = computed(() => scenarioStore.getLinksTo(props.scenarioId))

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
    class="bg-gh-dark/95 backdrop-blur-xl border border-gh-border rounded-2xl p-5 w-80 max-h-[80vh] overflow-y-auto shadow-2xl shadow-black/60"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="font-display text-2xl font-bold text-gh-primary">#{{ scenario.id }}</span>
          <span :class="statusColors[status]" class="gh-badge">
            {{ statusLabels[status] }}
          </span>
        </div>
        <h3 class="font-display text-lg font-semibold text-gray-200 mt-1.5 tracking-wide">{{ scenario.name }}</h3>
        <p class="text-xs text-gray-500 mt-0.5">{{ scenario.location }}</p>
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
    <div class="flex flex-wrap gap-1.5 mb-4">
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

    <!-- Summary (only when completed) -->
    <div v-if="scenario.summary && isCompleted" class="mb-4 p-3 rounded-lg bg-white/[0.02] border border-gh-border/40">
      <p class="text-sm text-gray-400 italic leading-relaxed">{{ scenario.summary }}</p>
    </div>

    <!-- Rewards -->
    <div v-if="scenario.rewards" class="mb-4">
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

    <!-- Treasures -->
    <div v-if="scenario.treasures.length > 0" class="mb-4">
      <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Poklady</h4>
      <div v-for="t in scenario.treasures" :key="t.id" class="flex items-center gap-2 text-sm py-1">
        <input
          type="checkbox"
          :checked="state.treasuresLooted.includes(t.id)"
          class="accent-yellow-400 rounded"
          @change="scenarioStore.lootTreasure(scenario.id, t.id)"
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
            {{ scenarioStore.getDefinition(String(choiceId))?.name }}
          </span>
        </button>
      </div>
    </div>

    <!-- Connections: links to -->
    <div v-if="linksFrom.length > 0" class="mb-4">
      <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Odemyká</h4>
      <div v-for="s in linksFrom" :key="s.id" class="text-sm text-gray-400 py-0.5">
        <span class="text-gh-primary/60 font-display">#{{ s.id }}</span>
        <span class="text-gray-600 ml-1">{{ s.name }}</span>
      </div>
    </div>

    <!-- Connections: linked from -->
    <div v-if="linksTo.length > 0" class="mb-4">
      <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Odemčeno z</h4>
      <div v-for="s in linksTo" :key="s.id" class="text-sm text-gray-400 py-0.5">
        <span class="text-gh-primary/60 font-display">#{{ s.id }}</span>
        <span class="text-gray-600 ml-1">{{ s.name }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-2 mt-5 pt-4 border-t border-gh-border/40">
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

    <!-- Notes -->
    <div class="mt-4">
      <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Poznámky</h4>
      <textarea
        :value="state.notes"
        placeholder="Poznámky ke scénáři..."
        class="gh-input w-full resize-y min-h-[60px] text-sm"
        @input="scenarioStore.setNotes(scenario.id, inputValue($event))"
      />
    </div>
  </div>
</template>
