
-- Fix drivers table to include all necessary columns
-- First, check if email column exists and add it if not
DO $$
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'email') THEN
        ALTER TABLE drivers ADD COLUMN email text;
    END IF;
    
    -- Add other missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'address') THEN
        ALTER TABLE drivers ADD COLUMN address text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'city') THEN
        ALTER TABLE drivers ADD COLUMN city text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'state') THEN
        ALTER TABLE drivers ADD COLUMN state text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'zip_code') THEN
        ALTER TABLE drivers ADD COLUMN zip_code text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'date_of_birth') THEN
        ALTER TABLE drivers ADD COLUMN date_of_birth date;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE drivers ADD COLUMN emergency_contact_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE drivers ADD COLUMN emergency_contact_phone text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'emergency_contact_relation') THEN
        ALTER TABLE drivers ADD COLUMN emergency_contact_relation text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'work_experience') THEN
        ALTER TABLE drivers ADD COLUMN work_experience text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'availability') THEN
        ALTER TABLE drivers ADD COLUMN availability text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'preferred_areas') THEN
        ALTER TABLE drivers ADD COLUMN preferred_areas text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'profile_completed') THEN
        ALTER TABLE drivers ADD COLUMN profile_completed boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'last_active_at') THEN
        ALTER TABLE drivers ADD COLUMN last_active_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'updated_at') THEN
        ALTER TABLE drivers ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Add unique constraint on email if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'drivers_email_key' 
    AND table_name = 'drivers'
  ) THEN
    ALTER TABLE drivers ADD CONSTRAINT drivers_email_key UNIQUE (email);
  END IF;
END $$;

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_drivers_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_drivers_updated_at();
