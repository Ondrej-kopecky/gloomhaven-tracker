# Next Session TODO

**Date:** 2026-03-22
**Last session:** v3.7.0 — Security audit, SEO, feedback notifikace, spoiler fix, mobile stat labels

## Co se udělalo 2026-03-22 (session 3)
- [x] **Security audit** — SECRET_KEY, API docs hidden, CORS, security headers, heslo 8+, hmac.compare_digest, logy
- [x] **Server hardening** — SSH hesla off, Portainer jen Tailscale, API non-root, DB permissions 600
- [x] **Feedback email notifikace** — GH i FH posílají na okkopecky@gmail.com s rozšířenými daty (user, kampaň, verze, obrazovka)
- [x] **Spoiler fix** — poklady u scénářů skryté dokud scénář není dokončený
- [x] **Mobile stat labels** — přidány zkratky (sc., dost., post., prosp., rep.) na přehledu
- [x] **SEO** — meta description, OG tagy, Twitter card, sitemap.xml, robots.txt, lepší title
- [x] **Google Search Console** — ověřeno pro gloomhaven.ongy.cz, ongy.cz, frosthaven.ongy.cz

## Co dál (priority)
1. [x] **Google Search Console sitemapy** — GH: Úspěšné (9 stránek), FH: odesláno
2. [ ] **Ověřit Google indexování** — hledat `site:gloomhaven.ongy.cz` (mělo by se objevit do 3-7 dnů)
2. [ ] **České texty událostí** — přeložit příběhové texty (8700 řádků, nízká priorita)
3. [ ] **Anglická verze webu** — i18n, přepínání CZ/EN (nápad)
4. [ ] **Fotky předmětů #152-164** — Forgotten Circles předměty nemají fotky

## Při startu session
- [ ] **Zkontrolovat feedback** — notifikace chodí na Gmail, ale taky: `ssh server "docker exec ongy-api python3 -c \"import sqlite3; conn=sqlite3.connect('/app/data/app.db'); c=conn.cursor(); c.execute('SELECT * FROM feedback ORDER BY rowid DESC LIMIT 10'); [print(r) for r in c.fetchall()]; conn.close()\""`
- [ ] **Google indexování** — hledat `site:gloomhaven.ongy.cz` v Googlu

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh` (auto version bump + frontend + API + fotky)
- Deploy major: `bash scripts/deploy.sh major` (pro velké release)
- Testy: `npm test` (105 unit) + `npm run test:e2e` (9 E2E)
- Commity: `feat:` → minor, `fix:` → patch, `brain:/chore:` → žádný bump
- Fotky: trvalá složka na serveru /home/ongy/Projekty/Server/gloomhaven-items/
- Cloudflare cache: 4h, cache buster ?v=4
- GoatCounter: gloomhaven.goatcounter.com (SPA tracking přes router.afterEach)
- Google Search Console: všechny 3 domény ověřeny (soubor google78df9234136c9e52.html)
- Předměty #134-151 = solo scénáře, #151 = Obálka X, #152-164 = Forgotten Circles
- master branch synchronizován s main
- Verze: 3.7.0, 105 testů
- ENV=production + SECRET_KEY nastaveno v docker-compose na serveru
- API běží jako appuser (non-root), DB permissions 600
