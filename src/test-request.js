// Test script to create a service request
// This runs completely on its own without needing the UI
// and should trigger a Slack notification

import { createClient } from '@supabase/supabase-js';

async function createTestRequest() {
  console.log('Starting test request creation...');
  
  // Create Supabase client (these values are available in the browser network requests)
  const supabaseUrl = 'https://tfplxkwjlbcvgqqtxkno.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcGx4a3dqbGJjdmdxcXR4a25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2MTczMTMsImV4cCI6MjAyNzE5MzMxM30.Jc_8dYZNlY1TbcJ-HKEeYj-EzpZzakYdX8t45IQ9ncc';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Generate tracking and request IDs
  const trackingId = `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const requestId = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Create the test request
  const requestData = {
    id: requestId,
    tracking_id: trackingId,
    pickup_location: 'TEST Hospital Lab - Script Test',
    delivery_location: 'TEST Medical Center - Script Test',
    priority: 'urgent',
    package_type: 'Medical Samples - Contact: test@catalystnetworklogistics.com',
    status: 'pending',
    estimated_cost: 45.25,
    requester_name: 'Script Test',
    company_name: 'Script Testing Co'
  };
  
  console.log('Submitting request data:', requestData);
  
  try {
    const { data, error } = await supabase
      .from('delivery_requests')
      .insert(requestData)
      .select();
    
    if (error) {
      console.error('❌ Error creating request:', error);
      return;
    }
    
    console.log('✅ Request created successfully:', data);
    console.log('Request ID:', requestId);
    console.log('Tracking ID:', trackingId);
    console.log('A Slack notification should have been triggered.');
  } catch (err) {
    console.error('❌ Exception creating request:', err);
  }
}

// Execute the test
createTestRequest(); 