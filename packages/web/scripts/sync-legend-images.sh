#!/usr/bin/env bash
# Cron entrypoint: fetch portraits for new legends, then commit, push, rebuild and restart the web app.
# Does nothing beyond the fetch when no image is missing.
set -euo pipefail

WEB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "$WEB_DIR/../.." && pwd)"

# cron runs with a bare PATH; load nvm's node/npm/pm2
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null

exec 9>"/tmp/brawlmance-sync-legend-images.lock"
flock -n 9 || { echo "Another sync is running, skipping"; exit 0; }

echo "[$(date -Is)] Checking for missing legend images"
cd "$WEB_DIR"
added="$(node scripts/sync-legend-images.mjs)"
if [ -z "$added" ]; then
  echo "Nothing new"
  exit 0
fi

names="$(echo "$added" | sed 's/\.png$//' | paste -sd, - | sed 's/,/, /g')"
echo "Added: $names"

cd "$REPO_DIR"
git add packages/web/assets/img/legends
git commit -q -m "Add legend images: $names" -- packages/web/assets/img/legends
git pull -q --rebase --autostash
git push -q

cd "$WEB_DIR"
npm run build
pm2 restart brawlmance-web
echo "Deployed"
