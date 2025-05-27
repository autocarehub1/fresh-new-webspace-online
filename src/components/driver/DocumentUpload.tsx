import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DocumentUploadProps, UploadedDocument } from './document-upload/types';
import { documentTypes } from './document-upload/constants';
import { validateFile, uploadFile } from './document-upload/utils';
import { DocumentCard } from './document-upload/DocumentCard';
import { DocumentUploadHeader } from './document-upload/DocumentUploadHeader';
import { DocumentUploadFooter } from './document-upload/DocumentUploadFooter';

const DocumentUpload: React.FC<DocumentUploadProps> = ({ userId, onComplete }) => {
  const [uploads, setUploads] = useState<Record<string, UploadedDocument>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if database and storage are ready
  useEffect(() => {
    const checkDatabaseReady = async () => {
      try {
        console.log('Checking if database is ready...');
        
        // Test database connection
        const { error: dbError } = await supabase
          .from('driver_documents')
          .select('count')
          .limit(1);
        
        if (dbError) {
          console.error('Database not ready:', dbError);
          toast.error('Database is not ready yet. Please wait a moment and try again.');
          return;
        }

        // Test storage bucket
        const { error: storageError } = await supabase.storage
          .from('driver-documents')
          .list('', { limit: 1 });
        
        if (storageError) {
          console.error('Storage not ready:', storageError);
          toast.error('File storage is not ready yet. Please wait a moment and try again.');
          return;
        }

        console.log('Database and storage are ready');
        setIsInitialized(true);
        loadExistingDocuments();
      } catch (error) {
        console.error('Error checking database readiness:', error);
        toast.error('Unable to connect to the database. Please refresh the page.');
      }
    };

    checkDatabaseReady();
  }, [userId]);

  const loadExistingDocuments = async () => {
    try {
      console.log('Loading existing documents for user:', userId);
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        return;
      }

      if (data && data.length > 0) {
        const existingUploads: Record<string, UploadedDocument> = {};
        data.forEach(doc => {
          existingUploads[doc.document_type] = {
            id: doc.id,
            type: doc.document_type,
            fileName: doc.metadata?.fileName || 'Unknown file',
            url: doc.document_url,
            status: doc.verification_status || 'pending',
            uploadedAt: new Date(doc.created_at)
          };
        });
        setUploads(existingUploads);
        console.log('Loaded existing documents:', existingUploads);
      }
    } catch (error) {
      console.error('Error loading existing documents:', error);
    }
  };

  const handleFileUpload = async (file: File, docType: typeof documentTypes[0]) => {
    if (!isInitialized) {
      toast.error('System is still initializing. Please wait a moment.');
      return;
    }

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

      const url = await uploadFile(file, docType.id, userId);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [docType.id]: 100 }));

      console.log('File uploaded successfully, saving to database...', { url, docType: docType.id });

      // Save document record to database
      const { error: dbError } = await supabase
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

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
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

  const handleDrop = useCallback((e: React.DragEvent, docType: typeof documentTypes[0]) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], docType);
    }
  }, [isInitialized]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: typeof documentTypes[0]) => {
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
      
      // Remove from database first
      const { error: deleteError } = await supabase
        .from('driver_documents')
        .delete()
        .eq('driver_id', userId)
        .eq('document_type', docType);

      if (deleteError) {
        console.warn('Database deletion error:', deleteError);
        throw deleteError;
      }

      // Try to remove from storage (non-critical if it fails)
      try {
        const fileName = doc.url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('driver-documents')
            .remove([`${userId}/${fileName}`]);
        }
      } catch (storageError) {
        console.warn('Storage deletion warning:', storageError);
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

  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing document upload system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DocumentUploadHeader allRequiredUploaded={allRequiredUploaded} />

      <div className="grid gap-6">
        {documentTypes.map((docType) => (
          <DocumentCard
            key={docType.id}
            docType={docType}
            uploadedDoc={uploads[docType.id]}
            isUploading={uploading[docType.id] || false}
            progress={uploadProgress[docType.id] || 0}
            dragOver={dragOver === docType.id}
            onFileSelect={(e) => handleFileSelect(e, docType)}
            onDrop={(e) => handleDrop(e, docType)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(docType.id);
            }}
            onDragLeave={() => setDragOver(null)}
            onRemove={() => removeDocument(docType.id)}
          />
        ))}
      </div>

      <DocumentUploadFooter />
    </div>
  );
};

export default DocumentUpload;
