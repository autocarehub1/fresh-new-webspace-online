
import { supabase } from '@/lib/supabase';

export const createBucketIfNeeded = async () => {
  try {
    console.log('Checking if proof-of-delivery bucket exists...');
    
    // Try to list files in the bucket to check if it exists
    const { error: listError } = await supabase.storage
      .from('proof-of-delivery')
      .list('', { limit: 1 });

    if (listError && listError.message.includes('Bucket not found')) {
      console.log('Bucket does not exist, attempting to create...');
      
      // Try to create the bucket
      const { error: createError } = await supabase.storage
        .createBucket('proof-of-delivery', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

      if (createError) {
        console.error('Failed to create bucket:', createError);
        throw new Error('Storage bucket could not be created. Please contact system administrator.');
      }
      
      console.log('Bucket created successfully');
      return true;
    } else if (listError) {
      console.error('Other bucket error:', listError);
      throw listError;
    }
    
    console.log('Bucket exists and is accessible');
    return true;
  } catch (error) {
    console.error('Bucket setup error:', error);
    throw error;
  }
};
