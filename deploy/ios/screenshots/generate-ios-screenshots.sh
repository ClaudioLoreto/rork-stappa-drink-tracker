#!/usr/bin/env bash
# generate-ios-screenshots.sh
# Utility script to automate iOS screenshots capture for App Store submission.
# Requirements: macOS, Xcode + simulators installed, app running in development (expo start) OR using a built .app
# Usage examples:
#   1. Start dev server: npx expo start --ios (open simulator manually)
#   2. Run this script: ./generate-ios-screenshots.sh
# Screens will be saved in ./output/ organized by size.

set -euo pipefail
OUTPUT_DIR="$(dirname "$0")/output"
mkdir -p "$OUTPUT_DIR/iphone-6.7" "$OUTPUT_DIR/iphone-6.5" "$OUTPUT_DIR/iphone-5.5"

# Simulator device names
DEVICE_67="iPhone 15 Pro Max"      # 6.7"
DEVICE_65="iPhone 14 Plus"         # 6.5" (or iPhone 11 Pro Max alternative)
DEVICE_55="iPhone 8 Plus"          # 5.5"

function boot_sim() {
  local name="$1"
  local udid
  udid=$(xcrun simctl list devices available | grep -F "$name (" | awk -F'[()]' '{print $2}' | head -1)
  if [ -z "$udid" ]; then
    echo "[ERROR] Simulator $name not found. Install via Xcode > Settings > Platforms." >&2
    exit 1
  fi
  xcrun simctl boot "$udid" 2>/dev/null || true
  echo "$udid"
}

function wait_boot() {
  local udid="$1"
  echo "Waiting for device $udid to boot..."
  for i in {1..20}; do
    state=$(xcrun simctl list devices | grep "$udid" | grep -oE "(Booted|Shutdown)")
    [ "$state" = "Booted" ] && return 0
    sleep 2
  done
  echo "[WARN] Device $udid may not be fully booted, continuing..."
}

function capture_set() {
  local udid="$1"; local folder="$2"; local prefix="$3"
  echo "Capturing screenshots for $prefix -> $folder"
  # Suggest user navigates manually to each screen; pause-and-capture approach
  declare -a shots=(
    "login" "select-bar" "user-dashboard" "merchant-dashboard" "social-feed"
  )
  for shot in "${shots[@]}"; do
    read -p "Navigate to screen: $shot then press Enter to capture..." _
    filename="$folder/${prefix}_${shot}.png"
    xcrun simctl io "$udid" screenshot "$filename"
    echo "Saved: $filename"
  done
}

UDID_67=$(boot_sim "$DEVICE_67")
wait_boot "$UDID_67"
UDID_65=$(boot_sim "$DEVICE_65")
wait_boot "$UDID_65"
UDID_55=$(boot_sim "$DEVICE_55")
wait_boot "$UDID_55"

# Focus first simulator (optional)
open -a Simulator || true

capture_set "$UDID_67" "$OUTPUT_DIR/iphone-6.7" "67"
capture_set "$UDID_65" "$OUTPUT_DIR/iphone-6.5" "65"
# For 5.5" fewer required screenshots
capture_set "$UDID_55" "$OUTPUT_DIR/iphone-5.5" "55"

cat <<INFO
-------------------------------------------------------
Screenshots complete.
Check output folders:
$OUTPUT_DIR/iphone-6.7
$OUTPUT_DIR/iphone-6.5
$OUTPUT_DIR/iphone-5.5

Rename if necessary following Apple's naming conventions or upload directly.
Ensure NO status bar anomalies (use Xcode "Enable Pro