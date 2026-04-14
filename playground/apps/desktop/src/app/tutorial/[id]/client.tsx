"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button, Badge } from "@innate/ui";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { RunButton } from "@/components/tutorial/run-button";
import { loadSkillContent, parseFrontmatter, SkillFile } from "@/lib/tutorial-scanner";

interface TutorialDetailClientProps {
  id: string;
}

// MDX component overrides
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
    <a href={href} className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export default function TutorialDetailClient({ id }: TutorialDetailClientProps) {
  const router = useRouter();
  const slug = id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [meta, setMeta] = useState<SkillFile | null>(null);

  const { discoveredSkills, updateProgress, progress } = useAppStore();
  const tutorialProgress = progress[slug];

  // Load MDX content
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Find workspace path
        const state = useAppStore.getState();
        const workspacePath = state.currentWorkspace?.path ||
          (state.defaultWorkspaceId ? state.workspaces.find((w) => w.id === state.defaultWorkspaceId)?.path : undefined);

        const result = await loadSkillContent(slug, workspacePath);
        if (!result) {
          setError("技能内容未找到");
          return;
        }

        const { frontmatter, body } = parseFrontmatter(result.content);

        // Set metadata
        const skillMeta = discoveredSkills.find((t) => t.slug === slug);
        setMeta(skillMeta || {
          slug,
          title: frontmatter.title || slug,
          description: frontmatter.description || '',
          difficulty: frontmatter.difficulty || 'beginner',
          duration: frontmatter.duration || 10,
          category: frontmatter.category || 'general',
          tags: frontmatter.tags || [],
          source: result.source,
        } as SkillFile);

        // Serialize MDX body
        const serialized = await serialize(body, {
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
  }, [slug, discoveredSkills]);

  const handleMarkComplete = () => {
    updateProgress({
      skillId: slug,
      completed: true,
      completedSections: [],
      completedAt: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    updateProgress({
      skillId: slug,
      completed: false,
      completedSections: [],
    });
  };

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return { text: "入门", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case "intermediate": return { text: "进阶", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "advanced": return { text: "高级", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
      default: return { text: "入门", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    }
  };

  const difficulty = getDifficultyConfig(meta?.difficulty || "beginner");

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">加载技能...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" size={16} />
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-8 py-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2" size={16} />
          返回
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={`${difficulty.bg} ${difficulty.color} ${difficulty.border}`}>
                {difficulty.text}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock size={14} />
                {meta?.duration || 10} 分钟
              </span>
              {meta?.source === 'local' && (
                <Badge variant="outline" className="text-xs">本地</Badge>
              )}
              {tutorialProgress?.completed && (
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已完成
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{meta?.title || slug}</h1>
            <p className="text-muted-foreground text-lg">{meta?.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {tutorialProgress?.completed ? (
              <>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2" size={18} />
                  重置进度
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-md">
                  <CheckCircle size={18} />
                  <span className="font-medium">已完成</span>
                </div>
              </>
            ) : (
              <Button onClick={handleMarkComplete} className="bg-gradient-to-r from-primary to-secondary">
                <CheckCircle className="mr-2" size={18} />
                标记完成
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {mdxSource ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <MDXRemote {...mdxSource} components={mdxComponents} />
            </div>
          ) : null}
        </div>

        {/* Footer CTA */}
        <div className="mx-auto max-w-3xl px-6 pb-8">
          <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="text-primary-foreground" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  {tutorialProgress?.completed ? "想要学习更多？" : "完成本技能！"}
                </h3>
                <p className="text-muted-foreground">
                  {tutorialProgress?.completed
                    ? "继续探索课程中的其他技能，提升你的能力。"
                    : "完成上面的步骤，然后点击\"标记完成\"按钮。"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
