
import { createContext } from 'react';
import type { AuthContextValue } from './types';

export const AuthContext = createContext<AuthContextValue>({
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
