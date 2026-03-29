<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCampaignStore } from '@/stores/campaignStore'

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

function handleCodeInput(e: Event) {
  const input = e.target as HTMLInputElement
  // Strip everything except digits
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
    // Auto-login after verification
    const loginOk = await authStore.login(email.value.trim(), password.value)
    if (loginOk) {
      await authStore.syncCampaigns()
      await campaignStore.loadCampaignList()
      router.push('/kampan')
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
  <div class="max-w-sm mx-auto pt-16">
    <div class="text-center mb-10">
      <div class="w-14 h-14 rounded-2xl bg-gh-primary/10 flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gh-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
      </div>
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">
        {{ phase === 'register' ? 'Registrace' : 'Ověření emailu' }}
      </h1>
      <p class="text-sm text-gray-500 mt-2">
        {{ phase === 'register' ? 'Vytvořte si účet pro cloud sync' : 'Zadejte kód z emailu' }}
      </p>
    </div>

    <!-- Phase 1: Registration form -->
    <form v-if="phase === 'register'" @submit.prevent="handleRegister" class="space-y-4">
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
        <label class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Uživatelské jméno</label>
        <input
          v-model="username"
          type="text"
          class="gh-input w-full"
          placeholder="username"
          autocomplete="username"
        />
      </div>
      <div>
        <label class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Heslo</label>
        <input
          v-model="password"
          type="password"
          class="gh-input w-full"
          placeholder="min. 6 znaků"
          autocomplete="new-password"
        />
      </div>

      <label class="flex items-center justify-center gap-2.5 cursor-pointer">
        <input
          v-model="gdprConsent"
          type="checkbox"
          class="accent-gh-primary shrink-0"
        />
        <span class="text-xs text-gray-400">
          Souhlasím se
          <router-link to="/ochrana-udaju" class="text-gh-primary hover:text-gh-primary-light" target="_blank">
            zpracováním osobních údajů
          </router-link>
        </span>
      </label>

      <p v-if="authStore.error" class="text-xs text-red-400">{{ authStore.error }}</p>

      <button
        type="submit"
        class="gh-btn-primary w-full"
        :disabled="authStore.isLoading || !gdprConsent"
        :class="{ 'opacity-40 cursor-not-allowed': !gdprConsent }"
      >
        {{ authStore.isLoading ? 'Registruji...' : 'Zaregistrovat' }}
      </button>
    </form>

    <!-- Phase 2: Verification code -->
    <form v-else @submit.prevent="handleVerify" class="space-y-4">
      <div class="gh-card p-4 text-center">
        <p class="text-sm text-gray-400">
          Odeslali jsme ověřovací kód na
          <span class="text-gray-200 font-medium">{{ email }}</span>
        </p>
        <p class="text-[11px] text-gray-600 mt-1">Kód platí 15 minut</p>
      </div>

      <div>
        <label class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1.5 block">Ověřovací kód</label>
        <input
          :value="code"
          type="text"
          class="gh-input w-full text-center text-2xl tracking-[0.3em] font-mono"
          placeholder="000000"
          maxlength="20"
          autocomplete="one-time-code"
          @input="handleCodeInput"
        />
      </div>

      <p v-if="authStore.error" class="text-xs text-red-400">{{ authStore.error }}</p>

      <button
        type="submit"
        class="gh-btn-primary w-full"
        :disabled="authStore.isLoading"
      >
        {{ authStore.isLoading ? 'Ověřuji...' : 'Ověřit' }}
      </button>

      <div class="text-center">
        <button
          type="button"
          class="text-xs text-gray-500 hover:text-gh-primary transition-colors"
          @click="handleResend"
        >
          Odeslat kód znovu
        </button>
        <p v-if="resendSuccess" class="text-xs text-green-400 mt-1">Kód odeslán!</p>
      </div>
    </form>

    <p class="text-center text-sm text-gray-500 mt-6">
      Máte účet?
      <router-link to="/prihlaseni" class="text-gh-primary hover:text-gh-primary-light transition-colors">
        Přihlaste se
      </router-link>
    </p>

    <p class="text-center mt-4">
      <router-link to="/kampan" class="text-xs text-gray-600 hover:text-gray-400 transition-colors">
        Pokračovat bez registrace
      </router-link>
    </p>
  </div>
</template>
