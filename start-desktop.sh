#!/usr/bin/env bash
set -e

# Innate Desktop - Tauri + Vite (Mac/Linux)

echo "Starting Innate Desktop..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$SCRIPT_DIR/apps/desktop"

# Ensure Rust/Cargo is in PATH
if [ -f "$HOME/.cargo/env" ]; then
  source "$HOME/.cargo/env"
fi

cd "$DESKTOP_DIR"

# Install dependencies
npm install

# Start Tauri dev server
npx tauri dev
