#!/usr/bin/env bash
#
# Install fonts for glissando themes.
#
# Font presets:
#   default       DM Serif Display + Inter + JetBrains Mono (free, Google Fonts)
#   google-fonts  Libre Baskerville + Space Grotesk + JetBrains Mono (free, Google Fonts)
#   macos-native  Iowan Old Style + Avenir Next + Menlo (pre-installed on macOS)
#
# Usage:
#   ./scripts/install-fonts.sh                        # install default preset
#   ./scripts/install-fonts.sh claude-doc default     # same as above
#   ./scripts/install-fonts.sh claude-doc google-fonts
#   ./scripts/install-fonts.sh claude-doc macos-native
#   ./scripts/install-fonts.sh elegant-bw             # Space Grotesk + Inter + JetBrains Mono
#
# Supports: macOS, Linux

set -euo pipefail

THEME="${1:-claude-doc}"
PRESET="${2:-default}"

# --- Detect OS and set font install directory ---
OS="$(uname -s)"
case "$OS" in
  Darwin)
    INSTALL_DIR="$HOME/Library/Fonts"
    ;;
  Linux)
    INSTALL_DIR="$HOME/.local/share/fonts"
    mkdir -p "$INSTALL_DIR"
    ;;
  *)
    echo "Error: Unsupported OS '$OS'. Use install-fonts.ps1 for Windows."
    exit 1
    ;;
esac

echo "=== glissando Font Installer ==="
echo "Theme:       $THEME"
echo "Preset:      $PRESET"
echo "OS:          $OS"
echo "Install to:  $INSTALL_DIR"
echo ""

# --- Helper: download a single font from Google Fonts CSS API ---
install_google_font() {
  local FONT_NAME="$1"       # Display name, e.g. "DM Serif Display"
  local CSS_QUERY="$2"       # CSS API query, e.g. "DM+Serif+Display:wght@400"
  local FILE_PREFIX="$3"     # Filename prefix, e.g. "DMSerifDisplay"

  if ls "$INSTALL_DIR"/vs-${FILE_PREFIX}* 2>/dev/null | grep -q .; then
    echo "[✓] $FONT_NAME — already installed"
    return 0
  fi

  echo "[↓] Downloading $FONT_NAME..."

  local CSS
  CSS=$(curl -fsSL "https://fonts.googleapis.com/css2?family=${CSS_QUERY}&display=swap" \
    -H "User-Agent: Mozilla/5.0")

  local COUNT=0
  local WEIGHT=""
  while IFS= read -r line; do
    if echo "$line" | grep -q "font-weight:"; then
      WEIGHT=$(echo "$line" | grep -oE '[0-9]+')
    fi
    if echo "$line" | grep -q "url(https://"; then
      local URL
      URL=$(echo "$line" | grep -oE 'https://[^ )]+\.ttf')
      if [ -n "$URL" ]; then
        curl -fsSL "$URL" -o "$INSTALL_DIR/vs-${FILE_PREFIX}-${WEIGHT}.ttf"
        COUNT=$((COUNT + 1))
      fi
    fi
  done <<< "$CSS"

  if [ "$COUNT" -gt 0 ]; then
    echo "[✓] $FONT_NAME — installed ($COUNT weights)"
  else
    echo "[!] $FONT_NAME — failed to download"
  fi
}

# --- Helper: install JetBrains Mono from GitHub ---
install_jetbrains_mono() {
  local VERSION="2.304"
  local URL="https://github.com/JetBrains/JetBrainsMono/releases/download/v${VERSION}/JetBrainsMono-${VERSION}.zip"

  if ls "$INSTALL_DIR"/vs-JetBrainsMono* 2>/dev/null | grep -q .; then
    echo "[✓] JetBrains Mono — already installed"
    return 0
  fi

  echo "[↓] Downloading JetBrains Mono v${VERSION}..."
  local TMP
  TMP=$(mktemp -d)
  local ZIP="$TMP/JetBrainsMono.zip"
  curl -fsSL "$URL" -o "$ZIP"
  unzip -q -o "$ZIP" -d "$TMP"

  local STATIC="$TMP/fonts/ttf"
  if [ -d "$STATIC" ]; then
    for f in "$STATIC"/JetBrainsMono-*.ttf; do
      cp "$f" "$INSTALL_DIR/vs-$(basename "$f")"
    done
    echo "[✓] JetBrains Mono — installed"
  else
    echo "[!] JetBrains Mono — could not find TTF files"
  fi

  rm -rf "$TMP"
}

