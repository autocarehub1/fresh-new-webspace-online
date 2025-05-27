
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Clock, Package, Navigation, Camera, Bell, Truck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { DeliveryRequest } from '@/types/delivery';
import ProofOfDeliveryCapture from './ProofOfDeliveryCapture';

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
        .in('status', ['pending', 'in_progress', 'picked_up', 'in_transit']);

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
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', deliveryId);

      if (error) throw error;

      // Add tracking update with appropriate status message
      const statusMessages = {
        'in_progress': 'Driver En Route to Pickup',
        'picked_up': 'Package Picked Up',
        'in_transit': 'Package In Transit to Destination',
        'completed': 'Package Delivered'
      };

      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: deliveryId,
          status: statusMessages[status as keyof typeof statusMessages] || status,
          timestamp: new Date().toISOString(),
          location: status === 'picked_up' ? 'Pickup Location' : 
                   status === 'in_transit' ? 'En Route' : 
                   status === 'completed' ? 'Delivery Location' : 'Driver Location',
          note: `Status updated by driver to ${status.replace('_', ' ')}`
        });

      toast.success(`Delivery marked as ${status.replace('_', ' ')}`);
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
          proofOfDeliveryPhoto: photoUrl,
          updated_at: new Date().toISOString()
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

      setShowProofDialog(false);
      setSelectedDeliveryId('');
      toast.success('Delivery completed successfully!');
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'picked_up': return 'outline';
      case 'in_transit': return 'default';
      case 'completed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'in_progress': return 'text-blue-600';
      case 'picked_up': return 'text-orange-600';
      case 'in_transit': return 'text-purple-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading active deliveries...</p>
        </CardContent>
      </Card>
    );
  }

  // Show status warning if driver is not active
  if (driverStatus !== 'active') {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Bell className="h-5 w-5" />
            Driver Status: {driverStatus}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-orange-600">
              {driverStatus === 'pending' && 'Your driver application is pending admin approval.'}
              {driverStatus === 'inactive' && 'Your driver account is currently inactive. Please contact admin.'}
              {driverStatus === 'suspended' && 'Your driver account has been suspended. Please contact admin.'}
            </p>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              Status: {driverStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No active deliveries assigned</p>
              <p className="text-sm text-gray-400">
                New deliveries will appear here when assigned by dispatch
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        activeDeliveries.map((delivery) => (
          <Card key={delivery.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  Delivery #{delivery.tracking_id || delivery.id.slice(0, 8)}
                </CardTitle>
                <Badge variant={getStatusBadgeVariant(delivery.status)} className={getStatusColor(delivery.status)}>
                  {delivery.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Pickup</p>
                    <p className="text-sm text-gray-600">{delivery.pickup_location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Navigation className="h-4 w-4 mt-1 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">Delivery</p>
                    <p className="text-sm text-gray-600">{delivery.delivery_location}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{delivery.package_type || 'Medical Supplies'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">
                    Created: {new Date(delivery.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {delivery.status === 'pending' && (
                  <Button 
                    onClick={() => updateDeliveryStatus(delivery.id, 'in_progress')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Delivery
                  </Button>
                )}
                
                {delivery.status === 'in_progress' && (
                  <Button 
                    onClick={() => updateDeliveryStatus(delivery.id, 'picked_up')}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Picked Up
                  </Button>
                )}
                
                {delivery.status === 'picked_up' && (
                  <Button 
                    onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Mark In Transit
                  </Button>
                )}
                
                {delivery.status === 'in_transit' && (
                  <Button 
                    onClick={() => handleCompleteDelivery(delivery.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Complete with Photo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
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
