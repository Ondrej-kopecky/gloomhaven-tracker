<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const campaignStore = useCampaignStore()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
watch(mobileMenuOpen, (open) => {
  const html = document.documentElement
  const body = document.body
  if (open) {
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.inset = '0'
    body.style.touchAction = 'none'
  } else {
    html.style.overflow = ''
    body.style.overflow = ''
    body.style.position = ''
    body.style.inset = ''
    body.style.touchAction = ''
  }
})

const navItems = [
  { to: '/prehled', label: 'Přehled' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/scenare', label: 'Scénáře' },
  { to: '/predmety', label: 'Předměty' },
  { to: '/druzina', label: 'Družina' },
  { to: '/postavy', label: 'Postavy' },
  { to: '/achievementy', label: 'Úspěchy' },
  { to: '/pribeh', label: 'Příběh' },
  { to: '/boss-hp', label: 'HP' },
]

const mobileNavItems = [
  { to: '/prehled', label: 'Přehled' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/scenare', label: 'Scénáře' },
  { to: '/predmety', label: 'Předměty' },
  { to: '/druzina', label: 'Družina' },
  { to: '/postavy', label: 'Postavy' },
  { to: '/achievementy', label: 'Úspěchy' },
  { to: '/pribeh', label: 'Příběh' },
  { to: '/boss-hp', label: 'Počítadlo HP' },
  { to: '/nastaveni', label: 'Nastavení' },
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 border-b border-gh-border/60 bg-gh-dark/90 backdrop-blur-xl safe-area-top">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center h-14">
        <!-- Logo -->
        <router-link to="/kampan" class="flex items-center gap-2 group shrink-0">
          <svg class="w-6 h-6 text-gh-primary group-hover:text-gh-primary-light transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13 19l6-6M16 16l3.5 3.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.5 17.5L21 6V3h-3L6.5 14.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11 19l-6-6M8 16l-3.5 3.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="flex items-baseline gap-1 font-display font-bold tracking-widest uppercase">
            <span class="text-base text-gh-primary">Gloomhaven</span>
            <span class="text-[10px] text-gray-500 tracking-wider hidden xs:inline">Tracker</span>
          </span>
        </router-link>

        <!-- Campaign chip (desktop, left side) -->
        <router-link
          v-if="campaignStore.currentCampaign"
          to="/kampan"
          class="hidden xl:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-md bg-gh-primary/[0.06] border border-gh-primary/15 hover:border-gh-primary/30 transition-colors"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          <span class="text-[10px] text-gray-600 shrink-0">Kampaň:</span>
          <span class="text-[11px] text-gh-primary/80 font-medium truncate max-w-40">{{ campaignStore.currentCampaign.name }}</span>
          <span
            v-if="campaignStore.currentCampaignSummary?.isOwner === false || campaignStore.currentCampaignSummary?.shareCode"
            class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"
            :title="campaignStore.currentCampaignSummary?.isOwner === false ? 'Sdílená kampaň' : 'Sdílíte tuto kampaň'"
          />
        </router-link>

        <!-- Desktop nav (centered) -->
        <nav class="hidden xl:flex items-center gap-0.5 mx-auto">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="relative px-3 py-1.5 rounded-md text-[13px] font-medium transition-all"
            :class="isActive(item.to)
              ? 'text-gh-primary bg-gh-primary/10'
              : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'"
          >
            {{ item.label }}
            <span
              v-if="isActive(item.to)"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-gh-primary rounded-full"
            />
          </router-link>
        </nav>

        <!-- Right side icons -->
        <div class="flex items-center gap-0.5 ml-auto xl:ml-0 shrink-0">
          <!-- Spoiler toggle -->
          <div v-if="campaignStore.hasCampaign" class="spoiler-toggle-wrap relative">
            <button
              class="p-2 rounded-md transition-all"
              :class="campaignStore.hideSpoilers
                ? 'text-gh-primary bg-gh-primary/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'"
              @click="campaignStore.setHideSpoilers(!campaignStore.hideSpoilers)"
            >
              <svg v-if="campaignStore.hideSpoilers" class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg v-else class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <div class="spoiler-tooltip">
              {{ campaignStore.hideSpoilers ? 'Spoilery skryté' : 'Spoilery viditelné' }}
            </div>
          </div>

          <!-- Info (desktop only) -->
          <router-link
            to="/info"
            class="hidden xl:block p-2 rounded-md transition-all"
            :class="isActive('/info')
              ? 'text-gh-primary bg-gh-primary/10'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'"
          >
            <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </router-link>

          <!-- Settings (desktop) -->
          <router-link
            to="/nastaveni"
            class="hidden xl:block p-2 rounded-md transition-all"
            :class="isActive('/nastaveni')
              ? 'text-gh-primary bg-gh-primary/10'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'"
          >
            <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </router-link>

          <!-- Campaign chip (mobile, right side) -->
          <router-link
            v-if="campaignStore.currentCampaign"
            to="/kampan"
            class="xl:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gh-primary/[0.06] border border-gh-primary/15 min-w-0"
          >
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="campaignStore.currentCampaignSummary?.isOwner === false || campaignStore.currentCampaignSummary?.shareCode ? 'bg-blue-400' : 'bg-green-500'" />
            <div class="min-w-0">
              <p class="text-[8px] text-gray-600 uppercase tracking-wider leading-none">Kampaň</p>
              <p class="text-[10px] text-gh-primary/80 font-medium truncate max-w-28 leading-tight">{{ campaignStore.currentCampaign.name }}</p>
            </div>
          </router-link>

          <!-- Hamburger (mobile) -->
          <button
            class="xl:hidden p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/[0.05] transition-all"
            @click="mobileMenuOpen = true"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile drawer -->
    <Teleport to="body">
      <transition name="drawer-backdrop">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm xl:hidden"
          @click="mobileMenuOpen = false"
        />
      </transition>
      <transition name="drawer">
        <nav
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-[100] bg-gh-dark flex flex-col xl:hidden safe-area-top"
        >
          <!-- Drawer header -->
          <div class="flex items-center justify-between px-5 h-14 border-b border-gh-border/40">
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

          <!-- Campaign (mobile) -->
          <router-link
            v-if="campaignStore.currentCampaign"
            to="/kampan"
            class="flex items-center gap-2.5 mx-3 mt-3 px-4 py-2.5 rounded-xl bg-gh-primary/[0.07] border border-gh-primary/20"
          >
            <span class="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <div class="min-w-0">
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Kampaň</p>
              <p class="text-sm text-gh-primary font-display font-semibold truncate">{{ campaignStore.currentCampaign.name }}</p>
            </div>
          </router-link>

          <!-- Nav links -->
          <div class="flex-1 py-3 px-3 overflow-y-auto">
            <router-link
              v-for="item in mobileNavItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all min-h-[44px]"
              :class="isActive(item.to)
                ? 'text-gh-primary bg-gh-primary/10'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'"
            >
              <span class="text-sm font-medium">{{ item.label }}</span>
              <span
                v-if="isActive(item.to)"
                class="ml-auto w-1.5 h-1.5 rounded-full bg-gh-primary"
              />
            </router-link>
          </div>

          <!-- Drawer footer -->
          <div class="px-5 py-4 border-t border-gh-border/40 flex items-center gap-2">
            <button
              v-if="campaignStore.hasCampaign"
              class="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
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
            <router-link
              to="/info"
              class="p-2.5 rounded-xl transition-all"
              :class="isActive('/info')
                ? 'text-gh-primary bg-gh-primary/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'"
              @click="isMenuOpen = false"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </router-link>
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

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 250ms ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(-100%);
}

.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 250ms ease;
}
.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}
</style>
