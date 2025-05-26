-- Create customer_profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  preferences JSONB DEFAULT '{
    "email_notifications": true,
    "delivery_updates": true,
    "marketing_emails": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for customer_profiles table
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile" 
  ON customer_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to create their own profile
CREATE POLICY "Users can create their own profile" 
  ON customer_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON customer_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON customer_profiles 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email LIKE '%@admin.com'
    )
  );

-- Add user_id to delivery_requests table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'delivery_requests' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE delivery_requests ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Update RLS for delivery_requests to include user_id
CREATE POLICY IF NOT EXISTS "Users can view their own requests" 
  ON delivery_requests 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email LIKE '%@admin.com'
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create their own requests" 
  ON delivery_requests 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email LIKE '%@admin.com'
    )
  );

-- Create function to set updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Set trigger on customer_profiles
CREATE TRIGGER update_customer_profiles_updated_at
BEFORE UPDATE ON customer_profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 