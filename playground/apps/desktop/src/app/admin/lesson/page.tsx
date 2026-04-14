"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button, Badge, Separator } from "@innate/ui";
import {
  GraduationCap,
  Plus,
  Trash2,
  Star,
  BookOpen,
  FolderPlus,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  saveTutorialToWorkspace,
  saveSeriesToWorkspace,
  deleteTutorialFromWorkspace,
  deleteSeriesFromWorkspace,
  generateTutorialMDX,
  SeriesFile,
  TutorialFile,
} from "@/lib/tutorial-scanner";

type Tab = "series" | "tutorials";

export default function LessonPage() {
  const {
    discoveredTutorials,
    discoveredSeries,
    scanTutorials,
    currentWorkspace,
    workspaces,
    defaultWorkspaceId,
  } = useAppStore();

  const [tab, setTab] = useState<Tab>("series");
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [showCreateTutorial, setShowCreateTutorial] = useState(false);
  const [scanning, setScanning] = useState(false);

  const workspacePath = currentWorkspace?.path ||
    (defaultWorkspaceId ? workspaces.find((w) => w.id === defaultWorkspaceId)?.path : undefined);

  const handleScan = async () => {
    setScanning(true);
    await scanTutorials();
    setScanning(false);
  };

  useEffect(() => {
    scanTutorials();
  }, [scanTutorials]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="text-primary" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Lesson Manager</h1>
            <p className="text-sm text-muted-foreground">
              {discoveredTutorials.length} tutorials in {discoveredSeries.length} series
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleScan} disabled={scanning}>
            <RefreshCw className={`mr-2 size-4 ${scanning ? 'animate-spin' : ''}`} />
            Scan
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b shrink-0">
        <button
          onClick={() => setTab("series")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            tab === "series"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FolderPlus className="size-4 inline mr-2" />
          Series ({discoveredSeries.length})
        </button>
        <button
          onClick={() => setTab("tutorials")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            tab === "tutorials"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-4 inline mr-2" />
          Tutorials ({discoveredTutorials.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {tab === "series" ? (
          <SeriesTab
            series={discoveredSeries}
            tutorials={discoveredTutorials}
            workspacePath={workspacePath}
            showCreate={showCreateSeries}
            setShowCreate={setShowCreateSeries}
            onRefresh={handleScan}
          />
        ) : (
          <TutorialsTab
            tutorials={discoveredTutorials}
            series={discoveredSeries}
            workspacePath={workspacePath}
            showCreate={showCreateTutorial}
            setShowCreate={setShowCreateTutorial}
            onRefresh={handleScan}
          />
        )}
      </div>
    </div>
  );
}

// ─── Series Tab ────────────────────────────────────────────────────────

function SeriesTab({
  series,
  tutorials,
  workspacePath,
  showCreate,
  setShowCreate,
  onRefresh,
}: {
  series: SeriesFile[];
  tutorials: TutorialFile[];
  workspacePath?: string;
  showCreate: boolean;
  setShowCreate: (v: boolean) => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Series</h2>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={16} />
          Create Series
        </Button>
      </div>

      {showCreate && (
        <CreateSeriesForm
          workspacePath={workspacePath}
          onCancel={() => setShowCreate(false)}
          onSave={async () => {
            setShowCreate(false);
            await onRefresh();
          }}
        />
      )}

      <div className="space-y-3">
        {series.map((s) => {
          const seriesTutorials = tutorials
            .filter((t) => t.series === s.id)
            .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));

          return (
            <div key={s.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon || '📘'}</span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2">
                    {s.source === 'builtin' ? 'Builtin' : 'Local'}
                  </Badge>
                </div>
                {s.source === 'local' && workspacePath && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await deleteSeriesFromWorkspace(workspacePath, s.id);
                      await onRefresh();
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                )}
              </div>
              <div className="mt-3 pl-11">
                <p className="text-xs text-muted-foreground mb-2">
                  {seriesTutorials.length} tutorial{seriesTutorials.length !== 1 ? 's' : ''}
                </p>
                {seriesTutorials.map((t) => (
                  <div key={t.slug} className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                    <FileText size={14} />
                    <span>{t.seriesOrder}. {t.title}</span>
                    <Badge variant="secondary" className="text-xs">{t.difficulty}</Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tutorials Tab ─────────────────────────────────────────────────────

function TutorialsTab({
  tutorials,
  series,
  workspacePath,
  showCreate,
  setShowCreate,
  onRefresh,
}: {
  tutorials: TutorialFile[];
  series: SeriesFile[];
  workspacePath?: string;
  showCreate: boolean;
  setShowCreate: (v: boolean) => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All Tutorials</h2>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={16} />
          Create Tutorial
        </Button>
      </div>

      {showCreate && (
        <CreateTutorialForm
          series={series}
          workspacePath={workspacePath}
          onCancel={() => setShowCreate(false)}
          onSave={async () => {
            setShowCreate(false);
            await onRefresh();
          }}
        />
      )}

      <div className="space-y-2">
        {tutorials.map((t) => {
          const s = t.series ? series.find((s) => s.id === t.series) : null;
          return (
            <div key={t.slug} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} className="text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-medium truncate">{t.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{t.duration}min</span>
                    <Badge variant="secondary" className="text-xs">{t.difficulty}</Badge>
                    {s && <span>{s.icon} {s.title}</span>}
                    <Badge variant="outline" className="text-xs">
                      {t.source === 'builtin' ? 'Builtin' : t.source === 'imported' ? 'Imported' : 'Local'}
                    </Badge>
                  </div>
                </div>
              </div>
              {t.source !== 'builtin' && workspacePath && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await deleteTutorialFromWorkspace(workspacePath, t.slug);
                    await onRefresh();
                  }}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Create Series Form ────────────────────────────────────────────────

function CreateSeriesForm({
  workspacePath,
  onCancel,
  onSave,
}: {
  workspacePath?: string;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#3498db");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspacePath) return;

    setSaving(true);
    try {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await saveSeriesToWorkspace(workspacePath, {
        id,
        title: title.trim(),
        description: description.trim(),
        icon,
        color,
        source: 'local',
      });
      onSave();
    } catch (err) {
      console.error('Failed to create series:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!workspacePath) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">Please create a workspace first to save custom series.</p>
        <Button variant="outline" size="sm" onClick={onCancel} className="mt-2">Cancel</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
      <h3 className="font-semibold">Create New Series</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
            placeholder="My Series"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
            placeholder="📚"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          placeholder="A short description"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">Cancel</Button>
        <Button type="submit" size="sm" disabled={!title.trim() || saving}>
          {saving ? 'Saving...' : 'Create Series'}
        </Button>
      </div>
    </form>
  );
}

// ─── Create Tutorial Form ──────────────────────────────────────────────

function CreateTutorialForm({
  series,
  workspacePath,
  onCancel,
  onSave,
}: {
  series: SeriesFile[];
  workspacePath?: string;
  onCancel: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [duration, setDuration] = useState(10);
  const [category, setCategory] = useState("general");
  const [selectedSeries, setSelectedSeries] = useState("");
  const [content, setContent] = useState("# My Tutorial\n\nContent goes here...");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspacePath) return;

    setSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const mdx = generateTutorialMDX({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        duration,
        category,
        tags: [],
        series: selectedSeries || undefined,
        seriesOrder: selectedSeries ? 1 : undefined,
        content,
      });
      await saveTutorialToWorkspace(workspacePath, slug, mdx);
      onSave();
    } catch (err) {
      console.error('Failed to create tutorial:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!workspacePath) {
    return (
      <div className="border rounded-lg p-4 mb-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">Please create a workspace first to save custom tutorials.</p>
        <Button variant="outline" size="sm" onClick={onCancel} className="mt-2">Cancel</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-4 bg-muted/30 space-y-3">
      <h3 className="font-semibold">Create New Tutorial</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
            placeholder="My Tutorial"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Series (optional)</label>
          <select
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="">No series</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>{s.icon} {s.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-background border rounded-md text-sm"
          placeholder="A short description"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Content (MDX)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 bg-background border rounded-md text-sm font-mono"
          rows={10}
          placeholder="# Title&#10;&#10;Content with <RunButton command='echo hello' />"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">Cancel</Button>
        <Button type="submit" size="sm" disabled={!title.trim() || saving}>
          {saving ? 'Saving...' : 'Create Tutorial'}
        </Button>
      </div>
    </form>
  );
}
