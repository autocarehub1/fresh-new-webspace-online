
import { supabase } from '@/lib/supabase';

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Use a simple query to test the connection instead of accessing protected properties
    const { data, error } = await supabase.from('delivery_requests').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};

export const checkSupabaseSetup = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    const connected = await checkSupabaseConnection();
    return { connected };
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
