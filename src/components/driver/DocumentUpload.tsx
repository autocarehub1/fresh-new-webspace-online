import React, { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SecurityService } from '@/lib/security';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadProps {
  userId: string;
  onComplete: () => void;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  maxSize: number; // in MB
  acceptedTypes: string[];
}

interface UploadedDocument {
  id: string;
  type: string;
  fileName: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
}

const documentTypes: DocumentType[] = [
  {
    id: 'license',
    name: 'Driver License',
    description: 'Front and back of your valid driver license',
    required: true,
    maxSize: 5,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },
  {
    id: 'insurance',
    name: 'Vehicle Insurance',
    description: 'Current vehicle insurance certificate',
    required: true,
    maxSize: 5,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },
  {
    id: 'registration',
    name: 'Vehicle Registration',
    description: 'Current vehicle registration document',
    required: true,
    maxSize: 5,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },
  {
    id: 'background_check',
    name: 'Background Check',
    description: 'Recent background check certificate (if available)',
    required: false,
    maxSize: 5,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  }
];

const DocumentUpload: React.FC<DocumentUploadProps> = ({ userId, onComplete }) => {
  const [uploads, setUploads] = useState<Record<string, UploadedDocument>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  const validateFile = (file: File, docType: DocumentType): string | null => {
    if (file.size > docType.maxSize * 1024 * 1024) {
      return `File size must be less than ${docType.maxSize}MB`;
    }
    
    if (!docType.acceptedTypes.includes(file.type)) {
      return `File type not supported. Accepted types: ${docType.acceptedTypes.join(', ')}`;
    }
    
    return null;
  };

  const uploadFile = async (file: File, documentType: string): Promise<string> => {
    console.log('Starting secure file upload...', { userId, documentType, fileName: file.name });
    
    try {
      // Use the secure upload from SecurityService
      const result = await SecurityService.secureFileUpload(file, `driver-documents/${userId}/${documentType}`);
      console.log('Secure upload result:', result);
      return result.url;
    } catch (error) {
      console.error('Secure upload failed, trying direct upload:', error);
      
      // Fallback to direct upload if secure upload fails
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;
      
      console.log('Attempting direct upload to bucket: driver-documents, path:', fileName);
      
      const { data, error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Direct upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Direct upload successful:', data);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(data.path);

      console.log('Generated public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    }
  };

  const handleFileUpload = async (file: File, docType: DocumentType) => {
    const validation = validateFile(file, docType);
    if (validation) {
      toast.error(validation);
      return;
    }

    setUploading(prev => ({ ...prev, [docType.id]: true }));
    setUploadProgress(prev => ({ ...prev, [docType.id]: 0 }));

    try {
      console.log('Starting file upload process...', { docType: docType.id, fileName: file.name });
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [docType.id]: Math.min((prev[docType.id] || 0) + 10, 90)
        }));
      }, 200);

      const url = await uploadFile(file, docType.id);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [docType.id]: 100 }));

      console.log('File uploaded successfully, saving to database...', { url, docType: docType.id });

      // Save document record to database - using 'documents' table instead of 'driver_documents'
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          driver_id: userId,
          document_type: docType.id,
          document_url: url,
          verification_status: 'pending',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // If table doesn't exist, try alternative table name
        if (dbError.message.includes('relation "documents" does not exist')) {
          console.log('Trying alternative table name: driver_documents');
          const { error: altDbError } = await supabase
            .from('driver_documents')
            .insert({
              driver_id: userId,
              document_type: docType.id,
              document_url: url,
              verification_status: 'pending',
              metadata: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
              }
            });
          
          if (altDbError) {
            console.error('Alternative database insert error:', altDbError);
            throw altDbError;
          }
        } else {
          throw dbError;
        }
      }

      const uploadedDoc: UploadedDocument = {
        id: Date.now().toString(),
        type: docType.id,
        fileName: file.name,
        url,
        status: 'pending',
        uploadedAt: new Date()
      };

      setUploads(prev => ({ ...prev, [docType.id]: uploadedDoc }));
      toast.success(`${docType.name} uploaded successfully`);
      console.log('Document upload completed successfully');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${docType.name}: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(prev => ({ ...prev, [docType.id]: false }));
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [docType.id]: 0 }));
      }, 1000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent, docType: DocumentType) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], docType);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentType) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], docType);
    }
  };

  const removeDocument = async (docType: string) => {
    const doc = uploads[docType];
    if (!doc) return;

    try {
      console.log('Removing document:', { docType, url: doc.url });
      
      // Remove from storage
      const fileName = doc.url.split('/').pop();
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from('driver-documents')
          .remove([`${userId}/${fileName}`]);
        
        if (deleteError) {
          console.warn('Storage deletion error:', deleteError);
        }
      }

      // Remove from database - try both table names
      let deleteError = null;
      
      const { error: dbError1 } = await supabase
        .from('documents')
        .delete()
        .eq('driver_id', userId)
        .eq('document_type', docType);
        
      if (dbError1?.message?.includes('relation "documents" does not exist')) {
        const { error: dbError2 } = await supabase
          .from('driver_documents')
          .delete()
          .eq('driver_id', userId)
          .eq('document_type', docType);
        deleteError = dbError2;
      } else {
        deleteError = dbError1;
      }

      if (deleteError) {
        console.warn('Database deletion error:', deleteError);
      }

      setUploads(prev => {
        const updated = { ...prev };
        delete updated[docType];
        return updated;
      });

      toast.success('Document removed');
    } catch (error) {
      console.error('Remove document error:', error);
      toast.error('Failed to remove document');
    }
  };

  const requiredUploads = documentTypes.filter(doc => doc.required);
  const allRequiredUploaded = requiredUploads.every(doc => uploads[doc.id]);

  React.useEffect(() => {
    if (allRequiredUploaded) {
      onComplete();
    }
  }, [allRequiredUploaded, onComplete]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

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

      <div className="grid gap-6">
        {documentTypes.map((docType) => {
          const isUploaded = uploads[docType.id];
          const isUploading = uploading[docType.id];
          const progress = uploadProgress[docType.id] || 0;

          return (
            <Card key={docType.id} className="relative">
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
                  {isUploaded && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(docType.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {isUploaded ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    {getFileIcon(isUploaded.fileName)}
                    <div className="flex-1">
                      <p className="font-medium text-green-900">{isUploaded.fileName}</p>
                      <p className="text-sm text-green-700">
                        Status: {isUploaded.status === 'pending' ? 'Under Review' : isUploaded.status}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragOver === docType.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(docType.id);
                      }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => handleDrop(e, docType)}
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
                            onChange={(e) => handleFileSelect(e, docType)}
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
        })}
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>
          <strong>Note:</strong> All documents will be reviewed by our team within 1-2 business days.
          You'll receive an email notification once your documents are verified.
        </p>
      </div>
    </div>
  );
};

export default DocumentUpload;
