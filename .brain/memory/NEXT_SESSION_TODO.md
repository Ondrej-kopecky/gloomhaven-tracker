# Next Session TODO

**Date:** 2026-03-21
**Last session:** Quest system, events, PWA, testy, CI, QR redesign, v2.0.0

## Co se udělalo v této session (2026-03-21)
- [x] **Storyline quest system** — 40 questových linií, expression parser, quest detail s propojenými scénáři
- [x] **Personal quests** — 24 questů, přiřazení k postavám, checkbox/number progress
- [x] **City/Road events** — balíčky událostí, klikatelná čísla na mobilu
- [x] **PWA support** — manifest, service worker, PNG ikony (192+512)
- [x] **Feedback button** — plovoucí tlačítko + backend /api/feedback endpoint
- [x] **Unit testy** — 95 testů (Vitest), 7 souborů
- [x] **E2E testy** — 9 testů (Playwright), 2 soubory
- [x] **GitHub CI** — TypeScript + testy + build, actions v5, Node 24
- [x] **Backend sync** — api/main.py synchronizován lokálně do repo
- [x] **QR kód redesign** — gold rámeček, rohové dekorace, bílé pozadí
- [x] **Verze 2.0.0** — package.json + "O aplikaci" aktualizováno
- [x] **README** — kompletně přepsán
- [x] **Backend fixes** — forgot-password třídy, feedback endpoint, CampaignData model

## Co dál (priority)
1. [ ] **Frosthaven projekt** — přidat feedback, CI, testy (prompt připraven)
2. [ ] **České překlady** — quest názvy do češtiny
3. [ ] **Scenario rewards** — automatické přidání gold/xp po dokončení scénáře
4. [ ] **Attack modifier deck** — tracking modifier kartiček
5. [ ] **Export/import** — zahrnout personalQuests do exportu

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh`
- Testy: `npm test` (95 unit) + `npm run test:e2e` (9 E2E)
- CI: `.github/workflows/ci.yml` — actions v5, Node 24, běží na push/PR, bez warningů
- Backend api/main.py je lokálně v repo (api/)
- Prompt pro Frosthaven agenta připraven (feedback + CI + testy)
- Verze: 2.0.0
