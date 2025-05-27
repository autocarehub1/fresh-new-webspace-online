
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DeliveryRequest } from '@/types/delivery';
import ProofOfDeliveryCapture from './ProofOfDeliveryCapture';
import DriverStatusAlert from './DriverStatusAlert';
import EmptyDeliveries from './EmptyDeliveries';
import DeliveryCard from './DeliveryCard';

interface DeliveryTrackerProps {
  driverId: string;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ driverId }) => {
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('');
  const [driverStatus, setDriverStatus] = useState<string>('inactive');

  useEffect(() => {
    fetchActiveDeliveries();
    fetchDriverStatus();
    setupRealtimeSubscription();
  }, [driverId]);

  const fetchDriverStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('status')
        .eq('id', driverId)
        .single();

      if (error) throw error;
      setDriverStatus(data?.status || 'inactive');
    } catch (error) {
      console.error('Error fetching driver status:', error);
    }
  };

  const fetchActiveDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('assigned_driver', driverId)
        .in('status', ['pending', 'in_progress', 'in_transit']);

      if (error) throw error;
      setActiveDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
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
              onClick: () => fetchActiveDeliveries()
            }
          });
        }
        
        fetchActiveDeliveries();
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
          setDriverStatus(newStatus);
          toast.info(`Status updated to: ${newStatus}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      console.log(`Updating delivery ${deliveryId} to status: ${status}`);
      
      // Map the status to the correct database values - align with the database constraints
      let dbStatus = status;
      if (status === 'picked_up') {
        dbStatus = 'in_progress'; // Use in_progress instead of picked_up to avoid constraint violation
      } else if (status === 'in_transit') {
        dbStatus = 'in_transit';
      } else if (status === 'completed') {
        dbStatus = 'completed';
      }
      
      console.log(`Database status will be: ${dbStatus}`);
      
      const { error } = await supabase
        .from('delivery_requests')
        .update({ status: dbStatus })
        .eq('id', deliveryId);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Add tracking update with appropriate status message
      const statusMessages: { [key: string]: string } = {
        'in_progress': 'Package Picked Up by Driver',
        'in_transit': 'Package In Transit to Destination',
        'completed': 'Package Delivered'
      };

      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: deliveryId,
          status: statusMessages[dbStatus] || dbStatus,
          timestamp: new Date().toISOString(),
          location: dbStatus === 'in_progress' ? 'Pickup Location' : 
                   dbStatus === 'in_transit' ? 'En Route' : 
                   dbStatus === 'completed' ? 'Delivery Location' : 'Driver Location',
          note: `Status updated by driver to ${dbStatus.replace('_', ' ')}`
        });

      // Refresh the deliveries list to show updated status
      await fetchActiveDeliveries();
      
      toast.success(`Delivery marked as ${status.replace('_', ' ')}`);
      console.log(`Successfully updated delivery ${deliveryId} to ${dbStatus}`);
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const handleCompleteDelivery = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setShowProofDialog(true);
  };

  const handleProofUploaded = async (photoUrl: string) => {
    try {
      // Update delivery with proof photo and mark as completed
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status: 'completed',
          proofOfDeliveryPhoto: photoUrl
        })
        .eq('id', selectedDeliveryId);

      if (error) throw error;

      // Add final tracking update
      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: selectedDeliveryId,
          status: 'Delivered',
          timestamp: new Date().toISOString(),
          location: 'Delivery Location',
          note: 'Package delivered with proof photo'
        });

      // Refresh the deliveries list
      await fetchActiveDeliveries();

      setShowProofDialog(false);
      setSelectedDeliveryId('');
      toast.success('Delivery completed successfully!');
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-64 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Loading active deliveries...</p>
        </div>
      </div>
    );
  }

  // Show status warning if driver is not active
  if (driverStatus !== 'active') {
    return <DriverStatusAlert status={driverStatus} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Deliveries</h3>
        <Badge variant="default" className="bg-green-600">
          Status: Active
        </Badge>
      </div>
      
      {activeDeliveries.length === 0 ? (
        <EmptyDeliveries />
      ) : (
        activeDeliveries.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            onStatusUpdate={updateDeliveryStatus}
            onCompleteDelivery={handleCompleteDelivery}
          />
        ))
      )}

      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Delivery</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Please take a photo as proof of delivery before completing this request.
            </p>
            
            <ProofOfDeliveryCapture
              deliveryId={selectedDeliveryId}
              onPhotoUploaded={handleProofUploaded}
              onCancel={() => {
                setShowProofDialog(false);
                setSelectedDeliveryId('');
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryTracker;
