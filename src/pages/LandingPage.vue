<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCampaignStore } from '@/stores/campaignStore'
import { onMounted } from 'vue'
import { contentStats } from '@/data/contentStats'

const router = useRouter()
const campaignStore = useCampaignStore()

onMounted(() => {
  if (campaignStore.hasCampaign) {
    router.replace('/prehled')
  }
})

const stats = [
  { value: contentStats.scenarios, label: 'scénářů' },
  { value: contentStats.classes, label: 'tříd' },
  { value: contentStats.items, label: 'předmětů' },
  { value: contentStats.quests, label: 'questů' },
]

const features = [
  { id: 'map', title: 'Mapa & diagram', desc: 'Interaktivní mapa světa a přehledný diagram všech scénářů s větvením příběhu.' },
  { id: 'characters', title: 'Správa postav', desc: 'Úroveň, zkušenosti, zlato, perky, schopnosti a modifikační balíček každé postavy.' },
  { id: 'items', title: 'Předměty & obchod', desc: 'Kompletní katalog předmětů s cenami a dostupností podle prosperity města.' },
  { id: 'story', title: 'Příběh & questy', desc: 'Storyline kampaně, globální úspěchy a osobní questy odemykající nové třídy.' },
  { id: 'share', title: 'Sdílení s družinou', desc: 'Hrajte společně — kampaň sdílíte s ostatními hráči přes 6-místný kód.' },
  { id: 'pwa', title: 'Offline & PWA', desc: 'Funguje i bez internetu. Nainstalujete si jako appku na mobil nebo PC.' },
]
</script>

