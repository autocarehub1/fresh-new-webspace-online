
import type { User, Session, Provider, AuthError } from '@supabase/supabase-js';

export type AuthContextValue = {
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
