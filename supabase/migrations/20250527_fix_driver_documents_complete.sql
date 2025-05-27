
-- Drop existing objects if they exist to start fresh
DROP TABLE IF EXISTS public.driver_documents CASCADE;
DROP POLICY IF EXISTS "Drivers can view own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can insert own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can update own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can delete own documents" ON public.driver_documents;

-- Create driver_documents table
CREATE TABLE public.driver_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('license', 'insurance', 'registration', 'background_check', 'document', 'photo')),
  document_url TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Drivers can view own documents" ON public.driver_documents
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert own documents" ON public.driver_documents
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own documents" ON public.driver_documents
  FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete own documents" ON public.driver_documents
  FOR DELETE USING (auth.uid() = driver_id);

-- Create indexes for performance
CREATE INDEX idx_driver_documents_driver_id ON public.driver_documents(driver_id);
CREATE INDEX idx_driver_documents_type ON public.driver_documents(document_type);
CREATE INDEX idx_driver_documents_status ON public.driver_documents(verification_status);

-- Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'driver-documents', 
  'driver-documents', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Drivers can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Drivers can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Drivers can delete documents" ON storage.objects;

-- Create storage policies
CREATE POLICY "Drivers can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'driver-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Drivers can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'driver-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Drivers can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'driver-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_driver_documents_updated_at 
  BEFORE UPDATE ON public.driver_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.driver_documents TO authenticated;
GRANT ALL ON public.driver_documents TO service_role;
