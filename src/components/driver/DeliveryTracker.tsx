
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Package, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { DeliveryRequest } from '@/types/delivery';

interface DeliveryTrackerProps {
  driverId: string;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ driverId }) => {
  const [activeDeliveries, setActiveDeliveries] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveDeliveries();
    setupRealtimeSubscription();
  }, [driverId]);

  const fetchActiveDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('assigned_driver', driverId)
        .in('status', ['pending', 'in_progress']);

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
        fetchActiveDeliveries();
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

      // Add tracking update
      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: deliveryId,
          status: status === 'in_progress' ? 'Driver En Route' : 'Delivered',
          timestamp: new Date().toISOString(),
          location: status === 'in_progress' ? 'Pickup Location' : 'Delivery Location',
          note: `Status updated by driver to ${status}`
        });

      toast.success(`Delivery marked as ${status}`);
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error('Failed to update delivery status');
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Active Deliveries</h3>
      
      {activeDeliveries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No active deliveries assigned</p>
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
                <Badge variant={delivery.status === 'pending' ? 'secondary' : 'default'}>
                  {delivery.status}
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
              
              <div className="flex gap-2 pt-2">
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
                    onClick={() => updateDeliveryStatus(delivery.id, 'completed')}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default DeliveryTracker;
