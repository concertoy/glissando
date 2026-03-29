#!/usr/bin/env bash
#
# glissando build script
#
# Usage:
#   ./build.sh <path>          Build PPTX from slides.ts in <path>
#
# Examples:
#   ./build.sh examples/mimic-claude-macos
#   ./build.sh examples/elegant-bw-demo

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./build.sh <path-to-deck-folder>"
  echo ""
  echo "Examples:"
  echo "  ./build.sh examples/mimic-claude-macos"
  echo "  ./build.sh examples/elegant-bw-demo"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec npx tsx "$SCRIPT_DIR/runner.ts" "$@"
