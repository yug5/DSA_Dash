'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/lib/services/dataService';
import { DSAExperience } from '@/lib/types';
import { Target, Calendar, ArrowRight, Zap, Code2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function OnboardingPage() {
  const router = useRouter();

  const [experience, setExperience] = useState<DSAExperience>('INTERMEDIATE');
  const [dailyTarget, setDailyTarget] = useState<number>(5);
  const [customTarget, setCustomTarget] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState<string>('');

  const targetValue = dailyTarget === 0 ? Number(customTarget) || 1 : dailyTarget;
  const durationValue = durationDays === 0 ? Number(customDays) || 1 : durationDays;
  const calculatedTotalQuestions = targetValue * durationValue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeOnboarding(experience, targetValue, durationValue);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-on-surface">
      <div className="max-w-xl w-full bg-surface-container-low rounded-md border border-outline-variant p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-surface-container-high border border-outline-variant rounded-sm mb-3 text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <div className="font-mono text-xs text-primary uppercase tracking-widest mb-1">
            ALGO_CORE SYSTEM INITIALIZATION
          </div>
          <h1 className="font-display text-display text-2xl font-semibold text-on-surface uppercase tracking-tight">
            Configure Adaptive Parameters
          </h1>
          <p className="font-mono text-xs text-on-surface-variant mt-1.5">
            Calibrate recommendation scoring weights according to your practice baseline.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DSA Experience / Difficulty Tensor */}
          <div>
            <label className="block font-mono text-xs font-semibold text-on-surface mb-2 uppercase tracking-wider">
              1. Select initial difficulty tensor
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { level: 'BEGINNER', label: 'BEGINNER', code: 'O(N^2)', desc: 'New to DSA & foundational arrays' },
                { level: 'INTERMEDIATE', label: 'INTERMEDIATE', code: 'O(N log N)', desc: 'Trees, recursion & binary search' },
                { level: 'ADVANCED', label: 'ADVANCED', code: 'O(1)', desc: 'Graphs, DP & complex algorithms' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.level}
                  onClick={() => setExperience(item.level as DSAExperience)}
                  className={`p-3 text-left rounded-sm border text-xs font-mono transition-all ${
                    experience === item.level
                      ? 'border-primary bg-primary/20 text-on-surface font-bold'
                      : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <div className="text-primary font-bold">{item.code}</div>
                  <div className="font-semibold text-on-surface mt-0.5">{item.label}</div>
                  <div className="text-[10px] text-on-surface-variant mt-1 leading-normal">
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Target */}
          <div>
            <label className="block font-mono text-xs font-semibold text-on-surface mb-2 uppercase tracking-wider">
              2. Set daily throughput threshold
            </label>
            <div className="grid grid-cols-4 gap-3 mb-2">
              {[3, 5, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => {
                    setDailyTarget(num);
                    setCustomTarget('');
                  }}
                  className={`py-2.5 px-3 rounded-sm border text-center font-mono text-xs ${
                    dailyTarget === num
                      ? 'border-primary bg-primary text-on-primary font-bold'
                      : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {num} / DAY
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDailyTarget(0)}
                className={`py-2.5 px-3 rounded-sm border text-center font-mono text-xs ${
                  dailyTarget === 0
                    ? 'border-primary bg-primary text-on-primary font-bold'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                CUSTOM
              </button>
            </div>

            {dailyTarget === 0 && (
              <input
                type="number"
                min="1"
                max="50"
                placeholder="Enter custom daily target"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                className="w-full mt-2 p-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none"
                required
              />
            )}
          </div>

          {/* Goal Duration */}
          <div>
            <label className="block font-mono text-xs font-semibold text-on-surface mb-2 uppercase tracking-wider">
              3. Define evaluation epoch duration
            </label>
            <div className="grid grid-cols-3 gap-3 mb-2">
              {[
                { days: 7, label: '7 DAYS' },
                { days: 30, label: '30 DAYS' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.days}
                  onClick={() => {
                    setDurationDays(item.days);
                    setCustomDays('');
                  }}
                  className={`py-2.5 px-3 rounded-sm border text-center font-mono text-xs ${
                    durationDays === item.days
                      ? 'border-primary bg-primary text-on-primary font-bold'
                      : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDurationDays(0)}
                className={`py-2.5 px-3 rounded-sm border text-center font-mono text-xs ${
                  durationDays === 0
                    ? 'border-primary bg-primary text-on-primary font-bold'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                CUSTOM
              </button>
            </div>

            {durationDays === 0 && (
              <input
                type="number"
                min="1"
                max="365"
                placeholder="Enter custom number of days"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="w-full mt-2 p-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none"
                required
              />
            )}
          </div>

          {/* Configuration Preview */}
          <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/60 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <div className="text-on-surface-variant text-[11px] uppercase">Configuration Compiled</div>
                <div className="font-bold text-on-surface">
                  {targetValue} Qs/day × {durationValue} days
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">{calculatedTotalQuestions}</div>
              <div className="text-[11px] text-on-surface-variant uppercase">Target Questions</div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-on-primary rounded-sm font-mono text-xs font-bold hover:bg-primary-container transition-colors flex items-center justify-center"
          >
            COMPILE CONFIGURATION & LAUNCH
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
