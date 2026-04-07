"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "@innate/ui";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { StatusBar } from "@/components/layout/status-bar";

export function AppShellInner({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto">{children}</div>
        <StatusBar />
      </div>
    </SidebarProvider>
  );
}
