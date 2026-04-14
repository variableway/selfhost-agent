import { tutorials } from "@/data/tutorials";
import TutorialDetailClient from "./client";

// Builtin slugs for static generation
const builtinSlugs = [
  ...tutorials.map((t) => t.id),
  // Also include MDX-specific slugs
  "terminal-setup-mdx",
  "openclaw-install",
  "openclaw-manual-install",
  "openclaw-config",
  "openclaw-chat",
  "vibe-setup",
  "vibe-workflow",
  "vibe-advanced",
];

export function generateStaticParams() {
  return [...new Set(builtinSlugs)].map((id) => ({ id }));
}

export default async function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TutorialDetailClient id={id} />;
}
