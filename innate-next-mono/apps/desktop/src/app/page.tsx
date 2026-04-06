"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@innate/ui";

export default function Home() {
  const [greeting, setGreeting] = useState("");
  const [platform, setPlatform] = useState("");

  async function testGreet() {
    const result = await invoke<string>("greet", { name: "Innate" });
    setGreeting(result);
  }

  async function testPlatform() {
    const result = await invoke<string>("get_platform");
    setPlatform(result);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Innate Playground</CardTitle>
          <CardDescription>AI Agent 学习桌面应用</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex gap-3">
            <Button onClick={testGreet}>Test Tauri IPC</Button>
            <Button variant="outline" onClick={testPlatform}>
              Detect Platform
            </Button>
          </div>

          {greeting && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {greeting}
            </p>
          )}
          {platform && (
            <Badge variant="secondary">Platform: {platform}</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
