"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Separator,
  SidebarTrigger,
  Badge,
} from "@innate/ui";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@innate/ui";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { TutorialMarkdown } from "@/components/tutorial/tutorial-markdown";
import { TerminalPanel } from "@/components/tutorial/terminal-panel";
import { TerminalProvider, useTerminal } from "@/components/tutorial/terminal-context";

interface TutorialMeta {
  title: string;
  files: string[];
  tag: string;
}

export function TutorialPageClient({ meta }: { meta: TutorialMeta }) {
  return (
    <TerminalProvider>
      <TutorialPageInner meta={meta} />
    </TerminalProvider>
  );
}

function TutorialPageInner({ meta }: { meta: TutorialMeta }) {
  const router = useRouter();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { pendingCommand, sendCommand } = useTerminal();

  useEffect(() => {
    async function load() {
      try {
        const parts = await Promise.all(
          meta.files.map(async (file) => {
            const res = await fetch(file);
            if (!res.ok) throw new Error(`Failed to load ${file}`);
            return res.text();
          })
        );
        setContent(parts.join("\n\n---\n\n"));
      } catch {
        setContent("# 加载失败\n\n教程内容加载出错，请确认 `/public/tutorials/` 目录中有对应的 Markdown 文件。");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [meta]);

  const commandForTerminal = pendingCommand ? pendingCommand.split("__")[0] : null;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="size-4" />
        </Button>
        <BookOpen className="size-5" />
        <h1 className="text-lg font-semibold">{meta.title}</h1>
        <Badge variant="outline" className="text-xs">{meta.tag}</Badge>
      </header>

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={55} minSize={30}>
          <div className="h-full overflow-auto">
            <div className="mx-auto max-w-3xl px-6 py-8">
              {loading ? (
                <div className="text-center text-muted-foreground py-12">加载中...</div>
              ) : content ? (
                <TutorialMarkdown content={content} onRunCommand={sendCommand} />
              ) : null}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={45} minSize={25}>
          <TerminalPanel pendingCommand={commandForTerminal} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
