<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const campaignStore = useCampaignStore()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)

// Close drawer on route change + lock body scroll
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
watch(mobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

const navItems = [
  { to: '/prehled', label: 'Přehled', svg: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/mapa', label: 'Mapa', svg: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { to: '/scenare', label: 'Scénáře', svg: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { to: '/predmety', label: 'Předměty', svg: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/druzina', label: 'Družina', svg: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/postavy', label: 'Postavy', svg: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { to: '/achievementy', label: 'Úspěchy', svg: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { to: '/nastaveni', label: 'Nastavení', svg: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 border-b border-gh-border/60 bg-gh-dark/85 backdrop-blur-xl safe-area-top">
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

          <!-- User avatar (desktop only, on mobile it's in the drawer) -->
          <router-link
            v-if="authStore.isLoggedIn"
            to="/nastaveni"
            class="hidden md:flex w-8 h-8 rounded-full bg-gh-primary/20 items-center justify-center text-gh-primary text-xs font-bold uppercase hover:bg-gh-primary/30 transition-colors"
            title="Účet"
          >
            {{ authStore.user?.username?.charAt(0) ?? '?' }}
          </router-link>

          <!-- Settings icon (desktop only) -->
          <router-link
            to="/nastaveni"
            class="hidden md:block p-2.5 rounded-lg transition-all duration-200"
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

          <!-- Hamburger button (mobile only) -->
          <button
            class="md:hidden p-2.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/[0.05] transition-all duration-200"
            @click="mobileMenuOpen = true"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile slide-out drawer -->
    <Teleport to="body">
      <transition name="drawer-backdrop">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm md:hidden"
          @click="mobileMenuOpen = false"
        />
      </transition>
      <transition name="drawer">
        <nav
          v-if="mobileMenuOpen"
          class="fixed top-0 right-0 bottom-0 z-[100] w-72 bg-gh-dark border-l border-gh-border/60 flex flex-col md:hidden safe-area-top"
        >
          <!-- Drawer header -->
          <div class="flex items-center justify-between px-5 h-16 border-b border-gh-border/40">
            <span class="font-display text-sm font-bold tracking-widest text-gh-primary uppercase">Menu</span>
            <button
              class="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/[0.05] transition-colors"
              @click="mobileMenuOpen = false"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Nav links -->
          <div class="flex-1 py-3 px-3 overflow-hidden">
            <router-link
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 min-h-[48px]"
              :class="isActive(item.to)
                ? 'text-gh-primary bg-gh-primary/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] active:bg-white/[0.06]'"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" :stroke-width="isActive(item.to) ? 2 : 1.5" stroke-linecap="round" stroke-linejoin="round">
                <path :d="item.svg" />
              </svg>
              <span class="text-sm font-medium">{{ item.label }}</span>
              <!-- Active dot -->
              <span
                v-if="isActive(item.to)"
                class="ml-auto w-1.5 h-1.5 rounded-full bg-gh-primary"
              />
            </router-link>
          </div>

          <!-- Drawer footer: spoiler toggle -->
          <div v-if="campaignStore.hasCampaign" class="px-5 py-4 border-t border-gh-border/40">
            <button
              class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200"
              :class="campaignStore.hideSpoilers
                ? 'text-gh-primary bg-gh-primary/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'"
              @click="campaignStore.setHideSpoilers(!campaignStore.hideSpoilers)"
            >
              <svg v-if="campaignStore.hideSpoilers" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span class="text-sm">{{ campaignStore.hideSpoilers ? 'Spoilery skryté' : 'Spoilery viditelné' }}</span>
            </button>
          </div>
        </nav>
      </transition>
    </Teleport>
  </header>
</template>

<style scoped>
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

/* Drawer slide-in from right */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 250ms ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

/* Backdrop fade */
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 250ms ease;
}
.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}
</style>
