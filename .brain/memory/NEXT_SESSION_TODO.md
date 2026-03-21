# Next Session TODO

**Date:** 2026-03-21
**Last session:** Hráči, profily, GoatCounter, UX cleanup, fotky fix

## Co se udělalo 2026-03-21 (celá session)
- [x] Quest system + personal quests + city/road events + PWA + feedback
- [x] 105 unit testů + 9 E2E testů + GitHub CI
- [x] České překlady: 95 scénářů, 100 předmětů, 24 osobních questů, 40 questových linií
- [x] 149 fotek předmětů (ručně oříznuté, na serveru v /gloomhaven-items/)
- [x] Storage/sync bug fix (logout + sync nemaže cloud)
- [x] Hráči v kampani (max 4, cloud synced, přiřazení k postavám)
- [x] Odstraněn "Profil hráče" z nastavení (duplicitní)
- [x] GoatCounter SPA tracking (každá navigace se reportuje)
- [x] Deploy skript opravený — fotky přežívají deploye
- [x] CampaignSelectPage zjednodušena (1 karta, import jako link)
- [x] Svatyně Velkého dubu s popisem
- [x] Slot limit: warning místo blokace
- [x] Two-tap eventy, spoiler-safe questy, stats bar
- [x] Verze 2.0.0, 105 testů

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
