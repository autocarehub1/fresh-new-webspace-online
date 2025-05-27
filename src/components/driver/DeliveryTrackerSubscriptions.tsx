
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DeliveryTrackerSubscriptionsProps {
  driverId: string;
  onDeliveriesChange: () => void;
  onDriverStatusChange: (status: string) => void;
}

const useDeliveryTrackerSubscriptions = ({ 
  driverId, 
  onDeliveriesChange, 
  onDriverStatusChange 
}: DeliveryTrackerSubscriptionsProps) => {
  useEffect(() => {
    const channel = supabase
      .channel(`driver_deliveries_${driverId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'delivery_requests',
        filter: `assigned_driver=eq.${driverId}`
      }, (payload) => {
        console.log('Real-time delivery update:', payload);
        
        // Show notification for new assignments with proper type checking
        if (payload.eventType === 'UPDATE' && 
            payload.new && typeof payload.new === 'object' && 'assigned_driver' in payload.new &&
            payload.old && typeof payload.old === 'object' && 'assigned_driver' in payload.old &&
            payload.new.assigned_driver === driverId && 
            !payload.old.assigned_driver) {
          const newPayload = payload.new as any;
          toast.success('🚚 New delivery assigned to you!', {
            description: `Pickup: ${newPayload.pickup_location}`,
            action: {
              label: "View",
              onClick: () => onDeliveriesChange()
            }
          });
        }
        
        // Refresh deliveries on any change
        onDeliveriesChange();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drivers',
        filter: `id=eq.${driverId}`
      }, (payload) => {
        console.log('Driver status update:', payload);
        if (payload.new && typeof payload.new === 'object' && 'status' in payload.new &&
            payload.old && typeof payload.old === 'object' && 'status' in payload.old &&
            payload.new.status !== payload.old.status) {
          const newStatus = payload.new.status as string;
          onDriverStatusChange(newStatus);
          toast.info(`Status updated to: ${newStatus}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, onDeliveriesChange, onDriverStatusChange]);
};

export default useDeliveryTrackerSubscriptions;
