'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import AttemptModal from '@/components/AttemptModal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getQuestions, getTopics, getNextRecommendation } from '@/lib/services/dataService';
import { Question, QuestionRecommendation, Topic } from '@/lib/types';
import { ExternalLink, CheckCircle2, Filter, Code2, Sparkles } from 'lucide-react';

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeQuestion, setActiveQuestion] = useState<QuestionRecommendation | null>(null);
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [q, t, rec] = await Promise.all([
          getQuestions(),
          getTopics(),
          getNextRecommendation(),
        ]);
        setQuestions(q);
        setTopics(t);
        setActiveQuestion(rec);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesTopic = selectedTopic === 'ALL' || q.primary_topic_id === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    return matchesTopic && matchesDifficulty;
  });

  const handleOpenAttempt = (q: Question) => {
    setActiveQuestion(q as QuestionRecommendation);
    setIsAttemptModalOpen(true);
  };

  const getDifficultyBadgeVariant = (diff: string) => {
    if (diff === 'EASY') return 'easy';
    if (diff === 'MEDIUM') return 'medium';
    return 'hard';
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-outline-variant mb-8 gap-4">
        <div>
          <div className="font-mono text-[11px] text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            Problem Catalog & Practice Environment
          </div>
          <h1 className="font-display text-display text-on-surface uppercase tracking-tight font-semibold">
            Practice Workspace
          </h1>
        </div>
        <div className="font-mono text-xs text-on-surface-variant">
          MANUAL SELECTION OR ADAPTIVE FLOW
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 font-mono text-xs text-on-surface-variant uppercase tracking-wider">
          <Filter className="w-4 h-4 text-primary" />
          <span>Filter Parameters:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Topic Selector */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="font-mono text-xs p-2.5 border border-outline-variant bg-surface-container rounded-sm text-on-surface focus:border-primary outline-none"
          >
            <option value="ALL">All Topics ({topics.length})</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Difficulty Selector */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="font-mono text-xs p-2.5 border border-outline-variant bg-surface-container rounded-sm text-on-surface focus:border-primary outline-none"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Skeleton key={n} className="h-44 w-full" />
          ))}
        </div>
      ) : (
        /* Questions Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((q) => (
            <Card key={q.id} className="flex flex-col justify-between hover:border-outline transition-colors">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant={getDifficultyBadgeVariant(q.difficulty)}>
                    {q.difficulty}
                  </Badge>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {q.estimated_time} MINS
                  </span>
                </div>
                <h3 className="font-headline-md text-base font-semibold text-on-surface mb-1.5">
                  {q.title}
                </h3>
                <div className="font-mono text-xs text-on-surface-variant mb-4">
                  TOPIC: <strong className="text-on-surface font-medium">{q.primary_topic_id}</strong>
                  {q.pattern && <span> • {q.pattern}</span>}
                </div>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-outline-variant/60">
                <a
                  href={q.leetcode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-surface-container-high border border-outline-variant/60 text-on-surface font-mono text-xs font-medium rounded-sm hover:bg-surface-bright transition-colors flex items-center justify-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  LEETCODE
                </a>
                <button
                  onClick={() => handleOpenAttempt(q)}
                  className="flex-1 py-2 px-3 bg-primary text-on-primary font-mono text-xs font-bold rounded-sm hover:bg-primary-container transition-colors flex items-center justify-center"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  REPORT RESULT
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Attempt Modal */}
      {activeQuestion && (
        <AttemptModal
          question={activeQuestion}
          isOpen={isAttemptModalOpen}
          onClose={() => setIsAttemptModalOpen(false)}
          onAttemptSubmitted={() => {
            setIsAttemptModalOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}
