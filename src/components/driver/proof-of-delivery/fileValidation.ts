
import { toast } from 'sonner';

export const validateFile = (file: File): boolean => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return false;
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    toast.error('Image must be smaller than 10MB');
    return false;
  }

  return true;
};

export const generateFileName = (deliveryId: string, originalFileName: string): string => {
  const fileExt = originalFileName.split('.').pop();
  return `pod_${deliveryId}_${Date.now()}.${fileExt}`;
};
