
import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ProofOfDeliveryCaptureProps {
  deliveryId: string;
  onPhotoUploaded: (photoUrl: string) => void;
  onCancel?: () => void;
}

const ProofOfDeliveryCapture: React.FC<ProofOfDeliveryCaptureProps> = ({ 
  deliveryId, 
  onPhotoUploaded, 
  onCancel 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [bucketError, setBucketError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be smaller than 10MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createBucketIfNeeded = async () => {
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first');
      return;
    }

    setUploading(true);
    setBucketError(false);
    
    try {
      // First, ensure the bucket exists
      await createBucketIfNeeded();
      
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `pod_${deliveryId}_${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('proof-of-delivery')
        .upload(fileName, selectedFile, { 
          upsert: true,
          contentType: selectedFile.type
        });

      if (error) {
        console.error('Upload error:', error);
        
        if (error.message.includes('Bucket not found')) {
          setBucketError(true);
          throw new Error('Storage bucket is not available. Please contact system administrator to set up the proof-of-delivery storage bucket.');
        }
        
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('proof-of-delivery')
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      console.log('Photo uploaded successfully:', publicUrlData.publicUrl);
      onPhotoUploaded(publicUrlData.publicUrl);
      
      toast.success('Proof of delivery photo uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      
      if (error.message.includes('Bucket not found') || error.message.includes('storage bucket')) {
        setBucketError(true);
        toast.error('Storage not configured. Please contact system administrator.');
      } else {
        toast.error(`Failed to upload photo: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setBucketError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (bucketError) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Storage Configuration Required
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800 mb-4">
              The photo storage system needs to be configured by your system administrator. 
              The "proof-of-delivery" storage bucket is missing.
            </p>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBucketError(false);
                  clearSelection();
                }}
                className="w-full"
              >
                Try Again
              </Button>
              
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Proof of Delivery Photo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                Tap to take a photo or select from gallery
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Maximum file size: 10MB
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Proof of delivery preview"
                className="w-full rounded-lg max-h-64 object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={clearSelection}
                disabled={uploading}
              >
                Retake
              </Button>
            </div>
          </div>
        )}
        
        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full"
            disabled={uploading}
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProofOfDeliveryCapture;
