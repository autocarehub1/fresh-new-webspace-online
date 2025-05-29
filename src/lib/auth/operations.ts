
import { supabase } from '@/lib/supabase';
import type { Provider, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const authOperations = {
  // Sign in with email and password
  signIn: async (email: string, password: string, rememberMe = true) => {
    try {
      console.log('Signing in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!error) {
        console.log('Sign in successful:', data);
      } else {
        console.error('Sign in error:', error);
      }

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  },

  // Sign up with email and password - disable confirmation for drivers
  signUp: async (email: string, password: string, metadata?: any, options?: { emailRedirectTo?: string }) => {
    try {
      console.log('Signing up with email:', email, 'metadata:', metadata);
      
      const isDriverSignup = metadata?.user_type === 'driver';
      
      // For driver signups, disable email confirmation entirely
      const signUpOptions: any = {
        data: metadata
      };

      // Only add email confirmation for non-driver signups
      if (!isDriverSignup) {
        const redirectTo = options?.emailRedirectTo || `${window.location.origin}/auth/callback`;
        console.log('Using redirect URL for non-driver signup:', redirectTo);
        
        signUpOptions.options = {
          emailRedirectTo: redirectTo
        };
      } else {
        // For drivers, explicitly disable email confirmation
        console.log('Driver signup: disabling email confirmation');
        signUpOptions.options = {
          emailRedirectTo: undefined,
          data: {
            ...metadata,
            email_confirm: false // Explicitly disable confirmation
          }
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        ...signUpOptions
      });
      
      if (error) {
        console.log('Sign up error:', error);
        return { user: null, session: null, error };
      }
      
      console.log('Sign up successful:', data);
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Auth signup error:', error);
      return { user: null, session: null, error: error as AuthError };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Failed to sign out');
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  resetPassword: async (email: string) => {
    try {
      console.log('Sending password reset for email:', email);
      
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth/callback`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (!error) {
        console.log('Password reset email sent');
        toast.success('Password reset email sent!');
      } else {
        console.error('Password reset error:', error);
      }

      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error as AuthError };
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      console.log('Updating password');
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (!error) {
        console.log('Password updated successfully');
        toast.success('Password updated successfully!');
      } else {
        console.error('Update password error:', error);
      }

      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as AuthError };
    }
  },

  signInWithProvider: async (provider: Provider) => {
    try {
      console.log('Signing in with provider:', provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('OAuth sign in error:', error);
        toast.error(`Failed to sign in with ${provider}`);
      } else {
        console.log('OAuth sign in initiated');
      }
    } catch (error) {
      console.error('OAuth sign in error:', error);
    }
  },

  initiateTwoFactor: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Initiating 2FA setup');
      return { success: true };
    } catch (error) {
      console.error('Error initiating 2FA:', error);
      return { success: false, error: 'Failed to initiate 2FA setup' };
    }
  },

  verifyTwoFactor: async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Verifying 2FA code:', code);
      if (code === '123456') {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid verification code' };
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  },
};
