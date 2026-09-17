<script setup lang="ts">
import { ref } from 'vue'
import { forgotPassword, resetPassword } from '@/services/api/authApi'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = useRouter()

const phase = ref<'email' | 'code'>('email')
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const loading = ref(false)

async function handleForgot() {
  if (!email.value.trim()) return
  error.value = null
  loading.value = true
  const result = await forgotPassword(email.value.trim())
  loading.value = false
  if (result.error) {
    error.value = result.error
  } else {
    success.value = 'Kód byl odeslán na e-mail (pokud účet existuje)'
    phase.value = 'code'
  }
}

async function handleReset() {
  if (!code.value.trim() || !newPassword.value) return
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Hesla se neshodují'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = 'Heslo musí mít alespoň 8 znaků'
    return
  }
  error.value = null
  loading.value = true
  const result = await resetPassword(email.value.trim(), code.value.trim(), newPassword.value)
  loading.value = false
  if (result.error) {
    error.value = result.error
  } else {
    success.value = 'Heslo bylo změněno! Můžeš se přihlásit.'
    setTimeout(() => router.push('/prihlaseni'), 2000)
  }
}
</script>

<template>
  <AuthLayout
    title="Zapomenuté heslo"
    :subtitle="phase === 'email' ? 'Zadej e-mail a pošleme ti kód pro reset' : 'Zadej kód z e-mailu a nové heslo'"
  >
    <template #icon>
      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    </template>

    <!-- Fáze 1: e-mail -->
    <form v-if="phase === 'email'" @submit.prevent="handleForgot" class="space-y-4">
      <div>
        <label class="gh-micro mb-1.5 block">E-mail</label>
        <input v-model="email" type="email" class="gh-input w-full" placeholder="vas@email.cz" autocomplete="email" />
      </div>
      <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
      <p v-if="success" class="text-xs text-green-400">{{ success }}</p>
      <button
        type="submit"
        class="gh-btn-primary w-full transition-opacity"
        :class="{ 'opacity-40 cursor-not-allowed': !email.trim() || loading }"
        :disabled="!email.trim() || loading"
      >
        {{ loading ? 'Odesílám…' : 'Odeslat kód' }}
      </button>
    </form>

    <!-- Fáze 2: kód + nové heslo -->
    <form v-else @submit.prevent="handleReset" class="space-y-4">
      <div>
        <label class="gh-micro mb-1.5 block">Kód z e-mailu</label>
        <input v-model="code" type="text" inputmode="numeric" maxlength="6" class="gh-input w-full text-center text-2xl tracking-[0.5em] font-mono" placeholder="000000" />
      </div>
      <div>
        <label class="gh-micro mb-1.5 block">Nové heslo</label>
        <input v-model="newPassword" type="password" class="gh-input w-full" placeholder="Min. 8 znaků" autocomplete="new-password" />
      </div>
      <div>
        <label class="gh-micro mb-1.5 block">Potvrzení hesla</label>
        <input v-model="confirmPassword" type="password" class="gh-input w-full" placeholder="Znovu nové heslo" autocomplete="new-password" />
      </div>
      <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
      <p v-if="success" class="text-xs text-green-400">{{ success }}</p>
      <button type="submit" class="gh-btn-primary w-full" :disabled="loading">
        {{ loading ? 'Měním heslo…' : 'Změnit heslo' }}
      </button>
      <button type="button" class="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-2" @click="handleForgot">
        Odeslat kód znovu
      </button>
    </form>

    <template #footer>
      <p>
        <router-link to="/prihlaseni" class="text-gh-primary hover:text-gh-primary-light transition-colors">Zpět na přihlášení</router-link>
      </p>
    </template>
  </AuthLayout>
</template>
