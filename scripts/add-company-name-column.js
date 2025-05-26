// Script to add company_name column to delivery_requests table
const { createClient } = require('@supabase/supabase-js');

// Define hardcoded values from supabase.ts
const supabaseUrl = 'https://joziqntfciyflfsgvsqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemlxbnRmY2l5Zmxmc2d2c3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTYwNDksImV4cCI6MjA2MDQ5MjA0OX0.7j-9MsQNma6N1fnKvFB7wBJReL6PHy_ncwJqDdMeIQA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addCompanyNameColumn() {
  try {
    console.log('Checking delivery_requests table structure...');
    
    // First, execute a raw query to check if the column exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'delivery_requests');
      
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return;
    }
    
    // Check if company_name is in the columns
    const columnExists = columns.some(col => col.column_name === 'company_name');
    
    if (columnExists) {
      console.log('company_name column already exists');
    } else {
      console.log('company_name column does not exist, adding it now...');
      
      // Execute raw SQL to add the column
      const { error: addColumnError } = await supabase.rpc(
        'execute_sql',
        {
          sql: 'ALTER TABLE delivery_requests ADD COLUMN company_name TEXT'
        }
      );
      
      if (addColumnError) {
        console.error('Error adding column:', addColumnError);
      } else {
        console.log('Successfully added company_name column');
      }
    }
    
    // Force refresh schema cache
    console.log('Refreshing schema cache...');
    const { data, error } = await supabase
      .from('delivery_requests')
      .select('id, company_name')
      .limit(1);
      
    if (error) {
      console.error('Error refreshing schema:', error);
    } else {
      console.log('Schema refresh successful!');
      console.log('Sample data:', data);
    }
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Run the function
addCompanyNameColumn(); 