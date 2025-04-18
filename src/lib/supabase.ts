
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback empty strings to prevent runtime errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client if environment variables are missing
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  
  // Create a mock client that will show appropriate errors when methods are called
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') })
    },
    from: () => ({
      select: () => ({
        order: () => ({
          then: () => Promise.reject(new Error('Supabase not configured'))
        })
      })
    })
  };
} else {
  // Create the real Supabase client if environment variables are present
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
