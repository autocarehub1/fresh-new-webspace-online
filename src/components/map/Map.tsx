import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface MapProps {
  driverLocation?: { lat: number; lng: number } | null;
  deliveryLocation?: { lat: number; lng: number } | null;
  pickupLocation?: { lat: number; lng: number } | null;
  height?: string;
  showTraffic?: boolean;
  trafficCondition?: 'good' | 'moderate' | 'heavy';
  estimatedTimeMinutes?: number;
}

const Map = ({ 
  driverLocation,
  deliveryLocation, 
  pickupLocation,
  height = '400px',
  showTraffic = false,
  trafficCondition = 'good',
  estimatedTimeMinutes
}: MapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    // Default San Antonio map if no locations provided
    if (!driverLocation && !deliveryLocation && !pickupLocation) {
      setMapUrl('https://maps.google.com/maps?q=San+Antonio,TX&t=&z=13&ie=UTF8&iwloc=&output=embed');
      return;
    }

    // If we have a delivery location, we can use directions mode
    if (deliveryLocation) {
      let baseUrl = 'https://www.google.com/maps/embed/v1/directions';
      
      // Add API key parameter
      baseUrl += '?key=YOUR_GOOGLE_MAPS_API_KEY_HERE';
      
      // Define origin (either the driver's current location or the pickup location)
      const origin = driverLocation 
        ? `${driverLocation.lat},${driverLocation.lng}` 
        : pickupLocation 
          ? `${pickupLocation.lat},${pickupLocation.lng}`
          : '';
          
      // If we don't have an origin, default to San Antonio
      if (origin) {
        baseUrl += `&origin=${origin}`;
      } else {
        baseUrl += `&origin=San+Antonio,TX`;
      }
      
      // Add the destination parameter (required for directions)
      baseUrl += `&destination=${deliveryLocation.lat},${deliveryLocation.lng}`;
      
      // Add waypoints if needed (pickup location if driver location is present)
      if (driverLocation && pickupLocation && !pickupLocation.lat.toFixed(3).includes(driverLocation.lat.toFixed(3))) {
        baseUrl += `&waypoints=${pickupLocation.lat},${pickupLocation.lng}`;
      }
      
      // Add travel mode (driving for courier services)
      baseUrl += '&mode=driving';
      
      // Add traffic layer if enabled
      if (showTraffic) {
        baseUrl += '&traffic_model=best_guess';
        
        // Add departure time (current time for real-time traffic)
        const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
        baseUrl += `&departure_time=${now}`;
      }
      
      // Add map styling
      baseUrl += '&maptype=roadmap';
      
      setMapUrl(baseUrl);
    } 
    // If we don't have delivery location but have another location, use place mode
    else if (driverLocation || pickupLocation) {
      let baseUrl = 'https://www.google.com/maps/embed/v1/place';
      
      // Add API key parameter
      baseUrl += '?key=YOUR_GOOGLE_MAPS_API_KEY_HERE';
      
      // Use either driver or pickup location for the center
      const location = driverLocation || pickupLocation;
      baseUrl += `&q=${location!.lat},${location!.lng}`;
      
      // Add zoom level
      baseUrl += '&zoom=15';
      
      // Add map styling
      baseUrl += '&maptype=roadmap';
      
      setMapUrl(baseUrl);
    }
  }, [driverLocation, deliveryLocation, pickupLocation, showTraffic]);

  return (
    <div className="space-y-2">
      <div className="w-full rounded-lg overflow-hidden relative" style={{ height }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : null}
        
        <iframe
          title="Live Delivery Tracking"
          width="100%"
          height="100%"
          frameBorder="0"
          src={mapUrl}
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        ></iframe>
      </div>
      
      {/* Map legend and status info */}
      <div className="flex flex-col space-y-2">
        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-gray-600">
          {pickupLocation && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Pickup</span>
            </div>
          )}
          {driverLocation && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Courier</span>
            </div>
          )}
          {deliveryLocation && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Destination</span>
            </div>
          )}
        </div>
        
        {/* Traffic condition indicator */}
        {showTraffic && (
          <div className="flex justify-center items-center gap-2 text-xs bg-gray-50 rounded-md py-1 px-2">
            <span className="text-gray-600">Traffic:</span>
            {trafficCondition === 'good' && (
              <span className="text-green-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Good
              </span>
            )}
            {trafficCondition === 'moderate' && (
              <span className="text-yellow-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Moderate
              </span>
            )}
            {trafficCondition === 'heavy' && (
              <span className="text-red-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Heavy
              </span>
            )}
            
            {estimatedTimeMinutes && (
              <span className="ml-2 text-gray-700">
                ETA: {estimatedTimeMinutes} min
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
