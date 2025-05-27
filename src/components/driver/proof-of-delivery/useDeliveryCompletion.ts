
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useDeliveryCompletion = () => {
  const [uploading, setUploading] = useState(false);

  const completeDeliveryWithPhoto = async (deliveryId: string, photoUrl: string) => {
    setUploading(true);
    try {
      console.log('Completing delivery with photo:', { deliveryId, photoUrl });
      
      // Update delivery record with proof photo
      const { error: updateError } = await supabase
        .from('delivery_requests')
        .update({ 
          proofOfDeliveryPhoto: photoUrl, 
          status: 'completed' 
        })
        .eq('id', deliveryId);

      if (updateError) {
        console.error('Error updating delivery:', updateError);
        throw updateError;
      }

      console.log('Delivery completed successfully');
      toast.success('Proof of delivery uploaded and delivery marked as completed!');
      return true;
    } catch (err: any) {
      console.error('Error completing delivery:', err);
      toast.error(err.message || 'Failed to complete delivery.');
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    completeDeliveryWithPhoto
  };
};
