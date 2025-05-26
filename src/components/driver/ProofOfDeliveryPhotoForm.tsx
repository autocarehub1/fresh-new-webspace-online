import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ProofOfDeliveryPhotoFormProps {
  deliveryId: string;
  onComplete?: () => void;
}

const ProofOfDeliveryPhotoForm: React.FC<ProofOfDeliveryPhotoFormProps> = ({ deliveryId, onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a photo to upload.');
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `pod_${deliveryId}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('proof-of-delivery')
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('proof-of-delivery')
        .getPublicUrl(fileName);
      const photoUrl = publicUrlData?.publicUrl;
      if (!photoUrl) throw new Error('Failed to get public URL');
      // Update delivery record
      const { error: updateError } = await supabase
        .from('delivery_requests')
        .update({ proofOfDeliveryPhoto: photoUrl, status: 'completed' })
        .eq('id', deliveryId);
      if (updateError) throw updateError;
      toast.success('Proof of delivery uploaded and delivery marked as completed!');
      setFile(null);
      if (onComplete) onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload proof of delivery.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Upload Proof of Delivery Photo</label>
      <Input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      <Button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload & Complete Delivery'}
      </Button>
    </div>
  );
};

export default ProofOfDeliveryPhotoForm; 