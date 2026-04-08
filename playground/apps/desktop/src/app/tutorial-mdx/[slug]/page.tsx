import { notFound } from "next/navigation";
import { TutorialMdxClient } from "./tutorial-mdx-client";

const mdxMeta: Record<string, { title: string; file: string; tag: string }> = {
  "terminal-setup": {
    title: "终端环境配置 (MDX)",
    file: "/tutorials/terminal-setup-mdx.mdx",
    tag: "入门",
  },
};

export function generateStaticParams() {
  return Object.keys(mdxMeta).map((slug) => ({ slug }));
}

export default function TutorialMdxPage({ params }: { params: Promise<{ slug: string }> }) {
  return <TutorialMdxClientWrapper params={params} />;
}

async function TutorialMdxClientWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = mdxMeta[slug];
  if (!meta) notFound();
  return <TutorialMdxClient meta={meta} />;
}
