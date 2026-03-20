<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCampaignStore } from '@/stores/campaignStore'

const router = useRouter()
const authStore = useAuthStore()
const campaignStore = useCampaignStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
  if (!email.value.trim() || !password.value) return
  const ok = await authStore.login(email.value.trim(), password.value)
  if (ok) {
    await authStore.syncCampaigns()
    await campaignStore.loadCampaignList()
    router.push('/kampan')
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto pt-16">
    <div class="text-center mb-10">
      <div class="w-14 h-14 rounded-2xl bg-gh-primary/10 flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gh-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Přihlášení</h1>
      <p class="text-sm text-gray-500 mt-2">Přihlaste se pro synchronizaci kampaní</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Email</label>
        <input
          v-model="email"
          type="email"
          class="gh-input w-full"
          placeholder="vas@email.cz"
          autocomplete="email"
        />
      </div>
      <div>
        <label class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Heslo</label>
        <input
          v-model="password"
          type="password"
          class="gh-input w-full"
          placeholder="********"
          autocomplete="current-password"
        />
      </div>

      <p v-if="authStore.error" class="text-xs text-red-400">{{ authStore.error }}</p>

      <button
        type="submit"
        class="gh-btn-primary w-full"
        :disabled="authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Přihlašuji...' : 'Přihlásit se' }}
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-6">
      <router-link to="/zapomenute-heslo" class="text-gh-primary/70 hover:text-gh-primary transition-colors">
        Zapomenuté heslo?
      </router-link>
    </p>

    <p class="text-center text-sm text-gray-500 mt-3">
      Nemáte účet?
      <router-link to="/registrace" class="text-gh-primary hover:text-gh-primary-light transition-colors">
        Zaregistrujte se
      </router-link>
    </p>

    <p class="text-center mt-4">
      <router-link to="/kampan" class="text-xs text-gray-600 hover:text-gray-400 transition-colors">
        Pokračovat bez přihlášení
      </router-link>
    </p>
  </div>
</template>
