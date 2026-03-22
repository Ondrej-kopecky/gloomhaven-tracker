# Next Session TODO

**Date:** 2026-03-22
**Last session:** v4.0.0 — Security, SEO, překlady, feedback, XP fix, quest storylines

## Co se udělalo 2026-03-22 (session 3) — v3.5.1 → v4.0.0

### Security audit & hardening (v3.5.2)
- [x] SECRET_KEY vyžaduje env var v produkci
- [x] API docs skryté v produkci
- [x] CORS bez localhost v produkci
- [x] Security headers (HSTS, X-Frame, X-Content-Type, Referrer-Policy)
- [x] Heslo minimum 8 znaků (backend + frontend)
- [x] hmac.compare_digest() na verifikačních kódech
- [x] Verifikační kódy odstraněny z logů

### Server hardening
- [x] SSH PasswordAuthentication no
- [x] Portainer jen na Tailscale IP
- [x] API Docker non-root (appuser)
- [x] DB permissions 600

### Feedback notifikace
- [x] GH + FH posílají na okkopecky@gmail.com
- [x] Rozšířená data: uživatel, kampaň, verze, obrazovka, stránka, IP

### Bugfixy
- [x] Spoiler fix — poklady u scénářů skryté dokud nedokončený
- [x] XP progress bar — správný výpočet v rámci levelu
- [x] Mobile stat labels — zkratky na flowchartu

### SEO & Google
- [x] Meta description, OG tagy, Twitter Card, canonical URL
- [x] robots.txt + sitemap.xml (GH 9 stránek, FH 7 stránek)
- [x] Google Search Console — 3 domény ověřeny, sitemapy úspěšné
- [x] Indexování požádáno

### České překlady
- [x] 41 scénářů doplněno summary (celkem 95/95)
- [x] 60 questových příběhů přeloženo s progresivním odhalováním
- [x] Stránka Příběh přidána do navigace

### Ostatní
- [x] README aktualizováno
- [x] Credits pro gloomhaven-storyline.com

## Co dál (priority)
1. [ ] **Ověřit Google indexování** — hledat `site:gloomhaven.ongy.cz` (3-7 dní)
2. [ ] **Anglická verze webu** — i18n, přepínání CZ/EN (nápad)
3. [ ] **Fotky předmětů #152-164** — Forgotten Circles předměty nemají fotky

## Při startu session
- [ ] **Zkontrolovat feedback** — notifikace chodí na Gmail
- [ ] **Google indexování** — hledat `site:gloomhaven.ongy.cz` v Googlu

## Poznámky
- Server: `ssh server` (Tailscale)
- Deploy: `bash scripts/deploy.sh` (auto version bump + frontend + API + fotky)
- Deploy major: `bash scripts/deploy.sh major`
- Testy: `npm test` (105 unit) + `npm run test:e2e` (9 E2E)
- Commity: `feat:` → minor, `fix:` → patch, `brain:/chore:` → žádný bump
- Google Search Console: 3 domény ověřeny (soubor google78df9234136c9e52.html)
- ENV=production + SECRET_KEY nastaveno v docker-compose na serveru
- API běží jako appuser (non-root), DB permissions 600
- Verze: 4.0.0, 105 testů
