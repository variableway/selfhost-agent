#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DESKTOP_DIR="$SCRIPT_DIR"
TAURI_DIR="$DESKTOP_DIR/src-tauri"
DIST_DIR="$TAURI_DIR/target/release"
BUNDLE_DIR="$DIST_DIR/bundle"
APP_NAME="Innate Playground"
APP_VERSION="0.1.0"

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_prerequisites() {
  log_info "Checking prerequisites..."

  command -v node >/dev/null 2>&1 || { log_error "Node.js not found"; exit 1; }
  command -v pnpm >/dev/null 2>&1 || { log_error "pnpm not found"; exit 1; }
  command -v rustc >/dev/null 2>&1 || { log_error "Rust not found. Install from https://rustup.rs"; exit 1; }
  command -v cargo >/dev/null 2>&1 || { log_error "Cargo not found"; exit 1; }

  log_ok "Node $(node -v), pnpm $(pnpm -v), rustc $(rustc --version)"
}

install_deps() {
  log_info "Installing dependencies..."
  cd "$PROJECT_ROOT"
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
  log_ok "Dependencies installed"
}

build_frontend() {
  log_info "Building Next.js static export..."
  cd "$DESKTOP_DIR"
  pnpm build
  log_ok "Frontend built -> $DESKTOP_DIR/out/"
}

build_tauri() {
  log_info "Building Tauri desktop app..."
  cd "$DESKTOP_DIR"
  pnpm tauri build
  log_ok "Tauri build complete"
}

create_dmg() {
  local dmg_path="$BUNDLE_DIR/dmg/${APP_NAME}_${APP_VERSION}_$(uname -m).dmg"
  local app_path="$BUNDLE_DIR/macos/${APP_NAME}.app"

  if [ -f "$dmg_path" ]; then
    log_ok "DMG already exists: $dmg_path"
    return 0
  fi

  if [ ! -d "$app_path" ]; then
    log_error ".app bundle not found at $app_path"
    return 1
  fi

  log_info "Creating DMG..."
  mkdir -p "$(dirname "$dmg_path")"
  hdiutil create \
    -volname "$APP_NAME" \
    -srcfolder "$app_path" \
    -ov \
    -format UDZO \
    "$dmg_path"
  log_ok "DMG created: $dmg_path"
}

print_summary() {
  echo ""
  echo "========================================="
  echo -e "${GREEN}  Build Summary${NC}"
  echo "========================================="
  echo ""

  local app_path="$BUNDLE_DIR/macos/${APP_NAME}.app"
  local binary_path="$DIST_DIR/innate-playground"
  local dmg_path="$BUNDLE_DIR/dmg/${APP_NAME}_${APP_VERSION}_$(uname -m).dmg"

  if [ -d "$app_path" ]; then
    local app_size
    app_size=$(du -sh "$app_path" | cut -f1)
    log_ok ".app bundle: $app_path ($app_size)"
  fi

  if [ -f "$binary_path" ]; then
    local bin_size
    bin_size=$(du -sh "$binary_path" | cut -f1)
    log_ok "Binary:      $binary_path ($bin_size)"
  fi

  if [ -f "$dmg_path" ]; then
    local dmg_size
    dmg_size=$(du -sh "$dmg_path" | cut -f1)
    log_ok "DMG:         $dmg_path ($dmg_size)"
  fi

  echo ""
  echo "Open the app:"
  echo "  open \"$app_path\""
  echo ""
}

clean() {
  log_info "Cleaning build artifacts..."
  cd "$DESKTOP_DIR"
  rm -rf out .next
  cd "$TAURI_DIR"
  rm -rf target
  log_ok "Clean complete"
}

dev() {
  log_info "Starting dev server..."
  cd "$DESKTOP_DIR"
  pnpm tauri dev
}

case "${1:-build}" in
  build)
    check_prerequisites
    install_deps
    build_frontend
    build_tauri
    create_dmg || log_warn "DMG creation failed (may need to run outside sandbox)"
    print_summary
    ;;
  dev)
    dev
    ;;
  clean)
    clean
    ;;
  frontend)
    check_prerequisites
    install_deps
    build_frontend
    log_ok "Frontend only build complete -> $DESKTOP_DIR/out/"
    ;;
  dmg)
    create_dmg
    ;;
  help|--help|-h)
    echo "Usage: ./build.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build      Full build: deps + frontend + Tauri + DMG (default)"
    echo "  dev        Start Tauri dev server with hot reload"
    echo "  frontend   Build Next.js static export only"
    echo "  dmg        Create DMG from existing .app bundle"
    echo "  clean      Remove all build artifacts"
    echo "  help       Show this help message"
    ;;
  *)
    log_error "Unknown command: $1"
    echo "Run './build.sh help' for usage."
    exit 1
    ;;
esac
