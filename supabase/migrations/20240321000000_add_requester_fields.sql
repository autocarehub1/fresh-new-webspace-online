-- Add requester_name and company_name fields to delivery_requests table
ALTER TABLE delivery_requests 
ADD COLUMN requester_name TEXT,
ADD COLUMN company_name TEXT; 