'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getAICoachAdvice, AICoachAdvice } from '@/lib/services/aiCoachService';
import { ProgressSummary, Topic } from '@/lib/types';
import { Bot, Sparkles, Target, Award } from 'lucide-react';

interface AICoachCardProps {
  summary: ProgressSummary | null;
  weakestTopics: { topic: Topic; score: number }[];
}

export default function AICoachCard({ summary, weakestTopics }: AICoachCardProps) {
  const [advice, setAdvice] = useState<AICoachAdvice | null>(null);

  useEffect(() => {
    async function loadAdvice() {
      const res = await getAICoachAdvice(summary, weakestTopics);
      setAdvice(res);
    }
    loadAdvice();
  }, [summary, weakestTopics]);

  if (!advice) return null;

  return (
    <Card className="border-primary/40 bg-surface-container-low relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-primary" />
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-on-surface">
            AI Pattern & Strategy Coach
          </h3>
        </div>
        <Badge variant="primary">SEPARATE ADVISORY ENGINE</Badge>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <div>
          <h4 className="font-headline-md text-sm font-semibold text-primary">{advice.headline}</h4>
          <p className="text-on-surface-variant mt-1 leading-relaxed">{advice.advice}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-2.5 bg-surface-container rounded-sm border border-outline-variant/40">
            <div className="text-[10px] text-on-surface-variant uppercase flex items-center">
              <Target className="w-3 h-3 mr-1 text-primary" />
              Recommended Focus Pattern
            </div>
            <div className="text-on-surface font-bold mt-0.5">{advice.focusPattern}</div>
          </div>

          <div className="p-2.5 bg-surface-container rounded-sm border border-outline-variant/40">
            <div className="text-[10px] text-on-surface-variant uppercase flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-[#f2c94c]" />
              Telemetry Encouragement
            </div>
            <div className="text-on-surface font-medium mt-0.5">{advice.encouragement}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
