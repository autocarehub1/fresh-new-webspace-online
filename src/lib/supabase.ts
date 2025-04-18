
// This is a mock Supabase client for demonstration purposes
// In a real app, you would use the actual Supabase client

const mockSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      if (credentials.email === 'admin@example.com' && credentials.password === 'password123') {
        return { data: { user: { id: '1', email: credentials.email } }, error: null };
      }
      return { data: null, error: { message: 'Invalid login credentials' } };
    },
    signOut: async () => ({ error: null })
  },
  from: (table: string) => ({
    select: () => ({
      order: () => ({
        then: (callback: any) => callback(mockData[table] || [])
      })
    })
  })
};

// Mock data store
const mockData: Record<string, any[]> = {
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

export const supabase = mockSupabaseClient;
