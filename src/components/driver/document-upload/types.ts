
export interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  maxSize: number; // in MB
  acceptedTypes: string[];
}

export interface UploadedDocument {
  id: string;
  type: string;
  fileName: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
}

export interface DocumentUploadProps {
  userId: string;
  onComplete: () => void;
}
