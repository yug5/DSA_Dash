'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  sendPasswordResetOtpToken,
  verifyRecoveryOtpToken,
  updateUserPassword,
} from '@/lib/services/authService';
import { Key, Mail, AlertCircle, Zap, ShieldCheck, RefreshCw, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Workflow Steps: 1 = Email Input, 2 = Verify OTP, 3 = Reset Password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Resend Cooldown (60s)
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Send Password Reset OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const result = await sendPasswordResetOtpToken(email);

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to send password reset code.');
      return;
    }

    setStep(2);
    setCooldown(60);
    setInfoMsg(`Password recovery OTP code sent to ${email}.`);
  };

  // Step 2: Verify Recovery OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken || otpToken.trim().length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const result = await verifyRecoveryOtpToken(email, otpToken);

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Invalid or expired OTP token. Please try again.');
      return;
    }

    setStep(3);
    setInfoMsg('OTP verified successfully. Please enter your new password.');
  };

  // Step 3: Set New Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const result = await updateUserPassword(newPassword);

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update password.');
      return;
    }

    setInfoMsg('Password updated successfully! Redirecting to login...');
    setTimeout(() => {
      router.push('/login');
      router.refresh();
    }, 1500);
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const result = await sendPasswordResetOtpToken(email);

    setResendLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Could not resend recovery code.');
      return;
    }

    setCooldown(60);
    setInfoMsg('A new recovery OTP code has been sent to your email.');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-on-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="font-mono text-xs text-primary font-bold px-3 py-1 bg-surface-container-high rounded-sm border border-outline-variant flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            ALGO_CORE RECOVERY
          </div>
        </div>
        <h2 className="mt-4 text-center font-display text-display text-2xl font-semibold text-on-surface tracking-tight uppercase">
          {step === 1 && 'Reset Password'}
          {step === 2 && 'Verify Recovery OTP'}
          {step === 3 && 'Set New Password'}
        </h2>
        <p className="mt-1.5 text-center font-mono text-xs text-on-surface-variant">
          {step === 1 && 'Enter registered email to receive OTP recovery token'}
          {step === 2 && `Enter 6-digit recovery code sent to ${email}`}
          {step === 3 && 'Establish new authentication credentials'}
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

          {infoMsg && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-sm flex items-center font-mono text-xs text-primary">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-on-primary rounded-sm font-mono text-xs font-bold hover:bg-primary-container transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'SENDING OTP...' : 'SEND RECOVERY OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: Verify Recovery OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                  6-Digit Recovery OTP Code
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-sm tracking-widest text-center text-on-surface focus:border-primary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-on-primary rounded-sm font-mono text-xs font-bold hover:bg-primary-container transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {loading ? 'VERIFYING CODE...' : 'VERIFY RECOVERY OTP'}
              </button>

              <div className="pt-2 flex items-center justify-between font-mono text-xs text-on-surface-variant border-t border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="hover:text-on-surface transition-colors flex items-center"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Edit Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || resendLoading}
                  className="font-bold text-primary hover:underline flex items-center disabled:opacity-40"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-outline-variant bg-surface-container rounded-sm font-mono text-xs text-on-surface focus:border-primary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-on-primary rounded-sm font-mono text-xs font-bold hover:bg-primary-container transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Key className="w-4 h-4 mr-2" />
                {loading ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD & LOGIN'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center font-mono text-xs text-on-surface-variant">
            Remembered your credentials?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              BACK TO SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
