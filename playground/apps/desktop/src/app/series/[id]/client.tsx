"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@innate/ui";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  BarChart3,
  Trophy,
  Play,
  Sparkles,
  CheckCircle,
  Circle,
} from "lucide-react";

interface SeriesDetailClientProps {
  id: string;
}

export default function SeriesDetailClient({ id }: SeriesDetailClientProps) {
  const router = useRouter();

  const { discoveredSeries, discoveredTutorials, progress } = useAppStore();

  const currentSeries = discoveredSeries.find((s) => s.id === id);
  const seriesTutorials = discoveredTutorials
    .filter((t) => t.series === id)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));

  if (!currentSeries) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">系列不存在</p>
        <Button variant="outline" onClick={() => router.push("/tutorials")}>
          <ArrowLeft className="mr-2" size={16} />
          返回教程列表
        </Button>
      </div>
    );
  }

  const completedCount = seriesTutorials.filter((t) => progress[t.slug]?.completed).length;
  const progressPercent = seriesTutorials.length > 0 ? (completedCount / seriesTutorials.length) * 100 : 0;
  const totalDuration = seriesTutorials.reduce((sum, t) => sum + t.duration, 0);
  const nextTutorial = seriesTutorials.find((t) => !progress[t.slug]?.completed);

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${currentSeries.color || '#3498db'}40 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
          style={{ background: `${currentSeries.color || '#3498db'}30` }}
        />

        <div className="relative px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/tutorials")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2" size={16} />
            返回教程列表
          </Button>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{
                background: `linear-gradient(135deg, ${currentSeries.color || '#3498db'}30 0%, ${currentSeries.color || '#3498db'}50 100%)`,
              }}
            >
              {currentSeries.icon || "📚"}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="text-white bg-gradient-to-r from-primary to-secondary">
                  {seriesTutorials.length} 个教程
                </Badge>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock size={14} />
                  {totalDuration} 分钟
                </span>
              </div>

              <h1 className="text-3xl font-bold mb-2">{currentSeries.title}</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                {currentSeries.description}
              </p>

              {/* Progress Section */}
              <div className="mt-6 p-4 bg-card/50 backdrop-blur-sm border rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-primary" size={18} />
                    <span className="font-medium">学习进度</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</span>
                    <span className="text-muted-foreground">
                      ({completedCount}/{seriesTutorials.length})
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {nextTutorial && progressPercent < 100 && (
                  <Button
                    onClick={() => router.push(`/tutorial/${nextTutorial.slug}`)}
                    className="mt-4 bg-gradient-to-r from-primary to-secondary"
                  >
                    <Play className="mr-2 fill-current" size={16} />
                    继续学习: {nextTutorial.title}
                  </Button>
                )}

                {progressPercent === 100 && seriesTutorials.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl">
                    <Trophy size={18} />
                    <span className="font-medium">恭喜！你已完成本系列所有教程</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorials List */}
      <div className="px-8 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">教程列表</h2>
            <p className="text-sm text-muted-foreground">按顺序完成所有教程</p>
          </div>
        </div>

        {seriesTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {seriesTutorials.map((tutorial) => {
              const isCompleted = progress[tutorial.slug]?.completed;
              return (
                <Card
                  key={tutorial.slug}
                  className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                  onClick={() => router.push(`/tutorial/${tutorial.slug}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={`text-xs ${
                              tutorial.difficulty === "beginner"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : tutorial.difficulty === "intermediate"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-rose-500/10 text-rose-500"
                            }`}
                          >
                            {tutorial.difficulty === "beginner" ? "入门" : tutorial.difficulty === "intermediate" ? "进阶" : "高级"}
                          </Badge>
                          {tutorial.seriesOrder && (
                            <Badge variant="secondary" className="text-xs">
                              #{tutorial.seriesOrder}
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge
                              variant="outline"
                              className="text-xs text-emerald-500 border-emerald-500/20"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              已完成
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {tutorial.title}
                        </CardTitle>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{tutorial.duration} 分钟</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        className={
                          isCompleted
                            ? "text-emerald-500 border-emerald-500/20"
                            : "bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                        }
                      >
                        <Play className="w-3 h-3 mr-1 fill-current" />
                        {isCompleted ? "复习" : "开始"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-dashed">
            <BookOpen size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-lg">该系列暂无教程</p>
          </div>
        )}
      </div>
    </div>
  );
}
