
-- Create security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID REFERENCES delivery_requests(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  content JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create 2FA secrets table
CREATE TABLE IF NOT EXISTS user_2fa_secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  secret_key TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create session monitoring table
CREATE TABLE IF NOT EXISTS session_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  anomaly_score INTEGER DEFAULT 0,
  is_suspicious BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create database functions for advanced queries
CREATE OR REPLACE FUNCTION get_driver_analytics(driver_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_deliveries', COUNT(*),
    'completed_deliveries', COUNT(*) FILTER (WHERE status = 'completed'),
    'average_rating', AVG((metadata->>'rating')::numeric),
    'total_distance', SUM((metadata->>'distance')::numeric),
    'on_time_percentage', 
      ROUND((COUNT(*) FILTER (WHERE metadata->>'on_time' = 'true')::numeric / COUNT(*) * 100), 2)
  ) INTO result
  FROM delivery_requests 
  WHERE assigned_driver = driver_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_driver_performance(driver_id UUID, time_range TEXT DEFAULT '30d')
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_date TIMESTAMP;
BEGIN
  -- Calculate start date based on time range
  CASE time_range
    WHEN '7d' THEN start_date := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN start_date := NOW() - INTERVAL '30 days';
    WHEN '90d' THEN start_date := NOW() - INTERVAL '90 days';
    ELSE start_date := NOW() - INTERVAL '30 days';
  END CASE;
  
  SELECT json_build_object(
    'deliveries_completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'average_completion_time', AVG(EXTRACT(EPOCH FROM (updated_at - created_at))),
    'customer_satisfaction', AVG((metadata->>'rating')::numeric),
    'punctuality_score', 
      ROUND((COUNT(*) FILTER (WHERE metadata->>'on_time' = 'true')::numeric / NULLIF(COUNT(*), 0) * 100), 2)
  ) INTO result
  FROM delivery_requests 
  WHERE assigned_driver = driver_id 
    AND created_at >= start_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION batch_update_delivery_status(delivery_ids UUID[], new_status TEXT)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE delivery_requests 
  SET status = new_status, updated_at = NOW()
  WHERE id = ANY(delivery_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_monitoring ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own security logs" ON security_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own 2FA settings" ON user_2fa_secrets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own session data" ON session_monitoring
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_notification_logs_delivery_id ON notification_logs(delivery_id);
CREATE INDEX IF NOT EXISTS idx_session_monitoring_user_id ON session_monitoring(user_id);
