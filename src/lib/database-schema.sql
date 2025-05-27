
-- Create driver_documents table for file storage
CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('license', 'insurance', 'document', 'photo')),
  document_url TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for driver_documents
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- Drivers can only see their own documents
CREATE POLICY "Drivers can view own documents" ON driver_documents
  FOR SELECT USING (auth.uid() = driver_id);

-- Drivers can insert their own documents
CREATE POLICY "Drivers can insert own documents" ON driver_documents
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Drivers can update their own documents
CREATE POLICY "Drivers can update own documents" ON driver_documents
  FOR UPDATE USING (auth.uid() = driver_id);

-- Drivers can delete their own documents
CREATE POLICY "Drivers can delete own documents" ON driver_documents
  FOR DELETE USING (auth.uid() = driver_id);

-- Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public) VALUES ('driver-documents', 'driver-documents', true) ON CONFLICT DO NOTHING;

-- Create storage policies for driver documents
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_type ON driver_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON driver_documents(verification_status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_driver_documents_updated_at BEFORE UPDATE
    ON driver_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
