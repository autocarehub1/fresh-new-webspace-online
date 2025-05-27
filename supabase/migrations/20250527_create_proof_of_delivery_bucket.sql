
-- Create storage bucket for proof of delivery photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'proof-of-delivery', 
  'proof-of-delivery', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies for proof of delivery photos
CREATE POLICY "Drivers can upload proof photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proof-of-delivery' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view proof photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'proof-of-delivery');

CREATE POLICY "Drivers can delete own proof photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'proof-of-delivery' AND
    auth.role() = 'authenticated'
  );

-- Add proofOfDeliveryPhoto column to delivery_requests if it doesn't exist
ALTER TABLE delivery_requests 
ADD COLUMN IF NOT EXISTS proofOfDeliveryPhoto TEXT;
