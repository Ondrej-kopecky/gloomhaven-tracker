# Next Session TODO

**Date:** 2026-03-20
**Last session:** Mobilní flowchart opravy + odemykání scénářů + donate

## Co se udělalo v této session
- [x] **AppHeader fixed** — sticky → fixed top-0, vždy viditelný na mobilu
- [x] **FlowchartPage fixed layout** — fixed inset-0 top-16, body overflow:hidden
- [x] **svg-pan-zoom → panzoom** — nativní touch support (pinch + pan)
- [x] **Tap detekce na flowchartu** — samostatný listener vedle panzoom
- [x] **Přehled na mobilu** — odstraněn redirect na /scenare
- [x] **Odemykání scénářů** — nové tlačítko pro LOCKED/BLOCKED (flowchart + scénáře)
- [x] **ScenarioDetail redesign** — fixní header + scroll obsah + fixní footer s tlačítky
- [x] **ScenariosPage akční tlačítka** — odemknout/dokončit/pokus/reset v modálu
- [x] **Reaktivní modál** — computed selectedScenario místo statického snapshotu
- [x] **Donate sekce** — Revolut QR kód v nastavení
- [x] **Duplikátní legenda** — odstraněna spodní

## Co pořád nefunguje 100% na mobilu
- [ ] **Flowchart pinch-to-zoom** — panzoom by měl fungovat, ale potřeba ověřit na fyzickém telefonu
- [ ] **Flowchart tap na scénáře** — tap detekce přidána, potřeba ověřit

## Co dál (priority)
1. [ ] **Ověřit flowchart na mobilu** — pinch zoom + tap po posledních opravách
2. [ ] **Storyline/quest system** - progressive story
3. [ ] **Personal quests** - 24 questů, odemykání tříd
4. [ ] **City/Road events** - deck management
5. [ ] **PWA support** - manifest, service worker

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh`
- AppHeader je teď FIXED (ne sticky) — všechny stránky mají pt-18 na main
- FlowchartPage používá panzoom (ne svg-pan-zoom) — stejná knihovna jako MapPage
- Mobilní testování: fyzický telefon + hard refresh (Cloudflare cache)
- svg-pan-zoom je stále v package.json ale nepoužívá se — můžeme odebrat
