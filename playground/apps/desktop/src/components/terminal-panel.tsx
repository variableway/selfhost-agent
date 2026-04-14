"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@innate/ui";
import { Minimize2, PanelRight, PanelBottom, Trash2, Terminal, Square, GripHorizontal } from "lucide-react";

export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const {
    terminalPosition,
    terminalVisible,
    isExecuting,
    hideTerminal,
    toggleTerminalPosition,
    clearTerminal,
    killRunningCommand,
    currentWorkspace,
    workspaces,
    defaultWorkspaceId,
  } = useAppStore();

  // Resizable dimensions
  const [width, setWidth] = useState(480);
  const [height, setHeight] = useState(320);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0, size: 0 });

  // Get workspace path
  const workspacePath = currentWorkspace?.path ||
    (defaultWorkspaceId ? workspaces.find((w) => w.id === defaultWorkspaceId)?.path : undefined);

  // Theme that matches the app's color scheme
  const theme = {
    background: "var(--color-background, #09090b)",
    foreground: "var(--color-foreground, #fafafa)",
    cursor: "var(--color-primary, #6366f1)",
    selectionBackground: "var(--color-primary, #6366f133)",
    selectionForeground: "var(--color-foreground, #fafafa)",
    black: "#18181b",
    red: "#ef4444",
    green: "#22c55e",
    yellow: "#eab308",
    blue: "#3b82f6",
    magenta: "#a855f7",
    cyan: "#06b6d4",
    white: "#fafafa",
    brightBlack: "#52525b",
    brightRed: "#f87171",
    brightGreen: "#4ade80",
    brightYellow: "#facc15",
    brightBlue: "#60a5fa",
    brightMagenta: "#c084fc",
    brightCyan: "#22d3ee",
    brightWhite: "#f4f4f5",
  };

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: "right" | "bottom") => {
    e.preventDefault();
    isDragging.current = true;
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      size: direction === "right" ? width : height,
    };

    const handleMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      if (direction === "right") {
        const delta = startPos.current.x - ev.clientX;
        const newWidth = Math.max(280, Math.min(800, startPos.current.size + delta));
        setWidth(newWidth);
      } else {
        const delta = ev.clientY - startPos.current.y;
        const newHeight = Math.max(150, Math.min(600, startPos.current.size + delta));
        setHeight(newHeight);
      }
    };

    const handleUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      setTimeout(() => {
        try { fitAddonRef.current?.fit(); } catch {}
      }, 50);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, [width, height]);

  // Initialize xterm.js and connect to PTY
  const initTerminal = useCallback(async () => {
    if (!terminalRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const { Terminal } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");
    await import("@xterm/xterm/css/xterm.css");

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      lineHeight: 1.4,
      fontFamily: "'Geist Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace",
      theme,
      convertEol: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    if ("__TAURI_INTERNALS__" in window) {
      const { listen } = await import("@tauri-apps/api/event");
      const { invoke } = await import("@tauri-apps/api/core");

      await listen<string>("pty-output", (event) => {
        term.write(event.payload);
      });

      await listen<string>("pty-exit", () => {
        term.writeln("\r\n\x1b[33m[Session ended]\x1b[0m");
      });

      term.onData((data) => {
        invoke("pty_write", { data });
      });

      term.onResize(({ cols, rows }) => {
        invoke("pty_resize", { rows, cols });
      });

      // CD to workspace path after shell prompt appears
      const wsPath = useAppStore.getState().currentWorkspace?.path ||
        useAppStore.getState().defaultWorkspaceId
          ? useAppStore.getState().workspaces.find(
              (w) => w.id === useAppStore.getState().defaultWorkspaceId
            )?.path
          : undefined;

      if (wsPath) {
        // Wait for the shell to be ready before sending cd
        setTimeout(() => {
          invoke("pty_write", { data: `cd "${wsPath}"\r` });
        }, 500);
      }
    } else {
      // Web mode: simulate a shell
      let cwd = workspacePath || "~/";
      let lineBuffer = "";

      const displayPath = cwd.startsWith("/Users/") ? cwd.replace(/\/Users\/[^/]+/, "~") : cwd;

      term.writeln(`\x1b[1m\x1b[36mInnate Playground\x1b[0m - Web Terminal`);
      term.writeln(`Workspace: ${displayPath}`);
      term.writeln("");
      term.write(`\x1b[32m${displayPath}\x1b[0m $ `);

      function handleLine(cmd: string) {
        if (!cmd) {
          term.write(`\x1b[32m${displayPath}\x1b[0m $ `);
          return;
        }
        simulateCommand(term, cmd, cwd, (newCwd) => {
          cwd = newCwd;
        }, displayPath);
      }

      // Listen for commands from RunButton via store's writeToPty
      const handleWebPty = (e: Event) => {
        const data = (e as CustomEvent).detail as string;
        if (!data) return;

        // Split by \r to handle command+enter sent by RunButton
        const parts = data.split("\r");
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (part) {
            lineBuffer += part;
            term.write(part);
          }
          // If this isn't the last part (or data ends with \r), it means Enter was pressed
          if (i < parts.length - 1 || data.endsWith("\r")) {
            const cmd = lineBuffer.trim();
            term.writeln("");
            lineBuffer = "";
            handleLine(cmd);
          }
        }
      };

      window.addEventListener("web-pty-write", handleWebPty);

      term.onData((data) => {
        if (data === "\r") {
          const cmd = lineBuffer.trim();
          term.writeln("");
          lineBuffer = "";
          handleLine(cmd);
        } else if (data === "\x7f") {
          if (lineBuffer.length > 0) {
            lineBuffer = lineBuffer.slice(0, -1);
            term.write("\b \b");
          }
        } else if (data === "\x03") {
          term.writeln("^C");
          lineBuffer = "";
          term.write(`\x1b[32m${displayPath}\x1b[0m $ `);
        } else {
          lineBuffer += data;
          term.write(data);
        }
      });
    }

    term.focus();
  }, [workspacePath]);

  // Initialize when visible
  useEffect(() => {
    if (terminalVisible && terminalRef.current && !initializedRef.current) {
      initTerminal();
    }
  }, [terminalVisible, initTerminal]);

  // Fit terminal when position or size changes
  useEffect(() => {
    if (fitAddonRef.current) {
      const timer = setTimeout(() => {
        try { fitAddonRef.current?.fit(); } catch {}
        xtermRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [terminalPosition, terminalVisible, width, height]);

  // Handle container resize
  useEffect(() => {
    if (!terminalRef.current) return;
    const observer = new ResizeObserver(() => {
      try { fitAddonRef.current?.fit(); } catch {}
    });
    observer.observe(terminalRef.current);
    return () => observer.disconnect();
  }, []);

  // Clear terminal
  const handleClear = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.focus();
    }
    clearTerminal();
  }, [clearTerminal]);

  if (!terminalVisible) return null;

  const isRight = terminalPosition === "right";

  return (
    <div
      className={`flex flex-col shrink-0 border-t overflow-hidden bg-card relative ${
        isRight ? "border-l" : ""
      }`}
      style={isRight ? { width } : { height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Terminal className="text-primary" size={12} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">终端</span>
          {isExecuting && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              执行中
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {isExecuting && (
            <Button variant="ghost" size="icon" onClick={killRunningCommand} title="停止" className="size-6">
              <Square size={12} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleClear} title="清除" className="size-6">
            <Trash2 size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTerminalPosition}
            title={isRight ? "切换到底部" : "切换到右侧"}
            className="size-6"
          >
            {isRight ? <PanelBottom size={12} /> : <PanelRight size={12} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={hideTerminal} title="关闭" className="size-6">
            <Minimize2 size={12} />
          </Button>
        </div>
      </div>

      {/* xterm.js container */}
      <div ref={terminalRef} className="flex-1 min-h-0" />

      {/* Resize handle */}
      {isRight ? (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 z-10 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, "right")}
        />
      ) : (
        <div
          className="h-1.5 cursor-row-resize hover:bg-primary/30 active:bg-primary/50 z-10 transition-colors flex items-center justify-center"
          onMouseDown={(e) => handleResizeStart(e, "bottom")}
        >
          <GripHorizontal size={12} className="text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}

// Simulate common commands for web mode
function simulateCommand(
  term: any,
  cmd: string,
  cwd: string,
  setCwd: (newCwd: string) => void,
  displayPath: string
) {
  const commands: Record<string, string[]> = {
    "node --version": ["v22.0.0"],
    "node -v": ["v22.0.0"],
    "npm --version": ["10.5.0"],
    "npm -v": ["10.5.0"],
    "python --version": ["Python 3.12.0"],
    "python3 --version": ["Python 3.12.0"],
    "git --version": ["git version 2.45.0"],
    "echo hello": ["hello"],
    "whoami": ["user"],
    "ls": ["node_modules  package.json  src  README.md"],
    "date": [new Date().toString()],
    "uname -a": ["Darwin Kernel Version 24.0.0"],
    "which node": ["/usr/local/bin/node"],
    "brew --version": ["Homebrew 4.2.0"],
  };

  setTimeout(() => {
    let matched = false;
    for (const [pattern, output] of Object.entries(commands)) {
      if (cmd === pattern) {
        output.forEach((line) => term.writeln(line));
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (cmd.startsWith("echo ")) {
        term.writeln(cmd.slice(5));
      } else if (cmd === "pwd") {
        term.writeln(cwd);
      } else if (cmd.startsWith("cd ")) {
        const target = cmd.slice(3).trim();
        if (target === "~" || target === "") {
          setCwd("~/");
          term.write(`\x1b[32m~\x1b[0m $ `);
          return;
        }
        setCwd(target);
        const dp = target.startsWith("/Users/") ? target.replace(/\/Users\/[^/]+/, "~") : target;
        term.write(`\x1b[32m${dp}\x1b[0m $ `);
        return;
      } else if (cmd.startsWith("cat ")) {
        term.writeln(`\x1b[33m[Web Mode]\x1b[0m File reading requires the desktop app.`);
      } else if (cmd.startsWith("mkdir ") || cmd.startsWith("touch ")) {
        term.writeln(`\x1b[32m[Web Mode]\x1b[0m Simulated: ${cmd}`);
      } else if (cmd.includes("install")) {
        term.writeln(`\x1b[36m⠋\x1b[0m Installing...`);
        setTimeout(() => {
          term.writeln(`\x1b[32m✔\x1b[0m Installation complete (simulated)`);
          term.write(`\x1b[32m${displayPath}\x1b[0m $ `);
        }, 800);
        return;
      } else {
        term.writeln(`\x1b[33m[Web Mode]\x1b[0m ${cmd}`);
      }
    }

    term.write(`\x1b[32m${displayPath}\x1b[0m $ `);
  }, 150);
}
