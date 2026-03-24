<script setup lang="ts">
import { version } from '../../package.json'
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="gh-page-header">
      <h1 class="font-display text-2xl font-bold text-gh-primary tracking-wide">Info</h1>
    </div>

    <!-- Hero -->
    <div class="gh-card relative overflow-hidden p-8 mb-6 text-center">
      <div class="font-display text-3xl font-bold text-gh-primary tracking-wider mb-1">Gloomhaven</div>
      <div class="text-sm text-gray-500 uppercase tracking-widest mb-4">Tracker</div>
      <div class="text-xs text-gray-600">v{{ version }}</div>
    </div>

    <!-- O projektu -->
    <div class="gh-card relative overflow-hidden p-6 mb-4">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gh-primary"></div>
      <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 pl-2">O projektu</h2>
      <div class="text-sm text-gray-400 leading-relaxed space-y-2 pl-2">
        <p>Sledujte postup vaší kampaně v deskovce Gloomhaven. Scénáře, postavy, předměty, úspěchy a mapu světa. Vše offline, přímo v prohlížeči.</p>
        <p>Aplikace je plně v češtině s českými názvy scénářů, předmětů, questů a příběhových linií.</p>
      </div>
    </div>

    <!-- Funkce -->
    <div class="gh-card relative overflow-hidden p-6 mb-4">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500"></div>
      <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 pl-2">Funkce</h2>
      <div class="grid sm:grid-cols-2 gap-2 pl-2">
        <div v-for="feature in features" :key="feature" class="flex items-center gap-2 text-sm text-gray-400">
          <svg class="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          {{ feature }}
        </div>
      </div>
    </div>

    <!-- Technologie -->
    <div class="gh-card relative overflow-hidden p-6 mb-4">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500"></div>
      <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 pl-2">Technologie</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pl-2">
        <div v-for="tech in technologies" :key="tech.name" class="text-sm">
          <span class="text-gray-300">{{ tech.name }}</span>
          <span class="text-gray-600 text-xs block">{{ tech.desc }}</span>
        </div>
      </div>
    </div>

    <!-- Credits -->
    <div class="gh-card relative overflow-hidden p-6 mb-4">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-purple-500"></div>
      <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 pl-2">Credits</h2>
      <div class="text-sm text-gray-400 leading-relaxed space-y-2 pl-2">
        <p><span class="text-gray-300">Gloomhaven</span> je desková hra od <span class="text-gray-300">Isaaca Childrese</span> (Cephalofair Games).</p>
        <p><span class="text-gray-300">Herní ikony a data scénářů</span> inspirovány projektem <a href="https://gloomhaven-storyline.com" target="_blank" class="text-gh-primary hover:text-gh-primary-light transition-colors">gloomhaven-storyline.com</a>.</p>
        <p><span class="text-gray-300">České překlady</span> na základě oficiální české lokalizace (Mindok).</p>
      </div>
    </div>

    <!-- Changelog -->
    <div class="gh-card relative overflow-hidden p-6 mb-4">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500"></div>
      <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 pl-2">Poslední změny</h2>
      <div class="space-y-3 pl-2">
        <div v-for="entry in changelog" :key="entry.version">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-mono text-gh-primary">v{{ entry.version }}</span>
            <span class="text-[10px] text-gray-600">{{ entry.date }}</span>
          </div>
          <ul class="text-xs text-gray-500 space-y-0.5">
            <li v-for="(change, i) in entry.changes" :key="i" class="flex items-start gap-1.5">
              <span class="text-gray-600 mt-0.5">-</span>
              {{ change }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Kontakt -->
    <div class="gh-card relative overflow-hidden p-6 mb-4">
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gray-500"></div>
      <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 pl-2">Kontakt</h2>
      <p class="text-sm text-gray-400 pl-2">
        Našli jste bug nebo máte nápad na vylepšení? Použijte tlačítko zpětné vazby vpravo dole nebo napište na
        <a href="mailto:okkopecky@gmail.com" class="text-gh-primary hover:text-gh-primary-light transition-colors">okkopecky@gmail.com</a>.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
const features = [
  'Interaktivní mapa světa',
  'Diagram příběhových linií',
  '95 scénářů s českými názvy',
  'Správa postav a předmětů',
  'Schopnosti s obrázky karet',
  'Attack modifier deck',
  'Městské a cestovní události',
  'Globální a party achievementy',
  'Osobní questy postav',
  'Cloud synchronizace',
  'Sdílení kampaně',
  'PWA — funguje offline',
]

const technologies = [
  { name: 'Vue 3', desc: 'UI framework' },
  { name: 'TypeScript', desc: 'Typový systém' },
  { name: 'Pinia', desc: 'State management' },
  { name: 'Tailwind CSS', desc: 'Stylování' },
  { name: 'Vite', desc: 'Build tool' },
  { name: 'PWA', desc: 'Offline podpora' },
]

const changelog = [
  {
    version: '5.3', date: '2026-03-24',
    changes: [
      'České názvy schopností pro všech 17 tříd (379 karet)',
      'Lightbox pro karty schopností s českými názvy',
      'Kompletní remap obrázků schopností podle iniciativy',
      'Možnost odstranit postavu (nejen poslat do důchodu)',
      'PWA service worker — skipWaiting + čištění starých cache',
      'Skrytí FC scénářů a flowchartu při vypnutém DLC',
      'Oprava Teleport crash v Transition komponentě',
    ],
  },
  {
    version: '5.0', date: '2026-03-24',
    changes: [
      'DLC Zapomenuté kruhy — 20 nových scénářů (96–115) s českými názvy a popisy',
      '6 nových kapitol na flowchartu (Věštkyně, Orchidská společnost, Obyvatelé Gloomhavenu, Sférochod, Nečistá krypta, Zkaženost)',
      'FC flowchart s kompletní strukturou větvení a propojení',
      'Oprava zobrazení příběhového textu u dokončených questů',
      'Sekce automatických záloh v nastavení je nyní skrytá (na rozkliknutí)',
    ],
  },
  {
    version: '4.14', date: '2026-03-23',
    changes: [
      'Info stránka s changelogem a credits',
      'Toast notifikace s undo tlačítkem (herní design)',
      'Undo pro dokončení scénáře',
      'Flip-card animace pro události (město/cesta)',
      'Oprava resetu scénáře (odebírá achievementy)',
      'Checkpointy přeloženy do češtiny',
    ],
  },
  {
    version: '4.10', date: '2026-03-23',
    changes: [
      'Schopnosti postav — 495 karet s obrázky, výběr při level-upu',
      '156 herních PNG ikon (živly, statusy, akce, sloty, perky)',
      'Ikony živlů a statusů v popisech předmětů',
      'SlotIcon přepsán na autentické herní PNG',
    ],
  },
  {
    version: '4.3', date: '2026-03-23',
    changes: [
      'Achievement stickery na mapě (42 EN + 22 CZ)',
      'Klikací popup s názvem a upgrade levelem',
      'Upgrade cyklování (Starobylá technologie atd.)',
      'Podmínky pro zahrání scénáře (seznam + mapa)',
      'Oprava legendy mapy (fialová "Vyžadováno")',
      'Křížek pro zavření předmětů na mobilu',
    ],
  },
  {
    version: '4.0', date: '2026-03-22',
    changes: [
      'SEO a Google Search Console',
      'Security audit a hardening',
      'České překlady 95 scénářů a 60 questů',
      'Feedback email notifikace',
      'Fullscreen hamburger menu na mobilu',
    ],
  },
  {
    version: '3.4', date: '2026-03-22',
    changes: [
      'Attack modifier deck vizualizace',
      'Zapečetěné obálky (A, B, ☀, ☾, X)',
      'Retirement flow s odemykáním tříd',
      'Upscalované fotky 151 předmětů',
    ],
  },
  {
    version: '3.0', date: '2026-03-22',
    changes: [
      'Sdílení kampaně (multiplayer)',
      'Auto versioning (conventional commits)',
      'Deploy skript (frontend + API)',
    ],
  },
  {
    version: '2.0', date: '2026-03-21',
    changes: [
      'Quest systém a příběhové linie',
      'Osobní questy postav',
      'Městské a cestovní události (150 karet)',
      'PWA — funguje offline',
      '95 unit testů + 9 E2E testů',
      'GitHub CI pipeline',
    ],
  },
  {
    version: '1.0', date: '2026-03-20',
    changes: [
      'Interaktivní flowchart diagram',
      'Mapa světa s pan/zoom',
      'Správa postav, předmětů, scénářů',
      'Cloud sync a přihlášení',
      'Donate sekce (Revolut, BMC, Bitcoin)',
    ],
  },
]
</script>
