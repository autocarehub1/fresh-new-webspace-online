
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DeliveryRequest } from '@/types/delivery';
import DriverStatusAlert from './DriverStatusAlert';
import EmptyDeliveries from './EmptyDeliveries';
import DeliveryCard from './DeliveryCard';
import DeliveryTrackerHeader from './DeliveryTrackerHeader';
import useDeliveryTrackerSubscriptions from './DeliveryTrackerSubscriptions';
import { useDeliveryActions } from './DeliveryTrackerActions';
import DeliveryTrackerDialog from './DeliveryTrackerDialog';

interface DeliveryTrackerProps {
  driverId: string;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ driverId }) => {
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('');
  const [driverStatus, setDriverStatus] = useState<string>('inactive');

  const { updateDeliveryStatus, completeDeliveryWithProof } = useDeliveryActions();

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
      console.log('Fetching active deliveries for driver:', driverId);
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('assigned_driver', driverId)
        .in('status', ['pending', 'in_progress', 'completed']);

      if (error) throw error;
      console.log('Active deliveries fetched:', data);
      setActiveDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDeliveries();
    fetchDriverStatus();
  }, [driverId]);

  useDeliveryTrackerSubscriptions({
    driverId,
    onDeliveriesChange: fetchActiveDeliveries,
    onDriverStatusChange: setDriverStatus
  });

  const handleStatusUpdate = async (deliveryId: string, status: string) => {
    const success = await updateDeliveryStatus(deliveryId, status);
    if (success) {
      await fetchActiveDeliveries();
    }
  };

  const handleCompleteDelivery = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setShowProofDialog(true);
  };

  const handleProofUploaded = async (photoUrl: string) => {
    const success = await completeDeliveryWithProof(selectedDeliveryId, photoUrl);
    if (success) {
      await fetchActiveDeliveries();
      setShowProofDialog(false);
      setSelectedDeliveryId('');
    }
  };

  const handleDialogCancel = () => {
    setShowProofDialog(false);
    setSelectedDeliveryId('');
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
      <DeliveryTrackerHeader driverStatus={driverStatus} />
      
      {activeDeliveries.length === 0 ? (
        <EmptyDeliveries />
      ) : (
        activeDeliveries.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            onStatusUpdate={handleStatusUpdate}
            onCompleteDelivery={handleCompleteDelivery}
          />
        ))
      )}

      <DeliveryTrackerDialog
        open={showProofDialog}
        onOpenChange={setShowProofDialog}
        selectedDeliveryId={selectedDeliveryId}
        onProofUploaded={handleProofUploaded}
        onCancel={handleDialogCancel}
      />
    </div>
  );
};

export default DeliveryTracker;
