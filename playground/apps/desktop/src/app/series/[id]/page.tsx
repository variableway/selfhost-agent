import { series } from "@/data/series";
import SeriesDetailClient from "./client";

const builtinSeriesIds = [
  ...series.map((s) => s.id),
  // Also include discovered series IDs that may exist at runtime
  "nodejs-fundamentals",
  "git-fundamentals",
  "python-fundamentals",
  "terminal-basics",
  "openclaw-quickstart",
  "vibe-coding",
];

export function generateStaticParams() {
  return [...new Set(builtinSeriesIds)].map((id) => ({ id }));
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SeriesDetailClient id={id} />;
}
