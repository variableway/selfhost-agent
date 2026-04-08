"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Play } from "lucide-react";

function ClickableCodeBlock({
  code,
  onRun,
}: {
  code: string;
  onRun: (command: string) => void;
}) {
  const lines = code.split("\n").filter((l) => l.trim() !== "");

  return (
    <div className="my-3 rounded-md border overflow-hidden bg-muted/30 group">
      <div className="border-b bg-muted/60 px-3 py-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">bash</span>
        <button
          onClick={() => {
            lines.forEach((line) => {
              const cmd = line.replace(/^\$\s*/, "");
              if (cmd) onRun(cmd);
            });
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors px-2 py-0.5 rounded hover:bg-green-500/10"
        >
          <Play className="size-3" />
          运行全部
        </button>
      </div>
      <div className="divide-y divide-border/50">
        {lines.map((line, i) => {
          const cmd = line.replace(/^\$\s*/, "");
          return (
            <div
              key={i}
              onClick={() => cmd && onRun(cmd)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-green-500/5 cursor-pointer transition-colors group/code"
            >
              <Play className="size-2.5 text-muted-foreground opacity-0 group-hover/code:opacity-100 transition-opacity text-green-500 shrink-0" />
              <code className="text-sm font-mono flex-1 break-all">{cmd}</code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TutorialMarkdown({
  content,
  onRunCommand,
}: {
  content: string;
  onRunCommand: (command: string) => void;
}) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const isBlock = (children as string)?.includes("\n") || className;
            if (isBlock) {
              const match = /language-(\w+)/.exec(className || "");
              const lang = match ? match[1] : null;
              const code = String(children).replace(/\n$/, "");
              const isRunnable =
                lang === "bash" ||
                lang === "sh" ||
                lang === "shell" ||
                lang === "zsh";

              if (isRunnable && code.trim()) {
                return (
                  <ClickableCodeBlock code={code} onRun={onRunCommand} />
                );
              }

              return (
                <div className="my-3 rounded-md border bg-muted/50 overflow-hidden">
                  {lang && (
                    <div className="border-b bg-muted px-3 py-1 text-xs text-muted-foreground font-mono">
                      {lang}
                    </div>
                  )}
                  <pre className="p-3 overflow-x-auto text-sm">
                    <code>{code}</code>
                  </pre>
                </div>
              );
            }
            return (
              <code
                className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-0 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-8 mb-3 border-b pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mt-6 mb-2">{children}</h3>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-md border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b bg-muted px-3 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b px-3 py-2">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-r-md">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="my-2 ml-6 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-6 list-decimal space-y-1">{children}</ol>
          ),
          p: ({ children }) => <p className="my-3 leading-7">{children}</p>,
          hr: () => <hr className="my-6 border-border" />,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
