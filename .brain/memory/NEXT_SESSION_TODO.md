# Next Session TODO

**Date:** 2026-03-21
**Last session:** Quest system, events, PWA, testy, CI, QR redesign

## Co se udělalo v této session (2026-03-21)
- [x] **Storyline quest system** — 40 questových linií, expression parser, quest detail s propojenými scénáři
- [x] **Personal quests** — 24 questů, přiřazení k postavám, checkbox/number progress
- [x] **City/Road events** — balíčky událostí, klikatelná čísla na mobilu
- [x] **PWA support** — manifest, service worker, PNG ikony (192+512)
- [x] **Feedback button** — plovoucí tlačítko + backend /api/feedback endpoint
- [x] **Unit testy** — 95 testů (Vitest)
- [x] **E2E testy** — 9 testů (Playwright)
- [x] **GitHub CI** — TypeScript + testy + build, Node 24
- [x] **Backend sync** — api/main.py synchronizován lokálně
- [x] **QR kód redesign** — hezčí donate sekce s gold rámečkem
- [x] **Backend fixes** — forgot-password třídy, feedback endpoint

## Co dál (priority)
1. [ ] **Frosthaven projekt** — přidat feedback, CI, testy (prompt připraven)
2. [ ] **Storyline rozšíření** — české překlady quest názvů
3. [ ] **Scenario rewards** — automatické přidání gold/xp po dokončení scénáře
4. [ ] **Attack modifier deck** — tracking modifier kartiček
5. [ ] **Export/import** — zahrnout personalQuests do exportu

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh`
- Testy: `npm test` (95 unit) + `npm run test:e2e` (9 E2E)
- CI: `.github/workflows/ci.yml` — Node 24, běží na push/PR
- Backend api/main.py je teď i lokálně v repo (api/)
- Prompt pro Frosthaven agenta připraven (feedback + CI + testy)
