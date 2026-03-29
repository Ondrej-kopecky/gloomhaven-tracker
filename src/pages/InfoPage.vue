<script setup lang="ts">
import { version } from '../../package.json'
import autoChangelog from '@/data/changelog.json'
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
      <p class="text-sm pl-2 mt-2">
        <router-link to="/ochrana-udaju" class="text-gray-500 hover:text-gh-primary-dim transition-colors">
          Ochrana osobních údajů
        </router-link>
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
  'Bestiář s českými popisky a staty',
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

// Ruční changelog — hezčí české popisy pro klíčové verze (override pro auto-generovaný)
const manualChangelog: Record<string, string[]> = {
  '5.9': [
    'Oprava: 8 scénářů bylo permanentně blokovaných kvůli chybné blocksOn podmínce',
    'Události — efekty úspěchů se automaticky aplikují při odehrání (globální i družinové)',
    'Výchozí Vládnoucí režim: Armáda — nové kampaně + migrace existujících',
    'Groupová exkluzivita při auto-udělení úspěchu (Vládnoucí režim)',
    'České překlady stavů v událostech (zmatení, otrava, prokletí...)',
  ],
  '5.7': [
    'Veřejná landing page — hero, feature karty, CTA tlačítka',
    'SEO opravy — sitemap, dynamické titulky',
    'Oprava UX landing page — šířka tlačítek, registrace CTA, mobilní karty',
  ],
  '5.6': [
    'Bestiář — 56 příšer s českými popisky, staty a výskytem ve scénářích',
    'Automatické načtení poslední kampaně po refreshi stránky',
  ],
  '5.4': [
    'Možnost odstranit postavu',
    'Kompletní remap obrázků schopností pro zbývající třídy',
  ],
  '5.2': [
    'Lightbox pro karty schopností s českými názvy (4 třídy)',
    'PWA service worker — skipWaiting + čištění starých cache',
  ],
  '5.1': [
    'DLC Zapomenuté kruhy — 20 nových scénářů, flowchart, opravy',
    'Verze na stránce nastavení čtena dynamicky z package.json',
    'Skrytí FC scénářů a flowchartu při vypnutém DLC',
  ],
  '5.8': [
    'Veřejná landing page — hero, feature karty s SVG ikonami, CTA tlačítka',
    'SEO opravy — sitemap vyčištěn (jen veřejné stránky), dynamické titulky per route',
    'Počítadlo HP — nová stránka pro sledování životů bossů s fullscreen ovládáním',
    'Příšery v přehledu — accordion se staty, herními ikonami a popisem',
    'Přepočet boss HP podle počtu hráčů (8xC → 32)',
    'Detail příšery ve scénářích — dvě karty (běžný/elitní) s ikonami akcí a stavů',
    'Oprava crash u bossů bez attack statu (Krutý dozorce)',
    'Navigace — breakpoint xl pro 9 položek v headeru',
  ],
  '5.5': [
    'Bestiář — 56 příšer s českými názvy, popisky a typy (humanoid, démon, nemrtvý, bestie...)',
    'Příšery ve scénářích — přesný počet běžných a elitních pro 2/3/4 hráče',
    'Detail příšery — staty (životy, útok, pohyb, dostřel) podle úrovně scénáře',
    'Schopnosti příšer — štít, odveta, otrava, zranění, imunity bossů',
    'Ikonka létání u létajících příšer',
    'Výskyt příšery ve všech scénářích (klikací seznam)',
    'Oprava mobilního zobrazení poznámky u postavy',
    'Automatické načtení kampaně po refreshi stránky',
  ],
  '5.3': [
    'České názvy schopností pro všech 17 tříd (379 karet)',
    'Lightbox pro karty schopností s českými názvy',
    'Kompletní remap obrázků schopností podle iniciativy',
    'Možnost odstranit postavu (nejen poslat do důchodu)',
    'PWA service worker — skipWaiting + čištění starých cache',
    'Skrytí FC scénářů a flowchartu při vypnutém DLC',
    'Oprava Teleport crash v Transition komponentě',
  ],
  '5.0': [
    'DLC Zapomenuté kruhy — 20 nových scénářů (96–115) s českými názvy a popisy',
    '6 nových kapitol na flowchartu (Věštkyně, Orchidská společnost, Obyvatelé Gloomhavenu, Sférochod, Nečistá krypta, Zkaženost)',
    'FC flowchart s kompletní strukturou větvení a propojení',
    'Oprava zobrazení příběhového textu u dokončených questů',
    'Sekce automatických záloh v nastavení je nyní skrytá (na rozkliknutí)',
  ],
  '4.17': [
    'Automatický systém záloh (snapshoty kampaně)',
  ],
  '4.16': [
    'Systém odemykání tříd — automatické odemčení při odchodu do důchodu, bez spoilerů',
  ],
  '4.15': [
    'Vylepšení info stránky — mobilní layout, kompletní changelog',
  ],
  '4.14': [
    'Info stránka s changelogem a credits',
    'Toast notifikace s undo tlačítkem (herní design)',
    'Undo pro dokončení scénáře',
    'Flip-card animace pro události (město/cesta)',
    'Oprava resetu scénáře (odebírá achievementy)',
    'Checkpointy přeloženy do češtiny',
  ],
  '4.13': [
    'Undo podpora pro dokončení scénáře',
  ],
  '4.12': [
    'Systém toast notifikací (herní design)',
    'Čitelné checkpointy v příběhu questů',
    'Reset scénáře správně odebírá úspěchy',
    'Reset scénáře odebírá i z ručně odemčených',
  ],
  '4.11': [
    'Upgrade tečky u achievement stickerů na mapě',
    'Oprava 12 ID schopností s apostrofy (neshodovaly se s obrázky)',
  ],
  '4.10': [
    'Schopnosti postav — 495 karet s obrázky, výběr při level-upu',
    '156 herních PNG ikon (živly, statusy, akce, sloty, perky)',
    'Ikony živlů a statusů v popisech předmětů',
    'SlotIcon přepsán na autentické herní PNG',
    'Cyklování upgrade úrovní u achievementů',
    'České stickery pro upgrade achievementů',
  ],
  '4.9': [
    'České achievement stickery na mapě',
  ],
  '4.8': [
    'Flip-card animace pro karty událostí',
    'Konzistentní barvy událostí (město/cesta)',
  ],
  '4.7': [
    'Výběr karet schopností při level-upu',
  ],
  '4.6': [
    'Sekce karet schopností v detailu postavy',
  ],
  '4.5': [
    'PNG ikony živlů, statusů a akcí v popisech předmětů',
    'Oprava cesty k ikoně štítu',
  ],
  '4.4': [
    'Autentické herní PNG ikony místo SVG slotů',
  ],
  '4.3': [
    'Achievement stickery na mapě (42 EN + 22 CZ)',
    'Klikací popup s názvem a upgrade levelem',
    'Upgrade cyklování (Starobylá technologie atd.)',
    'Podmínky pro zahrání scénáře (seznam + mapa)',
    'Oprava legendy mapy (fialová "Vyžadováno")',
    'Křížek pro zavření předmětů na mobilu',
  ],
  '4.2': [
    'Podmínky pro zahrání scénáře v popup na mapě',
  ],
  '4.1': [
    'Podmínky pro zahrání scénáře v detailu na stránce scénářů',
  ],
  '4.0': [
    'SEO a Google Search Console',
    'Security audit a hardening',
    'České překlady 95 scénářů a 60 questů',
    'Feedback email notifikace',
    'Fullscreen hamburger menu na mobilu',
    'Mobilní karty družiny na celou šířku',
  ],
  '3.9': [
    'České příběhové texty questů s postupným odhalováním',
    'Příběh questů viditelný i u dokončených',
    'Stránka Příběh přidána do navigace',
  ],
  '3.8': [
    'České popisy všech 95 scénářů',
  ],
  '3.7': [
    'SEO meta tagy, Open Graph, robots.txt a sitemap',
    'Oprava progress baru ZK — správný postup v rámci úrovně',
  ],
  '3.6': [
    'Obohacení feedbacku — velikost obrazovky, uživatel, kampaň, verze',
    'Skrytí pokladů scénáře v režimu bez spoilerů',
    'Popisky v mobilním stat baru na flowchartu',
  ],
  '3.5': [
    'Vlastní stylované dropdowny na stránce předmětů',
    'Tlačítka nákupu viditelná vždy na mobilu',
    'Bezpečnostní hardening — hlavičky, CORS, hesla, tajný klíč',
    'Feedback notifikace na osobní email',
  ],
  '3.4': [
    'Attack modifier deck vizualizace',
    'Zapečetěné obálky (A, B, ☀, ☾, X)',
    'Retirement flow s odemykáním tříd',
    'Upscalované fotky 151 předmětů',
    'Oprava SVG cest v SettingsPage',
    'Skrytí odměn scénáře v režimu bez spoilerů',
    'Překlad herních tagů (POISON, WOUND atd.) v pokladech',
  ],
  '3.3': [
    'Sledování zapečetěných obálek (A, B, ☀, ☾, X)',
    'Skrytí podmínek a obsahu obálek do otevření (bez spoilerů)',
    'Potvrzovací dialog před otevřením zapečetěné obálky',
  ],
  '3.2': [
    'Nový design odchodu do důchodu s potvrzením a info o odemčení',
  ],
  '3.1': [
    'Vizualizace attack modifier decku v detailu postavy',
    'Automatické bumpování verze v deploy pipeline',
    'Vylepšený popis přepínače Zapomenuté kruhy',
  ],
  '3.0': [
    'Sdílení kampaně (multiplayer)',
    'Auto versioning (conventional commits)',
    'Deploy skript (frontend + API)',
  ],
  '2.0': [
    'Quest systém a příběhové linie',
    'Osobní questy postav',
    'Městské a cestovní události (150 karet)',
    'PWA — funguje offline',
    '95 unit testů + 9 E2E testů',
    'GitHub CI pipeline',
  ],
  '1.0': [
    'Interaktivní flowchart diagram',
    'Mapa světa s pan/zoom',
    'Správa postav, předmětů, scénářů',
    'Cloud sync a přihlášení',
    'Donate sekce (Revolut, BMC, Bitcoin)',
  ],
}

// Sloučení: ruční popisy mají přednost, nové verze se berou z auto-generovaného
const changelog = autoChangelog.map(entry => ({
  ...entry,
  changes: manualChangelog[entry.version] ?? entry.changes,
}))
</script>
