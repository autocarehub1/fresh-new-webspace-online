
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ProofOfDeliveryCapture from './ProofOfDeliveryCapture';

interface ProofOfDeliveryPhotoFormProps {
  deliveryId: string;
  onComplete?: () => void;
}

const ProofOfDeliveryPhotoForm: React.FC<ProofOfDeliveryPhotoFormProps> = ({ deliveryId, onComplete }) => {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUploaded = async (photoUrl: string) => {
    setUploading(true);
    try {
      // Update delivery record with proof photo
      const { error: updateError } = await supabase
        .from('delivery_requests')
        .update({ proofOfDeliveryPhoto: photoUrl, status: 'completed' })
        .eq('id', deliveryId);

      if (updateError) throw updateError;

      toast.success('Proof of delivery uploaded and delivery marked as completed!');
      if (onComplete) onComplete();
    } catch (err: any) {
      console.error('Error completing delivery:', err);
      toast.error(err.message || 'Failed to complete delivery.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ProofOfDeliveryCapture
        deliveryId={deliveryId}
        onPhotoUploaded={handlePhotoUploaded}
      />
    </div>
  );
};

export default ProofOfDeliveryPhotoForm;
