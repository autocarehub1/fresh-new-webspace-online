
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';
import { createBucketIfNeeded } from './proof-of-delivery/bucketUtils';
import { validateFile, generateFileName } from './proof-of-delivery/fileValidation';
import BucketErrorState from './proof-of-delivery/BucketErrorState';
import FileSelectionArea from './proof-of-delivery/FileSelectionArea';
import PhotoPreview from './proof-of-delivery/PhotoPreview';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
      const fileName = generateFileName(deliveryId, selectedFile.name);
      
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
  };

  const handleRetry = () => {
    setBucketError(false);
    clearSelection();
  };

  if (bucketError) {
    return (
      <BucketErrorState
        onRetry={handleRetry}
        onCancel={onCancel}
      />
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
          <FileSelectionArea onFileSelect={handleFileSelect} />
        ) : (
          <PhotoPreview
            previewUrl={previewUrl}
            uploading={uploading}
            onUpload={handleUpload}
            onClear={clearSelection}
          />
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
