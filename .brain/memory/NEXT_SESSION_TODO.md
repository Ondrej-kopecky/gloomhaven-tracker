# Next Session TODO

**Date:** 2026-03-22
**Last session:** Mega session — scenario detail, event system, item fix, donate, header redesign, FC toggle

## Co se udělalo 2026-03-22
- [x] **Úroveň scénáře** — auto výpočet ceil(avg level / 2)
- [x] **Podmínky pro zahrání** — checklist s fajfka/vykřičník
- [x] **Spoiler ochrana** — odměny/poklady/odemykané scénáře skryté do dokončení
- [x] **Random item/scenario pickery** — u scénářů i událostí (#71-95 design deck)
- [x] **Event systém** — 150 událostí, A/B výběr, auto-apply efektů, return-to-deck
- [x] **Item availability fix** — Random Items #71-95 a Event items jen po odemčení
- [x] **Item names** — #127 Mechanický pavouk, #149 Boty z živlů + fotky
- [x] **Donate redesign** — Buy Me a Coffee + Revolut + Bitcoin QR (3 tlačítka)
- [x] **Header redesign** — kompaktní h-14, kampaň chip na mobilu i desktopu
- [x] **Forgotten Circles toggle** — skryje předměty #152-164 když FC vypnuté
- [x] **Scrollbar** — zlatý na tmavém
- [x] **Mobile character cards** — třída a owner na oddělených řádcích
- [x] **Aktivní kampaň** — v headeru, hamburger menu, badge v seznamu
- [x] **Nebezpečná zóna** — redesign + přesun nad "O aplikaci"
- [x] **Monsters data** — 34 nestvůr EN/CZ v monsters-gh.json

## Co dál (priority)
1. [ ] **Forgotten Circles scénáře** — filtrovat FC scénáře stejně jako FC itemy
2. [ ] **České texty událostí** — přeložit příběhové texty (8700 řádků, nízká priorita)
3. [ ] **Feedback checker** — při startu session zkontrolovat /api/feedback
4. [ ] **Sdílení družiny** — multiplayer: sdílet kampaň napříč hráči (velká feature)
5. [ ] **Attack modifier deck** — vizualizace balíčku po percích
6. [ ] **Anglická verze webu** — i18n, přepínání CZ/EN (nápad)
7. [ ] **Obálky** — tracking odemčených obálek (A, B, X, Slunce, Měsíc)

## Při startu session
- [ ] **Zkontrolovat feedback** — `ssh server "docker exec ongy-api python3 -c \"import sqlite3; conn=sqlite3.connect('/app/data/app.db'); c=conn.cursor(); c.execute('SELECT * FROM feedback ORDER BY rowid DESC LIMIT 10'); [print(r) for r in c.fetchall()]; conn.close()\""`

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
- 5 registrovaných uživatelů (Ongy, Ongy2, Milan, Laiedal, Toro)
- Předměty #134-151 = solo scénáře (per class), #152-164 = Forgotten Circles
- Obálky: A (5x Ancient Tech), B (100zl donate), X (tajná třída), Slunce (+10 rep), Měsíc (-10 rep)
- master branch synchronizován s main
- Verze: 2.0.0, 105 testů
