
import { supabase } from '@/lib/supabase';
import { SecurityService } from '@/lib/security';
import { DocumentType } from './types';

export const validateFile = (file: File, docType: DocumentType): string | null => {
  if (file.size > docType.maxSize * 1024 * 1024) {
    return `File size must be less than ${docType.maxSize}MB`;
  }
  
  if (!docType.acceptedTypes.includes(file.type)) {
    return `File type not supported. Accepted types: ${docType.acceptedTypes.join(', ')}`;
  }
  
  return null;
};

export const createStorageBucketIfNeeded = async (): Promise<boolean> => {
  try {
    // Check if bucket exists by trying to list files
    const { error } = await supabase.storage.from('driver-documents').list('', { limit: 1 });
    
    if (error && error.message.includes('Bucket not found')) {
      console.log('Creating driver-documents storage bucket...');
      // Note: Bucket creation is typically done via migration, but we log the attempt
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return false;
  }
};

export const uploadFile = async (file: File, documentType: string, userId: string): Promise<string> => {
  console.log('Starting file upload...', { userId, documentType, fileName: file.name });
  
  // Ensure storage bucket exists
  const bucketExists = await createStorageBucketIfNeeded();
  if (!bucketExists) {
    throw new Error('Storage bucket not available');
  }
  
  try {
    // Try secure upload first
    const result = await SecurityService.secureFileUpload(file, `driver-documents/${userId}/${documentType}`);
    console.log('Secure upload result:', result);
    return result.url;
  } catch (error) {
    console.error('Secure upload failed, trying direct upload:', error);
    
    // Fallback to direct upload
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;
    
    console.log('Attempting direct upload to bucket: driver-documents, path:', fileName);
    
    const { data, error: uploadError } = await supabase.storage
      .from('driver-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Direct upload error:', uploadError);
      throw uploadError;
    }
    
    console.log('Direct upload successful:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('driver-documents')
      .getPublicUrl(data.path);

    console.log('Generated public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  }
};

export const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '') ? 'image' : 'file';
};
