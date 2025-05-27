
-- Create driver_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.driver_documents (
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

-- Create policies
DROP POLICY IF EXISTS "Drivers can view own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can insert own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can update own documents" ON public.driver_documents;
DROP POLICY IF EXISTS "Drivers can delete own documents" ON public.driver_documents;

CREATE POLICY "Drivers can view own documents" ON public.driver_documents
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert own documents" ON public.driver_documents
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own documents" ON public.driver_documents
  FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete own documents" ON public.driver_documents
  FOR DELETE USING (auth.uid() = driver_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON public.driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_type ON public.driver_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON public.driver_documents(verification_status);

-- Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('driver-documents', 'driver-documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Drivers can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Drivers can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Drivers can delete documents" ON storage.objects;

CREATE POLICY "Drivers can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'driver-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Drivers can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'driver-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Drivers can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'driver-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_driver_documents_updated_at ON public.driver_documents;
CREATE TRIGGER update_driver_documents_updated_at 
  BEFORE UPDATE ON public.driver_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
