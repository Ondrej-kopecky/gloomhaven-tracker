<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useAchievementStore } from '@/stores/achievementStore'

const router = useRouter()
const campaignStore = useCampaignStore()
const achievementStore = useAchievementStore()

type Ach = (typeof achievementStore.globalDefinitions)[number]
type FilterType = 'all' | 'done' | 'remaining'
const filter = ref<FilterType>('all')
const search = ref('')
const filterOptions: FilterType[] = ['all', 'done', 'remaining']
const filterLabels: Record<FilterType, string> = { all: 'Vše', done: 'Splněno', remaining: 'Zbývá' }

onMounted(() => {
  if (!campaignStore.hasCampaign) router.push('/kampan')
})

/* ── helpers ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function prop(ach: Ach, key: string): any { return (ach as any)[key] }

function isHidden(ach: Ach): boolean { return !!prop(ach, 'hidden') }
function isManual(ach: Ach): boolean { return !!prop(ach, 'isManual') }
function getUpgrades(ach: Ach): string[] | undefined { return prop(ach, 'upgrades') }

const globalVisible = computed(() =>
  achievementStore.globalDefinitions.filter(a => !isHidden(a))
)
const partyVisible = computed(() =>
  achievementStore.partyDefinitions.filter(a => !isHidden(a))
)

const globalCount = computed(() =>
  globalVisible.value.filter(a => achievementStore.isGlobalAchieved(a.id)).length
)
const partyCount = computed(() =>
  partyVisible.value.filter(a => achievementStore.isPartyAchieved(a.id)).length
)
const totalCount = computed(() => globalCount.value + partyCount.value)
const totalAll = computed(() => globalVisible.value.length + partyVisible.value.length)

const globalFiltered = computed(() =>
  globalVisible.value.filter(a => {
    const achieved = achievementStore.isGlobalAchieved(a.id)
    if (campaignStore.hideSpoilers && !achieved) return false
    if (filter.value === 'done') return achieved
    if (filter.value === 'remaining') return !achieved
    if (search.value) {
      const q = search.value.toLowerCase()
      return a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    }
    return true
  })
)
const partyFiltered = computed(() =>
  partyVisible.value.filter(a => {
    const achieved = achievementStore.isPartyAchieved(a.id)
    if (campaignStore.hideSpoilers && !achieved) return false
    if (filter.value === 'done') return achieved
    if (filter.value === 'remaining') return !achieved
    if (search.value) {
      const q = search.value.toLowerCase()
      return a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    }
    return true
  })
)

/** upgrade chain level */
function upgradeLevel(ach: Ach): { current: number; max: number } | null {
  const upgrades = getUpgrades(ach)
  if (!upgrades || upgrades.length === 0) return null
  let level = achievementStore.isGlobalAchieved(ach.id) ? 1 : 0
  for (const uid of upgrades) {
    if (achievementStore.isGlobalAchieved(uid)) level++
  }
  return { current: level, max: upgrades.length + 1 }
}

function upgradeMax(ach: Ach): number {
  const info = upgradeLevel(ach)
  return info ? info.max : 0
}
function upgradeCurrent(ach: Ach): number {
  const info = upgradeLevel(ach)
  return info ? info.current : 0
}
function hasUpgrades(ach: Ach): boolean {
  return upgradeLevel(ach) !== null
}

const groupLabels: Record<string, string> = {
  cr: 'Vládnoucí režim',
  art: 'Artefakt',
}

function groupLabel(group: string): string {
  return groupLabels[group] ?? group
}

function pctBar(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100)
}
</script>