<template>
  <div class="min-h-screen bg-gh-dark relative overflow-hidden">
    <!-- Atmospheric backdrop -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background:
          radial-gradient(ellipse 900px 600px at 35% 15%, rgba(196, 163, 90, 0.10) 0%, transparent 65%),
          radial-gradient(ellipse 700px 500px at 85% 70%, rgba(59, 130, 246, 0.045) 0%, transparent 60%),
          radial-gradient(ellipse 600px 400px at 10% 90%, rgba(124, 58, 237, 0.04) 0%, transparent 60%);
      "
    />
    <!-- Faint city silhouette -->
    <svg class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1600px] max-w-none opacity-[0.06] pointer-events-none text-gh-primary" viewBox="0 0 1400 300" fill="currentColor" aria-hidden="true">
      <path d="M0,300 L0,220 L60,200 L80,180 L120,200 L140,160 L180,180 L200,140 L240,160 L280,120 L320,140 L360,100 L400,140 L440,80 L500,120 L540,60 L600,100 L660,40 L720,80 L780,20 L840,60 L900,100 L960,60 L1020,120 L1080,80 L1140,140 L1200,100 L1260,160 L1320,140 L1400,220 L1400,300 Z" opacity="0.45" />
      <path d="M0,300 L0,260 L80,240 L160,250 L240,220 L320,240 L400,200 L480,230 L560,200 L640,220 L720,180 L800,210 L880,190 L960,220 L1040,200 L1120,230 L1200,210 L1280,240 L1360,220 L1400,260 L1400,300 Z" opacity="0.6" />
    </svg>

    <!-- ── HERO ── -->
    <section class="relative max-w-6xl mx-auto px-4 pt-14 lg:pt-24 pb-14 lg:pb-20">
      <div class="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <!-- Left: text + CTA -->
        <div class="text-center lg:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gh-primary/[0.08] border border-gh-primary/30">
            <span class="w-1.5 h-1.5 rounded-full bg-gh-primary shadow-[0_0_8px_rgba(196,163,90,0.7)]" />
            <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gh-primary-light">Český průvodce kampaní</span>
          </div>

          <h1 class="gh-display-xl mt-5">Gloomhaven Tracker</h1>

          <p class="mt-5 text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Scénáře, postavy, předměty, mapa, příběh a sdílení s družinou — bez papírů,
            bez tužkou škrtaných tabulek, bez spoilerů navíc.
          </p>

          <!-- CTA -->
          <div class="mt-8 flex flex-col items-center lg:items-start gap-3">
            <button
              class="gh-btn-primary font-display tracking-wider text-lg px-7 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2"
              @click="router.push('/kampan')"
            >
              Začít kampaň
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <p class="text-sm text-gray-500">
              Máš účet?
              <router-link to="/prihlaseni" class="text-gh-primary/80 hover:text-gh-primary transition-colors ml-0.5">Přihlásit se</router-link>
              <span class="text-gray-700 mx-1.5">·</span>
              <router-link to="/registrace" class="hover:text-gray-300 transition-colors">Registrovat</router-link>
            </p>
          </div>

          <p class="mt-4 text-xs text-gray-600">
            Funguje offline (PWA) &bull; Zdarma &bull; Sdílíš 6-místným kódem &bull; Spoiler-safe &bull; Včetně DLC Forgotten Circles
          </p>

          <!-- Stats strip -->
          <div class="mt-8 pt-6 border-t border-gh-border flex flex-wrap justify-center lg:justify-start gap-x-8 sm:gap-x-10 gap-y-4">
            <div v-for="s in stats" :key="s.label">
              <div class="font-display text-2xl sm:text-3xl font-bold text-gh-primary leading-none">{{ s.value }}</div>
              <div class="gh-micro mt-1.5">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- Right: layered preview -->
        <div class="relative h-[340px] sm:h-[400px] hidden sm:block">
          <!-- Back card: scenario diagram -->
          <div class="absolute top-6 left-10 right-0 h-[300px] gh-card p-4 shadow-[0_30px_70px_rgba(0,0,0,0.5)] rotate-2">
            <div class="gh-micro mb-3">Diagram scénářů</div>
            <svg viewBox="0 0 400 240" class="w-full h-[230px]">
              <g stroke="#251f45" stroke-width="1.5">
                <line x1="60" y1="50" x2="160" y2="50" /><line x1="160" y1="50" x2="260" y2="35" /><line x1="160" y1="50" x2="260" y2="95" />
                <line x1="260" y1="35" x2="360" y2="28" /><line x1="260" y1="95" x2="360" y2="85" /><line x1="260" y1="95" x2="260" y2="165" />
                <line x1="260" y1="165" x2="360" y2="165" /><line x1="260" y1="165" x2="160" y2="200" />
              </g>
              <g>
                <g><circle cx="60" cy="50" r="14" fill="rgba(34,197,94,0.18)" stroke="#22c55e" stroke-width="1.5" /><text x="60" y="54" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#22c55e" font-weight="600">1</text></g>
                <g><circle cx="160" cy="50" r="14" fill="rgba(34,197,94,0.18)" stroke="#22c55e" stroke-width="1.5" /><text x="160" y="54" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#22c55e" font-weight="600">2</text></g>
                <g><circle cx="260" cy="35" r="14" fill="rgba(34,197,94,0.18)" stroke="#22c55e" stroke-width="1.5" /><text x="260" y="39" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#22c55e" font-weight="600">3</text></g>
                <g><circle cx="260" cy="95" r="14" fill="rgba(59,130,246,0.14)" stroke="#3b82f6" stroke-width="2.5" /><text x="260" y="99" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#3b82f6" font-weight="600">5</text></g>
                <g><circle cx="360" cy="28" r="14" fill="rgba(74,85,104,0.15)" stroke="#4a5568" stroke-width="1.5" /><text x="360" y="32" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#4a5568" font-weight="600">7</text></g>
                <g><circle cx="360" cy="85" r="14" fill="rgba(249,115,22,0.14)" stroke="#f97316" stroke-width="1.5" /><text x="360" y="89" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#f97316" font-weight="600">8</text></g>
                <g><circle cx="260" cy="165" r="14" fill="rgba(234,179,8,0.14)" stroke="#eab308" stroke-width="1.5" /><text x="260" y="169" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#eab308" font-weight="600">12</text></g>
                <g><circle cx="360" cy="165" r="14" fill="rgba(74,85,104,0.15)" stroke="#4a5568" stroke-width="1.5" /><text x="360" y="169" text-anchor="middle" font-family="Cinzel" font-size="10" fill="#4a5568" font-weight="600">15</text></g>
                <g><circle cx="160" cy="200" r="14" fill="rgba(74,85,104,0.15)" stroke="#4a5568" stroke-width="1.5" /><text x="160" y="204" text-anchor="middle" font-family="Cinzel" font-size="10" fill="#4a5568" font-weight="600">19</text></g>
              </g>
            </svg>
          </div>
          <!-- Front card: character -->
          <div class="absolute bottom-0 left-0 w-[230px] sm:w-[250px] gh-card border-gh-primary/30 p-4 shadow-[0_30px_70px_rgba(0,0,0,0.6),0_0_32px_rgba(196,163,90,0.12)]">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-11 h-11 rounded-full bg-gh-primary/15 border border-gh-primary/40 grid place-items-center font-display font-bold text-gh-primary">BR</div>
              <div>
                <div class="font-display font-semibold text-gh-primary-light">Brute</div>
                <div class="text-[11px] text-gh-dim">Inox &middot; Lvl 5</div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="[k, v] in [['XP','142'],['Zlato','38'],['HP','12']]" :key="k" class="bg-black/30 rounded-md py-2 text-center">
                <div class="font-display font-bold text-lg text-gh-primary leading-none">{{ v }}</div>
                <div class="text-[9px] uppercase tracking-[0.1em] text-gh-dim mt-1">{{ k }}</div>
              </div>
            </div>
            <div class="mt-3 h-1 rounded-full bg-gh-border overflow-hidden">
              <div class="h-full w-3/5 bg-gradient-to-r from-gh-primary-dim to-gh-primary" />
            </div>
            <div class="text-[9px] uppercase tracking-[0.1em] text-gh-dim mt-1.5">Postup do levelu 6</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FEATURES ── -->
    <section class="relative max-w-5xl mx-auto px-4 pb-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="f in features"
          :key="f.id"
          class="gh-card p-5 text-center sm:text-left"
        >
          <div class="w-9 h-9 mb-3 text-gh-primary mx-auto sm:mx-0">
            <svg v-if="f.id === 'map'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" /><path d="M9 4v13M15 7v13" />
            </svg>
            <svg v-else-if="f.id === 'characters'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5" /><path d="M13 19l6-6M16 16l3.5 3.5" /><path d="M9.5 17.5L21 6V3h-3L6.5 14.5" /><path d="M11 19l-6-6M8 16l-3.5 3.5" />
            </svg>
            <svg v-else-if="f.id === 'items'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 10l2-2h12l2 2v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9z" /><path d="M9 8V5a3 3 0 016 0v3" /><path d="M10 14h4" />
            </svg>
            <svg v-else-if="f.id === 'story'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><path d="M8 7h8M8 11h6" />
            </svg>
            <svg v-else-if="f.id === 'share'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><path d="M12 18h.01" /><path d="M9 8l3 3 3-3" />
            </svg>
          </div>
          <h3 class="gh-h3 text-gh-primary-light mb-1">{{ f.title }}</h3>
          <p class="text-sm text-gray-400 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="relative border-t border-gh-border/50 py-8 text-center text-xs text-gray-600">
      <p>
        Gloomhaven Tracker &copy; {{ new Date().getFullYear() }}
        <a href="https://ongy.cz" class="text-gh-primary-dim hover:text-gh-primary transition-colors ml-1">ongy.cz</a>
      </p>
      <p class="mt-1">Gloomhaven je desková hra od <span class="text-gray-500">Cephalofair Games</span></p>
      <p class="mt-2">
        <router-link to="/ochrana-udaju" class="text-gray-600 hover:text-gh-primary-dim transition-colors">Ochrana osobních údajů</router-link>
      </p>
    </footer>
  </div>
</template>
