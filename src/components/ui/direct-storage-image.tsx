import React, { useState, useEffect } from 'react';
import { fetchImageAsDataUrl } from '@/lib/image-helpers';

interface DirectStorageImageProps {
  bucket: string;
  path: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Component for displaying images directly downloaded from Supabase storage
 * Bypasses public URL limitations by downloading the image and displaying as data URL
 */
export const DirectStorageImage: React.FC<DirectStorageImageProps> = ({
  bucket,
  path,
  alt,
  className = '',
  fallbackSrc = 'https://placehold.co/80x80?text=No+Image'
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const downloadImage = async () => {
      if (!path) {
        console.log('No path provided for image');
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        
        console.log(`Attempting to download image from ${bucket}/${path}`);
        const dataUrl = await fetchImageAsDataUrl(bucket, path);
        
        if (!dataUrl) {
          console.error('Failed to fetch image data');
          setError(true);
        } else {
          console.log('Successfully got image data URL');
          setImageUrl(dataUrl);
        }
      } catch (error) {
        console.error('Error in DirectStorageImage:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    downloadImage();
  }, [bucket, path]);

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

  // Show the data URL image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => {
        console.error('Error displaying data URL image');
        setError(true);
      }}
    />
  );
}; 