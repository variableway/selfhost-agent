"use client";

import { useEffect, useState } from "react";
import { isTauri } from "@/lib/tauri";
import { invoke } from "@tauri-apps/api/core";

export function StatusBar() {
  const [platform, setPlatform] = useState("detecting...");

  useEffect(() => {
    if (!isTauri()) {
      setPlatform("web");
      return;
    }
    invoke<string>("get_platform")
      .then((p) => setPlatform(p))
      .catch(() => setPlatform("unknown"));
  }, []);

  const platformIcon =
    platform.includes("macos") ? "🍎" :
    platform.includes("windows") ? "🪟" :
    platform.includes("linux") ? "🐧" : "🌐";

  return (
    <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>{platformIcon} {platform}</span>
      </div>
      <div>Innate Playground v0.1.0</div>
    </div>
  );
}
