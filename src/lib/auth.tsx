import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session, Provider, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define a type for our auth context
type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isTwoFactorEnabled: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: object, options?: { emailRedirectTo?: string }) => Promise<{ user: User | null, session: Session | null, error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  initiateTwoFactor: () => Promise<{ success: boolean; error?: string }>;
  verifyTwoFactor: (code: string) => Promise<{ success: boolean; error?: string }>;
};

// Create the auth context with a default value
const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  isTwoFactorEnabled: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null, session: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  signInWithProvider: async () => {},
  initiateTwoFactor: async () => ({ success: false }),
  verifyTwoFactor: async () => ({ success: false }),
});

// Export the useAuth hook directly
export const useAuth = () => useContext(AuthContext);

// Export the auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  // Initialize auth state
  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');

    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        // Get current session
        console.log('Getting current session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('Session data:', data);
        
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user || null);
          setIsLoading(false);
          console.log('Auth state initialized with user:', data.session?.user?.id || 'none');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user || null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully');
        }
      }
    });

    // Clean up on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe = true) => {
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
  };

  // Sign up with email and password - completely disable email for drivers
  const signUp = async (email: string, password: string, metadata?: any, options?: { emailRedirectTo?: string }) => {
    try {
      console.log('Signing up with email:', email, 'metadata:', metadata);
      
      // For driver signups, completely bypass Supabase email confirmation
      const isDriverSignup = metadata?.user_type === 'driver';
      
      if (isDriverSignup) {
        console.log('Driver signup detected - using admin create user to bypass email confirmation');
        
        // Use admin API to create user without email confirmation
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: metadata,
          email_confirm: true // Auto-confirm email
        });
        
        if (error) {
          console.error('Admin create user error:', error);
          return { user: null, session: null, error };
        }
        
        console.log('Driver user created successfully via admin API:', data.user);
        return { user: data.user, session: null, error: null };
      }
      
      // For non-driver signups, use normal flow with email confirmation
      const signUpOptions: any = {
        data: metadata
      };

      if (options?.emailRedirectTo !== undefined) {
        const redirectTo = options.emailRedirectTo || `${window.location.origin}/auth/callback`;
        console.log('Using redirect URL for non-driver signup:', redirectTo);
        
        signUpOptions.options = {
          emailRedirectTo: redirectTo
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
      
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Auth signup error:', error);
      return { user: null, session: null, error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
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
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      console.log('Sending password reset for email:', email);
      
      // Get the current domain for redirect URL
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
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
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
  };

  // Sign in with provider
  const signInWithProvider = async (provider: Provider) => {
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
  };

  // Initiate two-factor authentication setup
  const initiateTwoFactor = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock implementation for demo
      console.log('Initiating 2FA setup');
      return { success: true };
    } catch (error) {
      console.error('Error initiating 2FA:', error);
      return { success: false, error: 'Failed to initiate 2FA setup' };
    }
  };

  // Verify two-factor authentication code
  const verifyTwoFactor = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock implementation for demo - accept 123456 as valid code
      console.log('Verifying 2FA code:', code);
      if (code === '123456') {
        setIsTwoFactorEnabled(true);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid verification code' };
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  };

  // Provide the auth context to children
  const value = {
    user,
    session,
    isLoading,
    isTwoFactorEnabled,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithProvider,
    initiateTwoFactor,
    verifyTwoFactor,
  };

  console.log('Auth provider value:', { 
    user: user?.id || null, 
    session: session?.access_token ? '[token available]' : null,
    isLoading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
