
import { toast } from 'sonner';
import { useDeliveryData } from './use-delivery-data';
import { DeliveryRequest } from '@/types/delivery';
import { useNotificationEmail } from './use-notification-email';

export const useRequestActions = () => {
  const { updateDeliveryRequest, addTrackingUpdate } = useDeliveryData();
  const { sendStatusNotification } = useNotificationEmail();

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

      await sendStatusNotification(request, newStatus, statusText);

      toast.success(`Status updated: ${trackingStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return {
    handleRequestAction,
    handleStatusUpdate,
  };
};

