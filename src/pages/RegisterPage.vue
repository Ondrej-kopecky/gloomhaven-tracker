<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCampaignStore } from '@/stores/campaignStore'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const campaignStore = useCampaignStore()

const phase = ref<'register' | 'verify'>('register')
const email = ref('')
const username = ref('')
const password = ref('')
const code = ref('')
const resendSuccess = ref(false)
const gdprConsent = ref(false)

const canRegister = computed(() =>
  email.value.trim().length > 3 && email.value.includes('@') &&
  username.value.trim().length >= 2 &&
  password.value.length >= 8 &&
  gdprConsent.value,
)

function handleCodeInput(e: Event) {
  const input = e.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 6)
  code.value = digits
  input.value = digits
}

async function handleRegister() {
  if (!email.value.trim() || !username.value.trim() || !password.value) return
  if (password.value.length < 8) {
    authStore.error = 'Heslo musí mít alespoň 8 znaků'
    return
  }
  const ok = await authStore.register(email.value.trim(), username.value.trim(), password.value)
  if (ok) {
    phase.value = 'verify'
  }
}

async function handleVerify() {
  if (!code.value.trim()) return
  const ok = await authStore.verifyEmail(email.value.trim(), code.value.trim())
  if (ok) {
    const loginOk = await authStore.login(email.value.trim(), password.value)
    if (loginOk) {
      await authStore.syncCampaigns()
      await campaignStore.loadCampaignList()
      // nový účet → onboarding wizard; OnboardingPage přesměruje na /prehled, pokud už kampaň je
      router.push(campaignStore.hasCampaign ? '/prehled' : '/onboarding')
    }
  }
}

async function handleResend() {
  const ok = await authStore.resendCode(email.value.trim())
  if (ok) {
    resendSuccess.value = true
    setTimeout(() => (resendSuccess.value = false), 3000)
  }
}
</script>

<template>
  <AuthLayout
    :title="phase === 'register' ? 'Registrace' : 'Ověření e-mailu'"
    :subtitle="phase === 'register' ? 'Vytvořte si účet pro cloud synchronizaci' : 'Zadejte kód, který jsme poslali na e-mail'"
  >
    <template #icon>
      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
      </svg>
    </template>

    <!-- Fáze 1: registrační formulář -->
    <form v-if="phase === 'register'" @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="gh-micro mb-1.5 block">Email</label>
        <input v-model="email" type="email" class="gh-input w-full" placeholder="vas@email.cz" autocomplete="email" />
      </div>
      <div>
        <label class="gh-micro mb-1.5 block">Uživatelské jméno</label>
        <input v-model="username" type="text" class="gh-input w-full" placeholder="jmeno" autocomplete="username" />
      </div>
      <div>
        <label class="gh-micro mb-1.5 block">Heslo</label>
        <input v-model="password" type="password" class="gh-input w-full" placeholder="Min. 8 znaků" autocomplete="new-password" />
      </div>

      <label class="flex items-start gap-2.5 cursor-pointer text-left">
        <input v-model="gdprConsent" type="checkbox" class="accent-gh-primary shrink-0 mt-0.5" />
        <span class="text-xs text-gray-400 leading-relaxed">
          Souhlasím se
          <router-link to="/ochrana-udaju" class="text-gh-primary hover:text-gh-primary-light" target="_blank">zpracováním osobních údajů</router-link>
        </span>
      </label>

      <p v-if="authStore.error" class="text-xs text-red-400">{{ authStore.error }}</p>

      <button
        type="submit"
        class="gh-btn-primary w-full transition-opacity"
        :class="{ 'opacity-40 cursor-not-allowed': !canRegister || authStore.isLoading }"
        :disabled="!canRegister || authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Registruji…' : 'Zaregistrovat' }}
      </button>
    </form>

    <!-- Fáze 2: ověřovací kód -->
    <form v-else @submit.prevent="handleVerify" class="space-y-4">
      <div class="rounded-lg bg-black/25 border border-gh-border px-4 py-3 text-center">
        <p class="text-sm text-gray-400">Ověřovací kód jsme poslali na <span class="text-gray-200 font-medium">{{ email }}</span></p>
        <p class="text-[11px] text-gray-600 mt-1">Kód platí 15 minut</p>
      </div>
      <div>
        <label class="gh-micro mb-1.5 block">Ověřovací kód</label>
        <input
          :value="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          autocomplete="one-time-code"
          class="gh-input w-full text-center text-2xl tracking-[0.5em] font-mono"
          placeholder="000000"
          @input="handleCodeInput"
        />
      </div>

      <p v-if="authStore.error" class="text-xs text-red-400">{{ authStore.error }}</p>

      <button type="submit" class="gh-btn-primary w-full" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? 'Ověřuji…' : 'Ověřit' }}
      </button>

      <div class="text-center">
        <button type="button" class="text-xs text-gray-500 hover:text-gh-primary transition-colors" @click="handleResend">Odeslat kód znovu</button>
        <p v-if="resendSuccess" class="text-xs text-green-400 mt-1">Kód odeslán!</p>
      </div>
    </form>

    <template #footer>
      <p>
        Máte účet?
        <router-link to="/prihlaseni" class="text-gh-primary hover:text-gh-primary-light transition-colors">Přihlaste se</router-link>
      </p>
      <p>
        <router-link to="/kampan" class="text-xs text-gray-600 hover:text-gray-400 transition-colors">Pokračovat bez registrace</router-link>
      </p>
    </template>
  </AuthLayout>
</template>
