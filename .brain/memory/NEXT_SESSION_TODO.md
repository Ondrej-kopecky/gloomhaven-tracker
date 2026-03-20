# Next Session TODO

**Date:** 2026-03-20
**Last session:** Favicon + Forgot password

## Co se udělalo v této session (2026-03-20)
- [x] **Favicon** — nový zlatý meč SVG, opravena reference /vite.svg → /favicon.svg
- [x] **Forgot password** — nová stránka /zapomenute-heslo, backend endpointy, link z loginu
- [x] **Deploy** — obojí nasazeno na gloomhaven.ongy.cz

## Co pořád nefunguje 100% na mobilu
- [ ] **Flowchart pinch-to-zoom** — potřeba ověřit na fyzickém telefonu
- [ ] **Flowchart tap na scénáře** — tap detekce přidána, potřeba ověřit

## Co dál (priority)
1. [ ] **Ověřit flowchart na mobilu** — pinch zoom + tap
2. [ ] **Cloud sync** — propojit se stávajícím auth systémem
3. [ ] **Storyline/quest system** — progressive story
4. [ ] **Personal quests** — 24 questů, odemykání tříd
5. [ ] **City/Road events** — deck management
6. [ ] **PWA support** — manifest, service worker

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh`
- Backend forgot-password endpointy přidány přímo na serveru (patch_gh_forgot.py)
  - Lokální api/main.py NEOBSAHUJE forgot password — je jen na serveru
  - Při příštím deployi backendu je potřeba přidat i do lokálního souboru
