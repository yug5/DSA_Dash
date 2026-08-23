'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import AttemptModal from '@/components/AttemptModal';
import AICoachCard from '@/components/AICoachCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getActiveGoal,
  getDailyActivities,
  getNextRecommendation,
  getStreak,
  getTotalXP,
  getUserMastery,
  getTopics,
} from '@/lib/services/dataService';
import { calculateGoalProjection } from '@/lib/services/goalService';
import { getDailyMotivationMessage } from '@/lib/services/motivationService';
import { QuestionRecommendation, Goal, Streak, DailyActivity, UserTopicMastery, Topic } from '@/lib/types';
import { Toast } from '@/components/ui/Toast';
import {
  Target,
  Flame,
  Award,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Zap,
  Activity,
  Snowflake,
  Info,
} from 'lucide-react';

export default function DashboardPage() {
  const [recommendation, setRecommendation] = useState<QuestionRecommendation | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [masteryList, setMasteryList] = useState<UserTopicMastery[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showFreezerToast, setShowFreezerToast] = useState<boolean>(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [rec, g, s, xp, m, t, activities] = await Promise.all([
        getNextRecommendation(),
        getActiveGoal(),
        getStreak(),
        getTotalXP(),
        getUserMastery(),
        getTopics(),
        getDailyActivities(),
      ]);
      setRecommendation(rec);
      setGoal(g);
      setStreak(s);
      setTotalXP(xp);
      setMasteryList(m);
      setTopics(t);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayAct = activities.find((a) => a.date === todayStr) || null;
      setTodayActivity(todayAct);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (isLoading || !recommendation) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-28 md:col-span-2" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-56" />
            <Skeleton className="h-56 lg:col-span-2" />
          </div>
        </div>
      </AppShell>
    );
  }

  const dailyTarget = goal?.daily_target ?? 5;
  const questionsCompletedToday = todayActivity?.questions_completed ?? 0;
  const motivationMsg = getDailyMotivationMessage(dailyTarget, questionsCompletedToday);

  // Projection calculation
  const projection = goal
    ? calculateGoalProjection(goal.total_completed, goal.start_date, goal.end_date)
    : null;

  // Topic map lookup
  const topicMap = new Map<string, string>();
  topics.forEach((t) => topicMap.set(t.id, t.name));

  // Weakest topics
  const sortedMastery = [...masteryList].sort((a, b) => Number(a.score) - Number(b.score));
  const weakestTopics = sortedMastery.slice(0, 4);

  const getDifficultyBadgeVariant = (diff: string) => {
    if (diff === 'EASY') return 'easy';
    if (diff === 'MEDIUM') return 'medium';
    return 'hard';
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-outline-variant mb-8 gap-4">
        <div>
          <div className="font-mono text-[11px] text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Adaptive Algorithm Active
          </div>
          <h1 className="font-display text-display text-on-surface uppercase tracking-tight font-semibold">
            Overview
          </h1>
        </div>
        <div className="font-mono text-xs text-on-surface-variant flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>REAL-TIME ADAPTIVE ENGINE</span>
        </div>
      </div>

      {/* Top Banner Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Daily Target & Motivation */}
        <Card className="md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
                Today's Target
              </span>
              <div className="font-mono font-bold text-2xl text-on-surface mt-1">
                {questionsCompletedToday} <span className="text-on-surface-variant text-base">/ {dailyTarget} Qs</span>
              </div>
            </div>
            <div className="p-2.5 bg-surface-container-high rounded-sm text-primary">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center space-x-2 font-mono text-xs text-on-surface-variant">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{motivationMsg}</span>
          </div>
        </Card>

        {/* Streak & Streak Freezer */}
        <Card className="flex flex-col justify-between relative">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-mono font-bold text-2xl text-[#f2c94c] flex items-center">
                <Flame className="w-5 h-5 mr-1 fill-[#f2c94c]" />
                {streak?.current_streak ?? 0}
              </div>
              <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                DAY STREAK
              </div>
            </div>
            <span className="font-mono text-[11px] text-on-surface-variant">
              MAX {streak?.longest_streak ?? 0}d
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
            <div>
              <div className="font-mono font-bold text-xl text-cyan-400 flex items-center">
                <Snowflake className="w-4.5 h-4.5 mr-1 text-cyan-400 fill-cyan-400/20" />
                {streak?.available_freezes ?? 0}
              </div>
              <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <span>STREAK FREEZERS</span>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip((prev) => !prev);
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="text-on-surface-variant hover:text-cyan-400 focus:outline-none transition-colors p-0.5 rounded-full"
                    aria-label="Streak Freezer Information"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {showTooltip && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-surface-container-highest border border-outline-variant rounded shadow-xl font-mono text-[11px] text-on-surface normal-case leading-snug z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start gap-1.5">
                        <Snowflake className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>
                          Earn 1 Streak Freezer after 5 consecutive days of practice. Use it to protect your streak when you miss a day.
                        </span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-container-highest border-r border-b border-outline-variant rotate-45" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Total XP */}
        <Card className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
                Total Experience
              </span>
              <div className="font-mono font-bold text-2xl text-on-surface mt-1">
                {totalXP} <span className="text-primary text-base">XP</span>
              </div>
            </div>
            <div className="p-2.5 bg-surface-container-high rounded-sm text-primary">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-[11px] text-on-surface-variant truncate">
            Earned from solved problems
          </div>
        </Card>
      </div>

      {/* CORE FOCAL RECOMMENDATION CARD */}
      <div className="bg-surface-container-low border border-primary/40 rounded-md p-6 mb-8 relative overflow-hidden">
        {/* Subtle accent vertical bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant pb-4 mb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="primary">Recommended Problem</Badge>
              <Badge variant={getDifficultyBadgeVariant(recommendation.difficulty)}>
                {recommendation.difficulty}
              </Badge>
              <span className="font-mono text-[11px] text-on-surface-variant">
                EST. {recommendation.estimated_time} MINS
              </span>
            </div>
            <h2 className="font-headline-lg text-2xl font-semibold text-on-surface mt-1">
              {recommendation.title}
            </h2>
            <div className="font-mono text-xs text-on-surface-variant mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                TOPIC: <strong className="text-on-surface font-medium">{topicMap.get(recommendation.primary_topic_id) || recommendation.primary_topic_id}</strong>
              </span>
              {recommendation.pattern && (
                <span>
                  PATTERN: <strong className="text-on-surface font-medium">{recommendation.pattern}</strong>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="font-mono text-xs text-on-surface-variant hover:text-on-surface inline-flex items-center self-start md:self-auto bg-surface-container-high px-3 py-1.5 rounded-sm border border-outline-variant/60 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'RESCORING...' : 'RE-SCORE RECOMMENDATION'}
          </button>
        </div>

        {/* Algorithm Score Explanation Breakdown */}
        {recommendation.scoreExplanation && (
          <div className="bg-surface-container p-4 rounded-sm border border-outline-variant text-xs font-mono mb-6">
            <div className="text-on-surface font-medium mb-2.5 flex items-center text-[11px] uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Algorithm Recommendation Rationale
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-on-surface-variant">
              <div className="bg-surface-container-high/40 p-2 rounded-sm border border-outline-variant/30">
                Weak Topic Score: <strong className="text-primary font-bold">+{recommendation.scoreExplanation.weakTopicBoost}</strong>
              </div>
              <div className="bg-surface-container-high/40 p-2 rounded-sm border border-outline-variant/30">
                Similarity Match: <strong className="text-on-surface font-bold">+{recommendation.scoreExplanation.similarityBoost}</strong>
              </div>
              <div className="bg-surface-container-high/40 p-2 rounded-sm border border-outline-variant/30">
                Prereqs Ready: <strong className="text-on-surface font-bold">+{recommendation.scoreExplanation.prereqBoost}</strong>
              </div>
              <div className="bg-surface-container-high/40 p-2 rounded-sm border border-outline-variant/30">
                Difficulty Fit: <strong className="text-on-surface font-bold">+{recommendation.scoreExplanation.difficultyBoost}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Main Problem Loop */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={recommendation.leetcode_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-surface-container-high border border-outline text-on-surface rounded-sm font-mono text-xs font-semibold hover:bg-surface-bright hover:border-on-surface transition-all flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            OPEN PROBLEM ON LEETCODE
          </a>

          <button
            onClick={() => setIsAttemptModalOpen(true)}
            className="flex-1 py-3 px-4 bg-primary text-on-primary rounded-sm font-mono text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            RETURN & REPORT RESULT
          </button>
        </div>
      </div>

      {/* AI Coach Guidance Card */}
      <div className="mb-8">
        <AICoachCard summary={null} weakestTopics={weakestTopics.map((w) => ({ topic: { id: w.topic_id, name: topicMap.get(w.topic_id) || w.topic_id, description: null, created_at: '' }, score: Number(w.score) }))} />
      </div>

      {/* Secondary Grid: Goal Projection & Weakest Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Goal & Projections */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-on-surface flex items-center">
              <Target className="w-4 h-4 mr-2 text-primary" />
              Active Goal Progress
            </h3>
            <Badge variant="outline">{goal?.status || 'ACTIVE'}</Badge>
          </div>

          {goal ? (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between text-on-surface-variant mb-1.5">
                  <span>Target Completion</span>
                  <span className="font-bold text-on-surface">{goal.total_completed} / {goal.total_target} Qs</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((goal.total_completed / goal.total_target) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {projection && (
                <div className="p-3 bg-surface-container rounded-sm border border-outline-variant space-y-2">
                  <div className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">
                    Real-time Projection
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Daily Average:</span>
                    <strong className="text-on-surface">{projection.currentDailyAverage} Qs/day</strong>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Projected Total:</span>
                    <strong className="text-primary">{projection.projectedTotal} Qs</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-mono text-on-surface-variant py-4 text-center">
              No active goal set. Configure one in Goals.
            </div>
          )}
        </Card>

        {/* Focus Areas (Lowest Topic Mastery) */}
        <Card className="lg:col-span-2">
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-on-surface mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-primary" />
            Focus Areas (Lowest Topic Mastery)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weakestTopics.map((m) => (
              <div key={m.topic_id} className="p-3.5 bg-surface-container rounded-sm border border-outline-variant/60">
                <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                  <span className="font-medium text-on-surface">{topicMap.get(m.topic_id) || m.topic_id}</span>
                  <span className="font-bold text-primary">{m.score} / 100</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, m.score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Attempt Modal Component */}
      <AttemptModal
        question={recommendation}
        isOpen={isAttemptModalOpen}
        onClose={() => setIsAttemptModalOpen(false)}
        onAttemptSubmitted={() => {
          setIsAttemptModalOpen(false);
          refreshData();
        }}
        onFreezerEarned={() => {
          setShowFreezerToast(true);
        }}
      />

      {/* Streak Freezer Earned Toast Notification */}
      <Toast
        isVisible={showFreezerToast}
        title="Streak Freezer earned!"
        description="You completed 5 consecutive days."
        onClose={() => setShowFreezerToast(false)}
      />
    </AppShell>
  );
}
