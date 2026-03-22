<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useCharacterStore } from '@/stores/characterStore'
import { usePersonalQuestStore } from '@/stores/personalQuestStore'
import { CharacterClass } from '@/models/types'
import { XP_THRESHOLDS } from '@/utils/prosperityTable'
import SlotIcon from '@/components/items/SlotIcon.vue'
import ClassIcon from '@/components/characters/ClassIcon.vue'
import { computeDeck, getDeckStats } from '@/utils/attackModifierDeck'

const router = useRouter()
const campaignStore = useCampaignStore()
const characterStore = useCharacterStore()
const pqStore = usePersonalQuestStore()

const showCreate = ref(false)
const showQuestPicker = ref<string | null>(null)
const showRetireConfirm = ref<string | null>(null)
const newName = ref('')
const newOwner = ref('')
const newClass = ref<CharacterClass>(CharacterClass.BRUTE)
const selectedUuid = ref<string | null>(null)
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const classNames: Partial<Record<CharacterClass, string>> = {
  [CharacterClass.BRUTE]: 'Inoxský surovec',
  [CharacterClass.CRAGHEART]: 'Savvasský prasklivec',
  [CharacterClass.MINDTHIEF]: 'Krysácká zlodějka mysli',
  [CharacterClass.SCOUNDREL]: 'Lidská ničemnice',
  [CharacterClass.SPELLWEAVER]: 'Orchidská čarovnice',
  [CharacterClass.TINKERER]: 'Quatrylský kutil',
  [CharacterClass.BEAST_TYRANT]: 'Krysácký zvěropán',
  [CharacterClass.BERSERKER]: 'Inoxská fúrie',
  [CharacterClass.DOOMSTALKER]: 'Orchidský zkázolov',
  [CharacterClass.ELEMENTALIST]: 'Savvasská vládkyně živlů',
  [CharacterClass.NIGHTSHROUD]: 'Aestherský stínochodec',
  [CharacterClass.PLAGUEHERALD]: 'Trýznitelský moronoš',
  [CharacterClass.QUARTERMASTER]: 'Valrathský zbrojmistr',
  [CharacterClass.SAWBONES]: 'Lidský kostiřez',
  [CharacterClass.SOOTHSINGER]: 'Quatrylská čaropěvkyně',
  [CharacterClass.SUMMONER]: 'Aestherská vyvolávačka',
  [CharacterClass.SUNKEEPER]: 'Valrathská světlonoška',
  [CharacterClass.DIVINER]: 'Aestherská věštkyně',
}

const classColors: Record<string, string> = {
  [CharacterClass.BRUTE]: '#e74c3c',
  [CharacterClass.CRAGHEART]: '#95a5a6',
  [CharacterClass.MINDTHIEF]: '#9b59b6',
  [CharacterClass.SCOUNDREL]: '#2ecc71',
  [CharacterClass.SPELLWEAVER]: '#3498db',
  [CharacterClass.TINKERER]: '#f39c12',
  [CharacterClass.BEAST_TYRANT]: '#e67e22',
  [CharacterClass.BERSERKER]: '#c0392b',
  [CharacterClass.DOOMSTALKER]: '#27ae60',
  [CharacterClass.ELEMENTALIST]: '#8e44ad',
  [CharacterClass.NIGHTSHROUD]: '#2c3e50',
  [CharacterClass.PLAGUEHERALD]: '#16a085',
  [CharacterClass.QUARTERMASTER]: '#d4a847',
  [CharacterClass.SAWBONES]: '#ecf0f1',
  [CharacterClass.SOOTHSINGER]: '#e91e8c',
  [CharacterClass.SUMMONER]: '#1abc9c',
  [CharacterClass.SUNKEEPER]: '#f1c40f',
  [CharacterClass.DIVINER]: '#a78bfa',
}

function getColor(classId: CharacterClass): string {
  return classColors[classId] ?? '#c4a35a'
}

function xpPercent(xp: number, level: number): number {
  if (level >= 9) return 100
  const currentThreshold = XP_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = XP_THRESHOLDS[level] ?? 999
  const progress = xp - currentThreshold
  const needed = nextThreshold - currentThreshold
  return needed > 0 ? Math.min((progress / needed) * 100, 100) : 100
}

