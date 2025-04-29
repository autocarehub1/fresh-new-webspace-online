import React, { useState, useEffect } from 'react';
import { fetchImageAsDataUrl } from '@/lib/image-helpers';
import { supabase } from '@/lib/supabase';

interface DualSourceImageProps {
  photoData: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Component that handles multiple image sources - can use:
 * 1. Base64 data directly
 * 2. Supabase file path
 * 3. Combined data with both options
 */
export const DualSourceImage: React.FC<DualSourceImageProps> = ({
  photoData,
  alt,
  className = '',
  fallbackSrc = 'https://placehold.co/80x80?text=No+Image'
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadImage = async () => {
      if (!photoData) {
        console.log('No photo data provided');
        setError(true);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(false);
      
      try {
        console.log('Processing photo data:', photoData.substring(0, 50) + '...');
        
        // Check if we have the combined format with both filename and base64
        if (photoData.includes('|||')) {
          const [filename, base64Data] = photoData.split('|||');
          console.log('Found combined data format with filename and base64');
          
          // Try the base64 data first since it's direct
          if (base64Data && base64Data.startsWith('data:')) {
            console.log('Using embedded base64 data');
            setImageUrl(base64Data);
            setLoading(false);
            return;
          }
          
          // If base64 didn't work, try the filename with Supabase
          if (filename) {
            console.log('Trying Supabase storage with filename:', filename);
            try {
              const dataUrl = await fetchImageAsDataUrl('driver-photos', filename);
              if (dataUrl) {
                console.log('Successfully got image from Supabase');
                setImageUrl(dataUrl);
                setLoading(false);
                return;
              }
            } catch (storageErr) {
              console.error('Supabase storage access failed:', storageErr);
            }
          }
        }
        
        // If the data is already a base64 string, use it directly
        if (photoData.startsWith('data:')) {
          console.log('Using direct base64 data');
          setImageUrl(photoData);
          setLoading(false);
          return;
        }
        
        // Last resort: Try as a Supabase path
        try {
          console.log('Last attempt: treating as Supabase path:', photoData);
          const dataUrl = await fetchImageAsDataUrl('driver-photos', photoData);
          if (dataUrl) {
            console.log('Successfully retrieved from Supabase storage');
            setImageUrl(dataUrl);
            setLoading(false);
            return;
          }
        } catch (finalErr) {
          console.error('All image loading attempts failed:', finalErr);
        }
        
        // If we reach here, all attempts failed
        setError(true);
      } catch (error) {
        console.error('Error in DualSourceImage:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [photoData]);

  // If loading, show placeholder
  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // If error or no image, show fallback
  if (error || !imageUrl) {
    return (
      <img 
        src={fallbackSrc} 
        alt={`${alt} (fallback)`}
        className={className}
      />
    );
  }

  // Show the image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => {
        console.error('Error displaying image');
        setError(true);
      }}
    />
  );
}; 