# Gloomhaven Campaign Tracker

Webová aplikace pro sledování kampaně deskové hry **Gloomhaven** v češtině.
Inspirováno projektem [gloomhaven-storyline.com](https://gloomhaven-storyline.com).

**Live:** [gloomhaven.ongy.cz](https://gloomhaven.ongy.cz)

## Funkce

- **Flowchart scénářů** — interaktivní SVG mapa s panzoom (desktop + mobil)
- **Správa scénářů** — odemykání, dokončování, pokusy, poznámky, poklady
- **Questové linie** — 40 storyline questů s automatickým vyhodnocením progressu
- **Osobní questy** — 24 personal questů s checkbox/number tracking, odemykání tříd
- **Městské & cestovní události** — správa balíčků (odebírání, přidávání, vracení)
- **Postavy** — 18 tříd, XP/gold/level, perky, attack modifier deck vizualizace, inventář, osobní questy
- **Družina** — reputace, prosperita, donace, odchod do důchodu s odemykáním tříd
- **Achievementy** — globální + party, automatické udělení
- **Předměty** — databáze 164+ předmětů s fotkami, sloty a filtrováním
- **Zapečetěné obálky** — A/B/☀/☾/X spoiler-safe tracking
- **Mapa světa** — Leaflet mapa s pozicemi scénářů
- **Příběh** — timeline dokončených scénářů s odměnami
- **Cloud sync** — registrace, přihlášení, synchronizace kampaní
- **Sdílení kampaní** — multiplayer přes kód, vlastník + členové
- **PWA** — instalovatelná na telefon, offline podpora
- **Spoiler režim** — skrývá odměny, poklady a nedostupné scénáře
- **Export/Import** — JSON export kampaně
- **Feedback** — plovoucí tlačítko s email notifikací

## Stack

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript** 5.9
- **Vite** 7.3 + **PWA plugin**
- **Pinia** 3 (state management)
- **Vue Router** 4
- **Tailwind CSS** v4 (dark fantasy theme)
- **Leaflet** (mapa světa)
- **panzoom** (flowchart touch/zoom)
- **FastAPI** backend (auth, cloud sync, feedback)
- **Vitest** (105 unit testů) + **Playwright** (9 E2E testů)
- **GitHub Actions** CI (TypeScript check + testy + build)

## Spuštění

```bash
npm install
npm run dev
```

## Testy

```bash
npm test          # 105 unit testů (Vitest)
npm run test:e2e  # 9 E2E testů (Playwright)
```

## Deploy

```bash
bash scripts/deploy.sh        # Build + upload + restart (auto version bump)
bash scripts/deploy.sh major  # Major version bump
```

## Struktura

```
src/
├── pages/              # 13 stránek (Vue Router)
├── components/         # Layout, flowchart, scenarios, characters, items
├── stores/             # 8 Pinia stores (campaign, scenario, quest, party, ...)
├── models/             # TypeScript interfaces
├── services/           # API client, storage adapters (local/hybrid/cloud)
├── composables/        # useStorage, useStorylineSvg
├── data/               # JSON data (scenarios, quests, characters, items, ...)
├── utils/              # Prosperity table, UUID
├── __tests__/          # 7 test souborů (Vitest)
├── i18n/               # Češtiny
└── router/             # Routes
e2e/                    # 2 Playwright test soubory
api/                    # FastAPI backend (auth, campaigns, feedback)
```
