
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { AuthContext } from './context';
import { authOperations } from './operations';

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

  // Enhanced two-factor operations
  const enhancedVerifyTwoFactor = async (code: string) => {
    const result = await authOperations.verifyTwoFactor(code);
    if (result.success) {
      setIsTwoFactorEnabled(true);
    }
    return result;
  };

  // Provide the auth context to children
  const value = {
    user,
    session,
    isLoading,
    isTwoFactorEnabled,
    signIn: authOperations.signIn,
    signUp: authOperations.signUp,
    signOut: authOperations.signOut,
    resetPassword: authOperations.resetPassword,
    updatePassword: authOperations.updatePassword,
    signInWithProvider: authOperations.signInWithProvider,
    initiateTwoFactor: authOperations.initiateTwoFactor,
    verifyTwoFactor: enhancedVerifyTwoFactor,
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
