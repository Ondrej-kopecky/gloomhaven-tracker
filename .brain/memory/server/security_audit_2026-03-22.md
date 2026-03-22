# Security Audit — 2026-03-22 (v3.5.2)

## Server (Ubuntu 24.04, Tailscale, Caddy, Docker)

### Opraveno:
- **SSH PasswordAuthentication no** — hesla vypnuta, pouze klíče (ed25519)
- **Portainer (9000/9443)** — binding změněn z `0.0.0.0` na `100.101.33.29` (Tailscale only)
- **API Dockerfile** — přidán `appuser` (non-root), `USER appuser`
- **DB permissions** — `app.db` změněno z 644 na 600, owned by appuser

### Stav serveru:
- SSH poslouchá jen na Tailscale IP (100.101.33.29:22)
- PermitRootLogin no, MaxAuthTries 3, X11Forwarding no
- Cloudflare tunnel pro web traffic (skrytá IP serveru)
- Caddy jako reverse proxy s auto HTTPS
- Unattended-upgrades aktivní
- Docker 24.0.7 / Compose 2.21.0

### Zůstává k řešení (nízká priorita):
- Docker verze je starší (24.x vs aktuální 27.x)
- Caddy Caddyfile jen na :80 (Cloudflare terminuje HTTPS)
- Žádné automatické zálohy DB
- Žádný firewall (UFW) — Docker bypasuje iptables přímo

---

## API Backend (FastAPI, Python 3.12)

### Opraveno:
- **SECRET_KEY** — vyžaduje env var v produkci, crash při startu pokud chybí; silný 64-char hex klíč nasazen
- **API docs skryté** — `/api/docs` a `/api/openapi.json` disabled v produkci (ENV=production)
- **CORS** — localhost origins jen v dev režimu, produkce jen ongy.cz domény
- **Security headers** — X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection, Referrer-Policy, HSTS (63072000s)
- **Minimum hesla** — zvýšeno z 6 na 8 znaků (backend registrace + reset, frontend registrace + forgot)
- **Timing-safe porovnání** — `hmac.compare_digest()` na verifikačních kódech (verify + reset-password)
- **Logy** — verifikační kódy se už nevypisují do stdout

### Co bylo už dobře:
- Bcrypt hashování hesel (passlib)
- SQLAlchemy parametrizované dotazy (žádná SQL injection)
- Rate limiting na auth endpointech (5/hr register, 30/hr login, 5/hr forgot)
- JWT s 24h expirací
- Autorizace na kampaních (owner vs member check)

### Zůstává k řešení (nízká priorita):
- Rate limiter v paměti (resetuje se při restartu)
- Verifikační kód jen 6 číslic bez lockoutu
- Chybí EmailStr validace v Pydantic modelu
- Campaign JSON bez schema validace

---

## Frontend (Vue 3, Vite)

### Opraveno:
- Password validace na RegisterPage a ForgotPasswordPage (8 znaků)

### Co bylo už dobře:
- Žádné hardcoded secrets
- v-html jen na statické SVG a item descriptions (ne user input)
- `new Function()` v questStore správně sanitizovaný
- Bearer token auth, auto-logout na 401
- Všechny dependencies aktuální

### Zůstává k řešení (nízká priorita):
- Žádné route guards (ochrana jen na úrovni komponent)
- Chybí CSP header
- Token v localStorage (standard pro SPA, ale zranitelný při XSS)

---

## Env vars v produkci (docker-compose.yml):
- `ENV=production`
- `SECRET_KEY=<64-char hex>`
- `SMTP_*` credentials v `api/.env`
