<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'

const route = useRoute()
const campaignStore = useCampaignStore()

const navItems = [
  { to: '/prehled', label: 'Přehled', icon: '&#x2B21;' },
  { to: '/mapa', label: 'Mapa', icon: '&#x1F5FA;' },
  { to: '/scenare', label: 'Scénáře', icon: '&#x1F4DC;' },
  { to: '/predmety', label: 'Předměty', icon: '&#x1F392;' },
  { to: '/druzina', label: 'Družina', icon: '&#x2691;' },
  { to: '/postavy', label: 'Postavy', icon: '&#x2694;' },
  { to: '/achievementy', label: 'Úspěchy', icon: '&#x2605;' },
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-gh-border/60 bg-gh-dark/85 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link
          to="/kampan"
          class="flex items-center gap-3 group"
        >
          <!-- SVG crossed swords icon -->
          <div class="relative">
            <svg class="w-7 h-7 text-gh-primary group-hover:text-gh-primary-light transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 19l6-6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 16l3.5 3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 17.5L21 6V3h-3L6.5 14.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11 19l-6-6" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 16l-3.5 3.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="absolute inset-0 bg-gh-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <span class="hidden sm:block font-display text-lg font-bold tracking-widest text-gh-primary group-hover:text-gh-primary-light transition-colors duration-300 uppercase">
            Gloomhaven
          </span>
        </router-link>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            :class="isActive(item.to)
              ? 'text-gh-primary bg-gh-primary/10'
              : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.03]'"
          >
            {{ item.label }}
            <!-- Active indicator -->
            <span
              v-if="isActive(item.to)"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gh-primary rounded-full"
            />
          </router-link>
        </nav>

        <div class="flex items-center gap-1">
          <!-- Spoiler toggle -->
          <div v-if="campaignStore.hasCampaign" class="spoiler-toggle-wrap relative">
            <button
              class="p-2.5 rounded-lg transition-all duration-200"
              :class="campaignStore.hideSpoilers
                ? 'text-gh-primary bg-gh-primary/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'"
              @click="campaignStore.setHideSpoilers(!campaignStore.hideSpoilers)"
            >
              <svg v-if="campaignStore.hideSpoilers" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <!-- Tooltip -->
            <div class="spoiler-tooltip">
              {{ campaignStore.hideSpoilers ? 'Spoilery skryté' : 'Spoilery viditelné' }}
            </div>
          </div>

          <!-- Settings -->
          <router-link
            to="/nastaveni"
            class="p-2.5 rounded-lg transition-all duration-200"
            :class="isActive('/nastaveni')
              ? 'text-gh-primary bg-gh-primary/10'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'"
            title="Nastavení"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mobile bottom nav -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-gh-dark/95 backdrop-blur-xl border-t border-gh-border/60 z-50 safe-area-bottom">
      <div class="flex justify-around items-center h-16 px-2">
        <router-link
          v-for="item in navItems.slice(0, 5)"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all duration-300 min-w-[56px]"
          :class="isActive(item.to)
            ? 'text-gh-primary'
            : 'text-gray-600 active:text-gray-400'"
        >
          <span class="text-base" v-html="item.icon" />
          <span>{{ item.label }}</span>
          <span
            v-if="isActive(item.to)"
            class="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gh-primary"
          />
        </router-link>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.spoiler-tooltip {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  padding: 4px 10px;
  font-size: 11px;
  white-space: nowrap;
  color: #d1d5db;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s, transform 0.2s;
}

.spoiler-toggle-wrap:hover .spoiler-tooltip {
  opacity: 1;
  transform: translateY(0);
}
</style>
