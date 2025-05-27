
-- Run this script in your Supabase SQL Editor to set up the proof-of-delivery storage bucket

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proof-of-delivery',
  'proof-of-delivery', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Step 2: Create storage policies
CREATE POLICY IF NOT EXISTS "Drivers can upload proof photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proof-of-delivery' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "Anyone can view proof photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'proof-of-delivery');

CREATE POLICY IF NOT EXISTS "Drivers can update proof photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'proof-of-delivery' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "Drivers can delete proof photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'proof-of-delivery' AND
    auth.role() = 'authenticated'
  );

-- Step 3: Ensure the proofOfDeliveryPhoto column exists
ALTER TABLE delivery_requests 
ADD COLUMN IF NOT EXISTS proofOfDeliveryPhoto TEXT;

-- Verify the setup
SELECT 
  'Bucket created successfully' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'proof-of-delivery';
