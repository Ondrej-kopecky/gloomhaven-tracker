# Next Session TODO

**Date:** 2026-03-22
**Last session:** v3.4.0 — Attack modifier deck, retirement flow, obálky, upscaled fotky, SVG fix

## Co se udělalo 2026-03-22 (session 2)
- [x] **Campaign sharing** — sdílení kampaně kódem (6 API endpointů, share panel, join flow)
- [x] **Auto versioning** — conventional commits + auto bump při deployi
- [x] **Attack modifier deck** — vizualizace balíčku po talentových (18 tříd)
- [x] **Retirement flow** — potvrzení + info o odemčení třídy/scénářů
- [x] **Obálky** — A/B/☀/☾/X tracking, spoiler-safe s potvrzením
- [x] **Item #151** — opraven zdroj na Obálku X, skrytý při spoilerech
- [x] **FC popis** — rozšířený text u toggle
- [x] **Upscalované fotky** — 151 předmětů PNG→JPG na server
- [x] **SVG fix** — version-bump skript rozbíjel SVG paths

## Co dál (priority)
1. [ ] **České texty událostí** — přeložit příběhové texty (8700 řádků, nízká priorita)
2. [ ] **Anglická verze webu** — i18n, přepínání CZ/EN (nápad)
3. [ ] **Fotky předmětů #152-164** — Forgotten Circles předměty nemají fotky

## Při startu session
- [ ] **Zkontrolovat feedback** — `ssh server "docker exec ongy-api python3 -c \"import sqlite3; conn=sqlite3.connect('/app/data/app.db'); c=conn.cursor(); c.execute('SELECT * FROM feedback ORDER BY rowid DESC LIMIT 10'); [print(r) for r in c.fetchall()]; conn.close()\""`

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh` (auto version bump + frontend + API + fotky)
- Deploy major: `bash scripts/deploy.sh major` (pro velké release)
- Testy: `npm test` (105 unit) + `npm run test:e2e` (9 E2E)
- Commity: `feat:` → minor, `fix:` → patch, `brain:/chore:` → žádný bump
- Fotky: trvalá složka na serveru /home/ongy/Projekty/Server/gloomhaven-items/
- Cloudflare cache: 4h, cache buster ?v=4
- GoatCounter: gloomhaven.goatcounter.com (SPA tracking přes router.afterEach)
- Předměty #134-151 = solo scénáře, #151 = Obálka X, #152-164 = Forgotten Circles
- master branch synchronizován s main
- Verze: 3.4.0, 105 testů
- 6 registrovaných uživatelů (Ongy, Ongy2, Milan, Laiedal, Toro + testovací)
