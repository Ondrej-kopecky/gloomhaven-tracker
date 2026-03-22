# Next Session TODO

**Date:** 2026-03-21
**Last session:** Players bug fix, cloud DB repair

## Co se udělalo 2026-03-21 (evening session)
- [x] **Players bug fix** — campaign.players bylo None v cloudu, HRÁČI na Družině ukazovalo 0
  - Auto-populate z character.owner při loadCampaign (pokud players prázdné)
  - Cloud DB opravena ručně (docker exec → sqlite3 update)
  - Pozor: `character.playerName` = jméno POSTAVY, `character.owner` = jméno HRÁČE

## Co dál (priority)
1. [ ] **Feedback checker** — při startu session zkontrolovat /api/feedback
2. [ ] **Sdílení družiny** — multiplayer: sdílet kampaň napříč hráči (velká feature)
3. [ ] **Attack modifier deck** — vizualizace balíčku po percích
4. [ ] **Chybějící fotky předmětů** — #127, #149, #151-164 (v obálkách)

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh` (fotky se automaticky kopírují z /gloomhaven-items/)
- Testy: `npm test` (105 unit) + `npm run test:e2e` (9 E2E)
- Fotky: trvalá složka na serveru /home/ongy/Projekty/Server/gloomhaven-items/
- Cloudflare cache: 4h, cache buster ?v=3
- GoatCounter: gloomhaven.goatcounter.com (SPA tracking přes router.afterEach)
- Hráči: max 4, uloženi v campaign state, syncují se s cloudem
- master branch synchronizován s main
- Verze: 2.0.0, 105 testů
