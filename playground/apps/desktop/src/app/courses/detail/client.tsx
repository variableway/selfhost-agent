"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button, Badge } from "@innate/ui";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  BarChart3,
  Trophy,
  Play,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  GripVertical,
  Save,
  X,
} from "lucide-react";
import {
  addSkillToCourse,
  removeSkillFromCourse,
  reorderCourseSkills,
  loadSkillContent,
} from "@/lib/tutorial-scanner";

interface CourseDetailClientProps {
  id: string;
}

export default function CourseDetailClient({ id }: CourseDetailClientProps) {
  const router = useRouter();

  const { discoveredCourses, discoveredSkills, progress, scanContent, currentWorkspace, workspaces, defaultWorkspaceId } = useAppStore();

  const currentCourse = discoveredCourses.find((c) => c.id === id);
  const courseSkillSlugs = new Set(currentCourse?.skills?.map((cs) => cs.slug) || []);
  const courseSkills = currentCourse?.skills
    ? currentCourse.skills
        .sort((a, b) => a.order - b.order)
        .map((cs) => {
          const s = discoveredSkills.find((sk) => sk.slug === cs.slug);
          return s ? { ...s, order: cs.order } : null;
        })
        .filter((s): s is NonNullable<typeof s> => !!s)
    : [];

  const availableSkills = discoveredSkills.filter((s) => !courseSkillSlugs.has(s.slug));

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);

  // Drag state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);

  const workspacePath = currentWorkspace?.path ||
    (defaultWorkspaceId ? workspaces.find((w) => w.id === defaultWorkspaceId)?.path : undefined);

  if (!currentCourse) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">课程不存在</p>
        <Button variant="outline" onClick={() => router.push("/courses")}>
          <ArrowLeft className="mr-2" size={16} />
          返回课程列表
        </Button>
      </div>
    );
  }

  const completedCount = courseSkills.filter((s) => progress[s.slug]?.completed).length;
  const progressPercent = courseSkills.length > 0 ? (completedCount / courseSkills.length) * 100 : 0;
  const totalDuration = courseSkills.reduce((sum, s) => sum + s.duration, 0);
  const nextSkill = courseSkills.find((s) => !progress[s.slug]?.completed);

  // Display order: local drag order or original
  const displaySkills = localOrder
    ? localOrder.map((slug) => courseSkills.find((s) => s.slug === slug)).filter((s): s is NonNullable<typeof s> => !!s)
    : courseSkills;

  const toggleSelect = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedSlugs(new Set(availableSkills.map((s) => s.slug)));
  };

  const clearSelection = () => {
    setSelectedSlugs(new Set());
  };

  const handleBatchAdd = async () => {
    if (!workspacePath || selectedSlugs.size === 0) return;
    setSaving(true);
    try {
      const slugs = Array.from(selectedSlugs);
      const startOrder = courseSkills.length + 1;
      for (let i = 0; i < slugs.length; i++) {
        const result = await loadSkillContent(slugs[i], workspacePath);
        if (!result) continue;
        await addSkillToCourse(workspacePath, id, slugs[i], result.content, startOrder + i);
      }
      setSelectedSlugs(new Set());
      setShowAddSkill(false);
      await scanContent();
    } catch (err) {
      console.error("Failed to add skills:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (slug: string) => {
    if (!workspacePath) return;
    setRemovingSlug(slug);
    try {
      await removeSkillFromCourse(workspacePath, id, slug);
      await scanContent();
    } catch (err) {
      console.error("Failed to remove skill:", err);
    } finally {
      setRemovingSlug(null);
    }
  };

  // Drag handlers
  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
    // Initialize local order from current display
    if (!localOrder) {
      setLocalOrder(displaySkills.map((s) => s.slug));
    }
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setOverIdx(idx);
  };

  const handleDrop = () => {
    if (dragIdx === null || overIdx === null || !localOrder) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const arr = [...localOrder];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(overIdx, 0, moved);
    setLocalOrder(arr);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleSaveOrder = async () => {
    if (!workspacePath || !localOrder) return;
    setSaving(true);
    try {
      await reorderCourseSkills(workspacePath, id, localOrder);
      setLocalOrder(null);
      await scanContent();
    } catch (err) {
      console.error("Failed to save order:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReorder = () => {
    setLocalOrder(null);
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(135deg, ${currentCourse.color || '#3498db'}40 0%, transparent 60%)` }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
          style={{ background: `${currentCourse.color || '#3498db'}30` }}
        />
        <div className="relative px-8 py-8">
          <Button variant="ghost" onClick={() => router.push("/courses")} className="mb-4">
            <ArrowLeft className="mr-2" size={16} />
            返回课程列表
          </Button>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{ background: `linear-gradient(135deg, ${currentCourse.color || '#3498db'}30 0%, ${currentCourse.color || '#3498db'}50 100%)` }}
            >
              {currentCourse.icon || "📚"}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="text-white bg-gradient-to-r from-primary to-secondary">
                  {courseSkills.length} 个技能
                </Badge>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock size={14} />
                  {totalDuration} 分钟
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{currentCourse.title}</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">{currentCourse.description}</p>

              {/* Progress */}
              <div className="mt-6 p-4 bg-card/50 backdrop-blur-sm border rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-primary" size={18} />
                    <span className="font-medium">学习进度</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</span>
                    <span className="text-muted-foreground">({completedCount}/{courseSkills.length})</span>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {nextSkill && progressPercent < 100 && (
                  <Button
                    onClick={() => router.push(`/tutorial/${nextSkill.slug}`)}
                    className="mt-4 bg-gradient-to-r from-primary to-secondary"
                  >
                    <Play className="mr-2 fill-current" size={16} />
                    继续学习: {nextSkill.title}
                  </Button>
                )}
                {progressPercent === 100 && courseSkills.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl">
                    <Trophy size={18} />
                    <span className="font-medium">恭喜！你已完成本课程所有技能</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="text-primary-foreground" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">技能列表</h2>
              <p className="text-sm text-muted-foreground">
                {localOrder ? "拖拽排序后点击保存" : "按顺序完成所有技能"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {localOrder && (
              <>
                <Button size="sm" variant="outline" onClick={handleCancelReorder}>
                  取消
                </Button>
                <Button size="sm" onClick={handleSaveOrder} disabled={saving} className="gap-2">
                  <Save size={14} />
                  {saving ? "保存中..." : "保存排序"}
                </Button>
              </>
            )}
            {!localOrder && (
              <Button size="sm" onClick={() => setShowAddSkill(!showAddSkill)} className="gap-2">
                <Plus size={16} />
                添加技能
              </Button>
            )}
          </div>
        </div>

        {/* Multi-select add panel */}
        {showAddSkill && (
          <div className="mb-6 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {availableSkills.length > 0
                  ? `选择要添加的技能 (已选 ${selectedSlugs.size}/${availableSkills.length})`
                  : "没有可添加的技能"}
              </h3>
              {availableSkills.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>全选</Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection} disabled={selectedSlugs.size === 0}>
                    清除
                  </Button>
                </div>
              )}
            </div>
            {availableSkills.length > 0 && (
              <>
                <div className="space-y-1 max-h-64 overflow-auto mb-3">
                  {availableSkills.map((s) => {
                    const isSelected = selectedSlugs.has(s.slug);
                    return (
                      <label
                        key={s.slug}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-accent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(s.slug)}
                          className="rounded border-muted-foreground"
                        />
                        <BookOpen size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium flex-1">{s.title}</span>
                        <Badge variant="secondary" className="text-xs">{s.difficulty}</Badge>
                        <span className="text-xs text-muted-foreground">{s.duration}min</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-muted-foreground">
                    {selectedSlugs.size > 0 ? `已选择 ${selectedSlugs.size} 个技能` : "请选择技能"}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setShowAddSkill(false); setSelectedSlugs(new Set()); }}>
                      取消
                    </Button>
                    <Button size="sm" onClick={handleBatchAdd} disabled={selectedSlugs.size === 0 || saving}>
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          添加中...
                        </>
                      ) : (
                        <>
                          <Plus size={14} className="mr-2" />
                          添加 {selectedSlugs.size > 0 ? `(${selectedSlugs.size})` : ""}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Skill list with drag */}
        {displaySkills.length > 0 ? (
          <div className="space-y-2">
            {displaySkills.map((skill, idx) => {
              const isCompleted = progress[skill.slug]?.completed;
              const isDragging = dragIdx === idx;
              const isDragOver = overIdx === idx && dragIdx !== null && dragIdx !== idx;
              return (
                <div
                  key={skill.slug}
                  draggable={currentCourse.source === 'local' && !!workspacePath && !showAddSkill}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 border rounded-lg p-3 transition-all group ${
                    isDragging ? "opacity-50 border-primary" :
                    isDragOver ? "border-primary border-dashed bg-primary/5" :
                    "hover:border-primary/50 hover:shadow-sm"
                  } ${currentCourse.source === 'local' && workspacePath ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                >
                  {/* Drag handle */}
                  {currentCourse.source === 'local' && workspacePath && !showAddSkill && (
                    <GripVertical size={16} className="text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
                  )}
                  {/* Order number */}
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-xs font-mono text-muted-foreground shrink-0">
                    {idx + 1}
                  </div>
                  {/* Skill info */}
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => !localOrder && router.push(`/tutorial/${skill.slug}`)}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium truncate text-sm">{skill.title}</span>
                      <Badge
                        className={`text-xs ${
                          skill.difficulty === "beginner"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : skill.difficulty === "intermediate"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {skill.difficulty === "beginner" ? "入门" : skill.difficulty === "intermediate" ? "进阶" : "高级"}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          已完成
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{skill.description}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span className="text-xs">{skill.duration} 分钟</span>
                    </div>
                    {currentCourse.source === 'local' && workspacePath && !showAddSkill && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleRemoveSkill(skill.slug);
                        }}
                        disabled={removingSlug === skill.slug}
                        title="从课程中移除"
                      >
                        {removingSlug === skill.slug ? (
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} className="text-red-500" />
                        )}
                      </Button>
                    )}
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed">
            <BookOpen size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-lg">该课程暂无技能</p>
            <p className="text-sm text-muted-foreground mt-1">点击上方"添加技能"按钮开始</p>
          </div>
        )}
      </div>
    </div>
  );
}
