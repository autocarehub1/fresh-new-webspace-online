import { toast } from 'sonner';
import { useDeliveryData } from './use-delivery-data';
import { DeliveryRequest, DeliveryStatus } from '@/types/delivery';
import { useNotificationEmail } from './use-notification-email';
import { useSlackNotification } from './use-slack-notification';
import { supabase } from '@/lib/supabase';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import EventsService from '@/services/EventsService';
import { createDetailedTrackingUpdateAsync } from '@/store/requests/requestUtils';

export const useRequestActions = () => {
  const { updateDeliveryRequest, addTrackingUpdate, deleteDeliveryRequest } = useDeliveryData();
  const { sendStatusNotification } = useNotificationEmail();
  const { sendNewRequestNotification, sendStatusUpdateNotification } = useSlackNotification();
  const queryClient = useQueryClient();

  const handleRequestAction = async (requestId: string, action: 'approve' | 'decline') => {
    // When approved, we'll keep it as pending until driver assignment
    // Only decline changes the status
    console.log(`[REQUEST ACTION] Starting ${action} process for request ${requestId}`);
    const newStatus = action === 'approve' ? 'pending' : 'declined';
    
    try {
      console.log(`Processing ${action} action for request ${requestId}`);
      
      // First check if this request has already been approved or declined
      const { data: requestData, error: requestError } = await supabase
        .from('delivery_requests')
        .select('id, status, tracking_updates(*)')
        .eq('id', requestId)
        .single();
      
      console.log(`[REQUEST ACTION] Current request data:`, requestData?.status, 
        requestData?.tracking_updates?.length || 0, 'tracking updates');
      
      if (requestError) {
        console.error('Error checking request status:', requestError);
        throw new Error(`Could not verify current request status: ${requestError.message}`);
      }
      
      // Check if already has the target status or has been approved
      const isAlreadyApproved = requestData?.tracking_updates?.some(
        update => update.status === 'Request Approved'
      );
      
      if (action === 'approve' && isAlreadyApproved) {
        console.log(`Request ${requestId} is already approved`);
        toast.info('This request has already been approved');
        return;
      }
      
      if (action === 'decline' && requestData?.status === 'declined') {
        console.log(`Request ${requestId} is already declined`);
        toast.info('This request has already been declined');
        return;
      }
      
      // Update the request status
      await updateDeliveryRequest.mutateAsync({ 
        id: requestId, 
        status: newStatus 
      });

      // Get the updated request data for notifications
      const { data: updatedRequest } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (action === 'approve') {
        console.log(`Adding tracking update for approved request ${requestId}`);
        // Add a distinct tracking update to mark this as approved
        await addTrackingUpdate.mutateAsync({
          requestId,
          update: {
            status: 'Request Approved',
            timestamp: new Date().toISOString(),
            location: 'Admin Dashboard',
            note: 'Delivery request has been approved and awaiting driver assignment'
          }
        });

        // Send Slack notification for approved request
        if (updatedRequest) {
          await sendNewRequestNotification(updatedRequest);
        }
      } else if (action === 'decline') {
        // Add a tracking update for declined requests too
        await addTrackingUpdate.mutateAsync({
          requestId,
          update: {
            status: 'Request Declined',
            timestamp: new Date().toISOString(),
            location: 'Admin Dashboard',
            note: 'Delivery request has been declined by admin'
          }
        });

        // Send Slack notification for declined request
        if (updatedRequest) {
          await sendStatusUpdateNotification(
            updatedRequest, 
            'Request Declined', 
            'Delivery request has been declined by admin'
          );
        }
      }
      
      // Explicitly invalidate queries to ensure UI refresh
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      
      toast.success(`Request ${requestId} ${action === 'approve' ? 'approved' : 'declined'}`);
      
      // Return success to allow chaining
      return true;
    } catch (error) {
      console.error(`Error processing ${action} action:`, error);
      toast.error(`Failed to ${action} request: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleStatusUpdate = async (
    request: DeliveryRequest, 
    newStatus: 'picked_up' | 'in_transit' | 'delivered' | 'reset_to_pending'
  ) => {
    let statusText = '';
    let trackingStatus = '';
    let location = '';
    let statusForMain: DeliveryStatus = 'in_progress';
    let coordinates = undefined;
    
    console.log(`[STATUS UPDATE] Processing status update for request ${request.id} from ${request.status} to ${newStatus}`);
    
    switch (newStatus) {
      case 'picked_up':
        statusText = 'Picked up by courier';
        trackingStatus = 'Picked Up';
        location = request.pickup_location;
        statusForMain = 'in_progress';
        coordinates = request.pickup_coordinates;
        break;
      case 'in_transit':
        statusText = 'Package is in transit';
        trackingStatus = 'In Transit';
        location = 'En route to delivery location';
        statusForMain = 'in_progress';
        coordinates = request.current_coordinates;
        break;
      case 'delivered':
        statusText = 'Package delivered to destination';
        trackingStatus = 'Delivered';
        location = request.delivery_location;
        statusForMain = 'completed';
        coordinates = request.delivery_coordinates;
        break;
      case 'reset_to_pending':
        // Handle the source status differently
        if (request.status === 'completed') {
          statusText = 'Reopened completed request';
          trackingStatus = 'Request Reopened';
          location = 'Admin Dashboard';
          statusForMain = 'in_progress'; // Reopened requests go to in_progress, not pending
        } else if (request.status === 'declined') {
          statusText = 'Reconsidered declined request';
          trackingStatus = 'Request Reconsidered';
          location = 'Admin Dashboard';
          statusForMain = 'pending';
        } else {
          statusText = 'Request reset to pending status';
          trackingStatus = 'Pending';
          location = 'Admin Dashboard';
          statusForMain = 'pending';
        }
        break;
      default:
        console.log(`[STATUS UPDATE] Unknown status transition: ${newStatus}`);
        return;
    }

    try {
      console.log(`[STATUS UPDATE] Updating request ${request.id} to status ${statusForMain}`);
      
      // Special handling for driver reassignment when reopening completed requests
      if (newStatus === 'reset_to_pending' && request.status === 'completed' && request.assigned_driver) {
        console.log(`[STATUS UPDATE] Completed delivery being reopened - preserving driver assignment for ${request.id}`);
        // Don't nullify the assigned_driver when reopening a completed request
        await updateDeliveryRequest.mutateAsync({
          id: request.id,
          status: statusForMain
        });
      } else {
        // Normal status update, potentially clearing driver assignment for pending
        await updateDeliveryRequest.mutateAsync({
          id: request.id,
          status: statusForMain
        });
      }
      
      console.log(`[STATUS UPDATE] Adding tracking update: ${trackingStatus}`);
      let update;
      if (['picked_up', 'in_transit', 'delivered'].includes(newStatus) && coordinates) {
        update = await createDetailedTrackingUpdateAsync(request, trackingStatus, coordinates, statusText);
      } else {
        update = {
          status: trackingStatus,
          timestamp: new Date().toISOString(),
          location: location,
          note: statusText
        };
      }
      await addTrackingUpdate.mutateAsync({
        requestId: request.id,
        update
      });

      // If the delivery is marked as delivered, make the driver available again
      if (newStatus === 'delivered' && request.assigned_driver) {
        try {
          console.log(`[STATUS UPDATE] Making driver ${request.assigned_driver} available again after completed delivery`);
          
          // Update the driver in the database to clear their current_delivery
          const { error } = await supabase
            .from('drivers')
            .update({ current_delivery: null })
            .eq('id', request.assigned_driver);
            
          if (error) {
            console.error('[STATUS UPDATE] Error making driver available:', error);
          } else {
            console.log(`[STATUS UPDATE] Driver ${request.assigned_driver} is now available for new deliveries`);
            toast.success(`Driver ${request.assigned_driver} is now available for new deliveries`);
            
            // Invalidate both driver and delivery request queries to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
          }
        } catch (driverError) {
          console.error('[STATUS UPDATE] Exception when making driver available:', driverError);
        }
      }

      // Send notifications regardless of the transition
      await sendStatusNotification(request, newStatus, statusText);
      
      // MULTI-CHANNEL NOTIFICATION APPROACH:
      
      // 1. Try the original Slack notification system
      console.log(`[STATUS UPDATE] Sending status update via SlackClient: ${trackingStatus}`);
      try {
        await sendStatusUpdateNotification(request, trackingStatus, statusText);
        console.log('[STATUS UPDATE] Status notification sent via SlackClient');
      } catch (slackError) {
        console.error('[STATUS UPDATE] Error sending via SlackClient:', slackError);
      }
      
      // 2. Also use the Events service as a reliable backup channel
      console.log(`[STATUS UPDATE] Sending status update via Events service: ${trackingStatus}`);
      try {
        await EventsService.deliveryStatusUpdateEvent(request, trackingStatus, statusText);
        console.log('[STATUS UPDATE] Status notification sent via Events service');
      } catch (eventsError) {
        console.error('[STATUS UPDATE] Error sending via Events service:', eventsError);
      }

      console.log(`[STATUS UPDATE] Status update complete for ${request.id}: ${trackingStatus}`);
      toast.success(`Status updated: ${trackingStatus}`);
      
      // Explicitly invalidate queries to ensure UI refresh
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      
      return true;
    } catch (error) {
      console.error(`[STATUS UPDATE] Error updating status for ${request.id}:`, error);
      toast.error('Failed to update status');
      return false;
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
        
        // Handle navigation to prevent blank page issues
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const currentUrl = new URL(window.location.href);
          const currentTab = currentUrl.searchParams.get('tab');
          
          // Check if we're on a specific request details page or in requests tab
          if (currentPath.includes(requestId) || currentPath.includes('/admin/request/')) {
            console.log('Redirecting from request-specific page to appropriate admin tab');
            
            // Determine which admin tab to navigate to based on context
            let targetUrl = '/admin';
            if (currentTab) {
              if (currentTab === 'requests' || currentTab === 'orders') {
                targetUrl = `/admin?tab=${currentTab}`;
              }
            }
            
            window.history.pushState({}, '', targetUrl);
          }
        }
        
        await deleteDeliveryRequest.mutateAsync(requestId);
        
        // Ensure queries are properly invalidated after deletion
        queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
        
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
    [deleteDeliveryRequest, queryClient, toast]
  );

  return {
    handleRequestAction,
    handleStatusUpdate,
    handleDeleteRequest
  };
};

