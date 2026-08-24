import { createClient } from '@/lib/supabase/client';

export interface AuthOperationResult {
  success: boolean;
  error?: string;
}

/**
 * Initiates user registration with email and password.
 * Triggers Supabase OTP verification token via email.
 */
export async function registerAccount(
  email: string,
  password: string,
  name: string
): Promise<AuthOperationResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      console.error('[Auth Debug] signUp error:', error.message);
      return { success: false, error: error.message };
    }

    // Supabase returns user with identities: [] if the user already exists in auth.users
    // Supabase suppresses email sending for existing accounts to prevent user enumeration
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      console.warn('[Auth Debug] Account already exists for email:', email);
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in or use Forgot Password.',
      };
    }

    console.log('[Auth Debug] signUp request accepted by Supabase for user ID:', data.user?.id);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
    console.error('[Auth Debug] signUp exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Verifies 6-digit OTP token for Signup or Email verification.
 */
export async function verifySignupOtpToken(
  email: string,
  token: string
): Promise<AuthOperationResult> {
  try {
    const supabase = createClient();
    // Try 'signup' first, fallback to 'email' if required
    let { error } = await supabase.auth.verifyOtp({
      email,
      token: token.trim(),
      type: 'signup',
    });

    if (error && error.message.toLowerCase().includes('type')) {
      const fallback = await supabase.auth.verifyOtp({
        email,
        token: token.trim(),
        type: 'email',
      });
      error = fallback.error;
    }

    if (error) {
      console.error('[Auth Debug] verifyOtp error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Auth Debug] verifyOtp success for:', email);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify OTP. Please try again.';
    console.error('[Auth Debug] verifyOtp exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Resends Signup OTP to user email with error handling.
 */
export async function resendSignupOtpToken(email: string): Promise<AuthOperationResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      console.error('[Auth Debug] resendOtp error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Auth Debug] resendOtp request accepted for:', email);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resend OTP code.';
    console.error('[Auth Debug] resendOtp exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Sends Password Recovery OTP to user email.
 */
export async function sendPasswordResetOtpToken(email: string): Promise<AuthOperationResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send password reset code.';
    return { success: false, error: message };
  }
}

/**
 * Verifies 6-digit recovery OTP for Password Reset.
 */
export async function verifyRecoveryOtpToken(
  email: string,
  token: string
): Promise<AuthOperationResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: token.trim(),
      type: 'recovery',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid or expired OTP token.';
    return { success: false, error: message };
  }
}

/**
 * Updates user password once recovery session is active.
 */
export async function updateUserPassword(newPassword: string): Promise<AuthOperationResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update password.';
    return { success: false, error: message };
  }
}
