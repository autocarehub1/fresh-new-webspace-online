import { createClient } from '@supabase/supabase-js';

// Use hardcoded values
const supabaseUrl = 'https://joziqntfciyflfsgvsqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemlxbnRmY2l5Zmxmc2d2c3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTYwNDksImV4cCI6MjA2MDQ5MjA0OX0.7j-9MsQNma6N1fnKvFB7wBJReL6PHy_ncwJqDdMeIQA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createStorageBucket() {
  try {
    // Create the bucket
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('driver-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
      });

    if (bucketError) {
      console.error('Error creating bucket:', bucketError);
      return;
    }

    console.log('Bucket created successfully:', bucket);

    // Set up policies
    const policies = [
      {
        name: 'Public Access',
        definition: `CREATE POLICY "Public Access"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'driver-photos');`
      },
      {
        name: 'Authenticated Upload',
        definition: `CREATE POLICY "Authenticated users can upload"
          ON storage.objects FOR INSERT
          WITH CHECK (
            bucket_id = 'driver-photos' 
            AND auth.role() = 'authenticated'
          );`
      },
      {
        name: 'User Update',
        definition: `CREATE POLICY "Users can update their own photos"
          ON storage.objects FOR UPDATE
          USING (
            bucket_id = 'driver-photos'
            AND auth.uid()::text = (storage.foldername(name))[1]
          );`
      },
      {
        name: 'User Delete',
        definition: `CREATE POLICY "Users can delete their own photos"
          ON storage.objects FOR DELETE
          USING (
            bucket_id = 'driver-photos'
            AND auth.uid()::text = (storage.foldername(name))[1]
          );`
      }
    ];

    // Apply each policy
    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('create_storage_policy', {
        policy_name: policy.name,
        policy_definition: policy.definition
      });

      if (policyError) {
        console.error(`Error creating policy ${policy.name}:`, policyError);
      } else {
        console.log(`Policy ${policy.name} created successfully`);
      }
    }

    console.log('Storage bucket setup completed');
  } catch (error) {
    console.error('Error in setup:', error);
  }
}

// Run the setup
createStorageBucket(); 