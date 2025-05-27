
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface PhotoPreviewProps {
  previewUrl: string;
  uploading: boolean;
  onUpload: () => void;
  onClear: () => void;
}

const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  previewUrl,
  uploading,
  onUpload,
  onClear
}) => {
  return (
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
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={onUpload}
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
          onClick={onClear}
          disabled={uploading}
        >
          Retake
        </Button>
      </div>
    </div>
  );
};

export default PhotoPreview;