<template>
  <div v-if="campaignStore.hasCampaign" class="max-w-4xl mx-auto">
    <div class="gh-page-header">
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Úspěchy</h1>
    </div>

    <!-- ── Overall progress ── -->
    <div class="bg-gh-card border border-gh-border rounded-2xl p-5 mb-8">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-400 font-medium">Celkový postup</span>
        <span class="font-display text-gh-primary text-lg font-bold">
          {{ totalCount }}<span class="text-gray-600">/{{ totalAll }}</span>
        </span>
      </div>
      <div class="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          :style="{ width: pctBar(totalCount, totalAll) + '%', background: 'linear-gradient(90deg, #c4a35a, #e8d48b)' }"
        ></div>
      </div>
      <div class="flex gap-6 mt-4">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span class="text-xs text-gray-500">Globální {{ globalCount }}/{{ globalVisible.length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
          <span class="text-xs text-gray-500">Družina {{ partyCount }}/{{ partyVisible.length }}</span>
        </div>
      </div>
    </div>

    <!-- Spoiler mode notice -->
    <div v-if="campaignStore.hideSpoilers" class="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-gh-primary/[0.06] border border-gh-primary/15">
      <svg class="w-3.5 h-3.5 text-gh-primary/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
      <span class="text-[11px] text-gh-primary/70">Spoiler mód — zobrazeny jen splněné úspěchy</span>
    </div>

    <!-- ── Search ── -->
    <div class="mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Hledat úspěch..."
        class="gh-input w-full sm:w-64 text-sm"
      />
    </div>

    <!-- ── Filter tabs ── -->
    <div class="flex gap-1.5 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit">
      <button
        v-for="f in filterOptions"
        :key="f"
        class="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
        :class="filter === f
          ? 'bg-gh-primary/20 text-gh-primary'
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'"
        @click="filter = f"
      >
        {{ filterLabels[f] }}
      </button>
    </div>

    <!-- ── Global achievements ── -->
    <div class="mb-10">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
            <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider">Globální úspěchy</h2>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-32 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div class="h-full bg-green-500 rounded-full transition-all duration-500" :style="{ width: pctBar(globalCount, globalVisible.length) + '%' }"></div>
          </div>
          <span class="text-sm text-gray-500 font-display">{{ globalCount }}/{{ globalVisible.length }}</span>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="ach in globalFiltered"
          :key="ach.id"
          class="group relative rounded-xl p-4 border cursor-pointer transition-all duration-300 active:scale-[0.98]"
          :class="achievementStore.isGlobalAchieved(ach.id)
            ? 'border-green-700/40 bg-green-900/15 gh-glow-green'
            : 'border-gh-border bg-gh-card hover:border-green-800/40 hover:bg-white/[0.03]'"
          @click="achievementStore.toggleGlobal(ach.id)"
        >
          <!-- left accent -->
          <div
            class="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300"
            :class="achievementStore.isGlobalAchieved(ach.id) ? 'bg-green-500' : 'bg-white/[0.06]'"
          ></div>

          <div class="flex items-start gap-3 pl-2">
            <!-- icon -->
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
              :class="achievementStore.isGlobalAchieved(ach.id) ? 'bg-green-500/25' : 'bg-white/[0.04] border border-gh-border group-hover:border-green-800/30'"
            >
              <svg v-if="achievementStore.isGlobalAchieved(ach.id)" class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <svg v-else class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            <div class="min-w-0 flex-1">
              <div
                class="text-sm font-medium truncate transition-colors duration-300"
                :class="achievementStore.isGlobalAchieved(ach.id) ? 'text-green-300' : 'text-gray-400 group-hover:text-gray-300'"
              >
                {{ ach.name }}
              </div>

              <!-- group badge -->
              <div v-if="ach.group" class="mt-1">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.05] text-gray-500 border border-white/[0.06]">
                  {{ groupLabel(ach.group) }}
                </span>
              </div>

              <!-- upgrade chain -->
              <div v-if="hasUpgrades(ach)" class="flex items-center gap-1 mt-2">
                <div
                  v-for="step in upgradeMax(ach)"
                  :key="step"
                  class="w-4 h-1.5 rounded-full transition-all duration-300"
                  :class="step <= upgradeCurrent(ach) ? 'bg-green-500' : 'bg-white/[0.08]'"
                ></div>
                <span class="text-[10px] text-gray-600 ml-1">
                  {{ upgradeCurrent(ach) }}/{{ upgradeMax(ach) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Party achievements ── -->
    <div class="mb-10">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider">Úspěchy družiny</h2>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-32 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full transition-all duration-500" :style="{ width: pctBar(partyCount, partyVisible.length) + '%' }"></div>
          </div>
          <span class="text-sm text-gray-500 font-display">{{ partyCount }}/{{ partyVisible.length }}</span>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="ach in partyFiltered"
          :key="ach.id"
          class="group relative rounded-xl p-4 border cursor-pointer transition-all duration-300 active:scale-[0.98]"
          :class="achievementStore.isPartyAchieved(ach.id)
            ? 'border-blue-700/40 bg-blue-900/15 gh-glow-blue'
            : 'border-gh-border bg-gh-card hover:border-blue-800/40 hover:bg-white/[0.03]'"
          @click="achievementStore.toggleParty(ach.id)"
        >
          <!-- left accent -->
          <div
            class="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300"
            :class="achievementStore.isPartyAchieved(ach.id) ? 'bg-blue-500' : 'bg-white/[0.06]'"
          ></div>

          <div class="flex items-start gap-3 pl-2">
            <!-- icon -->
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
              :class="achievementStore.isPartyAchieved(ach.id) ? 'bg-blue-500/25' : 'bg-white/[0.04] border border-gh-border group-hover:border-blue-800/30'"
            >
              <svg v-if="achievementStore.isPartyAchieved(ach.id)" class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <svg v-else class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            <div class="min-w-0 flex-1">
              <div
                class="text-sm font-medium truncate transition-colors duration-300"
                :class="achievementStore.isPartyAchieved(ach.id) ? 'text-blue-300' : 'text-gray-400 group-hover:text-gray-300'"
              >
                {{ ach.name }}
              </div>
              <!-- manual badge -->
              <div v-if="isManual(ach)" class="mt-1">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-500/70 border border-amber-500/15">
                  manuální
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
