import { createClient } from '@supabase/supabase-js';

// Define hardcoded values for development to ensure the application always has these values
const supabaseUrl = 'https://joziqntfciyflfsgvsqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemlxbnRmY2l5Zmxmc2d2c3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTYwNDksImV4cCI6MjA2MDQ5MjA0OX0.7j-9MsQNma6N1fnKvFB7wBJReL6PHy_ncwJqDdMeIQA';

// Create Supabase client with explicit schema caching options
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || supabaseUrl,
  import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: { 'Cache-Control': 'no-cache' }
    }
  }
);

// Function to check if we have a valid session
export const checkSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error);
      return false;
    }
    return !!session;
  } catch (error) {
    console.error('Unexpected error checking session:', error);
    return false;
  }
};

// DEV ONLY: Function to manually sign up and verify a user in development
// This would NEVER be in production code
export const devSignUpAndVerify = async (email: string, password: string) => {
  try {
    console.log('DEV MODE: Bypassing email verification for:', email);
    
    // First check if user already exists
    const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (!userError && userData.user) {
      console.log('DEV MODE: User already exists, using existing account');
      return { 
        user: userData.user, 
        success: true,
        message: 'DEV MODE: Logged in with existing account'
      };
    }
    
    // If user doesn't exist or password is wrong, create a new account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error('DEV sign up error:', signUpError);
      return { error: signUpError, success: false };
    }
    
    // In development, provide a direct login option without email verification
    console.log('DEV MODE: User registration complete, attempting immediate login');
    
    // For development, we immediately try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        console.log('DEV MODE: Email verification would be required in production');
        
        // This is a DEV ONLY hack - to help development without requiring admin API
        // Return instruction to use the dev interface to continue registration
        return { 
          message: 'DEV MODE: Use the "Skip Email Verification" button to continue', 
          success: true,
          requiresDevBypass: true
        };
      }
      
      console.error('DEV sign in error:', signInError);
      return { error: signInError, success: false };
    }
    
    return { 
      user: signInData?.user || signUpData?.user, 
      success: true,
      message: 'DEV MODE: User created and signed in'
    };
    
  } catch (error) {
    console.error('DEV verification error:', error);
    return { error, success: false };
  }
};

// Function to force schema cache refresh
export const refreshSchemaCache = async () => {
  try {
    console.log('Forcing schema cache refresh...');
    
    // Clear internal cache if it exists
    // @ts-ignore - accessing internal cache property
    if (supabase.rest?.cache) {
      // @ts-ignore - accessing internal cache property
      supabase.rest.cache.clear();
      console.log('Internal client cache cleared.');
    }
    
    // Attempt to refresh schema by making a simple query
    const { error } = await supabase
      .from('delivery_requests')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Schema refresh failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error during schema refresh:', error);
    return false;
  }
};

// Function to check and create required tables
export const verifyRequiredTables = async () => {
  console.log('Verifying required database tables...');
  
  try {
    // Check if driver_profiles table exists
    const { error: checkError } = await supabase
      .from('driver_profiles')
      .select('id')
      .limit(1);
      
    if (checkError) {
      if (checkError.message?.includes('does not exist')) {
        console.warn('driver_profiles table does not exist. This is expected in development if the database is not set up.');
        
        // For development, we'll add a fallback mechanism instead of trying to create tables
        // Creating tables should be done through migrations in a real app
        console.log('Using local storage fallback for development');
        return false;
      }
      
      console.error('Error checking driver_profiles table:', checkError);
      return false;
    }
    
    console.log('driver_profiles table exists');
    return true;
  } catch (error) {
    console.error('Error verifying required tables:', error);
    return false;
  }
};

// Initialize schema cache immediately
console.log('Initial schema refresh call...');
refreshSchemaCache().then(success => {
  console.log('Initial schema refresh completed. Success:', success);
  if (success) {
    verifyRequiredTables().then(tablesOk => {
      console.log('Tables verification completed. Success:', tablesOk);
    });
  }
});

// Also refresh schema after a small delay
setTimeout(() => {
  console.log('Delayed schema refresh call from supabase.ts setup...');
  refreshSchemaCache().then(success => {
    console.log('Delayed schema refresh completed. Success:', success);
  });
}, 2500); // Increased delay slightly
