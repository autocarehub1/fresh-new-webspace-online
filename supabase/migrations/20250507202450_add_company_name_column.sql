-- Add company_name column to delivery_requests table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'delivery_requests'
        AND column_name = 'company_name'
    ) THEN
        ALTER TABLE delivery_requests
        ADD COLUMN company_name TEXT;
    END IF;
END $$;
