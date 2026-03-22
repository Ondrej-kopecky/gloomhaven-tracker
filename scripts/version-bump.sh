#!/bin/bash
# Auto version bump based on conventional commits since last tag
# Usage: bash scripts/version-bump.sh [major]
#   - Without args: auto-detect from commits (feat: → minor, fix: → patch)
#   - With "major": force major bump
#
# Commit prefixes:
#   feat:  → minor bump (3.1.0)
#   fix:   → patch bump (3.0.1)
#   brain:/chore:/docs: → no bump (skipped)

set -e

CURRENT=$(node -p "require('./package.json').version")
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$LAST_TAG" ]; then
  echo "No previous tag found. Current version: $CURRENT"
  exit 0
fi

echo "Current version: $CURRENT (tag: $LAST_TAG)"

# Force major if requested
if [ "$1" = "major" ]; then
  IFS='.' read -r major minor patch <<< "$CURRENT"
  NEW="$((major + 1)).0.0"
  echo "→ Major bump: $CURRENT → $NEW"
  npm version "$NEW" --no-git-tag-version > /dev/null
  # Update SettingsPage (only the version line, not SVG paths)
  sed -i "s/font-medium\">$CURRENT/font-medium\">$NEW/" src/pages/SettingsPage.vue 2>/dev/null || true
  echo "$NEW"
  exit 0
fi

# Check commits since last tag
COMMITS=$(git log "$LAST_TAG"..HEAD --pretty=format:"%s" 2>/dev/null)

if [ -z "$COMMITS" ]; then
  echo "No new commits since $LAST_TAG. Skipping."
  exit 0
fi

# Determine bump type
HAS_FEAT=false
HAS_FIX=false

while IFS= read -r msg; do
  case "$msg" in
    feat:*|feat\(*) HAS_FEAT=true ;;
    fix:*|fix\(*)   HAS_FIX=true ;;
  esac
done <<< "$COMMITS"

IFS='.' read -r major minor patch <<< "$CURRENT"

if $HAS_FEAT; then
  NEW="$major.$((minor + 1)).0"
  TYPE="minor (feat detected)"
elif $HAS_FIX; then
  NEW="$major.$minor.$((patch + 1))"
  TYPE="patch (fix detected)"
else
  echo "No feat:/fix: commits since $LAST_TAG. Skipping version bump."
  echo "Commits since last tag:"
  echo "$COMMITS" | head -5
  exit 0
fi

echo "→ Auto $TYPE: $CURRENT → $NEW"

# Update package.json
npm version "$NEW" --no-git-tag-version > /dev/null

# Update SettingsPage version display (only the version line, not SVG paths)
sed -i "s/font-medium\">$CURRENT/font-medium\">$NEW/" src/pages/SettingsPage.vue 2>/dev/null || true

echo "$NEW"
