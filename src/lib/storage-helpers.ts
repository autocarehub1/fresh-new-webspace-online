import { supabase } from './supabase';

/**
 * Converts a Supabase storage file path to a properly constructed public URL
 * that will work with browsers and image components
 */
export const getCorrectPublicUrl = (bucket: string, filePath: string): string => {
  try {
    // Get public URL from Supabase
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    console.log('Generated public URL:', data.publicUrl);
    
    // Return the properly formatted URL
    return data.publicUrl;
  } catch (error) {
    console.error('Error generating public URL:', error);
    return '';
  }
};

/**
 * Extract filename from a full Supabase storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/driver-photos/abc.jpg → abc.jpg
 */
export const extractFilenameFromUrl = (url: string): string | null => {
  try {
    // Match the filename pattern in the URL
    const matches = url.match(/\/([^\/]+\.[a-zA-Z0-9]+)$/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting filename:', error);
    return null;
  }
};

/**
 * Generates a direct URL to an image in Supabase storage from a full URL
 * This helps fix cases where the URL is stored incorrectly in the database
 */
export const fixImageUrl = (originalUrl: string | null | undefined): string => {
  if (!originalUrl) return '';
  
  console.log('Attempting to fix URL:', originalUrl);
  
  try {
    // Check if URL already has the correct format
    if (originalUrl.includes('/storage/v1/object/public/')) {
      const bucketName = 'driver-photos'; // Default bucket
      const filename = extractFilenameFromUrl(originalUrl);
      
      if (filename) {
        const fixedUrl = getCorrectPublicUrl(bucketName, filename);
        console.log('Fixed URL:', fixedUrl);
        return fixedUrl;
      }
    }
    
    return originalUrl;
  } catch (error) {
    console.error('Error fixing image URL:', error);
    return originalUrl;
  }
}; 