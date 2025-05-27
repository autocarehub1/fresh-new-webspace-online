
-- Create the proof-of-delivery storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proof-of-delivery',
  'proof-of-delivery', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies for proof of delivery photos

-- Policy 1: Allow authenticated users (drivers) to upload proof photos
CREATE POLICY "Drivers can upload proof photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proof-of-delivery' AND
    auth.role() = 'authenticated'
  );

-- Policy 2: Allow anyone to view proof photos (for customers and admins)
CREATE POLICY "Anyone can view proof photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'proof-of-delivery');

-- Policy 3: Allow authenticated users to update their own proof photos
CREATE POLICY "Drivers can update proof photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'proof-of-delivery' AND
    auth.role() = 'authenticated'
  );

-- Policy 4: Allow authenticated users to delete proof photos if needed
CREATE POLICY "Drivers can delete proof photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'proof-of-delivery' AND
    auth.role() = 'authenticated'
  );

-- Ensure the proofOfDeliveryPhoto column exists in delivery_requests table
ALTER TABLE delivery_requests 
ADD COLUMN IF NOT EXISTS proofOfDeliveryPhoto TEXT;

-- Create an index on the proofOfDeliveryPhoto column for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_requests_proof_photo 
ON delivery_requests(proofOfDeliveryPhoto) 
WHERE proofOfDeliveryPhoto IS NOT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN delivery_requests.proofOfDeliveryPhoto IS 'URL to the proof of delivery photo stored in Supabase storage';
