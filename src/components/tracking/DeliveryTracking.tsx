
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { DeliveryRequest, DeliveryStatus } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface TrackingProps {
  trackingId?: string;
}

// Add a function to calculate ETA based on distance and speed
const calculateETA = (
  current: { lat: number; lng: number }, 
  destination: { lat: number; lng: number }, 
  averageSpeed: number = 30 // km/h
) => {
  const R = 6371; // Earth's radius in km
  
  // Convert latitude and longitude from degrees to radians
  const lat1 = current.lat * Math.PI / 180;
  const lon1 = current.lng * Math.PI / 180;
  const lat2 = destination.lat * Math.PI / 180;
  const lon2 = destination.lng * Math.PI / 180;
  
  // Haversine formula to calculate distance
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  // Calculate time in minutes
  const timeInMinutes = (distance / averageSpeed) * 60;
  
  return {
    distance: distance.toFixed(1),
    eta: Math.round(timeInMinutes)
  };
};

export const DeliveryTracking: React.FC<TrackingProps> = ({ trackingId: propTrackingId }) => {
  const { trackingId: paramTrackingId } = useParams();
  const trackingId = propTrackingId || paramTrackingId;
  
  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const intervalRef = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const [eta, setEta] = useState<{ distance: string; eta: number } | null>(null);
  const [trafficCondition, setTrafficCondition] = useState<'good' | 'moderate' | 'heavy'>('good');
  const [detailedStatus, setDetailedStatus] = useState<string>('');
  const [etaStart, setEtaStart] = useState<number | null>(null);
  const [etaEnd, setEtaEnd] = useState<number | null>(null);
  const [etaCountdown, setEtaCountdown] = useState<number | null>(null);

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
      
      // Debug: Log courierInfo and assigned_driver
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

  // Function to calculate and update ETA
  const updateETA = useCallback(() => {
    if (!delivery || !delivery.current_coordinates || !delivery.delivery_coordinates) return;
    
    // Get speeds based on traffic condition
    const speeds = {
      good: 30, // km/h
      moderate: 20, // km/h
      heavy: 10, // km/h
    };
    
    const etaData = calculateETA(
      delivery.current_coordinates, 
      delivery.delivery_coordinates, 
      speeds[trafficCondition]
    );
    
    setEta(etaData);
    
    // Update detailed status based on distance remaining
    const distance = parseFloat(etaData.distance);
    
    if (distance < 0.5) {
      setDetailedStatus('Arriving soon (less than 0.5km away)');
    } else if (distance < 1) {
      setDetailedStatus('Approaching destination');
    } else if (distance < 3) {
      setDetailedStatus('In delivery area');
    } else {
      setDetailedStatus('En route to delivery location');
    }
  }, [delivery, trafficCondition]);

  // Helper function from requestUtils.ts
  const calculateMovement = (current: { lat: number; lng: number }, target: { lat: number; lng: number }, stepSize: number) => {
    const latDiff = target.lat - current.lat;
    const lngDiff = target.lng - current.lng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    if (distance < 0.002) {
      return null;
    }
    
    return {
      lat: current.lat + (latDiff / distance) * stepSize,
      lng: current.lng + (lngDiff / distance) * stepSize
    };
  };

  // Update delivery position in UI and optionally in database
  const updateDeliveryPosition = async (coordinates: { lat: number; lng: number }) => {
    if (!delivery) return;
    
    console.log('Updating delivery position:', coordinates);
    
    // Update local state first for immediate UI feedback
    setDelivery(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        current_coordinates: coordinates
      };
    });
    
    // Optionally update the database for persistent changes
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          current_coordinates: coordinates
        })
        .eq('id', delivery.id);
      
      if (error) {
        console.error('Error updating position in database:', error);
      }
    } catch (err) {
      console.error('Failed to update position in database:', err);
    }
  };
  
  // Update delivery status
  const updateDeliveryStatus = async (status: DeliveryStatus) => {
    if (!delivery) return;
    
    console.log('Updating delivery status to:', status);
    
    // Update local state
    setDelivery(prev => {
      if (!prev) return null;
      
      const update = {
        status: status === 'in_progress' ? 'Driver En Route' : status.charAt(0).toUpperCase() + status.slice(1),
        timestamp: new Date().toISOString(),
        location: status === 'completed' ? prev.delivery_location : prev.pickup_location,
        note: status === 'completed' ? 'Package has been delivered successfully' : `Delivery status updated to ${status}`
      };
      
      return {
        ...prev,
        status,
        tracking_updates: [...(prev.tracking_updates || []), update]
      };
    });
    
    // Update the database
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status,
          // If completed, set current coordinates to delivery coordinates
          ...(status === 'completed' ? { current_coordinates: delivery.delivery_coordinates } : {})
        })
        .eq('id', delivery.id);
      
      if (error) {
        console.error('Error updating status in database:', error);
      }
      
      // Add tracking update
      const update = {
        delivery_id: delivery.id,
        status: status === 'in_progress' ? 'Driver En Route' : status.charAt(0).toUpperCase() + status.slice(1),
        timestamp: new Date().toISOString(),
        location: status === 'completed' ? delivery.delivery_location : delivery.pickup_location,
        note: status === 'completed' ? 'Package has been delivered successfully' : `Delivery status updated to ${status}`
      };
      
      await supabase
        .from('tracking_updates')
        .insert(update);
      
    } catch (err) {
      console.error('Failed to update status in database:', err);
    }
  };

  // Function to start live tracking simulation
  const startLiveTracking = useCallback((speed: 'slow' | 'normal' | 'fast' = 'normal') => {
    if (!delivery || intervalRef.current) return;
    
    console.log('Starting live tracking simulation at speed:', speed);
    setIsLiveTracking(true);
    setSimulationSpeed(speed);
    
    // Set interval based on speed
    const intervalTime = speed === 'slow' ? 5000 : speed === 'fast' ? 1000 : 3000;
    
    // Randomly set traffic condition at start of simulation
    const trafficOptions: Array<'good' | 'moderate' | 'heavy'> = ['good', 'moderate', 'heavy'];
    setTrafficCondition(trafficOptions[Math.floor(Math.random() * trafficOptions.length)]);
    
    // Simulate movement at different intervals based on speed
    intervalRef.current = window.setInterval(() => {
      if (!delivery) return;
      
      // Only simulate if delivery is in progress
      if (delivery.status === 'in_progress') {
        console.log('Simulating movement for delivery:', delivery.id);
        
        // Get current and target coordinates
        const current = delivery.current_coordinates;
        const target = delivery.delivery_coordinates;
        
        if (!current || !target) {
          console.log('Missing coordinates, cannot simulate movement');
          return;
        }
        
        // Calculate new position (moving 0.001 degrees toward destination)
        // Factor in traffic conditions
        const trafficFactor = trafficCondition === 'good' ? 1.0 : 
                             trafficCondition === 'moderate' ? 0.7 : 0.4;
        
        const stepSize = 0.001 * trafficFactor;
        const newCoordinates = calculateMovement(current, target, stepSize);
        
        if (!newCoordinates) {
          console.log('Reached destination, stopping simulation');
          
          // Update delivery status to completed
          updateDeliveryStatus('completed');
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsLiveTracking(false);
          return;
        }
        
        // Update delivery with new coordinates
        updateDeliveryPosition(newCoordinates);
        
        // Update ETA and detailed status
        updateETA();
        
        // Occasionally change traffic conditions (10% chance every update)
        if (Math.random() < 0.1) {
          const trafficOptions: Array<'good' | 'moderate' | 'heavy'> = ['good', 'moderate', 'heavy'];
          const newTraffic = trafficOptions[Math.floor(Math.random() * trafficOptions.length)];
          setTrafficCondition(newTraffic);
          
          // Add traffic update if condition changes
          if (newTraffic !== trafficCondition) {
            const trafficMessages = {
              good: 'Traffic is flowing well',
              moderate: 'Moderate traffic conditions',
              heavy: 'Heavy traffic encountered'
            };
            
            toast.info(`Traffic Update: ${trafficMessages[newTraffic]}`);
          }
        }
      }
    }, intervalTime);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsLiveTracking(false);
    };
  }, [delivery, updateETA]);

  // Add a function to stop the simulation
  const stopLiveTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLiveTracking(false);
  }, []);

  // Add a function to reset the simulation
  const resetSimulation = useCallback(async () => {
    if (!delivery) return;
    
    // Stop any ongoing simulation
    stopLiveTracking();
    
    // Reset the delivery position to the starting point
    try {
      // Update local state first
      setDelivery(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          status: 'in_progress',
          current_coordinates: prev.pickup_coordinates
        };
      });
      
      // Then update the database
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status: 'in_progress',
          current_coordinates: delivery.pickup_coordinates
        })
        .eq('id', delivery.id);
      
      if (error) {
        console.error('Error resetting simulation:', error);
        toast.error('Failed to reset simulation');
        return;
      }
      
      toast.success('Simulation reset to starting point');
      
      // Optionally start the simulation again
      setTimeout(() => startLiveTracking(simulationSpeed), 500);
    } catch (err) {
      console.error('Error in resetSimulation:', err);
      toast.error('Failed to reset simulation');
    }
  }, [delivery, stopLiveTracking, startLiveTracking, simulationSpeed]);

  // Handle simulation speed change
  const handleSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    setSimulationSpeed(speed);
    if (isLiveTracking) {
      stopLiveTracking();
      setTimeout(() => startLiveTracking(speed), 100);
    }
  };

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [trackingId, fetchDeliveryData]);

  // Call updateETA on initial load and when delivery changes
  useEffect(() => {
    if (delivery?.current_coordinates && delivery?.delivery_coordinates) {
      updateETA();
    }
  }, [delivery, updateETA]);

  // Start live tracking when delivery is loaded and in progress
  useEffect(() => {
    if (delivery && delivery.status === 'in_progress' && !isLiveTracking) {
      startLiveTracking(simulationSpeed);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [delivery, startLiveTracking, isLiveTracking, simulationSpeed]);

  // When ETA is set, initialize start and end times
  useEffect(() => {
    if (delivery?.status === 'in_progress' && eta) {
      if (!etaStart) {
        setEtaStart(Date.now());
        setEtaEnd(Date.now() + eta.eta * 60 * 1000);
        setEtaCountdown(eta.eta * 60);
      }
    } else {
      setEtaStart(null);
      setEtaEnd(null);
      setEtaCountdown(null);
    }
    // eslint-disable-next-line
  }, [delivery?.status, eta?.eta]);

  // Countdown timer effect
  useEffect(() => {
    if (etaEnd && delivery?.status === 'in_progress') {
      const interval = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.round((etaEnd - now) / 1000));
        setEtaCountdown(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [etaEnd, delivery?.status]);

  // Calculate progress percentage
  const etaProgress = etaStart && etaEnd && delivery?.status === 'in_progress'
    ? Math.min(100, Math.max(0, ((Date.now() - etaStart) / (etaEnd - etaStart)) * 100))
    : 0;

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
