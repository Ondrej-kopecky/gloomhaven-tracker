<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useCharacterStore } from '@/stores/characterStore'
import { usePartyStore } from '@/stores/partyStore'
import { ScenarioStatus } from '@/models/types'
import { classColor, className } from '@/data/characterClasses'
import { getLevelFromXp, XP_THRESHOLDS } from '@/utils/prosperityTable'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import ClassIcon from '@/components/characters/ClassIcon.vue'

/** Přehled / Dashboard — „kapitánův můstek" kampaně (redesign Phase 03). */

const router = useRouter()
const campaignStore = useCampaignStore()
const scenarioStore = useScenarioStore()
const characterStore = useCharacterStore()
const partyStore = usePartyStore()

onMounted(async () => {
  if (!campaignStore.hasCampaign) {
    router.replace('/kampan')
    return
  }
  await scenarioStore.loadScenarioData()
})

const partyName = computed(
  () => campaignStore.currentCampaign?.party?.name?.trim() || campaignStore.currentCampaign?.name || 'Kampaň',
)

// ── Postup příběhu ──
const total = computed(() => scenarioStore.allScenarios.length)
function countOf(status: string) {
  return scenarioStore.allScenarios.filter((s) => s.computedStatus === status).length
}
const counts = computed(() => ({
  completed: countOf(ScenarioStatus.COMPLETED),
  available: countOf(ScenarioStatus.AVAILABLE),
  attempted: countOf(ScenarioStatus.ATTEMPTED),
  required: countOf(ScenarioStatus.REQUIRED),
  blocked: countOf(ScenarioStatus.BLOCKED),
}))
function pct(n: number) {
  return total.value === 0 ? 0 : (n / total.value) * 100
}

// ── Prosperita / reputace / doporučená úroveň ──
const prosperityLevel = computed(() => partyStore.prosperityLevel) // 1–9
const prosperityIndex = computed(() => partyStore.prosperityIndex) // checkmarky
const PROSPERITY_THRESHOLDS = [0, 4, 9, 15, 22, 30, 39, 50, 64]
const prosperityBarPct = computed(() => {
  const lvl = prosperityLevel.value
  if (lvl >= 9) return 100
  const lo = PROSPERITY_THRESHOLDS[lvl - 1] ?? 0
  const hi = PROSPERITY_THRESHOLDS[lvl] ?? lo + 1
  return hi === lo ? 100 : Math.round(((prosperityIndex.value - lo) / (hi - lo)) * 100)
})
const reputation = computed(() => partyStore.reputation) // -20..+20
const reputationBarPct = computed(() => Math.round(((reputation.value + 20) / 40) * 100))
const scenarioLevel = computed(() => Math.ceil(characterStore.averageLevel / 2)) // 1–7

// ── Roster ──
const activeChars = computed(() => characterStore.activeCharacters)
const retiredCount = computed(() => characterStore.archivedCharacters.length)
function levelProgress(xp: number) {
  const lvl = getLevelFromXp(xp)
  if (lvl >= 9) return 100
  const lo = XP_THRESHOLDS[lvl - 1] ?? 0
  const hi = XP_THRESHOLDS[lvl] ?? lo + 1
  return hi === lo ? 100 : Math.round(((xp - lo) / (hi - lo)) * 100)
}

// ── Naposledy hráno ── (rozehraný = attempted; jinak poslední dokončený)
const inProgressScenario = computed(() => scenarioStore.allScenarios.find((s) => s.computedStatus === ScenarioStatus.ATTEMPTED))
const lastCompleted = computed(() => {
  const states = Object.values(campaignStore.currentCampaign?.scenarios ?? {})
  const done = states.filter((s) => s.completedAt).sort((a, b) => (b.completedAt! > a.completedAt! ? 1 : -1))
  if (!done.length) return null
  return scenarioStore.allScenarios.find((s) => s.id === done[0]!.id) ?? null
})
const lastScenario = computed(() => inProgressScenario.value ?? lastCompleted.value)

// ── Co dál ── (dostupné scénáře — top 4)
const nextUp = computed(() => scenarioStore.availableScenarios.slice(0, 4))

function openScenario(id: string) {
  router.push({ path: '/scenare', query: { open: id } })
}
</script>

