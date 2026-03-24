#!/usr/bin/env bash
#
# glissando build script
#
# Usage:
#   ./build.sh <path>          Build PPTX from slides.ts in <path>
#
# Examples:
#   ./build.sh templates/template1-claude-doc-style
#   ./build.sh examples/ai-tooling-tutorial

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./build.sh <path-to-deck-folder>"
  echo ""
  echo "Examples:"
  echo "  ./build.sh templates/template1-claude-doc-style"
  echo "  ./build.sh examples/ai-tooling-tutorial"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec npx tsx "$SCRIPT_DIR/runner.ts" "$@"
