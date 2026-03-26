<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import FeedbackButton from '@/components/layout/FeedbackButton.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import { useCampaignStore } from '@/stores/campaignStore'

const route = useRoute()

const profileStore = useProfileStore()
const authStore = useAuthStore()
const campaignStore = useCampaignStore()

onMounted(async () => {
  profileStore.init()
  await authStore.init()
  await campaignStore.autoLoadLastCampaign()
})
</script>

<template>
  <div class="min-h-screen bg-gh-dark text-gray-100">
    <AppHeader v-if="route.name !== 'landing' && route.name !== 'boss-hp-active'" />
    <main :class="route.name === 'landing' || route.name === 'boss-hp-active' ? '' : 'max-w-7xl mx-auto px-4 pb-8 pt-16'">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <FeedbackButton v-if="route.name !== 'landing' && route.name !== 'boss-hp-active'" />
    <ToastNotification />
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
