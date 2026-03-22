# Next Session TODO

**Date:** 2026-03-22
**Last session:** Feedback od Jakuba — scenario detail, spoilery, random reward pickery, item images

## Co se udělalo 2026-03-22
- [x] **Úroveň scénáře** — auto výpočet ceil(avg level / 2)
- [x] **Podmínky pro zahrání** — checklist s fajfka/vykřičník
- [x] **Spoiler ochrana** — odměny/poklady/odemykané scénáře skryté do dokončení
- [x] **Random item picker** — výběr vylosovaného předmětu, ukládá do campaign state
- [x] **Random scenario picker** — výběr vylosovaného scénáře, odemkne na flowchartu
- [x] **Item card images** — object-top, zobrazuje horní část karty

## Co dál (priority)
1. [ ] **Odemykání z událostí** — picker pro scénáře/předměty z city/road events (Jakub chce nafotit)
2. [ ] **Feedback checker** — při startu session zkontrolovat /api/feedback
3. [ ] **Sdílení družiny** — multiplayer: sdílet kampaň napříč hráči (velká feature)
4. [ ] **Attack modifier deck** — vizualizace balíčku po percích
5. [ ] **Chybějící fotky předmětů** — #127, #149, #151-164 (v obálkách)
6. [ ] **Anglická verze webu** — i18n, přepínání CZ/EN (nápad)

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
