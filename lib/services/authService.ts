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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify OTP. Please try again.';
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resend OTP code.';
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
