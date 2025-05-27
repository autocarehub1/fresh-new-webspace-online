
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle } from 'lucide-react';

interface DocumentUploadHeaderProps {
  allRequiredUploaded: boolean;
}

export const DocumentUploadHeader: React.FC<DocumentUploadHeaderProps> = ({
  allRequiredUploaded
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Required Documents</h3>
        <p className="text-gray-600">
          Upload clear photos or scans of your documents. All required documents must be uploaded to proceed.
        </p>
      </div>

      {allRequiredUploaded && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All required documents have been uploaded successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
