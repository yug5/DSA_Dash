'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getUserProfile, getStreak, getTotalXP } from '@/lib/services/dataService';
import { Profile } from '@/lib/types';
import { Settings, User, Sliders, Shield, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      const p = await getUserProfile();
      const s = await getStreak();
      const x = await getTotalXP();
      setProfile(p);
      setStreakCount(s?.current_streak || 0);
      setXp(x);
    }
    loadData();
  }, []);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-outline-variant gap-4">
          <div>
            <div className="font-mono text-[11px] text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              System Parameters & Preferences
            </div>
            <h1 className="font-display text-display text-on-surface uppercase tracking-tight font-semibold">
              Settings
            </h1>
          </div>
          <div className="font-mono text-xs text-on-surface-variant">
            QUIET CONFIDENCE SPEC V1.0.4
          </div>
        </div>

        {/* Profile Card */}
        <Card className="space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-primary flex items-center">
            <User className="w-4 h-4 mr-2" />
            User Profile Telemetry
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-surface-container p-3.5 rounded-sm border border-outline-variant/40">
              <div className="text-on-surface-variant text-[11px] uppercase">Account Email</div>
              <div className="text-on-surface font-semibold mt-1">{profile?.email || 'user@example.com'}</div>
            </div>

            <div className="bg-surface-container p-3.5 rounded-sm border border-outline-variant/40">
              <div className="text-on-surface-variant text-[11px] uppercase">User Identifier / Name</div>
              <div className="text-on-surface font-semibold mt-1">{profile?.name || 'Algorithm Practitioner'}</div>
            </div>

            <div className="bg-surface-container p-3.5 rounded-sm border border-outline-variant/40">
              <div className="text-on-surface-variant text-[11px] uppercase">Current Active Streak</div>
              <div className="text-[#f2c94c] font-bold mt-1">{streakCount} Days</div>
            </div>

            <div className="bg-surface-container p-3.5 rounded-sm border border-outline-variant/40">
              <div className="text-on-surface-variant text-[11px] uppercase">Accumulated Experience</div>
              <div className="text-primary font-bold mt-1">{xp} XP</div>
            </div>
          </div>
        </Card>

        {/* Practice Preferences */}
        <Card className="space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-primary flex items-center">
            <Sliders className="w-4 h-4 mr-2" />
            Adaptive Algorithm Parameters
          </h3>

          <div className="space-y-3 font-mono text-xs text-on-surface-variant">
            <div className="p-3 bg-surface-container rounded-sm border border-outline-variant/40 flex justify-between items-center">
              <div>
                <div className="text-on-surface font-medium">Difficulty Fit Weighting</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Balancing weak topic boost vs recency score</div>
              </div>
              <Badge variant="primary">ENABLED</Badge>
            </div>

            <div className="p-3 bg-surface-container rounded-sm border border-outline-variant/40 flex justify-between items-center">
              <div>
                <div className="text-on-surface font-medium">Non-Punitive Streak Protection</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Automatic freeze allocation on missed days</div>
              </div>
              <Badge variant="primary">ACTIVE (2 Freezes)</Badge>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
