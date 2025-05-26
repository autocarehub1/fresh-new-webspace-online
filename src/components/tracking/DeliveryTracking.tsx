import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DeliveryRequest, DeliveryStatus } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import TrackingTimeline from './TrackingTimeline';
import PackageInfo from './PackageInfo';
import CourierInfo from './CourierInfo';

const generatePDF = (delivery: DeliveryRequest) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.text('Medical Courier Service', pageWidth/2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Tracking ID: ${delivery.trackingId || delivery.id}`, 20, 40);
  doc.text(`Status: ${delivery.status}`, 20, 50);
  doc.text(`Priority: ${delivery.priority}`, 20, 60);
  
  doc.text('Package Details:', 20, 80);
  doc.text(`Type: ${delivery.packageType}`, 30, 90);
  if (delivery.temperature) {
    doc.text(`Temperature: ${delivery.temperature.current} (Required: ${delivery.temperature.required})`, 30, 100);
  }
  
  doc.text('Pickup Location:', 20, 120);
  doc.text(delivery.pickup_location, 30, 130);
  
  doc.text('Delivery Location:', 20, 150);
  doc.text(delivery.delivery_location, 30, 160);
  
  doc.text('Delivery Information:', 20, 180);
  doc.text(`Created: ${new Date(delivery.created_at).toLocaleString()}`, 30, 190);
  if (delivery.estimatedDelivery) {
    doc.text(`Estimated Delivery: ${new Date(delivery.estimatedDelivery).toLocaleString()}`, 30, 200);
  }
  
  doc.save(`medical-delivery-${delivery.trackingId || delivery.id}.pdf`);
};

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

export const DeliveryTracking = () => {
  const { trackingId } = useParams();
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
            <div className="flex items-center gap-2">
              {!isLiveTracking ? (
                <Button 
                  size="sm" 
                  variant="default" 
                  className="px-3"
                  onClick={() => startLiveTracking(simulationSpeed)}
                  disabled={!delivery || delivery.status === 'completed'}
                >
                  Start Tracking
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="px-3"
                  onClick={stopLiveTracking}
                >
                  Pause
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                className="px-3"
                onClick={resetSimulation}
                disabled={!delivery || (delivery.status !== 'in_progress' && delivery.status !== 'completed')}
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Simulation Speed:</span>
                  <div className="flex border rounded-md overflow-hidden">
                    <button 
                      className={`px-2 py-0.5 text-xs ${simulationSpeed === 'slow' ? 'bg-gray-200 font-medium' : 'bg-white'}`}
                      onClick={() => {
                        setSimulationSpeed('slow');
                        if (isLiveTracking) {
                          stopLiveTracking();
                          setTimeout(() => startLiveTracking('slow'), 100);
                        }
                      }}
                    >
                      Slow
                    </button>
                    <button 
                      className={`px-2 py-0.5 text-xs ${simulationSpeed === 'normal' ? 'bg-gray-200 font-medium' : 'bg-white'}`}
                      onClick={() => {
                        setSimulationSpeed('normal');
                        if (isLiveTracking) {
                          stopLiveTracking();
                          setTimeout(() => startLiveTracking('normal'), 100);
                        }
                      }}
                    >
                      Normal
                    </button>
                    <button 
                      className={`px-2 py-0.5 text-xs ${simulationSpeed === 'fast' ? 'bg-gray-200 font-medium' : 'bg-white'}`}
                      onClick={() => {
                        setSimulationSpeed('fast');
                        if (isLiveTracking) {
                          stopLiveTracking();
                          setTimeout(() => startLiveTracking('fast'), 100);
                        }
                      }}
                    >
                      Fast
                    </button>
                  </div>
                </div>
                
                {delivery?.status === 'in_progress' && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      En Route
                    </span>
                  </div>
                )}
                
                {delivery?.status === 'completed' && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600">Delivered</span>
                  </div>
                )}
              </div>
              
              {/* ETA and Traffic Information */}
              {delivery?.status === 'in_progress' && eta && (
                <div className="bg-gray-50 rounded-md p-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-medical-blue" />
                    <span>
                      <strong>ETA:</strong> {eta.eta} minutes
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-medical-blue" />
                    <span>
                      <strong>Distance:</strong> {eta.distance} km
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {trafficCondition === 'good' ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Traffic: Good</span>
                      </div>
                    ) : trafficCondition === 'moderate' ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Traffic: Moderate</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Traffic: Heavy</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Detailed Status */}
              {delivery?.status === 'in_progress' && detailedStatus && (
                <div className="bg-blue-50 text-blue-800 rounded-md p-2 mb-4 flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4" />
                  <span>{detailedStatus}</span>
                </div>
              )}
              
              {/* Progress Bar and Countdown */}
              <div className="mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={etaProgress} className="h-2 bg-gray-200" />
                  </div>
                  <div className="w-32 text-right text-xs text-gray-600">
                    {etaCountdown !== null && etaCountdown > 0 ? (
                      <span>
                        {Math.floor(etaCountdown / 60)}:{(etaCountdown % 60).toString().padStart(2, '0')} min left
                      </span>
                    ) : (
                      <span>Arriving soon</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <div>{delivery?.pickup_location}</div>
                <div className="border-t border-dashed border-gray-300 grow mx-2 mt-2"></div>
                <div>{delivery?.delivery_location}</div>
              </div>
            </div>
            
            <Map 
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
      
      {delivery?.status === 'completed' && delivery.proofOfDeliveryPhoto && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Proof of Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <img
                src={delivery.proofOfDeliveryPhoto}
                alt="Proof of Delivery"
                className="rounded shadow-md max-w-xs max-h-80 border"
              />
              <span className="text-xs text-gray-500 mt-2">Photo provided by driver at delivery completion</span>
            </div>
          </CardContent>
        </Card>
      )}
      
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
