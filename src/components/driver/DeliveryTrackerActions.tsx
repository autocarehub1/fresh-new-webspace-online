
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { generateTrackingId } from '@/utils/deliveryUtils';

export const useDeliveryActions = () => {
  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      console.log(`Driver updating delivery ${deliveryId} from current status to: ${status}`);
      
      // First, get the current delivery to check if it has a tracking_id
      const { data: currentDelivery, error: fetchError } = await supabase
        .from('delivery_requests')
        .select('tracking_id, status')
        .eq('id', deliveryId)
        .single();

      if (fetchError) {
        console.error('Error fetching current delivery:', fetchError);
        throw fetchError;
      }

      // Generate tracking_id if it doesn't exist and we're moving to active status
      let trackingId = currentDelivery.tracking_id;
      if (!trackingId && (status === 'in_progress' || status === 'in_transit')) {
        trackingId = generateTrackingId();
        console.log(`Generated new tracking ID: ${trackingId}`);
      }
      
      // Map UI status to valid database status
      let dbStatus = status;
      if (status === 'in_transit') {
        // Use 'in_progress' instead of 'in_transit' since it's not allowed by database constraint
        dbStatus = 'in_progress';
        console.log(`Mapping status from ${status} to ${dbStatus} for database compatibility`);
      }
      
      // Prepare update data
      const updateData: any = { status: dbStatus };
      if (trackingId) {
        updateData.tracking_id = trackingId;
      }

      const { error } = await supabase
        .from('delivery_requests')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Add tracking update with appropriate status message
      const statusMessages: { [key: string]: string } = {
        'in_progress': status === 'in_transit' ? 'Package In Transit to Destination' : 'Package Picked Up by Driver',
        'completed': 'Package Delivered'
      };

      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: deliveryId,
          status: statusMessages[dbStatus] || dbStatus,
          timestamp: new Date().toISOString(),
          location: status === 'in_progress' ? 'Pickup Location' : 
                   status === 'in_transit' ? 'En Route' : 
                   status === 'completed' ? 'Delivery Location' : 'Driver Location',
          note: `Status updated by driver to ${status.replace('_', ' ')}`
        });

      console.log(`Successfully updated delivery ${deliveryId} to ${dbStatus}${trackingId ? ` with tracking ID ${trackingId}` : ''}`);
      
      // Show success message with proper display text
      const displayStatus = status === 'in_progress' ? 'picked up' : 
                           status === 'in_transit' ? 'in transit' : 
                           status.replace('_', ' ');
      toast.success(`Delivery marked as ${displayStatus}${trackingId ? ` (Tracking: ${trackingId})` : ''}`);
      
      return true;
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error('Failed to update delivery status');
      return false;
    }
  };

  const completeDeliveryWithProof = async (deliveryId: string, photoUrl: string) => {
    try {
      console.log('Completing delivery with proof photo:', { deliveryId, photoUrl });
      
      // Get current delivery to ensure tracking_id exists
      const { data: currentDelivery, error: fetchError } = await supabase
        .from('delivery_requests')
        .select('tracking_id')
        .eq('id', deliveryId)
        .single();

      if (fetchError) {
        console.error('Error fetching current delivery:', fetchError);
        throw fetchError;
      }

      // Generate tracking_id if it doesn't exist
      let trackingId = currentDelivery.tracking_id;
      if (!trackingId) {
        trackingId = generateTrackingId();
        console.log(`Generated tracking ID for completion: ${trackingId}`);
      }
      
      // Update delivery with proof photo, tracking ID, and mark as completed
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status: 'completed',
          proofofdeliveryphoto: photoUrl,
          tracking_id: trackingId
        })
        .eq('id', deliveryId);

      if (error) {
        console.error('Error updating delivery with proof:', error);
        throw error;
      }

      // Add final tracking update
      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: deliveryId,
          status: 'Delivered',
          timestamp: new Date().toISOString(),
          location: 'Delivery Location',
          note: 'Package delivered with proof photo'
        });

      console.log('Delivery completed successfully with proof photo and tracking ID:', trackingId);
      toast.success(`Delivery completed successfully! (Tracking: ${trackingId})`);
      return true;
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
      return false;
    }
  };

  return {
    updateDeliveryStatus,
    completeDeliveryWithProof
  };
};
