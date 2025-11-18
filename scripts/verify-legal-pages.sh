#!/usr/bin/env bash
# verify-legal-pages.sh
# Checks that the public legal/support pages return HTTP 200.
# Usage: ./scripts/verify-legal-pages.sh <github-username>
# Example: ./scripts/verify-legal-pages.sh claudioloreto

set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: $0 <github-username>" >&2
  exit 1
fi

USERNAME="$1"
BASE="https://$USERNAME.github.io/rork-stappa-drink-tracker"
PAGES=(
  "privacy.html"
  "terms.html"
  "cookies.html"
  "support.html"
  "index.html"
)

for page in "${PAGES[@]}"; do
  url="$BASE/$page"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  if [ "$status" = "200" ]; then
    echo "[OK] $url"
  else
    echo "[FAIL] $url -> HTTP $status" >&2
  fi
  sleep 1
  done
