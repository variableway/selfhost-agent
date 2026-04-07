import { notFound } from "next/navigation";
import { TutorialPageClient } from "./tutorial-client";

const tutorialMeta: Record<string, { title: string; files: string[]; tag: string }> = {
  "terminal-setup": {
    title: "终端环境配置",
    files: ["/tutorials/terminal-setup-mac.md"],
    tag: "入门",
  },
  "cmd-basics": {
    title: "命令行 5 分钟入门",
    files: ["/tutorials/cmd-basics.md"],
    tag: "入门",
  },
};

export function generateStaticParams() {
  return Object.keys(tutorialMeta).map((slug) => ({ slug }));
}

export default function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  return <TutorialPageClientWrapper params={params} />;
}

async function TutorialPageClientWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = tutorialMeta[slug];
  if (!meta) notFound();
  return <TutorialPageClient meta={meta} />;
}
