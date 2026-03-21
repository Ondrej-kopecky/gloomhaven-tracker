<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useQuestStore } from '@/stores/questStore'

const router = useRouter()
const campaignStore = useCampaignStore()
const scenarioStore = useScenarioStore()
const questStore = useQuestStore()

const activeTab = ref<'quests' | 'timeline'>('quests')

onMounted(async () => {
  if (!campaignStore.hasCampaign) {
    router.push('/kampan')
    return
  }
  await scenarioStore.loadScenarioData()
  await questStore.loadQuestData()
})

const completedScenarios = computed(() => {
  return scenarioStore.completedScenarios
    .filter((s) => s.state.completedAt)
    .sort((a, b) => {
      const dateA = a.state.completedAt ?? ''
      const dateB = b.state.completedAt ?? ''
      return dateA.localeCompare(dateB)
    })
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div v-if="campaignStore.hasCampaign" class="max-w-3xl mx-auto">
    <div class="gh-page-header">
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Příběh</h1>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-white/[0.03] rounded-xl p-1">
      <button
        @click="activeTab = 'quests'"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg text-sm font-display font-medium transition-all',
          activeTab === 'quests'
            ? 'bg-gh-primary/20 text-gh-primary'
            : 'text-gray-500 hover:text-gray-300'
        ]"
      >
        Questové linie
        <span v-if="questStore.activeQuests.length" class="ml-1.5 text-xs opacity-70">
          ({{ questStore.activeQuests.length }})
        </span>
      </button>
      <button
        @click="activeTab = 'timeline'"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg text-sm font-display font-medium transition-all',
          activeTab === 'timeline'
            ? 'bg-gh-primary/20 text-gh-primary'
            : 'text-gray-500 hover:text-gray-300'
        ]"
      >
        Časová osa
        <span v-if="completedScenarios.length" class="ml-1.5 text-xs opacity-70">
          ({{ completedScenarios.length }})
        </span>
      </button>
    </div>

    <!-- Quest Lines Tab -->
    <div v-if="activeTab === 'quests'">
      <!-- Active Quests -->
      <div v-if="questStore.activeQuests.length" class="space-y-3 mb-8">
        <h2 class="font-display text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Aktivní questy
        </h2>
        <div
          v-for="quest in questStore.activeQuests"
          :key="quest.id"
          class="gh-card p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-display font-semibold text-gray-200">{{ quest.name }}</h3>
            <span class="text-xs text-gh-primary font-display font-bold">
              {{ quest.completedCount }}/{{ quest.totalChecks }}
            </span>
          </div>
          <!-- Progress bar -->
          <div class="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
            <div
              class="h-full bg-gh-primary rounded-full transition-all duration-500"
              :style="{ width: quest.progressPercent + '%' }"
            />
          </div>
          <!-- Checkpoints -->
          <div class="flex flex-wrap gap-1.5">
            <div
              v-for="(check, idx) in quest.checks"
              :key="idx"
              :class="[
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-bold transition-all',
                check.completed
                  ? 'bg-green-900/30 text-green-400 border border-green-800/30'
                  : 'bg-white/[0.03] text-gray-600 border border-white/[0.05]'
              ]"
            >
              {{ idx + 1 }}
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Quests -->
      <div v-if="questStore.completedQuests.length" class="space-y-3 mb-8">
        <h2 class="font-display text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Dokončené questy
        </h2>
        <div
          v-for="quest in questStore.completedQuests"
          :key="quest.id"
          class="gh-card p-4 opacity-70"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-display font-semibold text-gray-300">{{ quest.name }}</h3>
            <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Not Started -->
      <div v-if="questStore.notStartedQuests.length">
        <h2 class="font-display text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Neodkryté questy
        </h2>
        <p class="text-sm text-gray-600">
          {{ questStore.notStartedQuests.length }} questových linií čeká na objevení.
        </p>
      </div>

      <!-- Empty state -->
      <div v-if="!questStore.isDataLoaded" class="text-center py-20">
        <p class="text-gray-600 text-sm">Načítám questové linie...</p>
      </div>
    </div>

    <!-- Timeline Tab -->
    <div v-if="activeTab === 'timeline'">
      <div v-if="completedScenarios.length === 0" class="text-center py-20">
        <div class="inline-block p-4 rounded-2xl bg-white/[0.02] mb-4">
          <svg class="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <p class="text-gray-500 text-lg font-display tracking-wide">Zatím žádné dokončené scénáře</p>
        <p class="text-gray-600 text-sm mt-2">Dokončete první scénář a příběh se začne vytvářet.</p>
      </div>

      <!-- Timeline -->
      <div v-else class="relative">
        <!-- Vertical line -->
        <div class="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-gh-primary/40 via-gh-border to-transparent" />

        <div
          v-for="(s, idx) in completedScenarios"
          :key="s.id"
          class="relative pl-14 pb-8"
        >
          <!-- Timeline dot -->
          <div
            class="absolute left-3 w-5 h-5 rounded-full border-2 border-gh-primary/60 bg-gh-dark flex items-center justify-center"
          >
            <div class="w-2 h-2 rounded-full bg-gh-primary" />
          </div>

          <!-- Counter badge -->
          <span class="absolute left-0 -top-1 text-[9px] text-gray-600 font-display">{{ idx + 1 }}</span>

          <!-- Card -->
          <div class="gh-card p-5">
            <div class="flex items-start justify-between mb-2">
              <div>
                <span class="text-gh-primary font-display font-bold text-sm">#{{ s.id }}</span>
                <h3 class="font-display text-lg font-semibold text-gray-200 tracking-wide">{{ s.name }}</h3>
                <p v-if="s.location" class="text-xs text-gray-600 mt-0.5">{{ s.location }}</p>
              </div>
              <span v-if="s.state.completedAt" class="text-[10px] text-gray-600 shrink-0 mt-1">
                {{ formatDate(s.state.completedAt) }}
              </span>
            </div>

            <p v-if="s.summary" class="text-sm text-gray-400 italic leading-relaxed mt-3 p-3 rounded-lg bg-white/[0.02] border-l-2 border-gh-primary/30">
              {{ s.summary }}
            </p>
            <p v-else class="text-xs text-gray-600 italic mt-2">
              Příběhový text zatím nebyl přidán.
            </p>

            <!-- Rewards summary -->
            <div v-if="s.rewards" class="flex flex-wrap gap-2 mt-3">
              <span v-if="s.rewards.gold" class="gh-badge bg-yellow-900/15 text-yellow-400/80 border border-yellow-800/20">
                {{ s.rewards.gold }} zl.
              </span>
              <span v-if="s.rewards.xp" class="gh-badge bg-blue-900/15 text-blue-400/80 border border-blue-800/20">
                {{ s.rewards.xp }} ZK
              </span>
              <span v-if="s.achievementsAwarded?.length" class="gh-badge bg-green-900/15 text-green-400/80 border border-green-800/20">
                +{{ s.achievementsAwarded.length }} úspěch
              </span>
            </div>

            <!-- Notes -->
            <div v-if="s.state.notes" class="mt-3 pt-3 border-t border-gh-border/30">
              <p class="text-xs text-gray-500">{{ s.state.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
