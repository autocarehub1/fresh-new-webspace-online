
import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X } from 'lucide-react';
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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first');
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `pod_${deliveryId}_${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('proof-of-delivery')
        .upload(fileName, selectedFile, { 
          upsert: true,
          contentType: selectedFile.type
        });

      if (error) {
        console.error('Upload error:', error);
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
      toast.error(`Failed to upload photo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
