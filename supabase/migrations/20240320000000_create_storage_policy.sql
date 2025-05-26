-- Create a function to create storage policies
CREATE OR REPLACE FUNCTION create_storage_policy(policy_name text, policy_definition text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policy if it exists
  EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
  
  -- Create the new policy
  EXECUTE policy_definition;
END;
$$; 