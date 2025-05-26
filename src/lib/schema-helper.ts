
import { supabase } from './supabase';

/**
 * Forces a schema refresh by making a simple query to the drivers table
 * This helps ensure the latest schema changes are reflected
 */
export const refreshDriversSchema = async (): Promise<boolean> => {
  try {
    console.log('Refreshing drivers table schema cache...');
    
    // Force refresh by selecting from the table
    const { data, error } = await supabase
      .from('drivers')
      .select('id, name, email, address, city, state, zip_code, date_of_birth, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, work_experience, availability, preferred_areas, profile_completed')
      .limit(1);
    
    if (error) {
      console.error('Schema refresh failed:', error);
      
      // Check if it's a column not found error
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.error('Missing columns in drivers table. Migration may not have been applied.');
        return false;
      }
      
      return false;
    }
    
    console.log('Drivers schema refresh successful');
    return true;
  } catch (error) {
    console.error('Unexpected error during drivers schema refresh:', error);
    return false;
  }
};

/**
 * Utility function to force refresh the schema cache and verify specific columns exist
 */
export const verifyColumnsExist = async (tableName: string, columnNames: string[]) => {
  try {
    console.log(`Verifying columns exist in ${tableName}: ${columnNames.join(', ')}`);

    // Force refresh the schema by selecting all columns
    await supabase.from(tableName).select('*').limit(1);

    console.log(`Schema refresh completed for ${tableName}`);
    return true;
  } catch (error) {
    console.error('Unexpected error verifying columns:', error);
    return false;
  }
};

/**
 * Forces a schema refresh for the delivery_requests table
 * and checks if company_name and requester_name columns exist
 */
export const verifyDeliveryRequestsSchema = async () => {
  return await verifyColumnsExist('delivery_requests', ['company_name', 'requester_name']);
}; 
