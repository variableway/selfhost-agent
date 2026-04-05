# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Self-host AI Environment Setup Guide (自建AI环境搭建指南) — a documentation and scripting repo that helps Chinese-speaking beginners set up AI development environments. The repo provides progressive learning paths, automated installation scripts, and JSON-based skill definitions targeting Mac, Windows, and WSL platforms.

## Running Scripts

Scripts are not built/compiled — they are run directly. Make sure shell scripts are executable:

```bash
chmod +x scripts/install/*.sh
```

Run a Mac installer:
```bash
./scripts/install/install-terminal-tools-mac.sh
```

Run a Windows installer (PowerShell, as admin):
```powershell
.\scripts\install\install-terminal-tools-windows.ps1
```

Run the GLM API configuration:
```bash
./scripts/configure/setup-glm.sh
```

## Architecture

### Skill System

Skills are JSON files in `skills/` that follow the schema at `skills/skill-schema.json`. Each skill defines an environment setup task with metadata (id, name, level, platform), prerequisites, ordered steps (script/manual/verification actions), and estimated time. Levels: `beginner`, `intermediate`, `advanced`.

### Script Conventions

All shell scripts in `scripts/` follow a consistent pattern:
- `set -e` for error handling
- Colored output using ANSI escape codes (`print_info`, `print_success`, `print_error` helpers)
- Idempotent — scripts check if tools are already installed before installing
- Platform-specific variants: `*-mac.sh`, `*-windows.ps1`, `*-wsl.sh`
- Each installer follows: banner → install steps → verify → print next steps

### Directory Layout

- `docs/guides/` — Progressive learning guides (1-terminal/, 2-dev-tools/, 2-git/)
- `scripts/install/` — Platform-specific installers for terminal tools, Node.js (via fnm), Python (via uv)
- `scripts/configure/` — Post-install configuration (GLM API key setup)
- `skills/` — JSON skill definitions with `skill-schema.json`
- `config/` — Config templates (e.g., `zshrc.template`)
- `tasks/` — Development task tracking and planning docs

### Documentation Language

All user-facing documentation and guides are written in Chinese (中文). Script comments and code can be in English or Chinese.
