# Next Session TODO

**Date:** 2026-03-21
**Last session:** CZ quest linie, Svatyně, fotky fix, export testy

## Co dál (priority)
1. [ ] **Feedback checker** — při startu session zkontrolovat /api/feedback (zatím jen 1 testovací)
2. [ ] **Sdílení družiny** — multiplayer: sdílet kampaň napříč hráči (velká feature, na jindy)
3. [ ] **Attack modifier deck** — vizualizace balíčku po percích (na jindy)
4. [ ] **Chybějící fotky předmětů** — #127, #149, #151-164 (předměty v obálkách, odloženo)

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh`
- Testy: `npm test` (105 unit) + `npm run test:e2e` (9 E2E)
- Fotky předmětů: ručně oříznuté na serveru, deploy skript je kopíruje do kontejneru
- Cloudflare cache: 4h, cache buster ?v=3 na obrázcích
- Caddy route pro gloomhaven.ongy.cz přidána do hlavního Caddyfile
- master branch synchronizován s main
- Frosthaven projekt: feedback+CI+testy už implementováno (vyřazeno z TODO)
- Verze: 2.0.0, 105 testů
