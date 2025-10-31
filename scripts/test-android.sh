#!/usr/bin/env bash
set -euo pipefail

# Quick test runner for Firefox for Android (Nightly/Beta/Release)
# Requirements:
#  - bash, adb, web-ext
#  - Android device connected with USB debugging enabled
#  - Firefox Nightly (preferred) installed on device
#
# Usage:
#  scripts/test-android.sh [ANDROID_DEVICE_ID]
# Environment:
#  FIREFOX_ANDROID_PACKAGE  Override package (e.g., org.mozilla.fenix)
#  WEB_EXT_FLAGS            Extra flags to pass to web-ext run

# Resolve repo root (directory containing this script is scripts/)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_ROOT="${SCRIPT_DIR%/scripts}"
cd "$REPO_ROOT"

if [[ ! -f manifest.json ]]; then
  echo "Error: manifest.json not found in repo root: $REPO_ROOT" >&2
  exit 1
fi

have_cmd() { command -v "$1" >/dev/null 2>&1; }

if ! have_cmd adb; then
  echo "Error: 'adb' not found. Install Android Platform Tools and ensure it's on PATH." >&2
  exit 2
fi

if ! have_cmd web-ext; then
  echo "Error: 'web-ext' not found. Install with: npm install -g web-ext" >&2
  exit 2
fi

# Pick device
DEVICE_ID="${1:-}"
if [[ -z "$DEVICE_ID" ]]; then
  # pick first device in 'device' state
  DEVICE_ID=$(adb devices | awk 'NR>1 && $2=="device" {print $1; exit}') || true
fi

if [[ -z "${DEVICE_ID:-}" ]]; then
  echo "Error: No Android device found in 'device' state. Check 'adb devices' and authorize the computer." >&2
  exit 3
fi

# Determine Firefox package
PREF_PACKAGES=(
  org.mozilla.fenix         # Nightly (Fenix)
  org.mozilla.firefox_beta  # Beta
  org.mozilla.firefox       # Release
)

PKG="${FIREFOX_ANDROID_PACKAGE:-}"
if [[ -z "$PKG" ]]; then
  for candidate in "${PREF_PACKAGES[@]}"; do
    if adb -s "$DEVICE_ID" shell pm list packages | tr -d '\r' | grep -q "^package:${candidate}$"; then
      PKG="$candidate"
      break
    fi
  done
fi

if [[ -z "$PKG" ]]; then
  echo "Error: Could not find Firefox on device $DEVICE_ID. Install Firefox Nightly (org.mozilla.fenix)." >&2
  exit 4
fi

echo "Using device: $DEVICE_ID"
echo "Using package: $PKG"

# Run the extension temporarily in Firefox for Android
set -x
web-ext run \
  --source-dir "$REPO_ROOT" \
  --target firefox-android \
  --android-device "$DEVICE_ID" \
  --android-package "$PKG" \
  --no-input ${WEB_EXT_FLAGS:-}