# ===================================================================
# Install based on selected preset
# ===================================================================

case "$THEME-$PRESET" in
  elegant-bw-*|elegant-bw)
    # Playfair Display + Space Grotesk + Inter + JetBrains Mono
    install_google_font "Playfair Display" "Playfair+Display:ital,wght@0,400;0,700;1,400" "PlayfairDisplay"
    install_google_font "Space Grotesk" "Space+Grotesk:wght@300;400;500;700" "SpaceGrotesk"
    install_google_font "Inter" "Inter:wght@400;500;600;700" "Inter"
    install_jetbrains_mono
    ;;

  *-default|claude-doc-default)
    # DM Serif Display + Inter + JetBrains Mono
    install_google_font "DM Serif Display" "DM+Serif+Display:wght@400" "DMSerifDisplay"
    install_google_font "Inter" "Inter:wght@400;500;600;700" "Inter"
    install_jetbrains_mono
    ;;

  google-fonts)
    # Libre Baskerville + Space Grotesk + JetBrains Mono
    install_google_font "Libre Baskerville" "Libre+Baskerville:ital,wght@0,400;0,700;1,400" "LibreBaskerville"
    install_google_font "Space Grotesk" "Space+Grotesk:wght@300;400;500;700" "SpaceGrotesk"
    install_jetbrains_mono
    ;;

  macos-native)
    # Iowan Old Style + Avenir Next + Menlo — pre-installed on macOS
    if [ "$OS" != "Darwin" ]; then
      echo "[!] Warning: macos-native preset uses fonts that ship with macOS."
      echo "    On Linux/Windows, these fonts may not be available."
      echo ""
    fi
    echo "[✓] Iowan Old Style — ships with macOS"
    echo "[✓] Avenir Next — ships with macOS"
    echo "[✓] Menlo — ships with macOS"
    ;;

  *)
    echo "Error: Unknown preset '$PRESET'"
    echo ""
    echo "Available themes/presets:"
    echo "  claude-doc default       DM Serif Display + Inter + JetBrains Mono"
    echo "  claude-doc google-fonts  Libre Baskerville + Space Grotesk + JetBrains Mono"
    echo "  claude-doc macos-native  Iowan Old Style + Avenir Next + Menlo"
    echo "  elegant-bw               Space Grotesk + Inter + JetBrains Mono"
    exit 1
    ;;
esac

echo ""

# --- Refresh font cache (Linux only) ---
if [ "$OS" = "Linux" ]; then
  echo "Rebuilding font cache..."
  fc-cache -f "$INSTALL_DIR"
fi

echo "=== Done ==="
echo ""
echo "To use this preset in your slides, add to slides.ts:"
echo ""
case "$THEME" in
  elegant-bw)
    echo '  import { elegantBw } from "../../src/themes/elegant-bw/index.js";'
    echo '  const deck = new Deck(elegantBw);'
    ;;
  *)
    case "$PRESET" in
      default)
        echo '  import { claudeDoc } from "../../src/themes/claude-doc/index.js";'
        echo '  const deck = new Deck(claudeDoc);'
        ;;
      google-fonts)
        echo '  import { claudeDoc, applyPreset, googleFonts } from "../../src/themes/claude-doc/index.js";'
        echo '  const deck = new Deck(applyPreset(claudeDoc, googleFonts));'
        ;;
      macos-native)
        echo '  import { claudeDoc, applyPreset, macosNative } from "../../src/themes/claude-doc/index.js";'
        echo '  const deck = new Deck(applyPreset(claudeDoc, macosNative));'
        ;;
    esac
    ;;
esac
