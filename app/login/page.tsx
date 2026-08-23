'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogIn, Key, Mail, AlertCircle, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check whether this user has completed onboarding.
      // Read only 2 lightweight columns — avoids fetching the full profile.
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('onboarding_completed, dsa_experience')
        .eq('id', data.user.id)
        .maybeSingle();

      const onboardingDone =
        profileRow?.onboarding_completed === true ||
        profileRow?.dsa_experience != null;

      setLoading(false);
      router.refresh();

      if (!onboardingDone) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    setLoading(false);
    router.push('/dashboard');
    router.refresh();
  };


  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-on-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="font-mono text-xs text-primary font-bold px-3 py-1 bg-surface-container-high rounded-sm border border-outline-variant flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            ALGO_CORE v1.0.4
          </div>
        </div>
        <h2 className="mt-4 text-center font-display text-display text-2xl font-semibold text-on-surface tracking-tight uppercase">
          System Authentication
        </h2>
        <p className="mt-1.5 text-center font-mono text-xs text-on-surface-variant">
          Adaptive DSA Telemetry & Guidance Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container-low py-8 px-6 border border-outline-variant rounded-md shadow-2xl">
          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container/20 border border-error/30 rounded-sm flex items-center font-mono text-xs text-error">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="solver@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="font-mono text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary rounded-sm font-mono text-xs font-bold hover:bg-primary-container transition-colors flex items-center justify-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'AUTHENTICATING...' : 'SIGN IN TO ALGO_CORE'}
            </button>
          </form>

          <div className="mt-6 text-center font-mono text-xs text-on-surface-variant">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              REGISTER ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
