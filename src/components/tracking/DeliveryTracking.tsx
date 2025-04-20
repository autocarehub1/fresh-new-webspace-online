
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeliveryRequest } from '@/types/delivery';
import Map from '@/components/map/Map';
import TrackingTimeline from './TrackingTimeline';
import PackageInfo from './PackageInfo';
import CourierInfo from './CourierInfo';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const DeliveryTracking = ({ trackingId }: { trackingId: string }) => {
  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        setLoading(true);
        
        // Query the Supabase database for the delivery request
        const { data, error } = await supabase
          .from('delivery_requests')
          .select('*, tracking_updates(*)')
          .or(`tracking_id.eq.${trackingId},id.eq.${trackingId}`)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          setError('No delivery found with this tracking ID');
          setLoading(false);
          return;
        }
        
        // Transform the data to match the expected format
        const enhancedRequest: DeliveryRequest = {
          id: data.id,
          trackingId: data.tracking_id || data.id,
          status: data.status,
          pickup_location: data.pickup_location,
          delivery_location: data.delivery_location,
          created_at: data.created_at,
          priority: data.priority || 'normal',
          packageType: data.package_type || 'Medical Supplies',
          tracking_updates: data.tracking_updates || [],
          pickupLocation: { 
            name: "Medical Facility", 
            address: data.pickup_location 
          },
          deliveryLocation: { 
            name: "Hospital", 
            address: data.delivery_location 
          },
          estimatedDelivery: data.estimated_delivery,
          temperature: data.temperature || {
            current: '2°C',
            required: '2-8°C',
            status: 'normal'
          },
          courier: data.assigned_driver ? {
            name: "Medical Courier",
            photo: "https://randomuser.me/api/portraits/men/32.jpg",
            vehicle: "Medical Delivery Vehicle",
            phone: "+1 (555) 123-4567"
          } : undefined,
          pickup_coordinates: data.pickup_coordinates,
          delivery_coordinates: data.delivery_coordinates,
          current_coordinates: data.current_coordinates,
          assigned_driver: data.assigned_driver
        };
        
        setDelivery(enhancedRequest);
      } catch (err: any) {
        console.error('Error fetching delivery:', err);
        setError(err.message || 'Failed to fetch delivery information');
      } finally {
        setLoading(false);
      }
    };
    
    if (trackingId) {
      fetchDeliveryData();
    }
  }, [trackingId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center py-8">Loading delivery information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !delivery) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              {error || `No delivery found with tracking ID: ${trackingId}`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">Tracking #{delivery.trackingId || delivery.id}</h2>
            {delivery.priority === 'urgent' && (
              <span className="bg-medical-red/10 text-medical-red text-xs font-semibold px-2.5 py-0.5 rounded">
                URGENT
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {delivery.estimatedDelivery && 
              `Estimated delivery by ${new Date(delivery.estimatedDelivery).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true
              })}`}
          </p>
        </div>
        <Button asChild variant="outline" className="mt-4 md:mt-0">
          <a href="#">Download Receipt</a>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <PackageInfo delivery={delivery} />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Courier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CourierInfo delivery={delivery} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Delivery Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackingTimeline updates={delivery.tracking_updates || []} />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Real-Time Location</CardTitle>
        </CardHeader>
        <CardContent>
          <Map />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryTracking;
