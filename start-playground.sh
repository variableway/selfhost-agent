#!/usr/bin/env bash
set -e

# Innate Playground - Tauri + Next.js (Mac/Linux)

echo "Starting Innate Playground..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLAYGROUND_DIR="$SCRIPT_DIR/playground"
DESKTOP_DIR="$PLAYGROUND_DIR/apps/desktop"

# Ensure Rust/Cargo is in PATH
if [ -f "$HOME/.cargo/env" ]; then
  source "$HOME/.cargo/env"
fi

cd "$PLAYGROUND_DIR"

# Install dependencies
pnpm install

cd "$DESKTOP_DIR"

# Start Tauri dev server
npx tauri dev
