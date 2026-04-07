"use client";

import { useState } from "react";
import { Button } from "@innate/ui";
import { Play, Loader2, CheckCircle2, XCircle, Terminal } from "lucide-react";

type RunStatus = "idle" | "running" | "success" | "error";

export function RunButton({ command }: { command: string }) {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [output, setOutput] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  async function handleRun() {
    setStatus("running");
    setOutput("");
    setShowOutput(true);

    try {
      if ("__TAURI_INTERNALS__" in window) {
        const { Command } = await import("@tauri-apps/plugin-shell");
        const cmd = Command.create("sh", ["-c", command]);
        const output = await cmd.execute();
        if (output.code === 0) {
          setStatus("success");
          setOutput(output.stdout || "(命令执行成功，无输出)");
        } else {
          setStatus("error");
          setOutput(output.stderr || `退出码: ${output.code}`);
        }
      } else {
        await new Promise((r) => setTimeout(r, 1000));
        setStatus("success");
        setOutput(`[Web 模式模拟] $ ${command}\n模拟执行成功 — 实际运行将在 Tauri 桌面环境中执行`);
      }
    } catch (err) {
      setStatus("error");
      setOutput(String(err));
    }
  }

  const statusIcon = {
    idle: <Play className="size-3" />,
    running: <Loader2 className="size-3 animate-spin" />,
    success: <CheckCircle2 className="size-3 text-green-500" />,
    error: <XCircle className="size-3 text-red-500" />,
  };

  const statusLabel = {
    idle: "运行",
    running: "执行中...",
    success: "成功",
    error: "失败",
  };

  return (
    <div className="my-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRun}
          disabled={status === "running"}
          className="gap-1.5 text-xs h-7"
        >
          {statusIcon[status]}
          {statusLabel[status]}
        </Button>
        <code className="text-xs text-muted-foreground font-mono flex-1 truncate">
          $ {command}
        </code>
      </div>
      {showOutput && (
        <div className="mt-2 rounded-md border bg-muted/50 p-3 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-auto">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Terminal className="size-3" />
            <span>输出</span>
          </div>
          {output}
        </div>
      )}
    </div>
  );
}
