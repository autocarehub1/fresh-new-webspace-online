import { toast } from 'sonner';
import { useDeliveryData } from './use-delivery-data';
import { DeliveryRequest } from '@/types/delivery';
import { useNotificationEmail } from './use-notification-email';
import { supabase } from '@/lib/supabase';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRequestActions = () => {
  const { updateDeliveryRequest, addTrackingUpdate, deleteDeliveryRequest } = useDeliveryData();
  const { sendStatusNotification } = useNotificationEmail();
  const queryClient = useQueryClient();

  const handleRequestAction = async (requestId: string, action: 'approve' | 'decline') => {
    const newStatus = action === 'approve' ? 'in_progress' : 'declined';
    try {
      await updateDeliveryRequest.mutateAsync({ 
        id: requestId, 
        status: newStatus 
      });

      if (action === 'approve') {
        await addTrackingUpdate.mutateAsync({
          requestId,
          update: {
            status: 'Request Approved',
            timestamp: new Date().toISOString(),
            location: 'Admin Dashboard',
            note: 'Delivery request has been approved'
          }
        });
      }
      toast.success(`Request ${requestId} ${action === 'approve' ? 'approved' : 'declined'}`);
    } catch (error) {
      toast.error('Failed to update request status');
    }
  };

  const handleStatusUpdate = async (
    request: DeliveryRequest, 
    newStatus: 'picked_up' | 'in_transit' | 'delivered'
  ) => {
    let statusText = '';
    let trackingStatus = '';
    let location = '';
    
    switch (newStatus) {
      case 'picked_up':
        statusText = 'Picked up by courier';
        trackingStatus = 'Picked Up';
        location = request.pickup_location;
        break;
      case 'in_transit':
        statusText = 'Package is in transit';
        trackingStatus = 'In Transit';
        location = 'En route to delivery location';
        break;
      case 'delivered':
        statusText = 'Package delivered to destination';
        trackingStatus = 'Delivered';
        location = request.delivery_location;
        break;
      default:
        return;
    }

    try {
      const statusForMain = newStatus === 'delivered' ? 'completed' : 'in_progress';
      
      await updateDeliveryRequest.mutateAsync({
        id: request.id,
        status: statusForMain
      });
      
      await addTrackingUpdate.mutateAsync({
        requestId: request.id,
        update: {
          status: trackingStatus,
          timestamp: new Date().toISOString(),
          location: location,
          note: statusText
        }
      });

      // If the delivery is marked as delivered, make the driver available again
      if (newStatus === 'delivered' && request.assigned_driver) {
        try {
          console.log(`Making driver ${request.assigned_driver} available again after completed delivery`);
          
          // Update the driver in the database to clear their current_delivery
          const { error } = await supabase
            .from('drivers')
            .update({ current_delivery: null })
            .eq('id', request.assigned_driver);
            
          if (error) {
            console.error('Error making driver available:', error);
          } else {
            console.log(`Driver ${request.assigned_driver} is now available for new deliveries`);
            toast.success(`Driver ${request.assigned_driver} is now available for new deliveries`);
            
            // Invalidate both driver and delivery request queries to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
          }
        } catch (driverError) {
          console.error('Exception when making driver available:', driverError);
        }
      }

      await sendStatusNotification(request, newStatus, statusText);

      toast.success(`Status updated: ${trackingStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteRequest = useCallback(
    async (requestId: string) => {
      try {
        console.log('Deleting delivery request:', requestId);
        
        // First check if this request has an assigned driver
        const { data: requestData, error: requestError } = await supabase
          .from('delivery_requests')
          .select('assigned_driver, status')
          .eq('id', requestId)
          .single();
        
        if (requestError) {
          console.error('Error fetching request details before deletion:', requestError);
        } else if (requestData && requestData.assigned_driver && requestData.status === 'completed') {
          // If the request was completed, make the driver available
          console.log(`Making driver ${requestData.assigned_driver} available after deleting completed request`);
          
          const { error: driverError } = await supabase
            .from('drivers')
            .update({ current_delivery: null })
            .eq('id', requestData.assigned_driver);
            
          if (driverError) {
            console.error('Error making driver available:', driverError);
          } else {
            console.log(`Driver ${requestData.assigned_driver} is now available for new deliveries`);
            toast.success(`Driver ${requestData.assigned_driver} is now available for new deliveries`);
            
            // Invalidate drivers query to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
          }
        }
        
        await deleteDeliveryRequest.mutateAsync(requestId);
        toast({
          title: 'Request deleted',
          description: 'The delivery request has been successfully deleted.',
        });
      } catch (error) {
        console.error('Error deleting request:', error);
        toast({
          title: 'Failed to delete request',
          description: 'There was an error deleting the delivery request.',
          variant: 'destructive',
        });
      }
    },
    [deleteDeliveryRequest, toast]
  );

  return {
    handleRequestAction,
    handleStatusUpdate,
    handleDeleteRequest
  };
};

