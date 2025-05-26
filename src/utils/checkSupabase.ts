import { supabase } from '@/lib/supabase';

// This file is used to check the Supabase configuration and table structure
export async function checkSupabaseSetup() {
  console.log('==== SUPABASE CONFIGURATION CHECK ====');
  console.log('Supabase URL:', supabase.supabaseUrl);
  
  // Check authentication
  const { data: authData, error: authError } = await supabase.auth.getSession();
  console.log('Auth session check:', authError ? 'ERROR' : 'OK');
  if (authError) {
    console.error('Auth error:', authError);
  } else {
    console.log('Session exists:', !!authData.session);
  }
  
  // Check database tables
  try {
    // List all tables (requires permissions)
    console.log('Attempting to list all tables...');
    const { data: tables, error: tablesError } = await supabase.rpc('list_tables');
    
    if (tablesError) {
      console.error('Could not list tables:', tablesError);
      console.log('This likely means your account lacks permissions to run RPC functions');
    } else {
      console.log('Available tables:', tables);
    }
  } catch (e) {
    console.error('Error checking tables:', e);
  }
  
  // Try to access specific tables we need
  const tablesToCheck = [
    'driver_profiles',
    'delivery_requests',
    'users'
  ];
  
  for (const table of tablesToCheck) {
    console.log(`Checking table '${table}'...`);
    const { data, error } = await supabase
      .from(table)
      .select('count(*)', { count: 'exact', head: true });
      
    if (error) {
      console.error(`Error accessing '${table}' table:`, error);
      console.log(`Table status: ${error.message.includes('does not exist') ? 'MISSING' : 'PERMISSION ERROR'}`);
    } else {
      console.log(`Table '${table}' exists and is accessible.`);
      console.log('Row count:', data);
    }
  }
  
  console.log('==== END OF SUPABASE CHECK ====');
} 