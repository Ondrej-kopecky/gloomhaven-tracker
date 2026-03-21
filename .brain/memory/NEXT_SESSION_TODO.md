# Next Session TODO

**Date:** 2026-03-21
**Last session:** CZ názvy, storage fix, UX vylepšení, v2.0.0

## Co se udělalo v této session (2026-03-21)
- [x] **Storyline quest system** — 40 questových linií, expression parser, quest detail
- [x] **Personal quests** — 24 questů, přiřazení k postavám, checkbox/number progress
- [x] **City/Road events** — balíčky událostí, two-tap pro odebírání
- [x] **PWA support** — manifest, service worker, PNG ikony (192+512)
- [x] **Feedback button** — plovoucí tlačítko + backend /api/feedback
- [x] **Unit testy** — 103 testů (Vitest), 8 souborů
- [x] **E2E testy** — 9 testů (Playwright)
- [x] **GitHub CI** — actions v5, Node 24, bez warningů
- [x] **České názvy scénářů** — 95 názvů z pravidel PDF
- [x] **Storage/sync bug fix** — logout a sync nemaže cloud data
- [x] **ScenariosPage fix** — správný počet zamčených scénářů
- [x] **Stats bar** — na flowchartu: dokončené, dostupné, postavy, prosperita, rep
- [x] **Spoiler-safe questy** — skryté neobjevené questy + checkpoint výrazy
- [x] **Export backward compat** — personalQuests fallback
- [x] **QR kód** — oříznutý, plná šířka, gold rámeček
- [x] **Verze 2.0.0** — package.json, README, "O aplikaci"
- [x] **Backend rate limit** — login zvýšen na 30/hodinu

## Co dál (priority)
1. [ ] **Obrázky předmětů** — uživatel nafotí vlastní karty, nahrát jako 001.jpg-XXX.jpg do /img/items/ na server, napojit v ItemsPage
2. [ ] **Frosthaven projekt** — přidat feedback, CI, testy (prompt připraven)
3. [ ] **Attack modifier deck** — vizualizace balíčku po percích
4. [ ] **Multiplayer view** — sdílení kampaně přes link (read-only)

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh`
- Testy: `npm test` (103 unit) + `npm run test:e2e` (9 E2E)
- CI: `.github/workflows/ci.yml` — actions v5, Node 24
- Backend login rate limit: 30/hodinu
- Prompt pro Frosthaven agenta připraven
- Verze: 2.0.0
- Obrázky předmětů: uživatel nafotí vlastní karty → public/img/items/001.jpg, pojmenování dle item ID
- Pravidla PDF: `pravidla/` složka v repo (neodesílat na GitHub — copyright)
