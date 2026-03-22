<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import QRCode from 'qrcode'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useProfileStore } from '@/stores/profileStore'
import { usePartyStore } from '@/stores/partyStore'
import { useCharacterStore } from '@/stores/characterStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { useScenarioStore } from '@/stores/scenarioStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const campaignStore = useCampaignStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const partyStore = usePartyStore()
const characterStore = useCharacterStore()
const achievementStore = useAchievementStore()
const scenarioStore = useScenarioStore()

const btcQrCanvas = ref<HTMLCanvasElement | null>(null)
const showBtc = ref(false)
const showResetConfirm = ref(false)
const showDeleteProfileConfirm = ref(false)
const importError = ref('')
const exportSuccess = ref(false)
const importSuccess = ref(false)

const syncResult = ref<{ synced: number; error: string | null } | null>(null)
const isSyncing = ref(false)
const shareCodeCopied = ref(false)
const envelopeConfirm = ref<string | null>(null)

const editingCampaignName = ref(false)
const editingProfileName = ref(false)
const newProfileName = ref('')
const showNewProfile = ref(false)

watch(showBtc, async (val) => {
  if (val) {
    await nextTick()
    if (btcQrCanvas.value) {
      QRCode.toCanvas(btcQrCanvas.value, 'bitcoin:bc1qhypsfmnw0a4g8aar2evx6tdvq30jvnen96few2', {
        width: 80,
        margin: 1,
        color: { dark: '#c4a35a', light: '#00000000' },
      })
    }
  }
})

onMounted(async () => {
  if (campaignStore.hasCampaign) {
    await scenarioStore.loadScenarioData()
    if (authStore.isLoggedIn) {
      campaignStore.loadShareInfo()
    }
  }
})

async function handleGenerateShareCode() {
  await campaignStore.generateShareCode()
}

async function handleRevokeShare() {
  await campaignStore.revokeShareCode()
}

async function handleLeaveCampaign() {
  await campaignStore.leaveCampaign()
  router.push('/kampan')
}

async function handleKickMember(userId: number) {
  await campaignStore.kickMember(userId)
}

function copyShareCode() {
  const code = campaignStore.currentCampaignSummary?.shareCode || campaignStore.shareInfo?.shareCode
  if (!code) return
  navigator.clipboard.writeText(code)
  shareCodeCopied.value = true
  setTimeout(() => (shareCodeCopied.value = false), 2000)
}

function inputValue(e: Event): string {
  return (e.target as HTMLInputElement).value
}

function selectAllOnFocus(e: FocusEvent) {
  (e.target as HTMLInputElement).select()
}

/* ── Campaign name ── */
function setCampaignName(name: string) {
  if (!campaignStore.currentCampaign || !name.trim()) return
  campaignStore.currentCampaign.name = name.trim()
  campaignStore.autoSave()
}

function toggleForgottenCircles() {
  if (!campaignStore.currentCampaign) return
  campaignStore.currentCampaign.forgottenCircles = !campaignStore.currentCampaign.forgottenCircles
  campaignStore.autoSave()
}

function toggleEnvelope(key: string) {
  if (!campaignStore.currentCampaign) return
  if (isEnvelopeOpen(key)) {
    const envelopes = campaignStore.currentCampaign.openedEnvelopes ?? {}
    envelopes[key] = false
    campaignStore.currentCampaign.openedEnvelopes = { ...envelopes }
    campaignStore.autoSave()
    return
  }
  envelopeConfirm.value = key
}

function confirmOpenEnvelope() {
  if (!campaignStore.currentCampaign || !envelopeConfirm.value) return
  const envelopes = campaignStore.currentCampaign.openedEnvelopes ?? {}
  envelopes[envelopeConfirm.value] = true
  campaignStore.currentCampaign.openedEnvelopes = { ...envelopes }
  campaignStore.autoSave()
  envelopeConfirm.value = null
}

function isEnvelopeOpen(key: string): boolean {
  return campaignStore.currentCampaign?.openedEnvelopes?.[key] ?? false
}

