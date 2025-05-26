
import { createClient } from '@supabase/supabase-js';

// Use the same values as in the integrations file for consistency
const supabaseUrl = 'https://joziqntfciyflfsgvsqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemlxbnRmY2l5Zmxmc2d2c3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTYwNDksImV4cCI6MjA2MDQ5MjA0OX0.7j-9MsQNma6N1fnKvFB7wBJReL6PHy_ncwJqDdMeIQA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

/**
 * Forces a schema refresh for the delivery_requests table
 * and verifies that required columns exist
 */
export const refreshSchemaCache = async (): Promise<boolean> => {
  try {
    console.log('Refreshing schema cache for delivery_requests table...');
    
    // Force refresh the schema by selecting all columns
    await supabase.from('delivery_requests').select('*').limit(1);
    
    // Verify that key columns exist by attempting a simple select
    const { data, error } = await supabase
      .from('delivery_requests')
      .select('id, pickup_location, delivery_location, package_type, priority, status, requester_name')
      .limit(1);
    
    if (error) {
      console.error('Schema refresh failed:', error);
      return false;
    }
    
    console.log('Schema refresh successful');
    return true;
  } catch (error) {
    console.error('Unexpected error during schema refresh:', error);
    return false;
  }
};
