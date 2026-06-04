# ---- build stage ----
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- serve stage ----
FROM caddy:2.11.2
COPY <<EOF /etc/caddy/Caddyfile
:80 {
    root * /srv
    try_files {path} /index.html
    file_server

    header /index.html Cache-Control "no-cache, no-store, must-revalidate"
    header /*.html Cache-Control "no-cache, no-store, must-revalidate"
    header /sw.js Cache-Control "no-cache, no-store, must-revalidate"
    header /registerSW.js Cache-Control "no-cache, no-store, must-revalidate"
    header /assets/* Cache-Control "public, max-age=31536000, immutable"
}
EOF
COPY --from=build /app/dist /srv
