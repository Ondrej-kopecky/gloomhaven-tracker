# Next Session TODO

**Date:** 2026-03-21
**Last session:** CZ překlady, fotky předmětů, bugy, UX, slot limit fix

## Nápady na příště (z hlavy uživatele)
1. [ ] **Feedback email checker** — agent/hook co při startu session zkontroluje jestli přišel feedback přes /api/feedback
2. [ ] **Sdílení družiny** — multiplayer: sdílet kampaň napříč hráči, každý vidí změny ostatních (game changer, velká feature)
3. [ ] **Chybějící fotky předmětů** — zbývá 16: #127, #149, #151-164
4. [ ] **Frosthaven projekt** — přidat feedback, CI, testy (prompt připraven)

## Co se udělalo 2026-03-21 (celá session)
- [x] Quest system + personal quests + city/road events + PWA + feedback
- [x] 103 unit testů + 9 E2E testů + GitHub CI (actions v5, Node 24)
- [x] České názvy: 95 scénářů, 100 předmětů, 24 osobních questů (z pravidel + karet)
- [x] Fotky předmětů: 149 fotek oříznutých + nahrány na server
- [x] Storage/sync bug fix (logout + sync nemaže cloud)
- [x] Slot limit: warning místo blokace (vlastnit lze cokoliv)
- [x] Two-tap eventy, spoiler-safe questy, stats bar na flowchartu
- [x] QR kód redesign, import na úvodní stránce, vyhledávání úspěchů
- [x] Verze 2.0.0, README přepsán, Cloudflare cache fix
- [x] Caddy reverse proxy opravena pro gloomhaven subdomain

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh`
- Testy: `npm test` (103 unit) + `npm run test:e2e` (9 E2E)
- Fotky předmětů: na serveru v /home/ongy/Projekty/Server/gloomhaven/public/img/items/
- Deploy skript kopíruje fotky do kontejneru (docker cp)
- Cloudflare cachuje 4h — pro nové soubory přidat ?v=X cache buster
- Caddy hlavní proxy: /home/ongy/Projekty/Server/caddy/Caddyfile (přidána gloomhaven route)
- Svatyně Velkého dubu = Příspěvky (donace) v sekci Družina
- Login rate limit: 30/hodinu
- master branch synchronizován s main
