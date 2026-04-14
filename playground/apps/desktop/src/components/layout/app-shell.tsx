"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@innate/ui";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MenuBar } from "@/components/layout/menu-bar";
import { StatusBar } from "@/components/layout/status-bar";
import { TerminalPanel } from "@/components/terminal-panel";
import { useAppStore } from "@/store/useAppStore";

function AppShellContent({ children }: { children: ReactNode }) {
  const { terminalVisible, terminalPosition } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Suspense><AppSidebar /></Suspense>
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Menu Bar */}
        <MenuBar />

        <div className="flex flex-1 overflow-hidden">
          <SidebarInset className="flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto">{children}</div>
          </SidebarInset>

          {/* Terminal - Right Side */}
          {terminalVisible && terminalPosition === "right" && (
            <TerminalPanel />
          )}
        </div>

        {/* Terminal - Bottom */}
        {terminalVisible && terminalPosition === "bottom" && (
          <TerminalPanel />
        )}

        <StatusBar />
      </div>
    </SidebarProvider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return <AppShellContent>{children}</AppShellContent>;
}
