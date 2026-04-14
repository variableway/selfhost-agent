"use client";

import { Button } from "@innate/ui";
import { Play, Loader2, Terminal } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export function RunButton({ command }: { command: string }) {
  const executeCommandInTerminal = useAppStore((s) => s.executeCommandInTerminal);

  const handleRun = () => {
    executeCommandInTerminal(command);
  };

  return (
    <div className="my-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRun}
          className="gap-1.5 text-xs h-7"
        >
          <Play className="size-3" />
          运行
        </Button>
        <code className="text-xs text-muted-foreground font-mono flex-1 truncate">
          $ {command}
        </code>
      </div>
    </div>
  );
}
