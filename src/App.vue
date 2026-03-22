<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import FeedbackButton from '@/components/layout/FeedbackButton.vue'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'

const profileStore = useProfileStore()
const authStore = useAuthStore()

onMounted(async () => {
  profileStore.init()
  await authStore.init()
})
</script>

<template>
  <div class="min-h-screen bg-gh-dark text-gray-100">
    <AppHeader />
    <main class="max-w-7xl mx-auto px-4 pb-8 pt-16">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <FeedbackButton />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
