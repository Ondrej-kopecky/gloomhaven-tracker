<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useCampaignStore } from '@/stores/campaignStore'
import { usePartyStore } from '@/stores/partyStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { CharacterClass } from '@/models/types'
import ClassIcon from '@/components/characters/ClassIcon.vue'
import type { ItemDefinition } from '@/models/Item'
import itemsData from '@/data/items.json'
import eventsData from '@/data/events.json'

const router = useRouter()
const campaignStore = useCampaignStore()
const partyStore = usePartyStore()
const characterStore = useCharacterStore()
const scenarioStore = useScenarioStore()

const allItems = itemsData as ItemDefinition[]
const designItems = allItems.filter((item) => item.id >= 71 && item.id <= 95)

const editingRep = ref(false)
const editingDonations = ref(false)
const newCityEvent = ref('')
const newRoadEvent = ref('')
const showCityRemoved = ref(false)
const showRoadRemoved = ref(false)
const newPlayerName = ref('')

function addPlayer() {
  if (!newPlayerName.value.trim() || !campaignStore.currentCampaign) return
  if (!campaignStore.currentCampaign.players) campaignStore.currentCampaign.players = []
  if (campaignStore.currentCampaign.players.length >= 4) return
  campaignStore.currentCampaign.players.push(newPlayerName.value.trim())
  newPlayerName.value = ''
  campaignStore.autoSave()
}

function removePlayer(idx: number) {
  if (!campaignStore.currentCampaign?.players) return
  campaignStore.currentCampaign.players.splice(idx, 1)
  campaignStore.autoSave()
}
const pendingRemove = ref<{ type: 'city' | 'road'; id: number } | null>(null)

// Event outcome modal
const eventOutcome = ref<{ type: 'city' | 'road'; id: number } | null>(null)
const selectedOption = ref<string | null>(null)
const effectsApplied = ref(false)
const eventItemSearch = ref('')
const eventScenarioSearch = ref('')
const showEventItemPicker = ref(false)
const showEventScenarioPicker = ref(false)

const eventItemResults = computed(() => {
  const q = eventItemSearch.value.toLowerCase().trim()
  if (!q) return designItems
  return designItems.filter((item) =>
    item.name.toLowerCase().includes(q) || String(item.id) === q
  )
})

const eventScenarioResults = computed(() => {
  const q = eventScenarioSearch.value.toLowerCase().trim()
  if (!q) return [] as { id: string; displayName: string }[]
  return scenarioStore.allScenarios
    .filter((s) => s.displayName.toLowerCase().includes(q) || s.id === q)
    .slice(0, 8)
})

function eventUnlockItem(itemId: number) {
  campaignStore.unlockItemDesign(itemId)
  eventItemSearch.value = ''
  showEventItemPicker.value = false
}

function eventUnlockScenario(id: string) {
  campaignStore.manuallyUnlockScenario(id)
  eventScenarioSearch.value = ''
  showEventScenarioPicker.value = false
}

const currentEventData = computed(() => {
  if (!eventOutcome.value) return null
  return eventsData.find(
    (e: any) => e.id === eventOutcome.value!.id && e.type === eventOutcome.value!.type
  ) as any | null
})

const selectedOptionData = computed(() => {
  if (!currentEventData.value || !selectedOption.value) return null
  return currentEventData.value.options.find((o: any) => o.label === selectedOption.value) ?? null
})

const shouldReturnToDeck = computed(() => {
  if (!selectedOptionData.value) return false
  // Check option-level returnToDeck, or outcome-level
  if (selectedOptionData.value.returnToDeck) return true
  return selectedOptionData.value.outcomes?.some((o: any) => o.returnToDeck) ?? false
})

function selectOption(label: string) {
  selectedOption.value = label
  effectsApplied.value = false
}

