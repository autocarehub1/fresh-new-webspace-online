
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeliveryStore } from '@/store/deliveryStore';
import { DeliveryRequest } from '@/types/delivery';
import Map from '@/components/map/Map';
import TrackingTimeline from './TrackingTimeline';
import PackageInfo from './PackageInfo';
import CourierInfo from './CourierInfo';

export const DeliveryTracking = ({ trackingId }: { trackingId: string }) => {
  const { getRequestByTrackingId } = useDeliveryStore();
  const [delivery, setDelivery] = useState<DeliveryRequest | null>(getRequestByTrackingId(trackingId));
  
  useEffect(() => {
    const request = getRequestByTrackingId(trackingId);
    if (!request) {
      return;
    }
    
    // Enhance the request with UI-specific properties if they don't exist
    const enhancedRequest = {
      ...request,
      trackingId: request.trackingId || request.id,
      pickupLocation: request.pickupLocation || { 
        name: "Medical Facility", 
        address: request.pickup_location 
      },
      deliveryLocation: request.deliveryLocation || { 
        name: "Hospital", 
        address: request.delivery_location 
      },
      priority: request.priority || 'normal',
      packageType: request.packageType || 'Medical Supplies',
      temperature: request.temperature || {
        current: '2°C',
        required: '2-8°C',
        status: 'normal'
      },
      courier: request.courier || {
        name: "John Doe",
        photo: "https://randomuser.me/api/portraits/men/32.jpg",
        vehicle: "Delivery Van #427",
        phone: "+1 (555) 123-4567"
      }
    };
    
    setDelivery(enhancedRequest);
  }, [trackingId, getRequestByTrackingId]);

  if (!delivery) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No delivery found with tracking ID: {trackingId}</p>
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
      
      {/* Package Info Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <PackageInfo delivery={delivery} />
        </CardContent>
      </Card>
      
      {/* Courier Info and Tracking Timeline */}
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
      
      {/* Map Card */}
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
