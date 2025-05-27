
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  X,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { DocumentType, UploadedDocument } from './types';
import { getFileIcon } from './utils';

interface DocumentCardProps {
  docType: DocumentType;
  uploadedDoc?: UploadedDocument;
  isUploading: boolean;
  progress: number;
  dragOver: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onRemove: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  docType,
  uploadedDoc,
  isUploading,
  progress,
  dragOver,
  onFileSelect,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemove
}) => {
  const FileIcon = getFileIcon(uploadedDoc?.fileName || '') === 'image' ? ImageIcon : File;

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {docType.name}
              {docType.required && <span className="text-red-500">*</span>}
            </CardTitle>
            <CardDescription>{docType.description}</CardDescription>
          </div>
          {uploadedDoc && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {uploadedDoc ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <FileIcon className="h-5 w-5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">{uploadedDoc.fileName}</p>
              <p className="text-sm text-green-700">
                Status: {uploadedDoc.status === 'pending' ? 'Under Review' : uploadedDoc.status}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-600 animate-pulse" />
                  </div>
                  <p className="text-blue-600">Uploading...</p>
                  <Progress value={progress} className="max-w-xs mx-auto" />
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600 mb-1">
                      Drop your file here, or{' '}
                      <Label htmlFor={`file-${docType.id}`} className="text-blue-600 cursor-pointer hover:underline">
                        browse
                      </Label>
                    </p>
                    <p className="text-sm text-gray-500">
                      Max {docType.maxSize}MB • {docType.acceptedTypes.join(', ')}
                    </p>
                  </div>
                  <input
                    id={`file-${docType.id}`}
                    type="file"
                    accept={docType.acceptedTypes.join(',')}
                    onChange={onFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
