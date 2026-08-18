'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getAttempts,
  getDailyActivities,
  getStreak,
  getTopics,
  getTotalXP,
  getUserMastery,
} from '@/lib/services/dataService';
import { computeProgressSummary } from '@/lib/services/analyticsService';
import { ProgressSummary } from '@/lib/types';
import { BarChart2, TrendingUp, TrendingDown, Flame, Award, Zap, CheckCircle2 } from 'lucide-react';

export default function ProgressPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [topics, masteryList, attempts, activities, streak, totalXP] = await Promise.all([
          getTopics(),
          getUserMastery(),
          getAttempts(),
          getDailyActivities(),
          getStreak(),
          getTotalXP(),
        ]);

        const res = computeProgressSummary(
          topics,
          masteryList,
          attempts,
          activities,
          streak,
          totalXP
        );
        setSummary(res);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading || !summary) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-28" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-outline-variant mb-8 gap-4">
        <div>
          <div className="font-mono text-[11px] text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" />
            Adaptive Trajectory & Telemetry Analysis
          </div>
          <h1 className="font-display text-display text-on-surface uppercase tracking-tight font-semibold">
            Progress & Topics
          </h1>
        </div>
        <div className="font-mono text-xs text-on-surface-variant">
          19 CORE DSA TOPICS
        </div>
      </div>

      {/* Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
            Overall Mastery
          </div>
          <div className="font-mono font-bold text-3xl text-primary mt-1">
            {summary.overallMastery} <span className="text-on-surface-variant text-base font-normal">/ 100</span>
          </div>
          <div className="font-mono text-[11px] text-on-surface-variant mt-2">
            Across 19 DSA topics
          </div>
        </Card>

        <Card>
          <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
            Consistency Score
          </div>
          <div className="font-mono font-bold text-3xl text-on-surface mt-1">
            {summary.consistencyScore}%
          </div>
          <div className="font-mono text-[11px] text-on-surface-variant mt-2">
            Regularity index
          </div>
        </Card>

        <Card>
          <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
            Independent Solve Rate
          </div>
          <div className="font-mono font-bold text-3xl text-primary mt-1">
            {summary.independentSolveRate}%
          </div>
          <div className="font-mono text-[11px] text-on-surface-variant mt-2 truncate">
            {summary.questionsSolved} of {summary.questionsAttempted} solved
          </div>
        </Card>

        <Card>
          <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
            Streak & Experience
          </div>
          <div className="font-mono font-bold text-2xl text-[#f2c94c] mt-1 flex items-center">
            <Flame className="w-5 h-5 mr-1 fill-[#f2c94c]" />
            {summary.currentStreak}d • {summary.totalXP} XP
          </div>
          <div className="font-mono text-[11px] text-on-surface-variant mt-2">
            Longest Streak: {summary.longestStreak}d
          </div>
        </Card>
      </div>

      {/* Strongest vs Weakest Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-on-surface mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-primary" />
            Strongest Topics
          </h3>
          <div className="space-y-3">
            {summary.strongestTopics.map((item) => (
              <div key={item.topic.id} className="flex justify-between items-center font-mono text-xs p-2 bg-surface-container rounded-sm border border-outline-variant/40">
                <span className="font-medium text-on-surface">{item.topic.name}</span>
                <span className="font-bold text-primary">{item.score} / 100</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-on-surface mb-4 flex items-center">
            <TrendingDown className="w-4 h-4 mr-2 text-error" />
            Weakest Topics (Recommended Focus)
          </h3>
          <div className="space-y-3">
            {summary.weakestTopics.map((item) => (
              <div key={item.topic.id} className="flex justify-between items-center font-mono text-xs p-2 bg-surface-container rounded-sm border border-outline-variant/40">
                <span className="font-medium text-on-surface">{item.topic.name}</span>
                <span className="font-bold text-error">{item.score} / 100</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* All Topic Mastery Breakdown */}
      <Card>
        <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-on-surface mb-6">
          Full Topic Mastery Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {summary.topicMasteries.map((item) => (
            <div key={item.topic.id} className="space-y-1.5 p-3 bg-surface-container rounded-sm border border-outline-variant/40">
              <div className="flex justify-between font-mono text-xs">
                <span className="font-medium text-on-surface">{item.topic.name}</span>
                <span className="font-bold text-primary">{item.score} / 100</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
