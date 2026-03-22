# Next Session TODO

**Date:** 2026-03-22
**Last session:** Massive session — scenario detail, event system, item fix, donate, UI polish

## Co se udělalo 2026-03-22
- [x] **Úroveň scénáře** — auto výpočet ceil(avg level / 2)
- [x] **Podmínky pro zahrání** — checklist s fajfka/vykřičník
- [x] **Spoiler ochrana** — odměny/poklady/odemykané scénáře skryté do dokončení
- [x] **Random item/scenario pickery** — u scénářů i událostí
- [x] **Event systém** — 150 událostí, A/B výběr, auto-apply efektů, return-to-deck
- [x] **Item availability fix** — Random Items #71-95 a Event items jen po odemčení
- [x] **Item names** — #127 Mechanický pavouk, #149 Boty z živlů + fotky
- [x] **Donate redesign** — Buy Me a Coffee + Revolut + Bitcoin QR
- [x] **Scrollbar** — zlatý na tmavém
- [x] **Mobile character cards** — lepší layout
- [x] **Aktivní kampaň** — v headeru + hamburger menu + badge v seznamu
- [x] **Nebezpečná zóna** — redesign

## Co dál (priority)
1. [ ] **Redesign headeru** — lépe reflektovat kampaň, cool design (Ondřej chce)
2. [ ] **České texty událostí** — přeložit příběhové texty (8700 řádků, nízká priorita)
3. [ ] **Feedback checker** — při startu session zkontrolovat /api/feedback
4. [ ] **Sdílení družiny** — multiplayer: sdílet kampaň napříč hráči (velká feature)
5. [ ] **Attack modifier deck** — vizualizace balíčku po percích
6. [ ] **Chybějící fotky předmětů** — #151-164 (v obálkách)
7. [ ] **Anglická verze webu** — i18n, přepínání CZ/EN (nápad)

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh` (fotky se automaticky kopírují z /gloomhaven-items/)
- Testy: `npm test` (105 unit) + `npm run test:e2e` (9 E2E)
- Fotky: trvalá složka na serveru /home/ongy/Projekty/Server/gloomhaven-items/
- Cloudflare cache: 4h, cache buster ?v=4
- GoatCounter: gloomhaven.goatcounter.com (SPA tracking přes router.afterEach)
- Buy Me a Coffee: buymeacoffee.com/ongy
- Revolut: @ondejqv70
- BTC: bc1qhypsfmnw0a4g8aar2evx6tdvq30jvnen96few2
- master branch synchronizován s main
- Verze: 2.0.0, 105 testů
