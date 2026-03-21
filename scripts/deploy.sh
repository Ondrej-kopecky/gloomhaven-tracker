#!/bin/bash
# Deploy Gloomhaven Tracker to production server
# Usage: bash scripts/deploy.sh

set -e

SERVER="server"
REMOTE_DIR="/home/ongy/Projekty/Server"
GLOOM_DIR="$REMOTE_DIR/gloomhaven"

echo "=== Gloomhaven Tracker Deploy ==="

# 1. Build check
echo "→ Checking local build..."
npm run build --silent
echo "  ✓ Build OK"

# 2. Upload source
echo "→ Uploading files..."
scp -q -r \
  src public package.json package-lock.json \
  tsconfig.json tsconfig.app.json tsconfig.node.json \
  vite.config.ts index.html .env.production \
  $SERVER:$GLOOM_DIR/
echo "  ✓ Files uploaded"

# 3. Set production env
echo "→ Setting production env..."
ssh $SERVER "cd $GLOOM_DIR && mv -f .env.production .env"
echo "  ✓ .env set"

# 4. Build & restart container
echo "→ Building container..."
ssh $SERVER "cd $REMOTE_DIR && docker compose build gloomhaven --quiet && docker compose up -d gloomhaven"
echo "  ✓ Container deployed"

# 5. Copy item images into container (not in git, hosted on server)
echo "→ Copying item images..."
ssh $SERVER "docker cp $GLOOM_DIR/public/img/items gloomhaven:/srv/img/ 2>/dev/null || true"
echo "  ✓ Item images copied"

echo ""
echo "=== Deploy complete! ==="
echo "→ https://gloomhaven.ongy.cz"
