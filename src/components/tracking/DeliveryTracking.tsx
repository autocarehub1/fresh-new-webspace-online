
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DeliveryRequest } from '@/types/delivery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TrackingTimeline from './TrackingTimeline';
import PackageInfo from './PackageInfo';
import CourierInfo from './CourierInfo';
import DeliveryTrackingControls from './DeliveryTrackingControls';
import DeliveryTrackingETA from './DeliveryTrackingETA';
import DeliveryTrackingMap from './DeliveryTrackingMap';
import DeliveryTrackingProof from './DeliveryTrackingProof';
import { generatePDF } from '@/utils/generatePDF';
import { useDeliveryTracking } from '@/hooks/use-delivery-tracking';

interface TrackingProps {
  trackingId?: string;
}

export const DeliveryTracking: React.FC<TrackingProps> = ({ trackingId: propTrackingId }) => {
  const { trackingId: paramTrackingId } = useParams();
  const trackingId = propTrackingId || paramTrackingId;
  
  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Use the custom tracking hook
  const {
    isLiveTracking,
    simulationSpeed,
    eta,
    trafficCondition,
    detailedStatus,
    etaProgress,
    etaCountdown,
    startLiveTracking,
    stopLiveTracking,
    resetSimulation,
    handleSpeedChange
  } = useDeliveryTracking({ delivery });

  // Fetch delivery and assigned driver info
  const fetchDeliveryData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching delivery data for tracking ID:', trackingId);
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*, tracking_updates(*)')
        .or(`tracking_id.eq.${trackingId},id.eq.${trackingId}`)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Delivery data received:', data);
      
      if (!data) {
        setError('No delivery found with this tracking ID');
        setLoading(false);
        return;
      }
    
      // Fetch actual driver info if assigned
      let courierInfo;
      if (data.assigned_driver) {
        console.log('Fetching driver data for ID:', data.assigned_driver);
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('name,photo,vehicle_type,phone')
          .eq('id', data.assigned_driver)
          .single();
        
        console.log('Driver data from DB:', {
          id: data.assigned_driver,
          name: driverData?.name,
          photo: driverData?.photo,
          error: driverError
        });
        
        if (!driverError && driverData) {
          courierInfo = {
            name: driverData.name,
            photo: driverData.photo || '',
            vehicle: driverData.vehicle_type,
            phone: driverData.phone || ''
          };
          console.log('Created courierInfo:', courierInfo);
        }
      }
      
      console.log('DeliveryTracking - assigned_driver ID:', data.assigned_driver);
      console.log('DeliveryTracking - final courierInfo:', courierInfo);
        
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
        courier: courierInfo,
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
  }, [trackingId]);

  // Initial fetch and set up realtime listener
  useEffect(() => {
    if (!trackingId) return;
    fetchDeliveryData();
    
    // Subscribe to changes on this delivery record
    const channel = supabase
      .channel(`delivery_${trackingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'delivery_requests',
        filter: `tracking_id=eq.${trackingId}`
      }, (payload) => {
        console.log('Realtime update received:', payload);
        fetchDeliveryData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackingId, fetchDeliveryData]);

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
            {isLiveTracking && (
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                LIVE
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
        <Button 
          variant="outline" 
          className="mt-4 md:mt-0"
          onClick={() => {
            try {
              generatePDF(delivery);
              toast.success('Receipt downloaded successfully');
            } catch (err) {
              console.error('Error generating PDF:', err);
              toast.error('Failed to generate receipt');
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Receipt
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
            <CourierInfo 
              info={delivery.courier} 
              assigned_driver={delivery.assigned_driver}
            />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Live Tracking</CardTitle>
            <DeliveryTrackingControls
              isLiveTracking={isLiveTracking}
              simulationSpeed={simulationSpeed}
              delivery={delivery}
              onStart={startLiveTracking}
              onStop={stopLiveTracking}
              onReset={resetSimulation}
              onSpeedChange={handleSpeedChange}
            />
          </CardHeader>
          <CardContent>
            <DeliveryTrackingETA
              delivery={delivery}
              eta={eta}
              trafficCondition={trafficCondition}
              detailedStatus={detailedStatus}
              etaProgress={etaProgress}
              etaCountdown={etaCountdown}
            />
            
            <DeliveryTrackingMap 
              driverLocation={delivery.current_coordinates}
              deliveryLocation={delivery.delivery_coordinates}
              pickupLocation={delivery.pickup_coordinates}
              height="300px"
              showTraffic={true}
              trafficCondition={trafficCondition}
              estimatedTimeMinutes={eta?.eta}
            />
          </CardContent>
        </Card>
      </div>
      
      <DeliveryTrackingProof delivery={delivery} />
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Delivery Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingTimeline delivery={delivery} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryTracking;
