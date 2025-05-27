
import { useState } from 'react';
import { supabase, refreshSchemaCache } from '@/lib/supabase';
import { toast } from 'sonner';

export const useDeliveryCompletion = () => {
  const [uploading, setUploading] = useState(false);

  const completeDeliveryWithPhoto = async (deliveryId: string, photoUrl: string) => {
    setUploading(true);
    try {
      console.log('Completing delivery with photo:', { deliveryId, photoUrl });
      
      // First, try to refresh the schema cache
      console.log('Refreshing schema cache before delivery update...');
      await refreshSchemaCache();
      
      // Try updating with the standard column name first
      let updateError;
      try {
        const { error } = await supabase
          .from('delivery_requests')
          .update({ 
            proofOfDeliveryPhoto: photoUrl, 
            status: 'completed' 
          })
          .eq('id', deliveryId);
        
        updateError = error;
      } catch (err) {
        console.log('Primary update failed, trying alternative approach...');
        updateError = err;
      }

      // If the primary update failed due to column not found, try alternative column names
      if (updateError && updateError.message?.includes('proofOfDeliveryPhoto')) {
        console.log('Trying alternative column name: proof_of_delivery_photo');
        const { error: altError } = await supabase
          .from('delivery_requests')
          .update({ 
            proof_of_delivery_photo: photoUrl, 
            status: 'completed' 
          })
          .eq('id', deliveryId);

        if (altError) {
          console.error('Alternative update also failed:', altError);
          // If both fail, just update the status without the photo URL for now
          const { error: statusOnlyError } = await supabase
            .from('delivery_requests')
            .update({ status: 'completed' })
            .eq('id', deliveryId);
          
          if (statusOnlyError) {
            throw statusOnlyError;
          }
          
          console.warn('Updated delivery status only - photo URL could not be saved to database');
          toast.success('Delivery completed! Photo uploaded but database needs schema update.');
          return true;
        }
      } else if (updateError) {
        throw updateError;
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
