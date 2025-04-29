import { supabase } from './supabase';

/**
 * Directly download an image from Supabase storage and convert it to a data URL
 * This bypasses the need for public bucket access by using authenticated API calls
 */
export const fetchImageAsDataUrl = async (bucket: string, path: string): Promise<string> => {
  try {
    console.log(`Directly downloading image from ${bucket}/${path}`);
    
    // Download the file using the authenticated client
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .download(path);
      
    if (error) {
      console.error('Error downloading image:', error);
      return '';
    }
    
    if (!data) {
      console.error('No data returned from download');
      return '';
    }
    
    // Convert the downloaded blob to a data URL
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        console.log(`Successfully converted image to data URL (length: ${dataUrl.length})`);
        resolve(dataUrl);
      };
      reader.readAsDataURL(data);
    });
  } catch (error) {
    console.error('Exception fetching image:', error);
    return '';
  }
}; 