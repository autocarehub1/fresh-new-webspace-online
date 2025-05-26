-- Add company_name and requester_name columns to delivery_requests table
ALTER TABLE public.delivery_requests ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.delivery_requests ADD COLUMN IF NOT EXISTS requester_name TEXT;

-- Verify the columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'delivery_requests' 
AND column_name IN ('company_name', 'requester_name'); 