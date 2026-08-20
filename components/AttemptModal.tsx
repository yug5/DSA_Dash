'use client';

import { useState } from 'react';
import {
  AttemptResult,
  FailureReason,
  QuestionRecommendation,
} from '@/lib/types';
import { recordQuestionAttempt, getNextRecommendation } from '@/lib/services/dataService';
import { getDailyMotivationMessage } from '@/lib/services/motivationService';
import { CheckCircle2, AlertCircle, Award, Flame, ArrowRight, ExternalLink, Clock, Loader2 } from 'lucide-react';

interface AttemptModalProps {
  question: QuestionRecommendation;
  isOpen: boolean;
  onClose: () => void;
  onAttemptSubmitted: () => void;
}

export default function AttemptModal({
  question,
  isOpen,
  onClose,
  onAttemptSubmitted,
}: AttemptModalProps) {
  const [result, setResult] = useState<AttemptResult>('SOLVED_INDEPENDENTLY');
  const [failureReason, setFailureReason] = useState<FailureReason>('DID_NOT_KNOW_APPROACH');
  const [timeSpent, setTimeSpent] = useState<number>(question.estimated_time || 20);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [submittedData, setSubmittedData] = useState<{
    masteryChange: number;
    xpEarned: number;
    streak: number;
    questionsCompleted: number;
    target: number;
    nextRecommendation: QuestionRecommendation | null;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent double submit

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await recordQuestionAttempt({
        questionId: question.id,
        result,
        failureReason: result === 'DID_NOT_SOLVE' ? failureReason : null,
        usedHelp: result === 'SOLVED_WITH_HELP',
        timeSpent: Number(timeSpent) || 15,
        notes,
      });

      // Show success immediately — nextRecommendation loads in the background
      setSubmittedData({
        masteryChange: res.masteryChange,
        xpEarned: res.xpEarned,
        streak: res.streak.current_streak,
        questionsCompleted: res.dailyActivity.questions_completed,
        target: res.dailyActivity.target,
        nextRecommendation: null, // will fill in once loaded
      });

      onAttemptSubmitted();

      // Fetch recommendation in background after success screen is shown
      getNextRecommendation()
        .then((rec) => {
          setSubmittedData((prev) => prev ? { ...prev, nextRecommendation: rec } : prev);
        })
        .catch(() => null); // non-critical — don't let it break the success state

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save attempt. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSubmittedData(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-low border border-outline-variant rounded-md w-full max-w-lg p-6 shadow-2xl my-8 text-on-surface">
        {!submittedData ? (
          <div>
            <div className="flex justify-between items-start mb-4 border-b border-outline-variant pb-3">
              <div>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-sm bg-surface-container-high text-primary uppercase">
                  {question.difficulty}
                </span>
                <h3 className="text-lg font-headline-md font-semibold text-on-surface mt-1.5">{question.title}</h3>
                <p className="text-xs font-mono text-on-surface-variant">{question.pattern || 'DSA Practice'}</p>
              </div>
              <button
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="text-on-surface-variant hover:text-on-surface text-xl font-bold px-1 disabled:opacity-40"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Attempt Result */}
              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-2 uppercase tracking-wider">
                  Result
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'SOLVED_INDEPENDENTLY', label: 'Solved Independently' },
                    { key: 'SOLVED_WITH_HELP', label: 'Solved with Help' },
                    { key: 'DID_NOT_SOLVE', label: "Didn't Solve" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      disabled={isSubmitting}
                      onClick={() => setResult(item.key as AttemptResult)}
                      className={`p-2.5 rounded-sm text-xs font-mono border text-center transition-all disabled:opacity-50 ${
                        result === item.key
                          ? 'border-primary bg-primary text-on-primary font-bold'
                          : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Failure Reason (if didn't solve) */}
              {result === 'DID_NOT_SOLVE' && (
                <div className="bg-error-container/20 border border-error/30 p-3 rounded-sm">
                  <label className="block text-xs font-mono text-error mb-1 uppercase tracking-wider">
                    What was the main blocker?
                  </label>
                  <select
                    value={failureReason}
                    disabled={isSubmitting}
                    onChange={(e) => setFailureReason(e.target.value as FailureReason)}
                    className="w-full text-xs font-mono p-2 border border-outline-variant rounded-sm bg-surface-container text-on-surface focus:border-primary outline-none disabled:opacity-50"
                  >
                    <option value="DID_NOT_KNOW_APPROACH">Didn't know the approach / pattern</option>
                    <option value="DID_NOT_KNOW_CONCEPT">Didn't know underlying concept</option>
                    <option value="DID_NOT_UNDERSTAND">Didn't understand problem statement</option>
                    <option value="TOO_DIFFICULT">Problem was too difficult</option>
                    <option value="RAN_OUT_OF_TIME">Ran out of time</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              )}

              {/* Time Spent */}
              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1 uppercase tracking-wider">
                  Time Spent (Minutes)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={timeSpent}
                    disabled={isSubmitting}
                    onChange={(e) => setTimeSpent(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-1.5 border border-outline-variant bg-surface-container rounded-sm text-xs font-mono text-on-surface focus:border-primary outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono text-on-surface-variant mb-1 uppercase tracking-wider">
                  Notes / Takeaway (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Key insight or mistake to remember..."
                  value={notes}
                  disabled={isSubmitting}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-outline-variant bg-surface-container rounded-sm text-xs font-mono text-on-surface focus:border-primary outline-none disabled:opacity-50"
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="p-3 bg-error-container/20 border border-error/30 rounded-sm flex items-center font-mono text-xs text-error">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-outline-variant text-on-surface-variant hover:text-on-surface text-xs font-mono rounded-sm hover:bg-surface-container-high transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-mono font-bold rounded-sm hover:bg-primary-container transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Attempt & Update Stats'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* RESULT SUMMARY SCREEN */
          <div className="text-center py-2 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 text-primary rounded-full mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-headline-md font-bold text-on-surface">Attempt Recorded!</h3>

            {/* Motivation Message */}
            <div className="bg-surface-container p-3 rounded-sm border border-outline-variant text-xs font-mono text-on-surface-variant">
              "{getDailyMotivationMessage(submittedData.target, submittedData.questionsCompleted)}"
            </div>

            {/* Metrics Impact Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-surface-container rounded-sm border border-outline-variant">
                <div className="text-[11px] font-mono text-on-surface-variant uppercase">Mastery</div>
                <div
                  className={`text-lg font-mono font-bold ${
                    submittedData.masteryChange >= 0 ? 'text-primary' : 'text-error'
                  }`}
                >
                  {submittedData.masteryChange >= 0 ? `+${submittedData.masteryChange}` : submittedData.masteryChange}
                </div>
              </div>

              <div className="p-3 bg-surface-container rounded-sm border border-outline-variant">
                <div className="text-[11px] font-mono text-on-surface-variant uppercase">XP Earned</div>
                <div className="text-lg font-mono font-bold text-on-surface">+{submittedData.xpEarned} XP</div>
              </div>

              <div className="p-3 bg-surface-container rounded-sm border border-outline-variant">
                <div className="text-[11px] font-mono text-on-surface-variant uppercase">Streak</div>
                <div className="text-lg font-mono font-bold text-[#f2c94c] flex items-center justify-center">
                  <Flame className="w-4 h-4 mr-1 fill-[#f2c94c]" />
                  {submittedData.streak}d
                </div>
              </div>
            </div>

            {/* Next Recommended Problem Preview */}
            <div className="bg-surface-container p-4 rounded-sm border border-outline-variant text-left min-h-[72px]">
              {submittedData.nextRecommendation ? (
                <>
                  <div className="text-[11px] font-mono text-primary uppercase tracking-wider mb-1">
                    Next Recommendation Prepared
                  </div>
                  <div className="text-sm font-semibold text-on-surface">
                    {submittedData.nextRecommendation.title}
                  </div>
                  <div className="text-xs font-mono text-on-surface-variant mt-1">
                    Topic: {submittedData.nextRecommendation.primary_topic_id} • Difficulty: {submittedData.nextRecommendation.difficulty}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Preparing next recommendation...
                </div>
              )}
            </div>

            <button
              onClick={handleModalClose}
              className="w-full py-2.5 bg-primary text-on-primary rounded-sm font-mono font-bold text-xs hover:bg-primary-container transition-colors flex items-center justify-center"
            >
              Continue to Dashboard / Next Problem
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
