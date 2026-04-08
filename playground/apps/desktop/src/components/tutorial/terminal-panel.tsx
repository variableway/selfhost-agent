"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@innate/ui";
import { Terminal, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface HistoryEntry {
  command: string;
  output: string;
  status: "success" | "error";
}

export function TerminalPanel({ pendingCommand }: { pendingCommand: string | null }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (pendingCommand && pendingCommand !== processedRef.current) {
      processedRef.current = pendingCommand;
      executeCommand(pendingCommand);
    }
  }, [pendingCommand]);

  useEffect(() => {
    scrollToBottom();
  }, [history, running, scrollToBottom]);

  async function executeCommand(command: string) {
    setRunning(true);
    scrollToBottom();

    try {
      if ("__TAURI_INTERNALS__" in window) {
        const { Command } = await import("@tauri-apps/plugin-shell");
        const cmd = Command.create("sh", ["-c", command]);

        let stdout = "";
        let stderr = "";
        cmd.stdout.on("data", (line) => {
          stdout += line + "\n";
          setHistory((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.command === command && last.status === "success") {
              updated[updated.length - 1] = { ...last, output: stdout };
            }
            return updated;
          });
          scrollToBottom();
        });
        cmd.stderr.on("data", (line) => {
          stderr += line + "\n";
        });

        setHistory((prev) => [
          ...prev,
          { command, output: "", status: "success" },
        ]);

        const result = await cmd.execute();

        setHistory((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex(
            (e) => e.command === command && updated.indexOf(e) === updated.length - 1
          );
          if (idx !== -1) {
            if (result.code === 0) {
              updated[idx] = {
                command,
                output: stdout || "(命令执行成功，无输出)",
                status: "success",
              };
            } else {
              updated[idx] = {
                command,
                output: stderr || stdout || `退出码: ${result.code}`,
                status: "error",
              };
            }
          }
          return updated;
        });
      } else {
        await new Promise((r) => setTimeout(r, 800));
        setHistory((prev) => [
          ...prev,
          {
            command,
            output: `[Web 模拟] $ ${command}\n模拟执行成功`,
            status: "success",
          },
        ]);
      }
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { command, output: String(err), status: "error" },
      ]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      <div
        className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-green-400" />
          <span className="text-xs font-medium text-zinc-300">终端</span>
          {running && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <span className="inline-block size-1.5 rounded-full bg-yellow-400 animate-pulse" />
              执行中
            </span>
          )}
          {history.length > 0 && !running && (
            <span className="text-xs text-zinc-500">{history.length} 条记录</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHistory([]);
              }}
              className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
          {collapsed ? (
            <ChevronUp className="size-4 text-zinc-400" />
          ) : (
            <ChevronDown className="size-4 text-zinc-400" />
          )}
        </div>
      </div>

      {!collapsed && (
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="p-4 font-mono text-xs leading-relaxed space-y-3 min-h-full">
            {history.length === 0 && !running && (
              <div className="text-zinc-600 text-center py-8">
                <Terminal className="size-8 mx-auto mb-2 opacity-50" />
                <p>点击教程中的命令即可在此执行</p>
              </div>
            )}
            {history.map((entry, i) => (
              <div key={i}>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 select-none">$</span>
                  <span className="text-cyan-300 break-all">{entry.command}</span>
                </div>
                <pre className="text-zinc-300 whitespace-pre-wrap break-all mt-1 ml-4">
                  {entry.output}
                </pre>
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="inline-block size-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span>执行中...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