// SVG circle progress helpers
const RING_RADIUS = 26
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
function ringOffset(xp: number, level: number): number {
  const pct = xpPercent(xp, level) / 100
  return RING_CIRCUMFERENCE * (1 - pct)
}

onMounted(async () => {
  if (!campaignStore.hasCampaign) {
    router.push('/kampan')
    return
  }
  document.addEventListener('click', onClickOutside)
  await pqStore.loadData()
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

function selectClass(key: string) {
  newClass.value = key as CharacterClass
  showDropdown.value = false
}

function getRetireUnlocks(charUuid: string) {
  const quest = pqStore.getQuestForCharacter(charUuid)
  if (!quest) return null
  const def = pqStore.getDefinition(quest.questId)
  if (!def) return null
  const unlockClass = def.character_unlock ? pqStore.getUnlockClassName(quest.questId) : null
  const unlockScenarios: number[] = []
  for (const p of def.progress) {
    if ('scenario_unlock' in p && p.scenario_unlock) {
      unlockScenarios.push(p.scenario_unlock as number)
    }
  }
  return { unlockClass, unlockScenarios, questCompleted: quest.isCompleted }
}

function handleRetire(charUuid: string) {
  characterStore.retireCharacter(charUuid)
  showRetireConfirm.value = null
}

function createCharacter() {
  if (!newName.value.trim()) return
  characterStore.createCharacter(newClass.value, newName.value.trim(), newOwner.value.trim() || undefined)
  newName.value = ''
  newOwner.value = ''
  showCreate.value = false
}

function getXpToNext(level: number): number {
  if (level >= 9) return 0
  const currentThreshold = XP_THRESHOLDS[level - 1] ?? 0
  return (XP_THRESHOLDS[level] ?? 999) - currentThreshold
}

function inputValue(e: Event): string {
  return (e.target as HTMLInputElement).value
}

function numericInput(e: Event): number {
  const val = parseInt((e.target as HTMLInputElement).value, 10)
  return isNaN(val) ? 0 : val
}

function selectAllOnFocus(e: FocusEvent) {
  (e.target as HTMLInputElement).select()
}

const STARTING_CLASSES = new Set([
  CharacterClass.BRUTE, CharacterClass.CRAGHEART, CharacterClass.MINDTHIEF,
  CharacterClass.SCOUNDREL, CharacterClass.SPELLWEAVER, CharacterClass.TINKERER,
])

const availableClasses = computed(() => {
  if (!campaignStore.hideSpoilers) return classNames
  const filtered: Partial<Record<CharacterClass, string>> = {}
  for (const [key, name] of Object.entries(classNames) as [CharacterClass, string][]) {
    if (STARTING_CLASSES.has(key)) {
      filtered[key] = name
    }
  }
  return filtered
})
</script>

<template>
  <div v-if="campaignStore.hasCampaign" class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div class="gh-page-header !mb-0">
        <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Postavy</h1>
      </div>
      <button
        class="gh-btn-secondary text-sm flex items-center gap-1.5"
        @click="showCreate = !showCreate"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nová postava
      </button>
    </div>

    <!-- Create form -->
    <div v-if="showCreate" class="gh-card p-6 mb-6">
      <h3 class="font-display text-lg font-semibold text-gray-200 mb-5 tracking-wide flex items-center gap-2">
        <svg class="w-5 h-5 text-gh-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
        Nová postava
      </h3>
      <!-- Player select (if players exist in campaign) -->
      <div v-if="campaignStore.currentCampaign?.players?.length" class="mb-4">
        <label class="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block font-semibold">Hráč</label>
        <select
          v-model="newOwner"
          class="gh-input w-full text-sm"
        >
          <option value="">-- Vyberte hráče --</option>
          <option v-for="player in campaignStore.currentCampaign.players" :key="player" :value="player">
            {{ player }}
          </option>
        </select>
      </div>

      <div class="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label class="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block font-semibold">Jméno postavy</label>
          <input
            v-model="newName"
            type="text"
            placeholder="Jméno postavy..."
            class="gh-input w-full"
            @keyup.enter="createCharacter"
          />
        </div>
        <div ref="dropdownRef" class="relative">
          <label class="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 block font-semibold">Třída</label>
          <button
            type="button"
            class="gh-input w-full text-left flex items-center gap-2.5 pr-8"
            @click="showDropdown = !showDropdown"
          >
            <ClassIcon :class-id="newClass" :size="20" />
            <span class="text-gray-200 truncate">{{ classNames[newClass] }}</span>
            <svg
              class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 mt-[10px] transition-transform duration-200"
              :class="{ 'rotate-180': showDropdown }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <div
            v-if="showDropdown"
            class="absolute z-50 top-full left-0 right-0 mt-1 bg-gh-card border border-gh-border rounded-xl shadow-2xl shadow-black/50 max-h-64 overflow-y-auto custom-scrollbar"
          >
            <button
              v-for="(name, key) in availableClasses"
              :key="key"
              type="button"
              class="w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors text-sm"
              :class="newClass === key
                ? 'bg-gh-primary/10 text-gh-primary'
                : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'"
              @click="selectClass(String(key))"
            >
              <ClassIcon :class-id="String(key)" :size="18" />
              {{ name }}
            </button>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="gh-btn-primary" @click="createCharacter">Vytvořit</button>
        <button class="gh-btn-ghost" @click="showCreate = false">Zrušit</button>
      </div>
    </div>

    <!-- Character list -->
    <div v-if="characterStore.activeCharacters.length > 0" class="space-y-4">
      <div
        v-for="char in characterStore.activeCharacters"
        :key="char.uuid"
        class="gh-card overflow-hidden"
        :style="{ borderLeftWidth: '3px', borderLeftColor: getColor(char.classId) }"
      >
        <!-- Card header -->
        <div
          class="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
          @click="selectedUuid = selectedUuid === char.uuid ? null : char.uuid"
        >
          <div class="flex items-center gap-4">
            <!-- Class icon with XP ring + level badge -->
            <div class="relative w-16 h-16 shrink-0">
              <svg class="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" :r="RING_RADIUS" fill="none" stroke="currentColor" stroke-width="3" class="text-white/[0.06]" />
                <circle
                  cx="30" cy="30" :r="RING_RADIUS" fill="none" stroke-width="3" stroke-linecap="round"
                  :stroke="getColor(char.classId)"
                  :stroke-dasharray="RING_CIRCUMFERENCE"
                  :stroke-dashoffset="ringOffset(char.xp, char.level)"
                  class="transition-all duration-700"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <ClassIcon :class-id="char.classId" :size="34" />
              </div>
              <!-- Level badge -->
              <div
                class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-gh-dark"
                :style="{ backgroundColor: getColor(char.classId), color: '#0a0813' }"
              >
                {{ char.level }}
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-display font-semibold text-gray-100 tracking-wide text-lg leading-tight">{{ char.playerName }}</h3>
              <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <ClassIcon :class-id="char.classId" :size="12" class="opacity-60 shrink-0" />
                <span class="truncate">{{ classNames[char.classId] }}</span>
              </p>
              <p v-if="char.owner" class="text-xs text-purple-400/70 mt-0.5">{{ char.owner }}</p>
            </div>

            <div class="text-right text-sm space-y-1 shrink-0">
              <div class="flex items-center justify-end gap-1.5 text-blue-400">
                <svg class="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
                {{ char.xp }} ZK
              </div>
              <div class="flex items-center justify-end gap-1.5 text-yellow-400">
                <svg class="w-3.5 h-3.5 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                  <text x="10" y="14" text-anchor="middle" font-size="10" font-weight="bold" fill="currentColor">$</text>
                </svg>
                {{ char.gold }} zl.
              </div>
            </div>

            <svg
              class="w-4 h-4 text-gray-600 transition-transform duration-200 shrink-0 ml-1"
              :class="{ 'rotate-180': selectedUuid === char.uuid }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        <!-- Expanded detail -->
        <div v-if="selectedUuid === char.uuid" class="border-t border-gh-border/50 p-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
              <div class="text-[11px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Zkušenosti</div>
              <div class="flex items-center justify-center gap-1">
                <button class="hidden sm:inline-flex w-7 h-7 bg-white/[0.04] text-gray-400 rounded-md hover:bg-white/[0.08] hover:text-gray-200 text-xs border border-gh-border/40 transition-colors active:scale-95 items-center justify-center" @click="characterStore.updateXp(char.uuid, -5)">-5</button>
                <button class="w-7 h-7 bg-white/[0.04] text-gray-400 rounded-md hover:bg-white/[0.08] hover:text-gray-200 text-xs border border-gh-border/40 transition-colors active:scale-95" @click="characterStore.updateXp(char.uuid, -1)">-1</button>
                <input
                  type="number"
                  :value="char.xp"
                  class="w-12 text-center bg-transparent text-blue-400 font-bold font-display text-lg border-b border-transparent hover:border-blue-800/40 focus:border-blue-400/50 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  @change="characterStore.setXp(char.uuid, numericInput($event))"
                  @focus="selectAllOnFocus"
                />
                <button class="w-7 h-7 bg-blue-900/20 text-blue-400 rounded-md hover:bg-blue-900/40 text-xs border border-blue-800/30 transition-colors active:scale-95" @click="characterStore.updateXp(char.uuid, 1)">+1</button>
                <button class="hidden sm:inline-flex w-7 h-7 bg-blue-900/20 text-blue-400 rounded-md hover:bg-blue-900/40 text-xs border border-blue-800/30 transition-colors active:scale-95 items-center justify-center" @click="characterStore.updateXp(char.uuid, 5)">+5</button>
              </div>
            </div>
            <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
              <div class="text-[11px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Zlaťáky</div>
              <div class="flex items-center justify-center gap-1">
                <button class="hidden sm:inline-flex w-7 h-7 bg-white/[0.04] text-gray-400 rounded-md hover:bg-white/[0.08] hover:text-gray-200 text-xs border border-gh-border/40 transition-colors active:scale-95 items-center justify-center" @click="characterStore.updateGold(char.uuid, -5)">-5</button>
                <button class="w-7 h-7 bg-white/[0.04] text-gray-400 rounded-md hover:bg-white/[0.08] hover:text-gray-200 text-xs border border-gh-border/40 transition-colors active:scale-95" @click="characterStore.updateGold(char.uuid, -1)">-1</button>
                <input
                  type="number"
                  :value="char.gold"
                  class="w-12 text-center bg-transparent text-yellow-400 font-bold font-display text-lg border-b border-transparent hover:border-yellow-800/40 focus:border-yellow-400/50 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  @change="characterStore.setGold(char.uuid, numericInput($event))"
                  @focus="selectAllOnFocus"
                />
                <button class="w-7 h-7 bg-yellow-900/20 text-yellow-400 rounded-md hover:bg-yellow-900/40 text-xs border border-yellow-800/30 transition-colors active:scale-95" @click="characterStore.updateGold(char.uuid, 1)">+1</button>
                <button class="hidden sm:inline-flex w-7 h-7 bg-yellow-900/20 text-yellow-400 rounded-md hover:bg-yellow-900/40 text-xs border border-yellow-800/30 transition-colors active:scale-95 items-center justify-center" @click="characterStore.updateGold(char.uuid, 5)">+5</button>
              </div>
            </div>
            <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
              <div class="text-[11px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Úroveň</div>
              <span class="font-display font-bold text-2xl" :style="{ color: getColor(char.classId) }">{{ char.level }}</span>
              <span v-if="char.level < 9" class="text-xs text-gray-600 block mt-0.5">dalš: {{ getXpToNext(char.level) }} ZK</span>
            </div>
            <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
              <div class="text-[11px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Fajfky</div>
              <div class="flex items-center justify-center gap-1.5">
                <button class="w-7 h-7 bg-white/[0.04] text-gray-400 rounded-md hover:bg-white/[0.08] hover:text-gray-200 text-xs border border-gh-border/40 transition-colors active:scale-95" @click="characterStore.updateChecks(char.uuid, -1)">-1</button>
                <input
                  type="number"
                  :value="char.checks"
                  class="w-10 text-center bg-transparent text-gray-300 font-bold font-display text-lg border-b border-transparent hover:border-gray-600/40 focus:border-gray-400/50 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  @change="characterStore.setChecks(char.uuid, numericInput($event))"
                  @focus="selectAllOnFocus"
                />
                <button class="w-7 h-7 bg-green-900/20 text-green-400 rounded-md hover:bg-green-900/40 text-xs border border-green-800/30 transition-colors active:scale-95" @click="characterStore.updateChecks(char.uuid, 1)">+1</button>
              </div>
              <span class="text-xs text-gray-600 block mt-1">3 = perk</span>
            </div>
          </div>

          <!-- Perks -->
          <div class="mb-5">
            <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-gh-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Talenty
            </h4>
            <div class="space-y-0.5">
              <div
                v-for="perk in characterStore.getDefinition(char.classId)?.perks ?? []"
                :key="perk.id"
                class="flex items-center gap-3 text-sm cursor-pointer hover:bg-white/[0.03] rounded-lg px-2.5 py-2 transition-colors group"
                @click="characterStore.togglePerk(char.uuid, perk.id)"
              >
                <div class="flex gap-1.5">
                  <span
                    v-for="i in perk.maxCount"
                    :key="i"
                    class="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                    :class="(char.perksSelected[perk.id] ?? 0) >= i
                      ? 'bg-gh-primary border border-gh-primary text-gh-dark shadow-sm shadow-gh-primary/20'
                      : 'border border-gray-600 bg-white/[0.03] group-hover:border-gray-500'"
                  >
                    <svg
                      v-if="(char.perksSelected[perk.id] ?? 0) >= i"
                      class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </span>
                </div>
                <span class="text-gray-400 group-hover:text-gray-300 transition-colors">{{ perk.description }}</span>
              </div>
            </div>
          </div>

          <!-- Attack Modifier Deck -->
          <div class="mb-5">
            <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-gh-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
              </svg>
              Útočný balíček
            </h4>

            <div class="bg-white/[0.02] rounded-xl border border-white/[0.05] p-4">
              <!-- Top stats row -->
              <div class="grid grid-cols-4 gap-2 mb-4">
                <div class="text-center">
                  <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Karet</div>
                  <div class="font-display text-lg font-bold text-gray-300">{{ getDeckStats(computeDeck(char.perksSelected)).total }}</div>
                </div>
                <div class="text-center">
                  <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Miss</div>
                  <div class="font-display text-lg font-bold text-red-400">{{ getDeckStats(computeDeck(char.perksSelected)).missChance.toFixed(0) }}%</div>
                </div>
                <div class="text-center">
                  <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Krit</div>
                  <div class="font-display text-lg font-bold text-yellow-400">{{ getDeckStats(computeDeck(char.perksSelected)).critChance.toFixed(0) }}%</div>
                </div>
                <div class="text-center">
                  <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Rolling</div>
                  <div class="font-display text-lg font-bold text-blue-400">{{ getDeckStats(computeDeck(char.perksSelected)).rollingCount }}</div>
                </div>
              </div>

              <!-- Proportion bar -->
              <div class="flex h-2 rounded-full overflow-hidden mb-4">
                <div
                  class="bg-red-500/70 transition-all duration-500"
                  :style="{ width: getDeckStats(computeDeck(char.perksSelected)).negativeCount / getDeckStats(computeDeck(char.perksSelected)).total * 100 + '%' }"
                />
                <div
                  class="bg-gray-500/50 transition-all duration-500"
                  :style="{ width: getDeckStats(computeDeck(char.perksSelected)).neutralCount / getDeckStats(computeDeck(char.perksSelected)).total * 100 + '%' }"
                />
                <div
                  class="bg-green-500/70 transition-all duration-500"
                  :style="{ width: getDeckStats(computeDeck(char.perksSelected)).positiveCount / getDeckStats(computeDeck(char.perksSelected)).total * 100 + '%' }"
                />
                <div
                  v-if="getDeckStats(computeDeck(char.perksSelected)).rollingCount > 0"
                  class="bg-blue-500/60 transition-all duration-500"
                  :style="{ width: getDeckStats(computeDeck(char.perksSelected)).rollingCount / getDeckStats(computeDeck(char.perksSelected)).total * 100 + '%' }"
                />
              </div>

              <!-- Cards grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                <div
                  v-for="card in computeDeck(char.perksSelected)"
                  :key="card.label"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors"
                  :class="{
                    'bg-green-500/[0.07]': card.type === 'positive',
                    'bg-red-500/[0.07]': card.type === 'negative',
                    'bg-white/[0.03]': card.type === 'neutral',
                    'bg-yellow-500/[0.1]': card.type === 'crit',
                    'bg-red-500/[0.12]': card.type === 'miss',
                    'bg-blue-500/[0.07]': card.type === 'rolling',
                  }"
                >
                  <span
                    class="w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold shrink-0"
                    :class="{
                      'bg-green-500/20 text-green-400': card.type === 'positive',
                      'bg-red-500/20 text-red-400': card.type === 'negative',
                      'bg-white/[0.08] text-gray-400': card.type === 'neutral',
                      'bg-yellow-500/25 text-yellow-300': card.type === 'crit',
                      'bg-red-500/25 text-red-300': card.type === 'miss',
                      'bg-blue-500/20 text-blue-400': card.type === 'rolling',
                    }"
                  >
                    {{ card.count }}
                  </span>
                  <span
                    class="text-xs truncate"
                    :class="{
                      'text-green-400/80': card.type === 'positive',
                      'text-red-400/80': card.type === 'negative',
                      'text-gray-500': card.type === 'neutral',
                      'text-yellow-300/90': card.type === 'crit',
                      'text-red-300/90': card.type === 'miss',
                      'text-blue-400/80': card.type === 'rolling',
                    }"
                  >
                    {{ card.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Quest -->
          <div class="mb-5">
            <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-gh-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              Osobní quest
            </h4>

            <!-- No quest assigned -->
            <div v-if="!pqStore.getQuestForCharacter(char.uuid)">
              <button
                v-if="showQuestPicker !== char.uuid"
                class="gh-btn-secondary text-xs"
                @click="showQuestPicker = char.uuid"
              >
                Přiřadit quest
              </button>
              <!-- Quest picker -->
              <div v-else class="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3 max-h-48 overflow-y-auto custom-scrollbar">
                <div
                  v-for="q in pqStore.definitions"
                  :key="q.id"
                  class="px-3 py-2 text-sm text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                  @click="pqStore.assignQuest(char.uuid, q.id); showQuestPicker = null"
                >
                  <span>{{ q.name }}</span>
                  <span v-if="q.character_unlock" class="text-[10px] text-gray-600">
                    → {{ pqStore.getUnlockClassName(q.id) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Quest assigned -->
            <div v-else>
              <div class="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <span class="font-display font-semibold text-gray-200">
                      {{ pqStore.getDefinition(pqStore.getQuestForCharacter(char.uuid)!.questId)?.name }}
                    </span>
                    <span
                      v-if="pqStore.getQuestForCharacter(char.uuid)!.isCompleted"
                      class="ml-2 text-xs text-green-400 font-semibold"
                    >
                      Splněno!
                    </span>
                  </div>
                  <button
                    class="text-[10px] text-red-400/50 hover:text-red-400 transition-colors"
                    @click="pqStore.removeQuest(char.uuid)"
                  >
                    Zrušit
                  </button>
                </div>

                <!-- Unlock info -->
                <div
                  v-if="pqStore.getUnlockClassName(pqStore.getQuestForCharacter(char.uuid)!.questId)"
                  class="text-xs text-purple-400/70 mb-3"
                >
                  Odemkne: {{ pqStore.getUnlockClassName(pqStore.getQuestForCharacter(char.uuid)!.questId) }}
                </div>

                <!-- Progress items -->
                <div class="space-y-3">
                  <div
                    v-for="(prog, pIdx) in pqStore.getDefinition(pqStore.getQuestForCharacter(char.uuid)!.questId)?.progress ?? []"
                    :key="pIdx"
                  >
                    <p class="text-xs text-gray-400 mb-1.5">{{ prog.name }}</p>

                    <!-- Checkbox progress -->
                    <div v-if="prog.type === 'checkbox'" class="flex flex-wrap gap-1.5">
                      <button
                        v-for="(_, cIdx) in (prog.value as number[])"
                        :key="cIdx"
                        class="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                        :class="pqStore.getQuestForCharacter(char.uuid)!.progress[pIdx]?.checkboxValues?.[cIdx]
                          ? 'bg-gh-primary border border-gh-primary text-gh-dark'
                          : 'border border-gray-600 bg-white/[0.03] hover:border-gray-500'"
                        @click="pqStore.toggleCheckbox(char.uuid, pIdx, cIdx)"
                      >
                        <svg
                          v-if="pqStore.getQuestForCharacter(char.uuid)!.progress[pIdx]?.checkboxValues?.[cIdx]"
                          class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </button>
                    </div>

                    <!-- Number progress -->
                    <div v-else-if="prog.type === 'number'" class="flex items-center gap-2">
                      <button
                        class="w-7 h-7 bg-white/[0.04] text-gray-400 rounded-md hover:bg-white/[0.08] text-xs border border-gh-border/40 transition-colors active:scale-95"
                        @click="pqStore.setNumberValue(char.uuid, pIdx, (pqStore.getQuestForCharacter(char.uuid)!.progress[pIdx]?.numberValue ?? 0) - 1)"
                      >-1</button>
                      <div class="text-sm font-display">
                        <span class="text-gray-200 font-bold">{{ pqStore.getQuestForCharacter(char.uuid)!.progress[pIdx]?.numberValue ?? 0 }}</span>
                        <span class="text-gray-600"> / {{ prog.target }}</span>
                      </div>
                      <button
                        class="w-7 h-7 bg-gh-primary/15 text-gh-primary rounded-md hover:bg-gh-primary/25 text-xs border border-gh-primary/20 transition-colors active:scale-95"
                        @click="pqStore.setNumberValue(char.uuid, pIdx, (pqStore.getQuestForCharacter(char.uuid)!.progress[pIdx]?.numberValue ?? 0) + 1)"
                      >+1</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Inventory -->
          <div class="mb-5">
            <h4 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-gh-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Vybavení
            </h4>
            <!-- Slot capacity -->
            <div class="flex flex-wrap gap-2.5 mb-2.5">
              <span
                v-for="(info, slotKey) in characterStore.getSlotCounts(char.uuid)"
                :key="slotKey"
                class="flex items-center gap-1 text-[10px]"
                :class="info.used >= info.max && info.max > 0 ? 'text-red-400/60' : 'text-gray-600'"
              >
                <SlotIcon :slot="String(slotKey)" :size="13" class="text-amber-600/40" />
                {{ info.used }}/{{ info.max }}
              </span>
            </div>
            <!-- Item list -->
            <div v-if="char.items.length > 0" class="space-y-1">
              <div
                v-for="(itemId, idx) in char.items"
                :key="idx"
                class="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.04] group"
              >
                <div class="flex items-center gap-2.5">
                  <SlotIcon :slot="characterStore.getItemDef(itemId)?.slot ?? ''" :size="16" class="text-amber-600/60" />
                  <span class="text-sm text-gray-300">{{ characterStore.getItemDef(itemId)?.name }}</span>
                  <span class="text-[10px] text-gray-600">#{{ itemId }}</span>
                </div>
                <button
                  class="text-[10px] text-red-400/50 hover:text-red-400 transition-colors md:opacity-0 md:group-hover:opacity-100"
                  @click="characterStore.sellItem(char.uuid, itemId)"
                >
                  Prodat ({{ Math.floor((characterStore.getItemDef(itemId)?.cost ?? 0) / 2) }} zl.)
                </button>
              </div>
            </div>
            <p v-else class="text-xs text-gray-600 italic">Žádné předměty</p>
          </div>

          <!-- Owner & Notes & Retire -->
          <div class="pt-4 border-t border-gh-border/30 space-y-3">
            <!-- Owner select -->
            <div v-if="campaignStore.currentCampaign?.players?.length" class="flex items-center gap-3">
              <label class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold shrink-0">Hráč</label>
              <select
                class="gh-input flex-1 text-sm"
                :value="char.owner ?? ''"
                @change="char.owner = ($event.target as HTMLSelectElement).value || undefined; campaignStore.autoSave()"
              >
                <option value="">-- Nepřiřazeno --</option>
                <option v-for="player in campaignStore.currentCampaign.players" :key="player" :value="player">
                  {{ player }}
                </option>
              </select>
            </div>

            <div class="flex items-end gap-3">
              <div class="flex-1">
                <textarea
                  :value="char.notes"
                  placeholder="Poznámky..."
                  class="gh-input w-full resize-y min-h-[40px] text-sm"
                  @input="characterStore.setNotes(char.uuid, inputValue($event))"
                />
              </div>
              <button
                v-if="showRetireConfirm !== char.uuid"
                class="py-2 px-4 bg-amber-900/15 text-amber-400/80 rounded-lg hover:bg-amber-900/30 hover:text-amber-400 transition-all text-xs border border-amber-900/25 shrink-0"
                @click="showRetireConfirm = char.uuid"
              >
                Poslat do důchodu
              </button>
            </div>

            <!-- Retire confirmation -->
            <div v-if="showRetireConfirm === char.uuid" class="bg-amber-900/10 rounded-xl border border-amber-800/20 p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4.5 h-4.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span class="text-sm font-semibold text-amber-300">Poslat {{ char.playerName }} do důchodu?</span>
              </div>

              <p class="text-xs text-gray-400 mb-3 leading-relaxed">
                Postava bude přesunuta do archivu. Tato akce je nevratná.
              </p>

              <!-- Quest unlock info -->
              <div v-if="getRetireUnlocks(char.uuid)" class="mb-4">
                <div v-if="getRetireUnlocks(char.uuid)?.questCompleted" class="space-y-1.5">
                  <div v-if="getRetireUnlocks(char.uuid)?.unlockClass" class="flex items-center gap-2 text-xs">
                    <span class="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center">
                      <svg class="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    </span>
                    <span class="text-green-400">Odemkne třídu: <strong>{{ getRetireUnlocks(char.uuid)?.unlockClass }}</strong></span>
                  </div>
                  <div v-for="scId in getRetireUnlocks(char.uuid)?.unlockScenarios ?? []" :key="scId" class="flex items-center gap-2 text-xs">
                    <span class="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                      <svg class="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                      </svg>
                    </span>
                    <span class="text-blue-400">Odemkne scénář #{{ scId }}</span>
                  </div>
                </div>
                <div v-else class="text-xs text-gray-500 italic">
                  Osobní quest ještě není splněn — žádné odemčení se neaktivuje.
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors text-xs font-medium"
                  @click="handleRetire(char.uuid)"
                >
                  Potvrdit důchod
                </button>
                <button
                  class="gh-btn-ghost text-xs"
                  @click="showRetireConfirm = null"
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!showCreate" class="text-center py-16">
      <div class="inline-block p-4 rounded-2xl bg-white/[0.02] mb-4">
        <svg class="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <p class="text-gray-500 text-lg font-display tracking-wide">Zatím žádné postavy</p>
      <p class="text-gray-600 text-sm mt-2">Vytvořte první postavu a začněte dobrodružství!</p>
    </div>

    <!-- Archived characters -->
    <div v-if="characterStore.archivedCharacters.length > 0" class="mt-10">
      <div class="gh-divider mb-4">Penzionované postavy</div>
      <div class="space-y-2">
        <div
          v-for="char in characterStore.archivedCharacters"
          :key="char.uuid"
          class="gh-card p-3.5 opacity-50"
        >
          <div class="flex items-center gap-3">
            <ClassIcon :class-id="char.classId" :size="28" class="opacity-60" />
            <div class="flex items-center gap-2">
              <span class="text-gray-400">{{ char.playerName }}</span>
              <span class="text-gray-600 text-sm flex items-center gap-1">
                Lv.{{ char.level }} · {{ classNames[char.classId] }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(196, 163, 90, 0.2);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(196, 163, 90, 0.35);
}
</style>
