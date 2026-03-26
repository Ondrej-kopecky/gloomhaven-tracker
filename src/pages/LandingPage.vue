<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { onMounted } from 'vue'

const router = useRouter()
const campaignStore = useCampaignStore()

onMounted(() => {
  if (campaignStore.hasCampaign) {
    router.replace('/prehled')
  }
})

const features = [
  {
    id: 'map',
    title: 'Mapa & Diagram scénářů',
    desc: 'Interaktivní mapa světa a přehledný diagram všech scénářů s větvením příběhu.',
  },
  {
    id: 'characters',
    title: 'Správa postav',
    desc: 'Sledujte úroveň, zkušenosti, zlato, perky a schopnosti každé postavy.',
  },
  {
    id: 'items',
    title: 'Předměty & Obchod',
    desc: 'Kompletní katalog předmětů s cenami a dostupností podle prosperity.',
  },
  {
    id: 'story',
    title: 'Příběh & Questy',
    desc: 'Sledujte storyline, globální achievementy a osobní questy postav.',
  },
  {
    id: 'share',
    title: 'Sdílení kampaně',
    desc: 'Hrajte společně — sdílejte kampaň s ostatními hráči přes 6-místný kód.',
  },
  {
    id: 'pwa',
    title: 'Offline & PWA',
    desc: 'Funguje i bez internetu. Nainstalujte si jako appku na mobil nebo PC.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gh-dark">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <!-- Background glow -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="
          background: radial-gradient(ellipse at 50% 20%, rgba(196, 163, 90, 0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.04) 0%, transparent 50%);
        "
      />

      <div class="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <!-- Logo -->
        <div class="mb-8">
          <img
            src="/favicon.svg"
            alt="Gloomhaven Tracker"
            class="w-20 h-20 mx-auto drop-shadow-[0_0_24px_rgba(196,163,90,0.3)]"
          />
        </div>

        <h1
          class="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gh-primary tracking-wider mb-6"
        >
          Gloomhaven Tracker
        </h1>

        <!-- Ornamental divider -->
        <div class="flex items-center justify-center gap-3 mb-6">
          <div class="h-px w-16 bg-gradient-to-r from-transparent to-gh-primary/40" />
          <div class="w-1.5 h-1.5 rotate-45 bg-gh-primary/60" />
          <div class="h-px w-16 bg-gradient-to-l from-transparent to-gh-primary/40" />
        </div>

        <p class="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-4">
          Kompletní správa kampaně Gloomhaven v češtině.
          Scénáře, postavy, předměty, mapa a příběh — vše na jednom místě.
        </p>

        <p class="text-sm text-gray-500 mb-10">
          Včetně DLC Forgotten Circles &bull; Zdarma &bull; Offline
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            class="gh-btn-primary py-3 text-lg font-display tracking-wider w-64"
            @click="router.push('/registrace')"
          >
            Vytvořit účet
          </button>
          <button
            class="gh-btn-secondary py-3 text-lg w-64"
            @click="router.push('/prihlaseni')"
          >
            Přihlásit se
          </button>
        </div>

        <button
          class="gh-btn-ghost py-2.5 mt-3 text-sm w-64"
          @click="router.push('/kampan')"
        >
          Pokračovat bez účtu
        </button>
      </div>
    </section>

    <!-- Features -->
    <section class="max-w-5xl mx-auto px-4 pb-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="f in features"
          :key="f.id"
          class="gh-card p-6 hover:border-gh-primary/20 transition-colors text-center sm:text-left"
        >
          <div class="w-10 h-10 mb-4 text-gh-primary mx-auto sm:mx-0">
            <!-- Map & Flowchart -->
            <svg v-if="f.id === 'map'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" />
              <path d="M9 4v13M15 7v13" />
            </svg>
            <!-- Characters / Swords -->
            <svg v-else-if="f.id === 'characters'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
              <path d="M13 19l6-6M16 16l3.5 3.5" />
              <path d="M9.5 17.5L21 6V3h-3L6.5 14.5" />
              <path d="M11 19l-6-6M8 16l-3.5 3.5" />
            </svg>
            <!-- Items / Backpack -->
            <svg v-else-if="f.id === 'items'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 10l2-2h12l2 2v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9z" />
              <path d="M9 8V5a3 3 0 016 0v3" />
              <path d="M10 14h4" />
            </svg>
            <!-- Story / Book -->
            <svg v-else-if="f.id === 'story'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              <path d="M8 7h8M8 11h6" />
            </svg>
            <!-- Share / Users -->
            <svg v-else-if="f.id === 'share'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <!-- PWA / Device -->
            <svg v-else-if="f.id === 'pwa'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <path d="M12 18h.01" />
              <path d="M9 8l3 3 3-3" />
            </svg>
          </div>
          <h3 class="font-display text-gh-primary-light text-sm tracking-widest uppercase mb-2">
            {{ f.title }}
          </h3>
          <p class="text-gray-400 text-sm leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gh-border/50 py-8 text-center text-xs text-gray-600">
      <p>
        Gloomhaven Tracker &copy; {{ new Date().getFullYear() }}
        <a href="https://ongy.cz" class="text-gh-primary-dim hover:text-gh-primary transition-colors ml-1">
          ongy.cz
        </a>
      </p>
      <p class="mt-1">
        Gloomhaven je desková hra od
        <span class="text-gray-500">Cephalofair Games</span>
      </p>
    </footer>
  </div>
</template>
