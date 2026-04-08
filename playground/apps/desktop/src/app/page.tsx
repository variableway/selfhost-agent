"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  SidebarTrigger,
} from "@innate/ui";
import { Bot, Zap, BookOpen, ChevronRight } from "lucide-react";

const skillCategories = [
  {
    level: "beginner",
    label: "入门",
    skills: [
      { id: "terminal-setup", name: "终端环境配置", time: "15-30分钟", platforms: ["macos", "windows"] },
      { id: "nodejs-setup", name: "Node.js 安装", time: "10分钟", platforms: ["macos", "windows"] },
      { id: "python-setup", name: "Python 安装", time: "10分钟", platforms: ["macos", "windows"] },
      { id: "git-setup", name: "Git 配置", time: "5分钟", platforms: ["macos", "windows"] },
    ],
  },
  {
    level: "intermediate",
    label: "进阶",
    skills: [
      { id: "ai-cli-setup", name: "AI CLI 工具", time: "10分钟", platforms: ["macos", "windows"] },
      { id: "ide-setup", name: "IDE 配置", time: "10分钟", platforms: ["macos", "windows"] },
    ],
  },
  {
    level: "advanced",
    label: "高级",
    skills: [
      { id: "agent-dev", name: "Agent 开发", time: "20分钟", platforms: ["macos", "windows"] },
      { id: "openclaw-setup", name: "OpenClaw 配置", time: "15分钟", platforms: ["macos"] },
    ],
  },
];

export default function Home() {
  const [greeting, setGreeting] = useState("");

  async function testTauri() {
    if ("__TAURI_INTERNALS__" in window) {
      const { invoke } = await import("@tauri-apps/api/core");
      const result = await invoke<string>("greet", { name: "Developer" });
      setGreeting(result);
    } else {
      setGreeting("Tauri not available — running in web mode");
    }
  }

  const totalSkills = skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <Bot className="size-5" />
        <h1 className="text-lg font-semibold">Innate Playground</h1>
        <Badge variant="outline" className="text-xs">v0.1.0</Badge>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={testTauri}>
          <Zap className="size-3" />
          Test IPC
        </Button>
      </header>

      {greeting && (
        <div className="bg-green-50 dark:bg-green-950 px-4 py-2 text-sm text-green-700 dark:text-green-300">
          {greeting}
        </div>
      )}

      {/* RoadMap Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold">你的 AI 学习之路</h2>
            <p className="text-muted-foreground mt-1">
              从零开始搭建 AI 开发环境，每步只需 5-10 分钟
            </p>
          </div>

          {skillCategories.map((category) => (
            <div key={category.level}>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {category.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.skills.map((skill) => (
                  <Card
                    key={skill.id}
                    className="cursor-pointer transition-all hover:shadow-md border-border"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        {skill.name}
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="size-3" />
                        <span>{skill.time}</span>
                        <Separator orientation="vertical" className="h-3" />
                        <span>{skill.platforms.join(" / ")}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center text-sm text-muted-foreground py-4">
            共 {totalSkills} 个教程 | 从入门到高级逐步解锁
          </div>
        </div>
      </div>
    </div>
  );
}
