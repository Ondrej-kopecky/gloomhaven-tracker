<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
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
const showResetConfirm = ref(false)
const showDeleteProfileConfirm = ref(false)
const importError = ref('')
const exportSuccess = ref(false)
const importSuccess = ref(false)

const syncResult = ref<{ synced: number; error: string | null } | null>(null)
const isSyncing = ref(false)

const editingCampaignName = ref(false)
const editingProfileName = ref(false)
const newProfileName = ref('')
const showNewProfile = ref(false)

onMounted(async () => {
  if (campaignStore.hasCampaign) {
    await scenarioStore.loadScenarioData()
  }
  await nextTick()
  if (btcQrCanvas.value) {
    QRCode.toCanvas(btcQrCanvas.value, 'bitcoin:bc1qhypsfmnw0a4g8aar2evx6tdvq30jvnen96few2', {
      width: 96,
      margin: 1,
      color: { dark: '#f97316', light: '#00000000' },
    })
  }
})

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

      <button
        class="mt-4 text-sm text-gh-primary hover:text-gh-primary-light transition-colors"
        @click="router.push('/kampan')"
      >
        Přepnout kampaň
      </button>
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
        Pokud vám aplikace pomáhá s hraním Gloomhavenu, kupte mi pivo!
      </p>

      <!-- Tlačítka vedle sebe -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <a
          href="https://buymeacoffee.com/ongy"
          target="_blank"
          rel="noopener"
          class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl bg-white/[0.03] border border-gh-border hover:border-gh-primary/40 hover:bg-gh-primary/5 transition-all text-center group"
        >
          <span class="text-3xl">&#9749;</span>
          <span class="text-xs font-semibold text-gh-primary">Buy Me a Coffee</span>
          <span class="text-[10px] text-gray-600">kartou</span>
        </a>
        <a
          href="https://revolut.me/ondejqv70"
          target="_blank"
          rel="noopener"
          class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl bg-white/[0.03] border border-gh-border hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-center group"
        >
          <span class="text-3xl">&#127866;</span>
          <span class="text-xs font-semibold text-blue-400">Revolut</span>
          <span class="text-[10px] text-gray-600">@ondejqv70</span>
        </a>
      </div>

      <!-- Bitcoin -->
      <div class="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-gh-border">
        <canvas ref="btcQrCanvas" class="rounded-lg shrink-0" />
        <div class="min-w-0">
          <p class="text-xs font-semibold text-orange-400 mb-1">Bitcoin</p>
          <p class="font-mono text-[10px] text-gray-500 break-all select-all cursor-pointer leading-relaxed" title="Klikni pro zkopírování">bc1qhypsfmnw0a4g8aar2evx6tdvq30jvnen96few2</p>
        </div>
      </div>
    </div>

    <!-- ── O aplikaci ── -->
    <div class="gh-card relative overflow-hidden p-6 mb-5">
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
          <span class="text-gray-300 font-medium">2.0.0</span>
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
          <span class="text-gray-400">95 unit + 9 E2E</span>
        </div>
      </div>
    </div>

    <!-- ── Nebezpečná zóna ── -->
    <div v-if="campaignStore.hasCampaign" class="rounded-2xl p-6 border border-red-900/25 bg-red-900/[0.04]">
      <h3 class="text-[11px] font-semibold text-red-400/60 uppercase tracking-wider mb-4">Nebezpečná zóna</h3>
      <p class="text-xs text-gray-500 mb-4 leading-relaxed">Smazání kampaně je nevratné. Před smazáním si doporučujeme exportovat data.</p>
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
  </div>
</template>
