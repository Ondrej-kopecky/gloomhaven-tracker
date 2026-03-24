#!/bin/bash
# Deploy Gloomhaven Tracker to production server
# Usage: bash scripts/deploy.sh

set -e

SERVER="server"
REMOTE_DIR="/home/ongy/Projekty/Server"
GLOOM_DIR="$REMOTE_DIR/gloomhaven"
# Item images stored outside deploy path to survive deploys
ITEMS_DIR="$REMOTE_DIR/gloomhaven-items"

echo "=== Gloomhaven Tracker Deploy ==="

# 0. Auto version bump
echo "→ Version check..."
NEW_VERSION=$(bash scripts/version-bump.sh "$1" 2>&1 | tail -1)
if [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "  ✓ Version bumped to $NEW_VERSION"
  git add package.json package-lock.json src/pages/SettingsPage.vue
  git commit -m "chore: bump version to $NEW_VERSION"
  git tag -a "v$NEW_VERSION" -m "v$NEW_VERSION"
  git push origin main && git push origin main:master && git push origin "v$NEW_VERSION"
else
  echo "  · No version change needed"
fi

# 1. Build check
echo "→ Checking local build..."
npm run build --silent
echo "  ✓ Build OK"

# 2. Backup item images on server (before upload overwrites them)
echo "→ Backing up item images..."
ssh $SERVER "mkdir -p $ITEMS_DIR && cp -n $GLOOM_DIR/public/img/items/*.jpg $ITEMS_DIR/ 2>/dev/null || true"
echo "  ✓ Backup OK"

# 3. Upload source
echo "→ Uploading files..."
scp -q -r \
  src public package.json package-lock.json \
  tsconfig.json tsconfig.app.json tsconfig.node.json \
  vite.config.ts index.html .env.production \
  $SERVER:$GLOOM_DIR/
echo "  ✓ Files uploaded"

# 3b. Upload API (if changed)
echo "→ Uploading API..."
scp -q api/main.py $SERVER:$REMOTE_DIR/api/main.py
ssh $SERVER "docker cp $REMOTE_DIR/api/main.py ongy-api:/app/main.py && docker compose -f $REMOTE_DIR/docker-compose.yml restart api"
echo "  ✓ API updated"

# 4. Restore item images on server (after upload)
echo "→ Restoring item images..."
ssh $SERVER "mkdir -p $GLOOM_DIR/public/img/items && cp $ITEMS_DIR/*.jpg $GLOOM_DIR/public/img/items/ 2>/dev/null || true"
echo "  ✓ Images restored"

# 5. Set production env
echo "→ Setting production env..."
ssh $SERVER "cd $GLOOM_DIR && mv -f .env.production .env"
echo "  ✓ .env set"

# 6. Build & restart container
echo "→ Building container..."
ssh $SERVER "cd $REMOTE_DIR && docker compose build gloomhaven --quiet && docker compose up -d gloomhaven && docker builder prune -af --filter 'until=24h' > /dev/null 2>&1 &"
echo "  ✓ Container deployed"

# 7. Copy item images into container
echo "→ Copying item images into container..."
ssh $SERVER "docker cp $ITEMS_DIR/. gloomhaven:/srv/img/items/"
echo "  ✓ Item images copied"

echo ""
echo "=== Deploy complete! ==="
echo "→ https://gloomhaven.ongy.cz"
