import { supabase } from './supabase';

/**
 * Utility function to force refresh the schema cache and verify specific columns exist
 */
export const verifyColumnsExist = async (tableName: string, columnNames: string[]) => {
  try {
    console.log(`Verifying columns exist in ${tableName}: ${columnNames.join(', ')}`);

    // Force refresh the schema by selecting all columns
    await supabase.from(tableName).select('*').limit(1);

    // Then explicitly check for the columns we need
    const { data, error } = await supabase.from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .in('column_name', columnNames);

    if (error) {
      console.error('Error verifying columns:', error);
      return false;
    }

    if (!data || data.length === 0) {
      console.error(`No columns found matching ${columnNames.join(', ')} in ${tableName}`);
      return false;
    }

    // Check if all required columns were found
    const foundColumns = data.map(col => col.column_name);
    const missingColumns = columnNames.filter(col => !foundColumns.includes(col));

    if (missingColumns.length > 0) {
      console.error(`Missing columns in ${tableName}: ${missingColumns.join(', ')}`);
      return false;
    }

    console.log(`All columns verified in ${tableName}: ${foundColumns.join(', ')}`);
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