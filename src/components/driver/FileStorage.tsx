
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Camera,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface FileStorageProps {
  driverId: string;
}

interface StoredFile {
  id: string;
  name: string;
  type: 'document' | 'photo' | 'license' | 'insurance';
  url: string;
  size: number;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const FileStorage: React.FC<FileStorageProps> = ({ driverId }) => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverFiles();
    setupRealtimeSubscription();
  }, [driverId]);

  const fetchDriverFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFiles: StoredFile[] = (data || []).map(doc => ({
        id: doc.id,
        name: doc.metadata?.fileName || 'Unknown file',
        type: doc.document_type,
        url: doc.document_url,
        size: doc.metadata?.fileSize || 0,
        uploadedAt: doc.created_at,
        status: doc.verification_status || 'pending'
      }));

      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`driver_files_${driverId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'driver_documents',
        filter: `driver_id=eq.${driverId}`
      }, (payload) => {
        console.log('Real-time file update:', payload);
        fetchDriverFiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const uploadFile = async (file: File, fileType: string) => {
    const fileId = Date.now().toString();
    setUploading(prev => ({ ...prev, [fileId]: true }));
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${driverId}/${fileType}_${Date.now()}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
        }));
      }, 200);

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(uploadData.path);

      // Save document record
      const { error: dbError } = await supabase
        .from('driver_documents')
        .insert({
          driver_id: driverId,
          document_type: fileType,
          document_url: urlData.publicUrl,
          verification_status: 'pending',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        });

      if (dbError) throw dbError;

      toast.success(`${fileType} uploaded successfully`);
      fetchDriverFiles();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${fileType}`);
    } finally {
      setUploading(prev => ({ ...prev, [fileId]: false }));
      setTimeout(() => {
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      }, 1000);
    }
  };

  const deleteFile = async (fileId: string, fileUrl: string) => {
    try {
      // Extract filename from URL
      const fileName = fileUrl.split('/').pop();
      
      if (fileName) {
        // Delete from storage
        await supabase.storage
          .from('driver-documents')
          .remove([`${driverId}/${fileName}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('driver_documents')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast.success('File deleted successfully');
      fetchDriverFiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      uploadFile(selectedFile, fileType);
    }
  };

  const getFileIcon = (type: string, fileName: string) => {
    if (type === 'photo' || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    }
    if (type === 'license') {
      return <Shield className="h-5 w-5 text-green-600" />;
    }
    if (type === 'insurance') {
      return <FileText className="h-5 w-5 text-purple-600" />;
    }
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document & Photo Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {['license', 'insurance', 'document', 'photo'].map((type) => (
              <div key={type} className="text-center">
                <input
                  type="file"
                  id={`upload-${type}`}
                  className="hidden"
                  accept={type === 'photo' ? 'image/*' : 'image/*,application/pdf'}
                  onChange={(e) => handleFileSelect(e, type)}
                />
                <label
                  htmlFor={`upload-${type}`}
                  className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {type === 'photo' ? <Camera className="h-8 w-8 mb-2 text-gray-400" /> : 
                   type === 'license' ? <Shield className="h-8 w-8 mb-2 text-gray-400" /> :
                   <FileText className="h-8 w-8 mb-2 text-gray-400" />}
                  <span className="text-sm font-medium capitalize">{type}</span>
                </label>
              </div>
            ))}
          </div>

          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            progress > 0 && (
              <div key={fileId} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Loading files...</p>
          ) : files.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No files uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type, file.name)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(file.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteFile(file.id, file.url)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileStorage;
