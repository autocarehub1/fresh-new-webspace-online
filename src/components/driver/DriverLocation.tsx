import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DriverLocationTrackerProps {
  driverId: string;
  deliveryId?: string;
}

export const DriverLocationTracker = ({ driverId, deliveryId }: DriverLocationTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{lat: number; lng: number} | null>(null);
  const watchIdRef = useRef<number | null>(null);
  
  // Start location tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      toast.error("Your browser doesn't support location tracking");
      return;
    }
    
    setIsTracking(true);
    toast.success("Location tracking started");
    
    // Track position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setPosition(coordinates);
        setError(null);
        
        // Update driver location in database
        try {
          console.log('Updating location for driver:', driverId, coordinates);
          
          // Update driver's current location
          const { error: driverError } = await supabase
            .from('drivers')
            .update({
              current_location: {
                coordinates,
                address: "Current location" // You could reverse geocode here
              },
              last_updated: new Date().toISOString()
            })
            .eq('id', driverId);
            
          if (driverError) {
            console.error('Error updating driver location:', driverError);
          }
          
          // Update delivery's current location if on active delivery
          if (deliveryId) {
            const { error: deliveryError } = await supabase
              .from('delivery_requests')
              .update({
                current_coordinates: coordinates,
                last_updated: new Date().toISOString()
              })
              .eq('id', deliveryId);
              
            if (deliveryError) {
              console.error('Error updating delivery location:', deliveryError);
            } else {
              console.log('Updated delivery location successfully');
            }
          }
        } catch (err) {
          console.error('Error updating location:', err);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(`Error getting location: ${err.message}`);
        setIsTracking(false);
        toast.error(`Location error: ${err.message}`);
      },
      { 
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
  };
  
  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    toast.info("Location tracking stopped");
  };
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);
  
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Location Sharing</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          {isTracking ? (
            <span className="inline-flex items-center text-green-600 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Live
            </span>
          ) : (
            <span className="text-gray-500 text-sm">Off</span>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {position && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <MapPin className="h-4 w-4" />
            <span>
              Current Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </span>
          </div>
          {deliveryId && (
            <p className="text-xs text-blue-600 mt-1">
              Updating delivery: {deliveryId}
            </p>
          )}
        </div>
      )}
      
      <Button 
        onClick={isTracking ? stopTracking : startTracking}
        variant={isTracking ? "outline" : "default"}
        className="w-full"
      >
        {isTracking ? "Stop Sharing Location" : "Start Sharing Location"}
      </Button>
    </div>
  );
};

export default DriverLocationTracker; 