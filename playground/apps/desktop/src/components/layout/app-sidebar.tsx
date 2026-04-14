"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  Bot,
  LayoutGrid,
  Settings,
  ChevronUp,
  ChevronRight,
  FileText,
  Shield,
  FolderKanban,
  GraduationCap,
  BookMarked,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@innate/ui";

const adminItems = [
  { title: "Workspace", href: "/admin/workspace", icon: FolderKanban },
  { title: "Lesson", href: "/admin/lesson", icon: GraduationCap },
  { title: "设置", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [platform, setPlatform] = useState("detecting...");
  const { discoveredTutorials, discoveredSeries, scanTutorials } = useAppStore();

  // Track which series are expanded
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({});
  // Track which sidebar groups are collapsed
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    scanTutorials();
  }, [scanTutorials]);

  // Auto-expand series that contain the current tutorial
  useEffect(() => {
    const currentTutorial = discoveredTutorials.find(
      (t) => pathname === `/tutorial/${t.slug}`
    );
    if (currentTutorial?.series) {
      setExpandedSeries((prev) => ({ ...prev, [currentTutorial.series!]: true }));
    }
  }, [pathname, discoveredTutorials]);

  const toggleSeries = (seriesId: string) => {
    setExpandedSeries((prev) => ({ ...prev, [seriesId]: !prev[seriesId] }));
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Series with tutorials
  const seriesWithTutorials = discoveredSeries
    .filter((s) => discoveredTutorials.some((t) => t.series === s.id))
    .map((s) => ({
      ...s,
      tutorials: discoveredTutorials
        .filter((t) => t.series === s.id)
        .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0)),
    }));

  // Tutorials without a series
  const ungroupedTutorials = discoveredTutorials.filter((t) => !t.series);

  useEffect(() => {
    if ("__TAURI_INTERNALS__" in window) {
      import("@tauri-apps/api/core").then(({ invoke }) => {
        invoke<string>("get_platform").then(setPlatform).catch(() => setPlatform("unknown"));
      });
    } else {
      setPlatform("web");
    }
  }, []);

  const platformIcon =
    platform.includes("macos") ? "🍎" :
    platform.includes("windows") ? "🪟" :
    platform.includes("linux") ? "🐧" : "🌐";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => router.push("/")}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Innate</span>
                <span className="text-xs text-muted-foreground">Playground</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="cursor-pointer select-none"
            onClick={() => toggleGroup("nav")}
          >
            导航
            <ChevronRight className={`ml-auto size-3 transition-transform duration-200 ${collapsedGroups["nav"] ? "" : "rotate-90"}`} />
          </SidebarGroupLabel>
          {!collapsedGroups["nav"] && (
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  tooltip="首页"
                  onClick={() => router.push("/")}
                >
                  <LayoutGrid className="size-4" />
                  <span>首页</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/tutorials"}
                  tooltip="教程中心"
                  onClick={() => router.push("/tutorials")}
                >
                  <BookMarked className="size-4" />
                  <span>教程中心</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Series as collapsible first-level items */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="cursor-pointer select-none"
            onClick={() => toggleGroup("series")}
          >
            系列课程
            <ChevronRight className={`ml-auto size-3 transition-transform duration-200 ${collapsedGroups["series"] ? "" : "rotate-90"}`} />
          </SidebarGroupLabel>
          {!collapsedGroups["series"] && (
          <SidebarGroupContent>
            <SidebarMenu>
              {seriesWithTutorials.map((series) => (
                <Collapsible
                  key={series.id}
                  open={expandedSeries[series.id] ?? false}
                  onOpenChange={() => toggleSeries(series.id)}
                  asChild
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={series.title}
                        isActive={pathname.startsWith(`/series/${series.id}`)}
                      >
                        <span className="text-sm">{series.icon || "📘"}</span>
                        <span>{series.title}</span>
                        <ChevronRight className={`ml-auto size-4 transition-transform duration-200 ${
                          expandedSeries[series.id] ? "rotate-90" : ""
                        }`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-primary/15 pl-3">
                        {series.tutorials.map((tutorial, idx) => (
                          <li key={tutorial.slug}>
                            <button
                              onClick={() => router.push(`/tutorial/${tutorial.slug}`)}
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors ${
                                pathname === `/tutorial/${tutorial.slug}`
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                              }`}
                            >
                              <span className="size-4 flex items-center justify-center text-[10px] text-muted-foreground/60 font-mono shrink-0">{idx + 1}</span>
                              <span className="truncate">{tutorial.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}

              {/* Ungrouped tutorials */}
              {ungroupedTutorials.map((tutorial) => (
                <SidebarMenuItem key={tutorial.slug}>
                  <SidebarMenuButton
                    isActive={pathname === `/tutorial/${tutorial.slug}`}
                    tooltip={tutorial.title}
                    onClick={() => router.push(`/tutorial/${tutorial.slug}`)}
                  >
                    <FileText className="size-4" />
                    <span>{tutorial.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Admin / 管理 (bottom position) */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="cursor-pointer select-none"
            onClick={() => toggleGroup("admin")}
          >
            <Shield className="size-3 mr-1 inline" />
            管理
            <ChevronRight className={`ml-auto size-3 transition-transform duration-200 ${collapsedGroups["admin"] ? "" : "rotate-90"}`} />
          </SidebarGroupLabel>
          {!collapsedGroups["admin"] && (
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <span className="text-sm">{platformIcon}</span>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium text-sm">{platform}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 size-4" />
                  设置
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
