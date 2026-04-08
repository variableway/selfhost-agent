"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Separator,
  SidebarTrigger,
  Badge,
} from "@innate/ui";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { RunButton } from "@/components/tutorial/run-button";

interface MdxMeta {
  title: string;
  file: string;
  tag: string;
}

function MdxPre({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-3 rounded-md border bg-muted/50 overflow-hidden">
      <pre className="p-3 overflow-x-auto text-sm">{children}</pre>
    </div>
  );
}

function MdxCode({ className, children }: { className?: string; children?: React.ReactNode }) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : null;
  const isBlock = !!lang || (typeof children === "string" && children.includes("\n"));

  if (isBlock) {
    return (
      <div className="my-3 rounded-md border bg-muted/50 overflow-hidden">
        {lang && (
          <div className="border-b bg-muted px-3 py-1 text-xs text-muted-foreground font-mono">
            {lang}
          </div>
        )}
        <pre className="p-3 overflow-x-auto text-sm">
          <code>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
      {children}
    </code>
  );
}

const mdxComponents = {
  RunButton,
  pre: MdxPre,
  code: MdxCode,
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-bold mt-0 mb-4">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xl font-semibold mt-8 mb-3 border-b pb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-medium mt-6 mb-2">{children}</h3>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto rounded-md border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b bg-muted px-3 py-2 text-left font-medium">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b px-3 py-2">{children}</td>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-r-md">
      {children}
    </blockquote>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-2 ml-6 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-2 ml-6 list-decimal space-y-1">{children}</ol>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="my-3 leading-7">{children}</p>
  ),
  hr: () => <hr className="my-6 border-border" />,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

export function TutorialMdxClient({ meta }: { meta: MdxMeta }) {
  const router = useRouter();
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(meta.file);
        if (!res.ok) throw new Error(`Failed to fetch ${meta.file}`);
        const raw = await res.text();
        const serialized = await serialize(raw, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            format: "mdx",
          },
          parseFrontmatter: false,
        });
        setMdxSource(serialized);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [meta]);

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
        <Badge variant="secondary" className="text-xs">方案二: MDX</Badge>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">加载中...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">加载失败: {error}</div>
          ) : mdxSource ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <MDXRemote {...mdxSource} components={mdxComponents} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
