// Script to add company_name column to delivery_requests table
import { createClient } from '@supabase/supabase-js';

// Define hardcoded values from supabase.ts
const supabaseUrl = 'https://joziqntfciyflfsgvsqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemlxbnRmY2l5Zmxmc2d2c3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTYwNDksImV4cCI6MjA2MDQ5MjA0OX0.7j-9MsQNma6N1fnKvFB7wBJReL6PHy_ncwJqDdMeIQA';

// Create Supabase client with admin capabilities
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  try {
    console.log('Attempting to add company_name column...');
    
    // Execute a direct SQL query
    const { data, error } = await supabase.rpc('executeSQL', {
      sql: "ALTER TABLE IF EXISTS public.delivery_requests ADD COLUMN IF NOT EXISTS company_name TEXT"
    });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try a different approach with raw SQL
      console.log('Trying alternative approach...');
      
      // Instead, let's just insert data with the company_name field to see if it already exists
      const { error: insertError } = await supabase
        .from('delivery_requests')
        .upsert([
          { 
            id: 'TEST-COL-CHECK',
            company_name: 'Test Company',
            pickup_location: 'Test Location',
            delivery_location: 'Test Destination',
            status: 'pending',
            priority: 'normal'
          }
        ]);
      
      if (insertError) {
        if (insertError.message.includes('company_name')) {
          console.error('Column definitely does not exist:', insertError.message);
        } else {
          console.error('Other error with insert:', insertError);
        }
      } else {
        console.log('Column appears to exist since test insert succeeded');
        
        // Delete test record
        await supabase.from('delivery_requests').delete().eq('id', 'TEST-COL-CHECK');
      }
    } else {
      console.log('SQL executed successfully:', data);
    }
    
    // Force schema cache refresh
    console.log('Refreshing schema cache...');
    const { data: refreshData, error: refreshError } = await supabase
      .from('delivery_requests')
      .select('*')
      .limit(1);
    
    if (refreshError) {
      console.error('Schema refresh error:', refreshError);
    } else {
      console.log('Schema refreshed, columns:', refreshData.length > 0 ? Object.keys(refreshData[0]) : 'No data');
    }
    
  } catch (e) {
    console.error('Script error:', e);
  }
}

main(); 