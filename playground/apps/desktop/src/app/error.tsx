"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@innate/ui";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="text-destructive" size={32} />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold mb-2">页面出错了</h2>
        <p className="text-sm text-muted-foreground mb-1">
          {error.message || "发生了未知错误"}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => reset()} className="gap-2">
          <RotateCcw size={16} />
          重试
        </Button>
        <Button onClick={() => router.push("/")} className="gap-2">
          <Home size={16} />
          返回首页
        </Button>
      </div>
    </div>
  );
}
