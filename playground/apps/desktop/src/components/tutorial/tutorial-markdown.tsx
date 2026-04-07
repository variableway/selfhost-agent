"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RunButton } from "./run-button";

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : null;
  const code = String(children).replace(/\n$/, "");

  const isRunnable = lang === "bash" || lang === "sh" || lang === "shell" || lang === "powershell" || lang === "zsh";

  if (isRunnable && code.trim()) {
    const lines = code.split("\n").filter((line) => line.trim() !== "");
    return (
      <div className="my-3 space-y-1">
        {lines.map((line, i) => (
          <RunButton key={i} command={line.replace(/^\$\s*/, "")} />
        ))}
      </div>
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

export function TutorialMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const isBlock = (children as string)?.includes("\n") || className;
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
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
