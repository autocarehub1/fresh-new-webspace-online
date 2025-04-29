import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StorageImageProps {
  bucket: string;
  path?: string;
  url?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Component for displaying images from Supabase storage with automatic
 * handling of URLs, paths, and error fallbacks
 */
export const StorageImage: React.FC<StorageImageProps> = ({
  bucket,
  path,
  url,
  alt,
  className = '',
  fallbackSrc = 'https://placehold.co/80x80?text=No+Image'
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  console.log('StorageImage props:', { bucket, path, url, alt });

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Case 1: If the URL is a simple filename (no path separators), use it directly as path
        if (url && !url.includes('/') && !path) {
          console.log('URL appears to be a simple filename:', url);
          const { data } = supabase.storage.from(bucket).getPublicUrl(url);
          console.log('Generated public URL from filename:', data.publicUrl);
          setImageUrl(data.publicUrl);
          return;
        }
        
        // Case 2: Direct URL is provided and contains http
        if (url && url.includes('http')) {
          console.log('Using provided HTTP URL:', url);
          setImageUrl(url);
          return;
        }
        
        // Case 3: Path within bucket is provided
        if (path) {
          console.log('Fetching URL for path:', path, 'in bucket:', bucket);
          const { data } = supabase.storage.from(bucket).getPublicUrl(path);
          console.log('Fetched public URL:', data.publicUrl);
          setImageUrl(data.publicUrl);
          return;
        }
        
        // Case 4: Extract path from URL
        if (url && url.includes('/storage/v1/object/')) {
          console.log('Extracting path from URL:', url);
          const matches = url.match(/\/([^\/]+\/[^\/]+)$/);
          if (matches && matches[1]) {
            const extractedPath = matches[1];
            console.log('Extracted path:', extractedPath);
            const { data } = supabase.storage.from(bucket).getPublicUrl(extractedPath);
            console.log('Re-generated URL:', data.publicUrl);
            setImageUrl(data.publicUrl);
            return;
          }
        }
        
        // Case 5: Last attempt - try using the URL directly as a path
        if (url) {
          console.log('Last attempt - using URL as direct path:', url);
          try {
            const { data } = supabase.storage.from(bucket).getPublicUrl(url);
            console.log('Generated URL as last resort:', data.publicUrl);
            setImageUrl(data.publicUrl);
            return;
          } catch (innerError) {
            console.error('Failed using URL as direct path:', innerError);
            // Continue to error state
          }
        }
        
        console.log('No valid image source provided');
        setError(true);
      } catch (error) {
        console.error('Error loading image:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, [bucket, path, url]);

  // If loading, show placeholder
  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Handle download through direct fetch if needed
  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setError(true);
  };

  return error ? (
    <img 
      src={fallbackSrc} 
      alt={`${alt} (fallback)`}
      className={className}
    />
  ) : (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={handleImageError}
      crossOrigin="anonymous"
    />
  );
}; 