<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCampaignStore } from '@/stores/campaignStore'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const campaignStore = useCampaignStore()

const email = ref('')
const password = ref('')

const canSubmit = computed(() => email.value.trim().length > 3 && email.value.includes('@') && password.value.length > 0)

async function handleLogin() {
  if (!canSubmit.value) return
  const ok = await authStore.login(email.value.trim(), password.value)
  if (ok) {
    await authStore.syncCampaigns()
    await campaignStore.loadCampaignList()
    router.push('/kampan')
  }
}
</script>

<template>
  <AuthLayout title="Přihlášení" subtitle="Přihlaste se pro synchronizaci kampaní">
    <template #icon>
      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    </template>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="gh-micro mb-1.5 block">Email</label>
        <input v-model="email" type="email" class="gh-input w-full" placeholder="vas@email.cz" autocomplete="email" />
      </div>
      <div>
        <label class="gh-micro mb-1.5 block">Heslo</label>
        <input v-model="password" type="password" class="gh-input w-full" placeholder="••••••••" autocomplete="current-password" />
      </div>

      <p v-if="authStore.error" class="text-xs text-red-400">{{ authStore.error }}</p>

      <button
        type="submit"
        class="gh-btn-primary w-full transition-opacity"
        :class="{ 'opacity-40 cursor-not-allowed': !canSubmit || authStore.isLoading }"
        :disabled="!canSubmit || authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Přihlašuji…' : 'Přihlásit se' }}
      </button>
    </form>

    <template #footer>
      <p>
        <router-link to="/zapomenute-heslo" class="text-gh-primary/70 hover:text-gh-primary transition-colors">Zapomenuté heslo?</router-link>
      </p>
      <p>
        Nemáte účet?
        <router-link to="/registrace" class="text-gh-primary hover:text-gh-primary-light transition-colors">Zaregistrujte se</router-link>
      </p>
      <p>
        <router-link to="/kampan" class="text-xs text-gray-600 hover:text-gray-400 transition-colors">Pokračovat bez přihlášení</router-link>
      </p>
    </template>
  </AuthLayout>
</template>