function applyEffects() {
  if (!selectedOptionData.value || !eventOutcome.value || effectsApplied.value) return

  for (const outcome of selectedOptionData.value.outcomes) {
    for (const effect of outcome.effects || []) {
      const num = (pattern: RegExp) => {
        const m = effect.label?.match(pattern)
        return m ? parseInt(m[1]) : 0
      }
      switch (effect.type) {
        case 'reputation':
          partyStore.changeReputation(num(/([-+]?\d+)/))
          break
        case 'loseReputation':
          partyStore.changeReputation(-num(/(\d+)/))
          break
        case 'prosperity':
          if (campaignStore.currentCampaign) {
            campaignStore.currentCampaign.prosperityIndex += num(/(\d+)/) || 1
            campaignStore.autoSave()
          }
          break
        case 'loseProsperity':
          if (campaignStore.currentCampaign) {
            campaignStore.currentCampaign.prosperityIndex = Math.max(0, campaignStore.currentCampaign.prosperityIndex - (num(/(\d+)/) || 1))
            campaignStore.autoSave()
          }
          break
        case 'unlockScenario': {
          const id = effect.label?.match(/#(\d+)/)?.[1]
          if (id) campaignStore.manuallyUnlockScenario(id)
          break
        }
        case 'event': {
          const match = effect.label?.match(/(\d+)/)
          if (match) {
            const evType = effect.label?.includes('City') || effect.label?.includes('město') ? 'city' : 'road'
            partyStore.addEvent(evType, parseInt(match[1]))
          }
          break
        }
      }
    }
  }
  effectsApplied.value = true
}

function closeEventOutcome() {
  // Return to deck if needed
  if (shouldReturnToDeck.value && eventOutcome.value) {
    partyStore.returnEvent(eventOutcome.value.type, eventOutcome.value.id)
  }
  eventOutcome.value = null
  selectedOption.value = null
  effectsApplied.value = false
  showEventItemPicker.value = false
  showEventScenarioPicker.value = false
  eventItemSearch.value = ''
  eventScenarioSearch.value = ''
}

function confirmRemoveEvent(type: 'city' | 'road', id: number) {
  if (pendingRemove.value?.type === type && pendingRemove.value?.id === id) {
    // Second tap — confirm removal
    partyStore.removeEvent(type, id)
    pendingRemove.value = null
    // Show outcome modal
    eventOutcome.value = { type, id }
  } else {
    // First tap — mark as pending
    pendingRemove.value = { type, id }
  }
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

onMounted(() => {
  if (!campaignStore.hasCampaign) router.push('/kampan')
})

/* ── prosperity helpers ── */
const PROSPERITY_THRESHOLDS = [0, 4, 9, 15, 22, 30, 39, 50, 64]

function thresholdForLevel(level: number): number {
  return PROSPERITY_THRESHOLDS[level - 1] ?? 0
}
function thresholdForNextLevel(level: number): number {
  return PROSPERITY_THRESHOLDS[level] ?? 64
}

const prosperityPct = computed(() => {
  const lvl = partyStore.prosperityLevel
  const current = partyStore.prosperityIndex
  const low = thresholdForLevel(lvl)
  const high = thresholdForNextLevel(lvl)
  if (high <= low) return 100
  return Math.round(((current - low) / (high - low)) * 100)
})

/* ── reputation helpers ── */
const repPct = computed(() => {
  // -20..+20 → 0..100
  return Math.round(((partyStore.reputation + 20) / 40) * 100)
})

function setReputation(val: number) {
  if (!campaignStore.currentCampaign?.party) return
  campaignStore.currentCampaign.party.reputation = Math.max(-20, Math.min(20, val))
  campaignStore.autoSave()
}

function setDonations(val: number) {
  if (!campaignStore.currentCampaign?.party) return
  campaignStore.currentCampaign.party.donations = Math.max(0, val)
  campaignStore.autoSave()
}

/* ── character colors ── */
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

function getClassName(classId: string): string {
  const def = characterStore.getDefinition(classId as CharacterClass)
  return def?.name ?? classId
}
</script>

<template>
  <div v-if="campaignStore.hasCampaign && partyStore.party" class="max-w-4xl mx-auto">
    <div class="gh-page-header">
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Družina</h1>
    </div>

    <!-- ── Active members ── -->
    <div v-if="characterStore.activeCharacters.length > 0" class="mb-8">
      <h2 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Aktivní členové</h2>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="char in characterStore.activeCharacters"
          :key="char.uuid"
          class="flex items-center gap-3 bg-gh-card border border-gh-border rounded-xl px-4 py-3 min-w-[180px]"
        >
          <div class="relative shrink-0">
            <ClassIcon :class-id="char.classId" :size="32" />
            <div
              class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-gh-card"
              :style="{ backgroundColor: classColors[char.classId] ?? '#c4a35a', color: '#0a0813' }"
            >
              {{ char.level }}
            </div>
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-gray-200 truncate">{{ char.playerName || getClassName(char.classId) }}</div>
            <div class="text-[11px] text-gray-500">{{ getClassName(char.classId) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Stats grid ── -->
    <div class="grid md:grid-cols-3 gap-4">

      <!-- Reputation -->
      <div class="gh-card relative overflow-hidden p-6">
        <div class="absolute left-0 top-0 bottom-0 w-[3px]" :class="partyStore.reputation >= 0 ? 'bg-green-500' : 'bg-red-500'"></div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" :class="partyStore.reputation >= 0 ? 'bg-green-500/15' : 'bg-red-500/15'">
            <svg class="w-4 h-4" :class="partyStore.reputation >= 0 ? 'text-green-400' : 'text-red-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>
          <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Reputace</h3>
        </div>

        <div class="text-center">
          <!-- editable value -->
          <div class="mb-3">
            <span
              v-if="!editingRep"
              class="font-display text-4xl sm:text-5xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
              :class="partyStore.reputation >= 0 ? 'text-green-400' : 'text-red-400'"
              @click="editingRep = true"
            >
              {{ partyStore.reputation > 0 ? '+' : '' }}{{ partyStore.reputation }}
            </span>
            <input
              v-else
              type="number"
              :value="partyStore.reputation"
              min="-20"
              max="20"
              class="font-display text-4xl sm:text-5xl font-bold text-center bg-transparent border-b-2 border-gh-primary/40 outline-none w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              :class="partyStore.reputation >= 0 ? 'text-green-400' : 'text-red-400'"
              @focus="selectAllOnFocus"
              @blur="editingRep = false"
              @change="setReputation(numericInput($event))"
              @keydown.enter="editingRep = false"
            />
          </div>

          <!-- reputation bar -->
          <div class="relative w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
            <div
              class="absolute h-full rounded-full transition-all duration-500"
              :class="partyStore.reputation >= 0 ? 'bg-green-500' : 'bg-red-500'"
              :style="{ width: repPct + '%' }"
            ></div>
            <!-- center marker -->
            <div class="absolute left-1/2 top-0 w-0.5 h-full bg-gray-500/50 -translate-x-px"></div>
          </div>
          <div class="flex justify-between text-[10px] text-gray-600 mb-4">
            <span>-20</span>
            <span>0</span>
            <span>+20</span>
          </div>

          <div class="flex justify-center gap-2">
            <button
              class="w-10 h-10 bg-red-900/15 text-red-400 rounded-xl hover:bg-red-900/30 transition-all text-base font-bold border border-red-900/25 active:scale-95"
              @click="partyStore.changeReputation(-1)"
            >-</button>
            <button
              class="w-10 h-10 bg-green-900/15 text-green-400 rounded-xl hover:bg-green-900/30 transition-all text-base font-bold border border-green-900/25 active:scale-95"
              @click="partyStore.changeReputation(1)"
            >+</button>
          </div>
          <p class="text-xs text-gray-600 mt-4">
            Ceny: <span class="font-medium" :class="partyStore.shopPriceModifier < 0 ? 'text-green-400' : partyStore.shopPriceModifier > 0 ? 'text-red-400' : 'text-gray-400'">{{ partyStore.shopPriceModifier > 0 ? '+' : '' }}{{ partyStore.shopPriceModifier }} zl.</span>
          </p>
        </div>
      </div>

      <!-- Prosperity -->
      <div class="gh-card relative overflow-hidden p-6">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gh-primary"></div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg bg-gh-primary/15 flex items-center justify-center">
            <svg class="w-4 h-4 text-gh-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
            </svg>
          </div>
          <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Blahobyt</h3>
        </div>

        <div class="text-center">
          <span class="font-display text-4xl sm:text-5xl font-bold text-gh-primary">{{ partyStore.prosperityLevel }}</span>
          <span class="text-gray-500 text-sm ml-1">úroveň</span>

          <!-- level milestones -->
          <div class="flex justify-center gap-1 mt-3 mb-3">
            <div
              v-for="lvl in 9"
              :key="lvl"
              class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-all"
              :class="lvl <= partyStore.prosperityLevel
                ? 'bg-gh-primary/25 text-gh-primary border border-gh-primary/30'
                : lvl === partyStore.prosperityLevel + 1
                  ? 'bg-white/[0.06] text-gray-500 border border-gh-border animate-pulse'
                  : 'bg-white/[0.03] text-gray-700 border border-white/[0.04]'"
            >
              {{ lvl }}
            </div>
          </div>

          <!-- progress to next level -->
          <div class="text-xs text-gray-500 mb-2">
            {{ partyStore.prosperityIndex }} / {{ thresholdForNextLevel(partyStore.prosperityLevel) }} odškrtnutí
          </div>
          <div class="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden mb-4">
            <div
              class="h-full bg-gradient-to-r from-gh-primary to-gh-primary-light rounded-full transition-all duration-500"
              :style="{ width: prosperityPct + '%' }"
            ></div>
          </div>

          <div class="flex justify-center gap-2">
            <button
              class="w-10 h-10 bg-white/[0.04] text-gray-400 rounded-xl hover:bg-white/[0.08] transition-all text-base font-bold border border-gh-border active:scale-95"
              @click="partyStore.addProsperity(-1)"
            >-</button>
            <button
              class="w-10 h-10 bg-gh-primary/10 text-gh-primary rounded-xl hover:bg-gh-primary/20 transition-all text-base font-bold border border-gh-primary/25 active:scale-95"
              @click="partyStore.addProsperity(1)"
            >+</button>
          </div>
        </div>
      </div>

      <!-- Donations -->
      <div class="gh-card relative overflow-hidden p-6">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-yellow-500"></div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg bg-yellow-500/15 flex items-center justify-center">
            <svg class="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Svatyně Velkého dubu</h3>
        </div>
        <p class="text-xs text-gray-600 mb-4 leading-relaxed">
          Při návštěvě města může hrdina darovat 10 zl. a přidat do svého balíčku 2 karty požehnání. Za každých 100 zl. získáte 1 bod blahobytu.
        </p>

        <div class="text-center">
          <div class="mb-1">
            <span
              v-if="!editingDonations"
              class="font-display text-4xl sm:text-5xl font-bold text-yellow-400 cursor-pointer hover:opacity-80 transition-opacity"
              @click="editingDonations = true"
            >{{ partyStore.donations }}</span>
            <input
              v-else
              type="number"
              :value="partyStore.donations"
              min="0"
              class="font-display text-4xl sm:text-5xl font-bold text-yellow-400 text-center bg-transparent border-b-2 border-yellow-500/40 outline-none w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              @focus="selectAllOnFocus"
              @blur="editingDonations = false"
              @change="setDonations(numericInput($event))"
              @keydown.enter="editingDonations = false"
            />
          </div>
          <span class="text-gray-500 text-sm">zlaťáků</span>

          <!-- donation milestones (every 100 gold = 1 prosperity) -->
          <div class="mt-4 mb-4">
            <div class="flex items-center justify-center gap-1.5">
              <div
                v-for="i in 10"
                :key="i"
                class="w-3 h-3 rounded-full transition-all"
                :class="partyStore.donations >= i * 10 ? 'bg-yellow-500' : 'bg-white/[0.06]'"
              ></div>
            </div>
            <div class="text-[10px] text-gray-600 mt-1">
              {{ Math.floor(partyStore.donations / 100) }} blahobyt z darů
            </div>
          </div>

          <button
            class="py-2.5 px-5 bg-yellow-600/10 text-yellow-400 border border-yellow-600/25 rounded-xl hover:bg-yellow-600/20 hover:shadow-[0_0_20px_rgba(202,138,4,0.08)] transition-all text-sm font-medium active:scale-95"
            @click="partyStore.addDonation()"
          >
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Darovat 10 zl.
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Players ── -->
    <div class="gh-card relative overflow-hidden p-5 mt-5 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500"></div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Hráči</h3>
        <span class="ml-auto text-sm font-display font-bold text-purple-400">
          {{ campaignStore.currentCampaign?.players?.length ?? 0 }}
        </span>
      </div>

      <!-- Player list -->
      <div v-if="campaignStore.currentCampaign?.players?.length" class="flex flex-wrap gap-2 mb-3">
        <div
          v-for="(player, idx) in campaignStore.currentCampaign.players"
          :key="idx"
          class="flex items-center gap-2 bg-purple-900/15 border border-purple-800/20 rounded-lg px-3 py-1.5"
        >
          <span class="text-sm text-purple-300 font-medium">{{ player }}</span>
          <button
            class="text-purple-500/50 hover:text-red-400 transition-colors text-xs"
            @click="removePlayer(idx)"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Add player (max 4) -->
      <div v-if="(campaignStore.currentCampaign?.players?.length ?? 0) < 4" class="flex gap-2">
        <input
          v-model="newPlayerName"
          type="text"
          placeholder="Jméno hráče..."
          class="gh-input flex-1 text-sm"
          @keyup.enter="addPlayer"
        />
        <button
          class="gh-btn-ghost text-xs"
          @click="addPlayer"
        >
          Přidat
        </button>
      </div>
      <p v-else class="text-[10px] text-gray-600">Maximum 4 hráči ve skupině.</p>
    </div>

    <!-- Party name & Notes -->
    <div class="grid md:grid-cols-2 gap-4 mt-5">
      <div class="gh-card relative overflow-hidden p-5">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gh-primary/40"></div>
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Název družiny</h3>
        </div>
        <input
          :value="partyStore.party?.name"
          type="text"
          class="gh-input w-full"
          placeholder="Zadejte název..."
          @input="partyStore.setPartyName(inputValue($event))"
        />
      </div>
      <div class="gh-card relative overflow-hidden p-5">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gh-primary/40"></div>
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Poznámky</h3>
        </div>
        <textarea
          :value="partyStore.party?.notes"
          placeholder="Poznámky k družině..."
          class="gh-input w-full resize-y min-h-[60px]"
          @input="partyStore.setNotes(inputValue($event))"
        />
      </div>
    </div>

    <!-- ── Event Decks ── -->
    <div class="grid md:grid-cols-2 gap-4 mt-5">
      <!-- City Events -->
      <div class="gh-card relative overflow-hidden p-5">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500"></div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
            </svg>
          </div>
          <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Městské události</h3>
          <span class="ml-auto text-sm font-display font-bold text-blue-400">
            {{ partyStore.cityEventsAvailable.length }}
          </span>
        </div>

        <!-- Tap hint -->
        <p class="text-[10px] text-gray-600 mb-2">Klikni 2x na cislo = odebrat z balicku</p>

        <!-- Available events (two-tap to remove) -->
        <div class="flex flex-wrap gap-1.5 mb-3">
          <button
            v-for="id in partyStore.cityEventsAvailable"
            :key="id"
            :class="[
              'w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center border active:scale-90 transition-all cursor-pointer',
              pendingRemove?.type === 'city' && pendingRemove?.id === id
                ? 'bg-red-900/40 text-red-400 border-red-700/50 animate-pulse'
                : 'bg-blue-900/20 text-blue-400/80 border-blue-800/20 hover:bg-blue-900/30'
            ]"
            @click="confirmRemoveEvent('city', id)"
          >
            {{ id }}
          </button>
        </div>

        <!-- Add event -->
        <div class="flex gap-2">
          <input
            v-model="newCityEvent"
            type="number"
            placeholder="Pridat #"
            min="1"
            class="gh-input flex-1 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            class="gh-btn-ghost text-xs"
            @click="if (newCityEvent) { partyStore.addEvent('city', Number(newCityEvent)); newCityEvent = '' }"
          >
            Pridat
          </button>
        </div>

        <!-- Removed events (collapsible) -->
        <div v-if="partyStore.cityEventsRemoved.length">
          <button
            class="text-[10px] text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
            @click="showCityRemoved = !showCityRemoved"
          >
            <svg
              class="w-3 h-3 transition-transform" :class="{ 'rotate-90': showCityRemoved }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            Odebrané ({{ partyStore.cityEventsRemoved.length }})
          </button>
          <div v-if="showCityRemoved" class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="id in partyStore.cityEventsRemoved"
              :key="id"
              class="w-7 h-7 rounded-md bg-white/[0.03] text-gray-600 text-[10px] font-bold flex items-center justify-center border border-white/[0.04] cursor-pointer hover:border-blue-800/30 hover:text-blue-400/50 transition-colors"
              title="Vrátit do balíčku"
              @click="partyStore.returnEvent('city', id)"
            >
              {{ id }}
            </span>
          </div>
        </div>
      </div>

      <!-- Road Events -->
      <div class="gh-card relative overflow-hidden p-5">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-600"></div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-7 h-7 rounded-lg bg-amber-600/15 flex items-center justify-center">
            <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
          </div>
          <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cestovní události</h3>
          <span class="ml-auto text-sm font-display font-bold text-amber-500">
            {{ partyStore.roadEventsAvailable.length }}
          </span>
        </div>

        <!-- Tap hint -->
        <p class="text-[10px] text-gray-600 mb-2">Klikni 2x na cislo = odebrat z balicku</p>

        <!-- Available events (two-tap to remove) -->
        <div class="flex flex-wrap gap-1.5 mb-3">
          <button
            v-for="id in partyStore.roadEventsAvailable"
            :key="id"
            :class="[
              'w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center border active:scale-90 transition-all cursor-pointer',
              pendingRemove?.type === 'road' && pendingRemove?.id === id
                ? 'bg-red-900/40 text-red-400 border-red-700/50 animate-pulse'
                : 'bg-amber-900/20 text-amber-500/80 border-amber-800/20 hover:bg-amber-900/30'
            ]"
            @click="confirmRemoveEvent('road', id)"
          >
            {{ id }}
          </button>
        </div>

        <!-- Add event -->
        <div class="flex gap-2">
          <input
            v-model="newRoadEvent"
            type="number"
            placeholder="Pridat #"
            min="1"
            class="gh-input flex-1 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            class="gh-btn-ghost text-xs"
            @click="if (newRoadEvent) { partyStore.addEvent('road', Number(newRoadEvent)); newRoadEvent = '' }"
          >
            Pridat
          </button>
        </div>

        <!-- Removed events (collapsible) -->
        <div v-if="partyStore.roadEventsRemoved.length">
          <button
            class="text-[10px] text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
            @click="showRoadRemoved = !showRoadRemoved"
          >
            <svg
              class="w-3 h-3 transition-transform" :class="{ 'rotate-90': showRoadRemoved }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            Odebrané ({{ partyStore.roadEventsRemoved.length }})
          </button>
          <div v-if="showRoadRemoved" class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="id in partyStore.roadEventsRemoved"
              :key="id"
              class="w-7 h-7 rounded-md bg-white/[0.03] text-gray-600 text-[10px] font-bold flex items-center justify-center border border-white/[0.04] cursor-pointer hover:border-amber-800/30 hover:text-amber-500/50 transition-colors"
              title="Vrátit do balíčku"
              @click="partyStore.returnEvent('road', id)"
            >
              {{ id }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Outcome Modal -->
    <Teleport to="body">
      <div
        v-if="eventOutcome"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="closeEventOutcome"
      >
        <div class="bg-gh-dark border border-gh-border rounded-2xl w-full max-w-sm shadow-2xl shadow-black/60 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-display text-lg font-semibold text-gray-200">
              {{ eventOutcome.type === 'city' ? 'Městská' : 'Cestovní' }} událost #{{ eventOutcome.id }}
            </h3>
            <button class="p-1 text-gray-600 hover:text-gray-300 transition-colors" @click="closeEventOutcome">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Step 1: Choose A or B -->
          <div v-if="currentEventData && !selectedOption" class="mb-4">
            <p class="text-xs text-gray-500 mb-3">Kterou volbu jste zvolili?</p>
            <div class="flex gap-2">
              <button
                v-for="opt in currentEventData.options"
                :key="opt.label"
                class="flex-1 py-3 rounded-lg border text-sm font-semibold transition-all"
                :class="opt.label === 'A'
                  ? 'bg-blue-900/20 text-blue-400 border-blue-700/40 hover:bg-blue-900/40'
                  : 'bg-amber-900/20 text-amber-400 border-amber-700/40 hover:bg-amber-900/40'"
                @click="selectOption(opt.label)"
              >
                Volba {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Step 2: Show outcomes for selected option -->
          <div v-if="selectedOptionData" class="mb-4 max-h-[40vh] overflow-y-auto">
            <div class="flex items-center gap-2 mb-3">
              <h4 class="text-sm font-semibold" :class="selectedOption === 'A' ? 'text-blue-400' : 'text-amber-400'">
                Volba {{ selectedOption }}
              </h4>
              <button class="text-[10px] text-gray-600 hover:text-gray-400 transition-colors" @click="selectedOption = null; effectsApplied = false">
                (změnit)
              </button>
            </div>
            <div v-for="(outcome, oi) in selectedOptionData.outcomes" :key="oi" class="mb-2">
              <p v-if="outcome.condition" class="text-[11px] text-yellow-400/80 mb-1">
                {{ outcome.condition }}:
              </p>
              <div v-for="(effect, ei) in outcome.effects" :key="ei" class="text-sm text-gray-400 py-0.5">
                <template v-if="effect.type === 'choose'">
                  <span class="text-gray-500 text-xs">Vyber: </span>
                  <span v-for="(o, idx) in effect.options" :key="idx">
                    {{ o }}<span v-if="idx < effect.options.length - 1" class="text-gray-600"> nebo </span>
                  </span>
                </template>
                <template v-else>
                  <span class="flex items-center gap-1.5">
                    <span class="w-1 h-1 rounded-full" :class="{
                      'bg-yellow-400/60': effect.label?.includes('zl.'),
                      'bg-blue-400/60': effect.label?.includes('ZK'),
                      'bg-purple-400/60': effect.label?.includes('reputace'),
                      'bg-green-400/60': effect.label?.includes('blahobyt') || effect.label?.includes('Odemkni'),
                      'bg-red-400/60': effect.label?.includes('zranění') || effect.label?.includes('-'),
                      'bg-gray-400/60': !effect.label?.includes('zl.') && !effect.label?.includes('ZK'),
                    }" />
                    {{ effect.label }}
                  </span>
                </template>
              </div>
            </div>

            <!-- Auto-apply button -->
            <button
              v-if="!effectsApplied"
              class="w-full mt-2 py-2 bg-green-900/20 text-green-400 border border-green-700/30 rounded-lg text-xs font-medium hover:bg-green-900/40 transition-colors"
              @click="applyEffects"
            >
              Aplikovat efekty (reputace, blahobyt, scénáře...)
            </button>
            <p v-else class="text-[10px] text-green-400/70 mt-2 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Efekty aplikovány
            </p>

            <!-- Return to deck info -->
            <p v-if="shouldReturnToDeck" class="text-[10px] text-blue-400/70 mt-1 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              Karta se vrátí do balíčku
            </p>
            <p v-else class="text-[10px] text-red-400/50 mt-1 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Karta se odstraní ze hry
            </p>
          </div>

          <p v-if="!currentEventData" class="text-xs text-gray-600 mb-4">Data pro tuto událost nejsou k dispozici.</p>

          <!-- Quick actions: item/scenario pickers -->
          <div v-if="selectedOption" class="border-t border-gh-border/40 pt-3 mb-4 flex flex-col gap-2">
            <p class="text-[10px] text-gray-600 mb-1">Rychlé akce</p>

            <!-- Item picker -->
            <div v-if="!showEventItemPicker">
              <button
                class="w-full text-left text-xs px-3 py-2 rounded-lg border border-gh-border bg-white/[0.02] text-gray-500 hover:border-gh-border-light hover:text-gray-300 transition-colors flex items-center gap-1.5"
                @click="showEventItemPicker = true"
              >
                <svg class="w-3.5 h-3.5 text-yellow-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Vylosovat náhodný předmět
              </button>
            </div>
            <div v-else>
              <input v-model="eventItemSearch" type="text" placeholder="Hledat předmět (název nebo #)..." class="gh-input w-full text-sm mb-1" />
              <div class="rounded-lg border border-gh-border bg-gh-dark overflow-hidden max-h-36 overflow-y-auto">
                <button v-for="item in eventItemResults" :key="item.id" class="w-full text-left px-3 py-1.5 text-sm hover:bg-white/[0.06] transition-colors border-b border-gh-border/20 last:border-0" @click="eventUnlockItem(item.id)">
                  <span class="text-yellow-400/70 font-display">#{{ item.id }}</span>
                  <span class="text-gray-300 ml-1">{{ item.name }}</span>
                </button>
              </div>
            </div>

            <!-- Scenario picker -->
            <div v-if="!showEventScenarioPicker">
              <button
                class="w-full text-left text-xs px-3 py-2 rounded-lg border border-gh-border bg-white/[0.02] text-gray-500 hover:border-gh-border-light hover:text-gray-300 transition-colors flex items-center gap-1.5"
                @click="showEventScenarioPicker = true"
              >
                <svg class="w-3.5 h-3.5 text-gh-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Odemknout náhodný scénář
              </button>
            </div>
            <div v-else>
              <input v-model="eventScenarioSearch" type="text" placeholder="Hledat scénář (název nebo #)..." class="gh-input w-full text-sm mb-1" />
              <div v-if="eventScenarioResults.length > 0" class="rounded-lg border border-gh-border bg-gh-dark overflow-hidden max-h-36 overflow-y-auto">
                <button v-for="s in eventScenarioResults" :key="s.id" class="w-full text-left px-3 py-1.5 text-sm hover:bg-white/[0.06] transition-colors border-b border-gh-border/20 last:border-0" @click="eventUnlockScenario(s.id)">
                  <span class="text-gh-primary/70 font-display">#{{ s.id }}</span>
                  <span class="text-gray-300 ml-1">{{ s.displayName }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Close -->
          <button
            class="w-full py-2.5 bg-gradient-to-r from-gh-primary/20 to-gh-primary/10 text-gh-primary border border-gh-primary/30 rounded-lg font-medium hover:from-gh-primary/30 transition-all text-sm"
            @click="closeEventOutcome"
          >
            Hotovo
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
