// Simpler test script using fetch directly
async function createTestRequest() {
  console.log('Starting test request creation with fetch...');
  
  // API details
  const supabaseUrl = 'https://tfplxkwjlbcvgqqtxkno.supabase.co/rest/v1/delivery_requests';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcGx4a3dqbGJjdmdxcXR4a25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE2MTczMTMsImV4cCI6MjAyNzE5MzMxM30.Jc_8dYZNlY1TbcJ-HKEeYj-EzpZzakYdX8t45IQ9ncc';
  
  // Generate tracking and request IDs
  const trackingId = `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const requestId = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Create the test request
  const requestData = {
    id: requestId,
    tracking_id: trackingId,
    pickup_location: 'TEST Hospital Lab - Fetch Script',
    delivery_location: 'TEST Medical Center - Fetch Script',
    priority: 'urgent',
    package_type: 'Medical Samples - Contact: test@catalystnetworklogistics.com',
    status: 'pending',
    estimated_cost: 45.25,
    requester_name: 'Fetch Script Test',
    company_name: 'Fetch Script Testing Co'
  };
  
  console.log('Submitting request data via fetch:', requestData);
  
  try {
    const response = await fetch(supabaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error creating request:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
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