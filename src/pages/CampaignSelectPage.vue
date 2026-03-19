<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const campaignStore = useCampaignStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const newCampaignName = ref('')
const showCreate = ref(false)
const showDeleteConfirm = ref<string | null>(null)

const loginEmail = ref('')
const loginPassword = ref('')

async function handleQuickLogin() {
  if (!loginEmail.value.trim() || !loginPassword.value) return
  const ok = await authStore.login(loginEmail.value.trim(), loginPassword.value)
  if (ok) {
    await authStore.syncCampaigns()
    await campaignStore.loadCampaignList()
  }
}

onMounted(async () => {
  await campaignStore.loadCampaignList()
})

async function createCampaign() {
  if (!newCampaignName.value.trim()) return
  await campaignStore.createCampaign(newCampaignName.value.trim())
  newCampaignName.value = ''
  showCreate.value = false
  router.push('/prehled')
}

async function loadCampaign(id: string) {
  await campaignStore.loadCampaign(id)
  router.push('/prehled')
}

async function deleteCampaign(id: string) {
  await campaignStore.deleteCampaign(id)
  showDeleteConfirm.value = null
}

function switchProfile(id: string) {
  profileStore.switchProfile(id)
  campaignStore.loadCampaignList()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Hero -->
    <div class="text-center pt-16 pb-12">
      <!-- Decorative swords icon -->
      <div class="relative inline-block mb-6">
        <svg class="w-16 h-16 text-gh-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M14.5 17.5L3 6V3h3l11.5 11.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 19l6-6M16 16l3.5 3.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.5 17.5L21 6V3h-3L6.5 14.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 19l-6-6M8 16l-3.5 3.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="absolute inset-0 bg-gh-primary/15 blur-2xl rounded-full" />
      </div>

      <h1 class="font-display text-5xl font-bold text-gh-primary tracking-wider mb-3">
        GLOOMHAVEN
      </h1>
      <p class="text-sm text-gray-500 tracking-[0.25em] uppercase font-light">Campaign Tracker</p>

      <!-- Ornamental divider -->
      <div class="flex items-center justify-center gap-3 mt-6">
        <div class="w-16 h-px bg-gradient-to-r from-transparent to-gh-primary/40" />
        <div class="w-1.5 h-1.5 rotate-45 border border-gh-primary/50" />
        <div class="w-16 h-px bg-gradient-to-l from-transparent to-gh-primary/40" />
      </div>
    </div>

    <!-- Profile switcher -->
    <div v-if="profileStore.profiles.length > 1" class="flex items-center justify-center gap-2 mb-8">
      <span class="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mr-1">Profil:</span>
      <button
        v-for="p in profileStore.profiles"
        :key="p.id"
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        :class="p.id === profileStore.activeProfileId
          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          : 'bg-white/[0.04] text-gray-500 border border-gh-border hover:bg-white/[0.08] hover:text-gray-300'"
        @click="switchProfile(p.id)"
      >
        {{ p.name }}
      </button>
    </div>

    <!-- Logged in: cloud sync badge -->
    <div v-if="authStore.isLoggedIn" class="flex items-center justify-center gap-3 mb-8">
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
        </svg>
        <span class="text-[11px] text-emerald-400 font-medium">{{ authStore.user?.username }}</span>
      </div>
    </div>

    <!-- Not logged in: inline login card -->
    <div v-else class="gh-card relative overflow-hidden p-5 mb-8">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500"></div>
      <div class="flex items-start gap-4">
        <div class="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <svg class="w-4.5 h-4.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-200 mb-1">Přihlaste se pro cloud sync</h3>
          <p class="text-[11px] text-gray-600 mb-3">Synchronizujte kampaně napříč zařízeními</p>

          <form @submit.prevent="handleQuickLogin" class="flex flex-col sm:flex-row gap-2">
            <input
              v-model="loginEmail"
              type="email"
              placeholder="Email"
              class="gh-input text-xs flex-1"
              autocomplete="email"
            />
            <input
              v-model="loginPassword"
              type="password"
              placeholder="Heslo"
              class="gh-input text-xs flex-1"
              autocomplete="current-password"
            />
            <button
              type="submit"
              class="gh-btn-primary text-xs whitespace-nowrap"
              :disabled="authStore.isLoading"
            >
              {{ authStore.isLoading ? '...' : 'Přihlásit' }}
            </button>
          </form>
          <p v-if="authStore.error" class="text-xs text-red-400 mt-2">{{ authStore.error }}</p>
          <p class="text-[11px] text-gray-600 mt-2">
            Nemáte účet?
            <router-link to="/registrace" class="text-gh-primary hover:text-gh-primary-light transition-colors">
              Zaregistrujte se
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Create new campaign -->
    <div class="mb-8">
      <button
        v-if="!showCreate"
        class="w-full py-4 px-5 rounded-xl font-medium transition-all duration-300 border-2 border-dashed border-gh-primary/20 text-gh-primary/80 bg-gh-primary/[0.03] hover:bg-gh-primary/[0.07] hover:border-gh-primary/40 hover:shadow-[0_0_40px_rgba(196,163,90,0.08)] group"
        @click="showCreate = true"
      >
        <span class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nová kampaň
        </span>
      </button>

      <div
        v-else
        class="gh-card p-6"
      >
        <h3 class="font-display text-lg font-semibold text-gray-200 mb-4 tracking-wide">Nová kampaň</h3>
        <input
          v-model="newCampaignName"
          type="text"
          placeholder="Název kampaně..."
          class="gh-input w-full mb-4"
          autofocus
          @keyup.enter="createCampaign"
        />
        <div class="flex gap-3">
          <button
            class="gh-btn-primary flex-1"
            @click="createCampaign"
          >
            Vytvořit
          </button>
          <button
            class="gh-btn-ghost"
            @click="showCreate = false"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>

    <!-- Campaign list -->
    <div v-if="campaignStore.campaigns.length > 0" class="space-y-3">
      <div class="gh-divider mb-5">Uložené kampaně</div>

      <div
        v-for="campaign in campaignStore.campaigns"
        :key="campaign.id"
        class="gh-card gh-card-interactive p-5"
        @click="loadCampaign(campaign.id)"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="font-display text-lg font-semibold text-gray-200 group-hover:text-gh-primary transition-colors truncate tracking-wide">
              {{ campaign.name }}
            </h3>
            <p class="text-xs text-gray-600 mt-1.5 flex items-center gap-1.5">
              <svg class="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {{ formatDate(campaign.lastPlayedAt) }}
            </p>
          </div>

          <div class="flex gap-2 ml-4 shrink-0" @click.stop>
            <button
              class="gh-btn-secondary text-sm"
              @click="loadCampaign(campaign.id)"
            >
              Načíst
            </button>
            <button
              v-if="showDeleteConfirm !== campaign.id"
              class="gh-btn-ghost text-sm !text-gray-600 hover:!text-red-400 hover:!bg-red-900/15 hover:!border-red-900/30"
              @click="showDeleteConfirm = campaign.id"
            >
              Smazat
            </button>
            <div v-else class="flex gap-1.5">
              <button
                class="text-sm py-2 px-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-medium"
                @click="deleteCampaign(campaign.id)"
              >
                Potvrdit
              </button>
              <button
                class="gh-btn-ghost text-sm"
                @click="showDeleteConfirm = null"
              >
                Ne
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-20">
      <div class="inline-block p-4 rounded-2xl bg-white/[0.02] mb-4">
        <svg class="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
      <p class="text-gray-500 text-lg font-display tracking-wide">Zatím žádné kampaně</p>
      <p class="text-gray-600 text-sm mt-2">Vytvořte novou kampaň a začněte dobrodružství!</p>
    </div>
  </div>
</template>
