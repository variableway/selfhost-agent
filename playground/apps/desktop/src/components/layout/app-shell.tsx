"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

const AppShellInner = dynamic(
  () =>
    import("./app-shell-inner").then((m) => m.AppShellInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    ),
  }
);

export function AppShell({ children }: { children: ReactNode }) {
  return <AppShellInner>{children}</AppShellInner>;
}
