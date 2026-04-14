import TutorialDetailClient from "./client";

// Builtin slugs for static generation
const builtinSlugs = [
  "terminal-setup-mdx",
  "tutorial-001",
  "tutorial-002",
  "tutorial-003",
  // openclaw-quickstart
  "install",
  "manual-install",
  "config",
  "chat",
  // vibe-coding
  "setup",
  "workflow",
  "advanced",
  // terminal-basics
  "ls",
  "cd-pwd",
];

export function generateStaticParams() {
  return [...new Set(builtinSlugs)].map((id) => ({ id }));
}

export default async function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TutorialDetailClient id={id} />;
}
