
import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock data is kept for development/demo purposes if needed
export const mockData: Record<string, any[]> = {
  requests: [
    {
      id: 'REQ-001',
      status: 'pending',
      pickup_location: '123 Medical Center, San Antonio, TX',
      delivery_location: '456 Hospital Ave, San Antonio, TX',
      created_at: '2025-04-16T14:22:00Z'
    }
  ],
  drivers: [
    {
      id: 'DRV-001',
      name: 'John Smith',
      status: 'active',
      vehicle_type: 'Temperature-Controlled Van',
      current_location: 'Medical District, San Antonio'
    }
  ]
};