<template>
  <div v-if="campaignStore.hasCampaign" class="max-w-6xl mx-auto">
    <!-- Page header -->
    <div class="flex flex-wrap items-end justify-between gap-3 mb-7">
      <div class="gh-page-header !mb-0">
        <div class="gh-micro mb-2">
          Kampaň &middot; {{ counts.completed }} z {{ total || '?' }} scénářů &middot; {{ prosperityLevel }}. úroveň prosperity
        </div>
        <h1 class="gh-display-l">{{ partyName }}</h1>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/diagram" class="gh-btn-secondary text-sm flex items-center gap-1.5">
          Diagram scénářů
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </router-link>
        <router-link to="/kampan" class="gh-btn-ghost text-sm">Kampaně</router-link>
      </div>
    </div>

    <!-- Hero stats row -->
    <div class="grid gap-3 sm:gap-4 mb-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">
      <!-- Postup příběhu -->
      <div class="gh-card p-4 sm:p-6">
        <div class="gh-micro mb-3">Postup příběhu</div>
        <div class="flex items-baseline gap-2.5">
          <span class="font-display text-4xl sm:text-5xl font-bold text-gh-primary leading-none">{{ counts.completed }}</span>
          <span class="text-gray-400 text-sm sm:text-base">/ {{ total || '?' }} scénářů</span>
        </div>
        <!-- multi-segment bar -->
        <div class="mt-4 sm:mt-5 h-2 rounded-full bg-gh-border overflow-hidden flex">
          <div class="h-full bg-gradient-to-r from-gh-primary-dim to-gh-primary" :style="{ width: pct(counts.completed) + '%' }" />
          <div class="h-full bg-gh-available/60" :style="{ width: pct(counts.available) + '%' }" />
          <div class="h-full bg-gh-attempted/60" :style="{ width: pct(counts.attempted) + '%' }" />
          <div class="h-full bg-gh-required/60" :style="{ width: pct(counts.required) + '%' }" />
        </div>
        <div class="mt-3 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5">
          <StatusBadge state="completed" variant="dot" :label="`${counts.completed} dokončeno`" />
          <StatusBadge v-if="counts.available" state="available" variant="dot" :label="`${counts.available} dostupných`" />
          <StatusBadge v-if="counts.attempted" state="attempted" variant="dot" :label="`${counts.attempted} pokus`" />
          <StatusBadge v-if="counts.required" state="required" variant="dot" :label="`${counts.required} povinné`" />
          <StatusBadge v-if="counts.blocked" state="blocked" variant="dot" :label="`${counts.blocked} blokované`" />
        </div>
      </div>

      <!-- 3 malé staty: na mobilu vedle sebe v řádku, od md splynou do hlavního gridu -->
      <div class="grid grid-cols-3 gap-2.5 md:contents">
        <!-- Prosperita -->
        <div class="gh-card p-3 sm:p-5">
          <div class="gh-micro mb-1.5 sm:mb-2">Prosperita</div>
          <div class="flex items-baseline gap-1">
            <span class="font-display text-2xl sm:text-3xl font-bold text-gh-primary leading-none">{{ prosperityLevel }}</span>
            <span class="text-[11px] sm:text-xs text-gh-dim">/ 9</span>
          </div>
          <div class="mt-3 sm:mt-3.5 h-1.5 rounded-full bg-gh-border overflow-hidden">
            <div class="h-full bg-gh-primary-dim" :style="{ width: prosperityBarPct + '%' }" />
          </div>
          <div class="gh-micro mt-1.5 hidden sm:block">{{ prosperityIndex }} {{ prosperityIndex === 1 ? 'checkmark' : 'checkmarků' }}</div>
        </div>

        <!-- Reputace -->
        <div class="gh-card p-3 sm:p-5">
          <div class="gh-micro mb-1.5 sm:mb-2">Reputace</div>
          <div class="flex items-baseline gap-1">
            <span class="font-display text-2xl sm:text-3xl font-bold leading-none" :class="reputation >= 0 ? 'text-gh-completed' : 'text-gh-blocked'">{{ reputation > 0 ? '+' : '' }}{{ reputation }}</span>
            <span class="text-[11px] sm:text-xs text-gh-dim">/ ±20</span>
          </div>
          <div class="mt-3 sm:mt-3.5 h-1.5 rounded-full bg-gh-border overflow-hidden">
            <div class="h-full" :class="reputation >= 0 ? 'bg-gh-completed/70' : 'bg-gh-blocked/70'" :style="{ width: reputationBarPct + '%' }" />
          </div>
          <div class="gh-micro mt-1.5 hidden sm:block">sleva v obchodě: {{ partyStore.shopPriceModifier > 0 ? '+' : '' }}{{ partyStore.shopPriceModifier }}</div>
        </div>

        <!-- Doporučená úroveň scénáře -->
        <div class="gh-card p-3 sm:p-5">
          <div class="gh-micro mb-1.5 sm:mb-2">Úr. scénáře</div>
          <div class="flex items-baseline gap-1">
            <span class="font-display text-2xl sm:text-3xl font-bold text-gh-primary leading-none">{{ scenarioLevel }}</span>
            <span class="text-[11px] sm:text-xs text-gh-dim">/ 7</span>
          </div>
          <div class="mt-3 sm:mt-3.5 flex gap-0.5 sm:gap-1">
            <span v-for="n in 7" :key="n" class="h-1.5 flex-1 rounded-full" :class="n <= scenarioLevel ? 'bg-gh-primary' : 'bg-gh-border'" />
          </div>
          <div class="gh-micro mt-1.5 hidden sm:block">průměr postav ÷ 2</div>
        </div>
      </div>
    </div>

    <!-- Body grid -->
    <div class="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <!-- Roster -->
      <div class="gh-card p-5 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="gh-h2">Družina</h2>
          <span class="text-[11px] text-gh-dim">{{ activeChars.length }} aktivní{{ retiredCount ? ` · ${retiredCount} v důchodu` : '' }}</span>
        </div>

        <div v-if="activeChars.length" class="divide-y divide-gh-border/60">
          <button
            v-for="char in activeChars"
            :key="char.uuid"
            type="button"
            class="w-full flex items-center gap-3.5 py-3 text-left hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
            @click="router.push('/postavy')"
          >
            <span class="w-10 h-10 rounded-full grid place-items-center shrink-0" :style="{ background: classColor(char.classId) + '22', border: '1px solid ' + classColor(char.classId) + '55' }">
              <ClassIcon :class-id="char.classId" :size="24" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium text-gray-200 truncate">{{ char.playerName }}</span>
              <span class="block text-[11px] text-gh-dim truncate">{{ className(char.classId) }}</span>
            </span>
            <span class="text-right shrink-0">
              <span class="gh-micro">Level</span>
              <span class="block font-display font-bold text-lg leading-none" :style="{ color: classColor(char.classId) }">{{ char.level }}</span>
            </span>
            <span class="text-right shrink-0 w-16">
              <span class="gh-micro">XP</span>
              <span class="block text-sm text-gray-300 leading-tight">{{ char.xp }}</span>
              <span class="block mt-1 h-1 rounded-full bg-gh-border overflow-hidden"><span class="block h-full bg-gh-primary-dim" :style="{ width: levelProgress(char.xp) + '%' }" /></span>
            </span>
            <span class="text-right shrink-0 w-14">
              <span class="gh-micro">Zlato</span>
              <span class="block text-sm text-yellow-400/90 leading-tight">{{ char.gold }}</span>
            </span>
          </button>
        </div>

        <div v-else class="py-8 text-center">
          <p class="text-sm text-gray-500">Zatím žádné postavy.</p>
          <router-link to="/postavy" class="gh-btn-secondary text-sm inline-block mt-3">Přidat postavu</router-link>
        </div>
      </div>

      <!-- Right column -->
      <div class="flex flex-col gap-4">
        <!-- Naposledy hráno -->
        <div class="gh-card p-5" :class="{ 'border-gh-primary/30': lastScenario && inProgressScenario }">
          <div class="flex items-center justify-between mb-2">
            <span class="gh-micro">Naposledy hráno</span>
            <StatusBadge v-if="lastScenario" :state="lastScenario.computedStatus" variant="pill" />
          </div>
          <template v-if="lastScenario">
            <div class="font-display text-lg font-semibold text-gh-primary-light leading-snug">
              #{{ lastScenario.id }} &middot; {{ lastScenario.displayName }}
            </div>
            <div v-if="lastScenario.location" class="text-xs text-gh-dim mt-0.5">{{ lastScenario.location }}</div>
            <div class="flex gap-2 mt-4">
              <button class="gh-btn-primary text-sm flex-1" @click="openScenario(lastScenario.id)">{{ inProgressScenario ? 'Pokračovat' : 'Detail' }}</button>
              <router-link to="/diagram" class="gh-btn-ghost text-sm">Diagram</router-link>
            </div>
          </template>
          <div v-else class="text-sm text-gray-500">
            Kampaň ještě nezačala.
            <router-link to="/scenare" class="text-gh-primary/80 hover:text-gh-primary ml-1">Začni scénář&nbsp;#1 →</router-link>
          </div>
        </div>

        <!-- Co dál -->
        <div class="gh-card p-5">
          <h3 class="gh-h3 mb-3">Co dál — dostupné scénáře</h3>
          <ul v-if="nextUp.length" class="space-y-1.5">
            <li v-for="s in nextUp" :key="s.id">
              <button type="button" class="w-full flex items-center gap-3 py-1.5 -mx-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left" @click="openScenario(s.id)">
                <span class="font-display font-bold text-sm text-gh-primary/60 w-7 text-center shrink-0">{{ s.id }}</span>
                <span class="text-sm text-gray-300 truncate flex-1">{{ s.displayName }}</span>
                <span v-if="s.isSide" class="text-[10px] text-gh-dim shrink-0">vedlejší</span>
                <svg class="w-3.5 h-3.5 text-gray-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-500 py-2">Žádný dostupný scénář — dokonči rozehrané nebo zkontroluj diagram.</p>
          <router-link to="/scenare" class="gh-micro mt-3 inline-flex items-center gap-1 hover:text-gh-primary transition-colors">
            Všechny scénáře →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
