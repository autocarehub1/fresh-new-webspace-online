-- Add payment-related fields to delivery_requests table
ALTER TABLE delivery_requests 
ADD COLUMN payment_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN estimated_cost DECIMAL(10, 2);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id TEXT REFERENCES delivery_requests(id) ON DELETE SET NULL,
  payment_intent_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX idx_payments_request_id ON payments(request_id);
CREATE INDEX idx_payments_payment_intent_id ON payments(payment_intent_id);
CREATE INDEX idx_delivery_requests_payment_id ON delivery_requests(payment_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a payments webhook_events table for Stripe webhook handling
CREATE TABLE payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  stripe_event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT
);

-- Add index for performance
CREATE INDEX idx_payment_webhook_events_stripe_event_id ON payment_webhook_events(stripe_event_id);
CREATE INDEX idx_payment_webhook_events_processed ON payment_webhook_events(processed); 