const envelopeList = [
  { key: 'A', label: 'Obálka A', condition: '5× úspěch Ancient Technology', content: 'Šifrovací puzzle — dešifrovací tabulka v krabici', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-800/30' },
  { key: 'B', label: 'Obálka B', condition: 'Darovat celkem 100 zl. v chrámu', content: '+1 prosperita + samolepka na mapu — další donace generují prosperitu', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-800/30' },
  { key: 'sun', label: 'Obálka ☀', condition: 'Reputace +10 nebo víc', content: 'Odemkne třídu Sunkeeper (Světlonoška)', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-800/30' },
  { key: 'moon', label: 'Obálka ☾', condition: 'Reputace -10 nebo míň', content: 'Odemkne třídu Nightshroud (Stínochodec)', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-800/30' },
  { key: 'X', label: 'Obálka X', condition: 'Vyřešte puzzle z 10 vodítek ve hře', content: 'Odemkne tajnou třídu', color: 'text-gray-400', bg: 'bg-white/[0.06]', border: 'border-white/[0.08]' },
]

/* ── Profile ── */
function setProfileName(name: string) {
  if (!name.trim()) return
  profileStore.renameProfile(name.trim())
}

function createNewProfile() {
  if (!newProfileName.value.trim()) return
  const profile = profileStore.createProfile(newProfileName.value.trim())
  newProfileName.value = ''
  showNewProfile.value = false
  profileStore.switchProfile(profile.id)
  campaignStore.loadCampaignList()
  router.push('/kampan')
}

function deleteCurrentProfile() {
  const success = profileStore.deleteProfile(profileStore.activeProfileId)
  if (success) {
    showDeleteProfileConfirm.value = false
    campaignStore.loadCampaignList()
    router.push('/kampan')
  }
}

function switchToProfile(id: string) {
  profileStore.switchProfile(id)
  campaignStore.loadCampaignList()
  router.push('/kampan')
}

/* ── Statistics ── */
const completedCount = computed(() => scenarioStore.completedScenarios.length)
const totalScenarios = computed(() => scenarioStore.scenarioDefinitions.length)
const scenarioPct = computed(() =>
  totalScenarios.value === 0 ? 0 : Math.round((completedCount.value / totalScenarios.value) * 100)
)

const globalAchCount = computed(() => {
  const achs = campaignStore.currentCampaign?.globalAchievements ?? {}
  return Object.values(achs).filter(Boolean).length
})
const partyAchCount = computed(() => {
  const achs = campaignStore.currentCampaign?.partyAchievements ?? {}
  return Object.values(achs).filter(Boolean).length
})
const totalAchCount = computed(() => globalAchCount.value + partyAchCount.value)
const totalAchDefs = computed(() =>
  achievementStore.globalDefinitions.length + achievementStore.partyDefinitions.length
)

const totalGold = computed(() =>
  characterStore.activeCharacters.reduce((sum, c) => sum + c.gold, 0)
)

const campaignAge = computed(() => {
  const created = campaignStore.currentCampaign?.createdAt
  if (!created) return '—'
  const days = Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'dnes'
  if (days === 1) return '1 den'
  if (days < 5) return `${days} dny`
  return `${days} dní`
})

/* ── Export / Import ── */
async function handleExport() {
  try {
    const json = await campaignStore.exportCampaign()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name = (campaignStore.currentCampaign?.name ?? 'kampan').replace(/\s+/g, '-').toLowerCase()
    a.download = `gloomhaven-${name}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    exportSuccess.value = true
    setTimeout(() => (exportSuccess.value = false), 3000)
  } catch {
    // noop
  }
}

function handleImportClick() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    try {
      const json = await file.text()
      await campaignStore.importCampaign(json)
      importError.value = ''
      importSuccess.value = true
      setTimeout(() => (importSuccess.value = false), 3000)
    } catch {
      importError.value = 'Chyba při importu. Zkontrolujte soubor.'
    }
  }
  input.click()
}

async function resetCampaign() {
  if (!campaignStore.currentCampaign) return
  await campaignStore.deleteCampaign(campaignStore.currentCampaign.id)
  showResetConfirm.value = false
  router.push('/kampan')
}

async function handleSync() {
  isSyncing.value = true
  syncResult.value = null
  try {
    syncResult.value = await authStore.syncCampaigns()
    if (!syncResult.value.error) {
      await campaignStore.loadCampaignList()
    }
  } finally {
    isSyncing.value = false
    setTimeout(() => (syncResult.value = null), 5000)
  }
}

function handleLogout() {
  authStore.logout()
  campaignStore.loadCampaignList()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="gh-page-header">
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Nastavení</h1>
    </div>

    <!-- ── Účet ── -->
    <div class="gh-card relative overflow-hidden p-6 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500"></div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Účet &amp; Cloud sync</h3>
      </div>

      <!-- Logged in -->
      <template v-if="authStore.isLoggedIn">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold uppercase">
            {{ authStore.user?.username?.charAt(0) ?? '?' }}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-200">{{ authStore.user?.username }}</div>
            <div class="text-[11px] text-gray-600">{{ authStore.user?.email }}</div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="gh-btn-secondary text-xs flex items-center gap-1.5"
            :disabled="isSyncing"
            @click="handleSync"
          >
            <svg class="w-3.5 h-3.5" :class="{ 'animate-spin': isSyncing }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
            </svg>
            {{ isSyncing ? 'Synchronizuji...' : 'Synchronizovat' }}
          </button>
          <button class="gh-btn-ghost text-xs !text-gray-600 hover:!text-red-400" @click="handleLogout">
            Odhlásit se
          </button>
        </div>
        <p v-if="syncResult && !syncResult.error" class="mt-3 text-xs text-green-400 flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Synchronizováno ({{ syncResult.synced }} {{ syncResult.synced === 1 ? 'kampaň' : syncResult.synced < 5 ? 'kampaně' : 'kampaní' }})
        </p>
        <p v-if="syncResult?.error" class="mt-3 text-xs text-red-400">{{ syncResult.error }}</p>
      </template>

      <!-- Not logged in -->
      <template v-else>
        <p class="text-sm text-gray-400 mb-4">Přihlaste se pro synchronizaci kampaní napříč zařízeními.</p>
        <div class="flex gap-2">
          <router-link to="/prihlaseni" class="gh-btn-primary text-xs">Přihlásit se</router-link>
          <router-link to="/registrace" class="gh-btn-ghost text-xs">Registrace</router-link>
        </div>
      </template>
    </div>

    <!-- Profil hráče sekce odstraněna — hráči se spravují v Družině -->

    <!-- ── Kampaň ── -->
    <div v-if="campaignStore.hasCampaign" class="gh-card relative overflow-hidden p-6 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gh-primary"></div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-gh-primary/15 flex items-center justify-center">
          <svg class="w-4 h-4 text-gh-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Kampaň</h3>
      </div>

      <!-- Campaign name (editable) -->
      <div class="mb-3">
        <span
          v-if="!editingCampaignName"
          class="font-display text-lg font-semibold text-gray-200 cursor-pointer hover:text-gh-primary transition-colors"
          @click="editingCampaignName = true"
        >
          {{ campaignStore.currentCampaign?.name }}
          <svg class="w-3.5 h-3.5 inline-block ml-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
        </span>
        <input
          v-else
          type="text"
          :value="campaignStore.currentCampaign?.name"
          class="font-display text-lg font-semibold text-gh-primary bg-transparent border-b-2 border-gh-primary/40 outline-none w-64"
          @focus="selectAllOnFocus"
          @blur="editingCampaignName = false"
          @change="setCampaignName(inputValue($event))"
          @keydown.enter="editingCampaignName = false"
        />
      </div>

      <div class="flex flex-col gap-1 sm:flex-row sm:gap-4 text-xs text-gray-600">
        <span>Vytvořeno: {{ formatDate(campaignStore.currentCampaign?.createdAt ?? '') }}</span>
        <span>Naposledy: {{ formatDate(campaignStore.currentCampaign?.lastPlayedAt ?? '') }}</span>
      </div>

      <!-- Spoiler mode toggle -->
      <div class="mt-4 pt-4 border-t border-gh-border/30">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-300 font-medium">Skrýt spoilery</div>
            <div class="text-[11px] text-gray-600 mt-0.5">Skryje odemykatelné třídy, nedostupné předměty, nesplněné úspěchy</div>
          </div>
          <button
            class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4"
            :class="campaignStore.hideSpoilers ? 'bg-gh-primary' : 'bg-white/[0.1]'"
            @click="campaignStore.setHideSpoilers(!campaignStore.hideSpoilers)"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
              :class="{ 'translate-x-5': campaignStore.hideSpoilers }"
            />
          </button>
        </div>
      </div>

      <!-- Forgotten Circles toggle -->
      <div class="mt-3 pt-3 border-t border-gh-border/30">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-300 font-medium">Forgotten Circles</div>
            <div class="text-[11px] text-gray-600 mt-0.5 leading-relaxed">Rozšíření pro Gloomhaven — přidává novou třídu Diviner (Věštkyně) a předměty #152-164. Zapněte, pokud hrajete s tímto rozšířením.</div>
          </div>
          <button
            class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4"
            :class="campaignStore.currentCampaign?.forgottenCircles ? 'bg-gh-primary' : 'bg-white/[0.1]'"
            @click="toggleForgottenCircles"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
              :class="{ 'translate-x-5': campaignStore.currentCampaign?.forgottenCircles }"
            />
          </button>
        </div>
      </div>

      <!-- Sealed envelopes -->
      <div class="mt-3 pt-3 border-t border-gh-border/30">
        <div class="text-sm text-gray-300 font-medium mb-2">Zapečetěné obálky</div>
        <p class="text-[11px] text-gray-600 mb-3 leading-relaxed">Označte obálky, které jste ve hře otevřeli. Podmínky a obsah se zobrazí po otevření.</p>
        <div class="space-y-1">
          <div
            v-for="env in envelopeList"
            :key="env.key"
            class="rounded-lg transition-colors"
            :class="isEnvelopeOpen(env.key) ? 'bg-white/[0.02]' : ''"
          >
            <div
              class="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-white/[0.03] rounded-lg transition-colors group"
              @click="toggleEnvelope(env.key)"
            >
              <span
                class="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 shrink-0"
                :class="isEnvelopeOpen(env.key)
                  ? `${env.bg} ${env.border} border`
                  : 'border border-gray-600 bg-white/[0.03] group-hover:border-gray-500'"
              >
                <svg
                  v-if="isEnvelopeOpen(env.key)"
                  class="w-3.5 h-3.5" :class="env.color" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </span>
              <div class="flex-1 min-w-0">
                <span class="text-sm" :class="isEnvelopeOpen(env.key) ? env.color : 'text-gray-400 group-hover:text-gray-300'">
                  {{ env.label }}
                </span>
                <span v-if="!isEnvelopeOpen(env.key)" class="text-[10px] text-gray-600 ml-2">zapečetěno</span>
                <span v-else class="text-[10px] text-green-500/70 ml-2">otevřeno</span>
              </div>
            </div>
            <div v-if="isEnvelopeOpen(env.key)" class="px-3 pb-3 ml-9">
              <div class="text-[11px] text-gray-600 leading-relaxed">
                <span class="text-gray-500 font-medium">Podmínka:</span> {{ env.condition }}
              </div>
              <div class="text-[11px] leading-relaxed mt-0.5" :class="env.color" style="opacity: 0.7">
                <span class="text-gray-500 font-medium">Obsah:</span> {{ env.content }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="envelopeConfirm" class="mt-3 p-3 rounded-lg bg-amber-900/10 border border-amber-800/20">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span class="text-sm font-medium text-amber-300">
              Otevřít {{ envelopeList.find(e => e.key === envelopeConfirm)?.label }}?
            </span>
          </div>
          <p class="text-[11px] text-gray-500 mb-3">Zobrazí se podmínka a obsah obálky. Obsahuje spoilery!</p>
          <div class="flex gap-2">
            <button
              class="py-1.5 px-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors text-xs font-medium"
              @click="confirmOpenEnvelope"
            >
              Otevřít obálku
            </button>
            <button class="gh-btn-ghost text-xs" @click="envelopeConfirm = null">Zrušit</button>
          </div>
        </div>
      </div>

      <button
        class="mt-4 text-sm text-gh-primary hover:text-gh-primary-light transition-colors"
        @click="router.push('/kampan')"
      >
        Přepnout kampaň
      </button>
    </div>

    <!-- ── Sdílení kampaně ── -->
    <div v-if="campaignStore.hasCampaign && authStore.isLoggedIn" class="gh-card relative overflow-hidden p-6 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500"></div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sdílení kampaně</h3>
      </div>

      <!-- Owner view -->
      <template v-if="campaignStore.isCurrentCampaignOwned">
        <p class="text-sm text-gray-400 mb-4">Sdílejte kampaň s ostatními hráči pomocí kódu. Sdílí se scénáře, blahobyt, úspěchy a další společná data.</p>

        <!-- No share code yet -->
        <div v-if="!campaignStore.currentCampaignSummary?.shareCode && !campaignStore.shareInfo?.shareCode">
          <button
            class="gh-btn-primary text-sm flex items-center gap-2"
            :disabled="campaignStore.shareLoading"
            @click="handleGenerateShareCode"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            Vygenerovat kód pro sdílení
          </button>
        </div>

        <!-- Share code exists -->
        <div v-else>
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span class="font-mono text-2xl font-bold text-blue-300 tracking-[0.3em]">
                {{ campaignStore.currentCampaignSummary?.shareCode || campaignStore.shareInfo?.shareCode }}
              </span>
            </div>
            <button
              class="gh-btn-ghost text-xs flex items-center gap-1.5"
              @click="copyShareCode"
            >
              <svg v-if="!shareCodeCopied" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              <svg v-else class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {{ shareCodeCopied ? 'Zkopírováno' : 'Kopírovat' }}
            </button>
          </div>

          <!-- Member list -->
          <div v-if="campaignStore.shareInfo && campaignStore.shareInfo.members.length > 0" class="mb-4">
            <div class="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Členové ({{ campaignStore.shareInfo.members.length }})</div>
            <div class="space-y-2">
              <div
                v-for="member in campaignStore.shareInfo.members"
                :key="member.userId"
                class="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[11px] font-bold uppercase">
                    {{ member.username.charAt(0) }}
                  </div>
                  <span class="text-sm text-gray-300">{{ member.username }}</span>
                </div>
                <button
                  class="text-[11px] text-gray-600 hover:text-red-400 transition-colors"
                  @click="handleKickMember(member.userId)"
                >
                  Odebrat
                </button>
              </div>
            </div>
          </div>
          <div v-else-if="campaignStore.shareInfo" class="mb-4">
            <p class="text-xs text-gray-600">Zatím se nikdo nepřipojil. Sdílejte kód s ostatními hráči.</p>
          </div>

          <button
            class="text-xs text-gray-600 hover:text-red-400 transition-colors"
            @click="handleRevokeShare"
          >
            Zrušit sdílení
          </button>
        </div>
      </template>

      <!-- Member view (not owner) -->
      <template v-else>
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold uppercase">
            {{ campaignStore.shareInfo?.ownerUsername?.charAt(0) ?? '?' }}
          </div>
          <div>
            <div class="text-sm text-gray-300">Sdílená kampaň</div>
            <div class="text-[11px] text-gray-600">Vlastník: {{ campaignStore.shareInfo?.ownerUsername ?? campaignStore.currentCampaignSummary?.ownerUsername }}</div>
          </div>
        </div>

        <!-- Member list -->
        <div v-if="campaignStore.shareInfo && campaignStore.shareInfo.members.length > 0" class="mb-4">
          <div class="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Členové</div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="member in campaignStore.shareInfo.members"
              :key="member.userId"
              class="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400"
            >
              {{ member.username }}
            </span>
          </div>
        </div>

        <button
          class="text-sm text-red-400/80 hover:text-red-400 transition-colors"
          @click="handleLeaveCampaign"
        >
          Opustit kampaň
        </button>
      </template>

      <p v-if="campaignStore.shareError" class="mt-3 text-xs text-red-400">{{ campaignStore.shareError }}</p>
    </div>

    <!-- Not logged in hint for sharing -->
    <div v-if="campaignStore.hasCampaign && !authStore.isLoggedIn" class="gh-card relative overflow-hidden p-6 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500/40"></div>
      <div class="flex items-center gap-2 mb-3">
        <div class="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sdílení kampaně</h3>
      </div>
      <p class="text-sm text-gray-500">Přihlaste se pro sdílení kampaně s ostatními hráči.</p>
    </div>

    <!-- ── Statistiky ── -->
    <div v-if="campaignStore.hasCampaign" class="gh-card relative overflow-hidden p-6 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500"></div>
      <div class="flex items-center gap-2 mb-5">
        <div class="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
          <svg class="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Statistiky kampaně</h3>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <!-- Scénáře -->
        <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
          <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 font-semibold">Scénáře</div>
          <div class="font-display text-xl font-bold text-green-400">{{ completedCount }}</div>
          <div class="text-[10px] text-gray-600">z {{ totalScenarios }}</div>
          <div class="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-2">
            <div class="h-full bg-green-500 rounded-full transition-all duration-500" :style="{ width: scenarioPct + '%' }"></div>
          </div>
        </div>

        <!-- Úspěchy -->
        <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
          <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 font-semibold">Úspěchy</div>
          <div class="font-display text-xl font-bold text-amber-400">{{ totalAchCount }}</div>
          <div class="text-[10px] text-gray-600">z {{ totalAchDefs }}</div>
          <div class="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-2">
            <div class="h-full bg-amber-500 rounded-full transition-all duration-500" :style="{ width: totalAchDefs > 0 ? Math.round((totalAchCount / totalAchDefs) * 100) + '%' : '0%' }"></div>
          </div>
        </div>

        <!-- Postavy -->
        <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
          <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 font-semibold">Postavy</div>
          <div class="font-display text-xl font-bold text-blue-400">{{ characterStore.activeCharacters.length }}</div>
          <div class="text-[10px] text-gray-600">aktivní</div>
          <div v-if="characterStore.archivedCharacters.length > 0" class="text-[10px] text-gray-600 mt-1">
            + {{ characterStore.archivedCharacters.length }} penz.
          </div>
        </div>

        <!-- Zlato -->
        <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
          <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 font-semibold">Celk. zlato</div>
          <div class="font-display text-xl font-bold text-yellow-400">{{ totalGold }}</div>
          <div class="text-[10px] text-gray-600">zl.</div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <!-- Blahobyt -->
        <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
          <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1 font-semibold">Blahobyt</div>
          <div class="font-display text-lg font-bold text-gh-primary">{{ partyStore.prosperityLevel }}</div>
        </div>
        <!-- Reputace -->
        <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
          <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1 font-semibold">Reputace</div>
          <div class="font-display text-lg font-bold" :class="partyStore.reputation >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ partyStore.reputation > 0 ? '+' : '' }}{{ partyStore.reputation }}
          </div>
        </div>
        <!-- Doba hraní -->
        <div class="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.04]">
          <div class="text-[10px] text-gray-600 uppercase tracking-wider mb-1 font-semibold">Doba kampaně</div>
          <div class="font-display text-lg font-bold text-gray-300">{{ campaignAge }}</div>
        </div>
      </div>
    </div>

    <!-- ── Data (export/import) ── -->
    <div class="gh-card relative overflow-hidden p-6 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500"></div>
      <div class="flex items-center gap-2 mb-5">
        <div class="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Data</h3>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button v-if="campaignStore.hasCampaign" class="gh-btn-secondary flex-1 text-sm" @click="handleExport">
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportovat kampaň
          </span>
        </button>
        <button class="gh-btn-ghost flex-1 text-sm" @click="handleImportClick">
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Importovat kampaň
          </span>
        </button>
      </div>
      <p v-if="exportSuccess" class="mt-3 text-xs text-green-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Export úspěšný!
      </p>
      <p v-if="importSuccess" class="mt-3 text-xs text-green-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Import úspěšný!
      </p>
      <p v-if="importError" class="mt-3 text-xs text-red-400">{{ importError }}</p>
    </div>

    <!-- ── Podpořte vývoj ── -->
    <div class="gh-card relative overflow-hidden p-6 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gh-primary to-yellow-600"></div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-gh-primary/10 flex items-center justify-center">
          <svg class="w-4 h-4 text-gh-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Podpořte vývoj</h3>
      </div>

      <p class="text-sm text-gray-400 leading-relaxed mb-5">
        Líbí se vám aplikace? Kupte mi pivo!
      </p>

      <div class="grid grid-cols-3 gap-2 mb-4">
        <a
          href="https://buymeacoffee.com/ongy"
          target="_blank"
          rel="noopener"
          class="py-2.5 rounded-lg bg-gradient-to-b from-gh-primary/20 to-gh-primary/5 border border-gh-primary/30 text-gh-primary text-xs font-semibold text-center hover:border-gh-primary/60 hover:shadow-[0_0_12px_rgba(196,163,90,0.15)] transition-all"
        >
          Karta
        </a>
        <a
          href="https://revolut.me/ondejqv70"
          target="_blank"
          rel="noopener"
          class="py-2.5 rounded-lg bg-gradient-to-b from-blue-500/15 to-blue-500/5 border border-blue-500/25 text-blue-400 text-xs font-semibold text-center hover:border-blue-400/50 transition-all"
        >
          Revolut
        </a>
        <button
          class="py-2.5 rounded-lg bg-gradient-to-b from-orange-500/15 to-orange-500/5 border border-orange-500/25 text-orange-400 text-xs font-semibold text-center hover:border-orange-400/50 transition-all"
          @click="showBtc = !showBtc"
        >
          Bitcoin
        </button>
      </div>

      <!-- BTC detail (collapsible) -->
      <div v-if="showBtc" class="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-gh-border/40">
        <canvas ref="btcQrCanvas" class="rounded shrink-0" />
        <p class="font-mono text-[10px] text-gray-500 break-all select-all cursor-pointer leading-relaxed" title="Klikni pro zkopírování">bc1qhypsfmnw0a4g8aar2evx6tdvq30jvnen96few2</p>
      </div>
    </div>

    <!-- ── Nebezpečná zóna ── -->
    <div v-if="campaignStore.hasCampaign" class="gh-card relative overflow-hidden p-6 mb-5">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600"></div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-red-600/15 flex items-center justify-center">
          <svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nebezpečná zóna</h3>
      </div>
      <p class="text-xs text-gray-600 mb-4">Smazání kampaně je nevratné. Doporučujeme nejdřív exportovat.</p>
      <button
        v-if="!showResetConfirm"
        class="py-2 px-4 text-red-400/80 border border-red-900/30 rounded-lg hover:bg-red-900/15 transition-all text-sm"
        @click="showResetConfirm = true"
      >
        Smazat kampaň
      </button>
      <div v-else class="flex gap-2">
        <button
          class="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
          @click="resetCampaign"
        >
          Opravdu smazat
        </button>
        <button
          class="gh-btn-ghost text-sm"
          @click="showResetConfirm = false"
        >
          Zrušit
        </button>
      </div>
    </div>

    <!-- ── O aplikaci ── -->
    <div class="gh-card relative overflow-hidden p-6">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gray-600"></div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        </div>
        <h3 class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">O aplikaci</h3>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Verze</span>
          <span class="text-gray-300 font-medium">3.9.2</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Technologie</span>
          <span class="text-gray-400">Vue 3 + Vite + Tailwind + PWA</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Data</span>
          <span class="text-gray-400">localStorage + cloud sync</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Testy</span>
          <span class="text-gray-400">105 unit + 9 E2E</span>
        </div>
      </div>
    </div>
  </div>
</template>
