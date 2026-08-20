'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getActiveGoal, updateGoalTarget, getTopics } from '@/lib/services/dataService';
import { calculateGoalProjection } from '@/lib/services/goalService';
import { Goal, Topic } from '@/lib/types';
import { Target, Calendar, Award, Edit3, ArrowRight, Loader2, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import TopicSelector from '@/components/TopicSelector';

export default function GoalsPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTarget, setNewTarget] = useState<number>(5);
  const [newDays, setNewDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [active, topics] = await Promise.all([getActiveGoal(), getTopics()]);
        setGoal(active);
        setAvailableTopics(topics);

        const allIds = topics.map((t) => t.id);
        if (active) {
          setNewTarget(active.daily_target);
          if (active.selected_topics && Array.isArray(active.selected_topics) && active.selected_topics.length > 0) {
            setSelectedTopicIds(active.selected_topics);
          } else {
            setSelectedTopicIds(allIds);
          }
        } else {
          setSelectedTopicIds(allIds);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!goal) return null;

  const projection = calculateGoalProjection(
    goal.total_completed,
    goal.start_date,
    goal.end_date
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (selectedTopicIds.length === 0) {
      setSaveError('Select at least one topic to continue.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateGoalTarget(newTarget, newDays, selectedTopicIds);
      setGoal(updated);
      setIsEditing(false);
    } catch {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-outline-variant mb-8 gap-4">
          <div>
            <div className="font-mono text-[11px] text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Target Tracking & Pace Engineering
            </div>
            <h1 className="font-display text-display text-on-surface uppercase tracking-tight font-semibold">
              Goals & Schedule
            </h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="font-mono text-xs inline-flex items-center px-3.5 py-2 bg-surface-container-high border border-outline-variant rounded-sm text-on-surface hover:bg-surface-bright transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 mr-2 text-primary" />
            {isEditing ? 'CANCEL EDIT' : 'MODIFY ACTIVE GOAL'}
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card className="mb-6 space-y-4 border-primary/40">
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-primary">
              Update Practice Parameters
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                  Daily Target Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newTarget}
                  onChange={(e) => setNewTarget(Number(e.target.value))}
                  className="w-full p-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={newDays}
                  onChange={(e) => setNewDays(Number(e.target.value))}
                  className="w-full p-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="bg-surface-container p-3 rounded-sm text-xs font-mono text-on-surface-variant border border-outline-variant/60">
                New Expected Total Target: <strong className="text-primary font-bold">{newTarget * newDays} questions</strong>
              </div>

              {/* Topic Selection */}
              <div className="pt-3 border-t border-outline-variant/60">
                <TopicSelector
                  topics={availableTopics}
                  selectedTopicIds={selectedTopicIds}
                  onChange={setSelectedTopicIds}
                  disabled={isSaving}
                />
              </div>

              {saveError && (
                <div className="p-3 bg-error-container/20 border border-error/30 rounded-sm flex items-center font-mono text-xs text-error">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving || selectedTopicIds.length === 0}
                className="py-2.5 px-4 bg-primary text-on-primary rounded-sm font-mono text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'SAVE NEW GOAL PARAMETERS'
                )}
              </button>
            </form>
          </Card>
        )}

        {/* Main Goal Details Card */}
        <Card className="space-y-6">
          <div className="flex justify-between items-start border-b border-outline-variant pb-4">
            <div>
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
                Active Daily Target
              </span>
              <div className="font-mono font-bold text-3xl text-on-surface mt-1">
                {goal.daily_target} <span className="text-primary text-base font-normal">Questions / Day</span>
              </div>
              <div className="font-mono text-xs text-on-surface-variant mt-1.5">
                Period: {goal.start_date} → {goal.end_date}
              </div>
            </div>
            <Badge variant="primary">{goal.status}</Badge>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between font-mono text-xs text-on-surface-variant mb-2">
              <span>Goal Completion Progress</span>
              <span className="font-bold text-on-surface">
                {goal.total_completed} / {goal.total_target} Qs (
                {Math.round((goal.total_completed / goal.total_target) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((goal.total_completed / goal.total_target) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Projection Grid */}
          <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/60">
            <h4 className="font-mono text-xs font-bold text-primary uppercase tracking-wider mb-3">
              Telemetry Pace Projections
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-surface-container-high/40 p-3 rounded-sm border border-outline-variant/30">
                <div className="text-on-surface-variant">Days Elapsed</div>
                <div className="text-lg font-bold text-on-surface mt-1">{projection.daysElapsed} / {projection.totalDays}d</div>
              </div>
              <div className="bg-surface-container-high/40 p-3 rounded-sm border border-outline-variant/30">
                <div className="text-on-surface-variant">Current Daily Pace</div>
                <div className="text-lg font-bold text-on-surface mt-1">{projection.currentDailyAverage} Qs / day</div>
              </div>
              <div className="bg-surface-container-high/40 p-3 rounded-sm border border-outline-variant/30">
                <div className="text-on-surface-variant">Projected Total</div>
                <div className="text-lg font-bold text-primary mt-1">{projection.projectedTotal} Qs</div>
              </div>
            </div>
          </div>

          {/* Selected Topics Summary Card */}
          <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/60 font-mono text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-primary font-bold uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Selected Practice Topics</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-bold">
                {goal.selected_topics && goal.selected_topics.length > 0
                  ? `${goal.selected_topics.length} / ${availableTopics.length} selected`
                  : `All Topics (${availableTopics.length}/${availableTopics.length})`}
              </span>
            </div>
            <p className="text-on-surface-variant text-[11px] mb-3">
              Your adaptive practice engine will only select questions matching these topics.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableTopics
                .filter((t) => !goal.selected_topics || goal.selected_topics.length === 0 || goal.selected_topics.includes(t.id))
                .map((topic) => (
                  <span
                    key={topic.id}
                    className="px-2 py-0.5 rounded-sm bg-surface-container-high border border-outline-variant text-[11px] text-on-surface"
                  >
                    {topic.name}
                  </span>
                ))}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
