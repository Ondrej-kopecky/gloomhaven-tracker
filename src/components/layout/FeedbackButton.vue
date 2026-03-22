<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { submitFeedback } from '@/services/api/feedbackApi'
import type { FeedbackPayload } from '@/services/api/feedbackApi'
import { version } from '../../../package.json'

const route = useRoute()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const isOpen = ref(false)
const feedbackType = ref<FeedbackPayload['type']>('bug')
const message = ref('')
const email = ref('')
const isSending = ref(false)
const sent = ref(false)
const error = ref('')

const userEmail = computed(() => authStore.user?.email ?? '')

function open() {
  isOpen.value = true
  sent.value = false
  error.value = ''
  if (userEmail.value) email.value = userEmail.value
}

function close() {
  isOpen.value = false
  message.value = ''
  feedbackType.value = 'bug'
  error.value = ''
}

async function send() {
  if (!message.value.trim()) {
    error.value = 'Napište popis.'
    return
  }

  isSending.value = true
  error.value = ''

  const result = await submitFeedback({
    type: feedbackType.value,
    message: message.value.trim(),
    email: email.value || undefined,
    page: route.fullPath,
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    username: authStore.user?.username || undefined,
    campaignName: profileStore.activeProfile?.name || undefined,
    appVersion: version,
  })

  isSending.value = false

  if (result.error) {
    error.value = result.error
    return
  }

  sent.value = true
  message.value = ''
  setTimeout(() => {
    close()
  }, 2000)
}

const typeLabels: Record<FeedbackPayload['type'], string> = {
  bug: 'Chyba',
  suggestion: 'Návrh',
  other: 'Jiné',
}
</script>

<template>
  <!-- Floating button -->
  <button
    v-if="!isOpen"
    class="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-gh-primary/90 text-gh-dark shadow-lg shadow-black/30 hover:bg-gh-primary hover:scale-110 transition-all flex items-center justify-center"
    title="Nahlásit chybu / Zpětná vazba"
    @click="open"
  >
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  </button>

  <!-- Modal overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60" @click="close" />

      <!-- Modal -->
      <div class="relative w-full max-w-md bg-gh-card border border-gh-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gh-border/50">
          <h3 class="font-display font-semibold text-gray-200">Zpětná vazba</h3>
          <button class="text-gray-500 hover:text-gray-300 transition-colors" @click="close">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Sent state -->
        <div v-if="sent" class="p-8 text-center">
          <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <p class="text-gray-300 font-display">Odesláno, díky!</p>
        </div>

        <!-- Form -->
        <div v-else class="p-4 space-y-4">
          <!-- Type selector -->
          <div class="flex gap-2">
            <button
              v-for="(label, key) in typeLabels"
              :key="key"
              :class="[
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all border',
                feedbackType === key
                  ? 'bg-gh-primary/15 text-gh-primary border-gh-primary/30'
                  : 'bg-white/[0.03] text-gray-500 border-white/[0.05] hover:text-gray-300'
              ]"
              @click="feedbackType = key as FeedbackPayload['type']"
            >
              {{ label }}
            </button>
          </div>

          <!-- Message -->
          <textarea
            v-model="message"
            :placeholder="feedbackType === 'bug' ? 'Popište, co nefunguje...' : 'Váš návrh nebo komentář...'"
            class="gh-input w-full resize-y min-h-[100px] text-sm"
            rows="4"
          />

          <!-- Email -->
          <input
            v-model="email"
            type="email"
            placeholder="Email (volitelný, pro odpověď)"
            class="gh-input w-full text-sm"
          />

          <!-- Error -->
          <p v-if="error" class="text-red-400 text-xs">{{ error }}</p>

          <!-- Submit -->
          <button
            class="gh-btn-primary w-full"
            :disabled="isSending"
            @click="send"
          >
            {{ isSending ? 'Odesílám...' : 'Odeslat' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
