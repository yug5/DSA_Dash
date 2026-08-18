'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getAttempts, getQuestions, getTopics } from '@/lib/services/dataService';
import { Attempt, Question, Topic } from '@/lib/types';
import { History, Filter, CheckCircle2 } from 'lucide-react';

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        const [att, q, t] = await Promise.all([
          getAttempts(),
          getQuestions(),
          getTopics(),
        ]);
        setAttempts(att);
        setQuestions(q);
        setTopics(t);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const questionMap = new Map<string, Question>();
  questions.forEach((q) => questionMap.set(q.id, q));

  const filteredAttempts = attempts.filter((att) => {
    const q = questionMap.get(att.question_id);
    const matchesResult = filterResult === 'ALL' || att.result === filterResult;
    const matchesDifficulty = filterDifficulty === 'ALL' || (q && q.difficulty === filterDifficulty);
    return matchesResult && matchesDifficulty;
  });

  const getDifficultyBadgeVariant = (diff?: string) => {
    if (diff === 'EASY') return 'easy';
    if (diff === 'MEDIUM') return 'medium';
    if (diff === 'HARD') return 'hard';
    return 'default';
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-outline-variant mb-8 gap-4">
        <div>
          <div className="font-mono text-[11px] text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Attempt Telemetry & Performance Logs
          </div>
          <h1 className="font-display text-display text-on-surface uppercase tracking-tight font-semibold">
            Submission History
          </h1>
        </div>
        <div className="font-mono text-xs text-on-surface-variant">
          {attempts.length} TOTAL ATTEMPTS RECORDED
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 font-mono text-xs text-on-surface-variant uppercase tracking-wider">
          <Filter className="w-4 h-4 text-primary" />
          <span>Filter Telemetry:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="font-mono text-xs p-2.5 border border-outline-variant bg-surface-container rounded-sm text-on-surface focus:border-primary outline-none"
          >
            <option value="ALL">All Results</option>
            <option value="SOLVED_INDEPENDENTLY">Solved Independently</option>
            <option value="SOLVED_WITH_HELP">Solved with Help</option>
            <option value="DID_NOT_SOLVE">Didn't Solve</option>
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="font-mono text-xs p-2.5 border border-outline-variant bg-surface-container rounded-sm text-on-surface focus:border-primary outline-none"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="bg-surface-container-low rounded-md border border-outline-variant overflow-hidden">
          {filteredAttempts.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-on-surface-variant">
              No practice attempts recorded matching your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface-container border-b border-outline-variant text-on-surface-variant uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Question Title</th>
                    <th className="p-3.5">Topic</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5">Result</th>
                    <th className="p-3.5">Failure Reason</th>
                    <th className="p-3.5">Time Spent</th>
                    <th className="p-3.5">Mastery Δ</th>
                    <th className="p-3.5">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                  {filteredAttempts.map((att) => {
                    const q = questionMap.get(att.question_id);
                    return (
                      <tr key={att.id} className="hover:bg-surface-container-high/50 transition-colors">
                        <td className="p-3.5 text-on-surface-variant whitespace-nowrap">
                          {new Date(att.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 font-semibold text-on-surface">
                          {q?.title || att.question_id}
                        </td>
                        <td className="p-3.5 text-on-surface-variant">{q?.primary_topic_id || '-'}</td>
                        <td className="p-3.5">
                          <Badge variant={getDifficultyBadgeVariant(q?.difficulty)}>
                            {q?.difficulty || '-'}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-semibold ${
                              att.result === 'SOLVED_INDEPENDENTLY'
                                ? 'text-primary'
                                : att.result === 'SOLVED_WITH_HELP'
                                ? 'text-[#f2c94c]'
                                : 'text-error'
                            }`}
                          >
                            {att.result.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-on-surface-variant">
                          {att.failure_reason ? att.failure_reason.replace(/_/g, ' ') : '-'}
                        </td>
                        <td className="p-3.5 text-on-surface-variant">{att.time_spent} mins</td>
                        <td className="p-3.5 font-bold">
                          <span className={att.mastery_change >= 0 ? 'text-primary' : 'text-error'}>
                            {att.mastery_change >= 0 ? `+${att.mastery_change}` : att.mastery_change}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-on-surface">+{att.xp_earned} XP</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
