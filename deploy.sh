#!/usr/bin/env bash
# Usage (on server): ./deploy.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="/var/www/researchpatra"

SRC="$REPO_DIR/dist"
LIVE="$WEB_DIR/dist"
NEW="$WEB_DIR/dist.new"
OLD="$WEB_DIR/dist.old"

cd "$REPO_DIR"

echo "Building ..."
npm run build

if [ ! -f "$SRC/index.html" ]; then
  echo "ERROR: $SRC/index.html not found after build."
  exit 1
fi

echo "Copying new build to $NEW ..."
rm -rf "$NEW"
cp -r "$SRC" "$NEW"

echo "Swapping live build ..."
rm -rf "$OLD"
if [ -d "$LIVE" ]; then
  mv "$LIVE" "$OLD"
fi
mv "$NEW" "$LIVE"

echo "Deployed OK at $(date)"
echo "Rollback: cd $WEB_DIR && mv dist dist.broken && mv dist.old dist"
