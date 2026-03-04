# Gloomhaven Campaign Tracker

Webová aplikace pro sledování kampaně deskové hry **Gloomhaven** v češtině.
Inspirováno projektem [gloomhaven-storyline.com](https://gloomhaven-storyline.com).

## Stack

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript** 5.9
- **Vite** 7.3
- **Pinia** 3 (state management)
- **Vue Router** 4
- **Tailwind CSS** v4 (dark theme)
- **Vue Flow** + **Dagre** (flowchart/DAG vizualizace scénářů)
- **Leaflet** (mapa světa - plánováno)
- **vue-i18n** (lokalizace - čeština)

## Spuštění

```bash
cd gloomhaven
npm install
npm run dev
```

## Struktura projektu

```
src/
├── pages/              # Stránky (views)
│   ├── FlowchartPage.vue    # Hlavní přehled - DAG flowchart scénářů
│   ├── MapPage.vue           # Mapa světa (TODO)
│   ├── PartyPage.vue         # Správa družiny
│   ├── CharactersPage.vue    # Správa postav
│   ├── AchievementsPage.vue  # Globální + party achievementy
│   ├── ScenariosPage.vue     # Tabulka scénářů s filtry
│   ├── StoryPage.vue         # Příběh (TODO)
│   ├── SettingsPage.vue      # Nastavení (TODO)
│   └── CampaignSelectPage.vue # Výběr/vytvoření kampaně
│
├── components/
│   ├── layout/
│   │   └── AppHeader.vue     # Navigace (desktop top + mobile bottom)
│   ├── flowchart/
│   │   ├── ScenarioFlowchart.vue  # Vue Flow DAG vizualizace
│   │   ├── ScenarioNode.vue       # Node ve flowchartu
│   │   ├── FlowchartControls.vue  # Filtry a ovládání
│   │   └── FlowchartLegend.vue    # Legenda barev
│   └── scenarios/
│       └── ScenarioDetail.vue     # Detail scénáře (slide-in panel)
│
├── stores/             # Pinia stores
│   ├── campaignStore.ts      # CRUD kampaní, autosave, export/import
│   ├── scenarioStore.ts      # 52 scénářů, odemykací logika, status
│   ├── flowchartStore.ts     # UI state flowchartu
│   ├── characterStore.ts     # Správa postav (6 tříd)
│   ├── partyStore.ts         # Reputace, prosperita, dary
│   └── achievementStore.ts   # Achievementy (global + party)
│
├── models/             # TypeScript interfaces
│   ├── types.ts              # Enumy a základní typy
│   ├── Scenario.ts           # Scenario interfaces
│   ├── Character.ts          # Character interfaces
│   ├── Party.ts              # Party interface
│   ├── Achievement.ts        # Achievement interfaces
│   └── Campaign.ts           # Campaign state interface
│
├── services/
│   └── storage/
│       ├── StorageAdapter.ts      # Interface pro persistence
│       └── LocalStorageAdapter.ts # LocalStorage implementace
│
├── composables/
│   ├── useStorage.ts         # Storage singleton
│   └── useScenarioFlow.ts    # Dagre layout pro flowchart
│
├── data/
│   ├── scenarios.json        # 52 GH scénářů (naše CZ verze)
│   ├── scenario-connections.json # 53 spojení mezi scénáři
│   ├── achievements.json     # 23 global + 16 party achievementů
│   ├── characters.json       # 6 starting tříd + perky
│   └── source/               # Zdrojová data z gloomhaven-storyline
│       ├── scenarios-gh.json      # 135 scénářů (kompletní data)
│       ├── achievements-gh.json   # 88 achievementů
│       ├── characters-gh.json     # Všechny postavy + perky + modifiers
│       ├── items-gh.json          # 164+ předmětů
│       ├── quests-gh.json         # Quest/storyline checks
│       ├── personal-quests-gh.json # 24 personal questů
│       ├── abilities-gh.json      # Ability karty
│       ├── attack-modifier-decks.json
│       └── lang/                  # EN překlady k přeložení do CZ
│
├── utils/
│   └── prosperityTable.ts    # Tabulka prosperity levelů
│
├── i18n/
│   ├── index.ts              # i18n setup
│   └── cs.json               # České UI překlady
│
├── router/index.ts           # Route konfigurace
├── main.ts                   # Entry point
├── App.vue                   # Root component
└── style.css                 # Tailwind + custom dark theme
```

## Herní logika

### Scénáře
- Base game: 52 scénářů, celkem s Forgotten Circles: 135
- Začíná se scénářem 1 (Černý kurhan / Black Barrow)
- Dokončení scénáře odemyká další (`links_to`)
- Některé vyžadují achievementy (`required_by`)
- Některé mohou být zablokovány (`blocks_on`)
- Některé nabízí volbu (`choices`) - hráč vybírá který odemknout
- Coupled scénáře sdílí místo na mapě (vzájemně exkluzivní)
- Poklady mohou odemykat další scénáře (`treasures_to`)

### Stavy scénářů
| Stav | Barva | Popis |
|------|-------|-------|
| completed | zelená | Dokončený |
| available | modrá | Odemčený, lze hrát |
| locked | šedá | Zamčený |
| blocked | červená | Zablokovaný achievementem |
| required | žlutá | Viditelný, nesplněné prerequisites |
| attempted | oranžová | Pokus (neúspěšný) |

### Achievementy
- **Global** (23) - přetrvávají celou kampaň
- **Party** (16) - vázané na aktuální party
- Vzájemně exkluzivní skupiny: rift, voice, drake, city_rule
- Automatické udělení při dokončení scénáře

### Postavy
- 6 starting tříd: Brute, Cragheart, Mindthief, Scoundrel, Spellweaver, Tinkerer
- 11 unlockable tříd (plánováno)
- XP -> automatický výpočet levelu (1-9)
- Perky s attack modifier efekty

### Prosperita & Reputace
- Prosperita: 0-64 checkmarks -> 9 levelů, ovlivňuje obchod a starting level
- Reputace: -20 az +20, ovlivňuje ceny v obchodě

## Persistence
- LocalStorage s prefixem `gh_tracker_`
- Autosave s 300ms debounce
- Export/Import kampaně jako JSON

## Zdrojová data
Data stažena z [teamducro/gloomhaven-storyline](https://github.com/teamducro/gloomhaven-storyline) (MIT licence).
Uložena v `src/data/source/` jako referenční zdroj pro překlad a rozšíření.

## Roadmap

### Fáze 1 - Rozšíření dat
- [ ] Transformovat zdrojové scénáře do našeho formátu
- [ ] Přeložit EN texty do češtiny
- [ ] Rozšířit scenario model o chybějící pole
- [ ] Opravit a doplnit connections

### Fáze 2 - Nové features
- [ ] Items databáze
- [ ] Storyline/quest system (progressive story)
- [ ] Decision prompts (větvení příběhu)
- [ ] Personal quests
- [ ] Unlockable characters
- [ ] Mapa světa (Leaflet)

### Fáze 3 - Polish
- [ ] Vylepšit vizuální design
- [ ] City/Road events
- [ ] Attack modifier deck builder
- [ ] PWA support
- [ ] Settings page
- [ ] Story page
