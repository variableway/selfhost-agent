"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TutorialEditClient from "./client";

function TutorialEditContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">未指定教程</p>
      </div>
    );
  }

  return <TutorialEditClient slug={slug} />;
}

export default function TutorialEditPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><span className="text-muted-foreground">加载中...</span></div>}>
      <TutorialEditContent />
    </Suspense>
  );
}
