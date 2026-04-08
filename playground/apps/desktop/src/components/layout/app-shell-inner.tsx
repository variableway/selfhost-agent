"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@innate/ui";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { StatusBar } from "@/components/layout/status-bar";

export function AppShellInner({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">{children}</div>
        <StatusBar />
      </SidebarInset>
    </SidebarProvider>
  );
}
