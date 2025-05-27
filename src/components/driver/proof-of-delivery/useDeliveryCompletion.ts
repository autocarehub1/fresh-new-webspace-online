
import { useState } from 'react';
import { supabase, refreshSchemaCache } from '@/lib/supabase';
import { toast } from 'sonner';

export const useDeliveryCompletion = () => {
  const [uploading, setUploading] = useState(false);

  const completeDeliveryWithPhoto = async (deliveryId: string, photoUrl: string) => {
    setUploading(true);
    try {
      console.log('Completing delivery with photo:', { deliveryId, photoUrl });
      
      // Use the actual column name from the database (lowercase)
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          proofofdeliveryphoto: photoUrl, 
          status: 'completed' 
        })
        .eq('id', deliveryId);

      if (error) {
        console.error('Error updating delivery:', error);
        throw error;
      }

      console.log('Delivery completed successfully with photo');
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
