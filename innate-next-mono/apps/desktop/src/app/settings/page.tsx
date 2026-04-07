"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  SidebarTrigger,
} from "@innate/ui";
import { Settings, Monitor, KeyRound, Info } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@/lib/tauri";

export default function SettingsPage() {
  const [platform, setPlatform] = useState("detecting...");

  useState(() => {
    if (!isTauri()) {
      setPlatform("web (no Tauri)");
      return;
    }
    invoke<string>("get_platform")
      .then((p) => setPlatform(p))
      .catch(() => setPlatform("unknown"));
  });

  const platformIcon =
    platform.includes("macos") ? "🍎" :
    platform.includes("windows") ? "🪟" :
    platform.includes("linux") ? "🐧" : "🌐";

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <Settings className="size-5" />
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Environment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Monitor className="size-4" />
                Environment
              </CardTitle>
              <CardDescription>System environment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-mono">{platformIcon} {platform}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">App Version</span>
                <span className="font-mono">0.1.0</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Runtime</span>
                <span className="font-mono">Tauri v2 + Next.js 16</span>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4" />
                API Keys
              </CardTitle>
              <CardDescription>Configure API keys for AI services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input id="openai-key" type="password" placeholder="sk-..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                <Input id="anthropic-key" type="password" placeholder="sk-ant-..." />
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-4" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Innate Playground helps you set up AI development environment with step-by-step tutorials.</p>
              <p className="mt-2">Built with Tauri v2 + Next.js + shadcn/ui</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
