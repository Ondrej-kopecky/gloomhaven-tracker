# Next Session TODO

**Date:** 2026-03-21
**Last session:** Quest system, events, PWA, testy, CI

## Co se udělalo v této session (2026-03-21)
- [x] **Storyline quest system** — 40 questových linií s expression parserem, StoryPage taby
- [x] **Personal quests** — 24 questů, přiřazení k postavám, checkbox/number progress, odemykání tříd
- [x] **City/Road events** — balíčky událostí na PartyPage, klikatelná čísla
- [x] **PWA support** — vite-plugin-pwa, manifest, service worker, instalovatelná appka
- [x] **Feedback button** — plovoucí tlačítko, modal formulář, backend endpoint /api/feedback
- [x] **Unit testy** — 95 testů (Vitest), pokrytí core logiky
- [x] **GitHub CI** — TypeScript check + testy + build na každém push/PR
- [x] **Backend fixes** — opraveny broken forgot-password třídy, přidán personalQuests do CampaignData

## Co dál (priority)
1. [ ] **Frosthaven projekt** — přidat feedback, CI, testy (prompt připraven)
2. [ ] **PWA ikony** — vygenerovat pwa-192.png a pwa-512.png z favicon.svg
3. [ ] **Backend lokální sync** — api/main.py lokálně neobsahuje forgot-password + feedback, synchronizovat
4. [ ] **Storyline rozšíření** — quest detail modal s popisem, scénáře propojené s questy
5. [ ] **E2E testy** — Playwright pro kritické flows (login, create campaign, complete scenario)

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh`
- Testy: `npm test` (95 testů, ~6s)
- CI: `.github/workflows/ci.yml` — běží na push/PR
- Feedback endpoint ukládá do SQLite DB na serveru + posílá email notifikaci
- Flowchart na mobilu funguje (pinch-to-zoom + tap ověřeno)
- Cloud sync funguje (login, registrace, sync kampaní)
