
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Coordinates } from '@/types/delivery';
import { Button } from '@/components/ui/button';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  driverLocation?: Coordinates;
  deliveryLocation?: Coordinates;
  height?: string;
}

const Map = ({ 
  center = [-74.5, 40], 
  zoom = 15, 
  driverLocation, 
  deliveryLocation,
  height = '400px'
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const deliveryMarker = useRef<mapboxgl.Marker | null>(null);
  const [token, setToken] = useState(localStorage.getItem('mapbox_token') || '');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    // Initialize map
    mapboxgl.accessToken = token;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      setMounted(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (driverMarker.current) driverMarker.current.remove();
      if (deliveryMarker.current) deliveryMarker.current.remove();
      map.current?.remove();
    };
  }, [token, center, zoom]);

  // Update markers when driver or delivery location changes
  useEffect(() => {
    if (!map.current || !mounted) return;

    // Update or create driver marker
    if (driverLocation) {
      const lngLat: [number, number] = [driverLocation.lng, driverLocation.lat];
      
      if (driverMarker.current) {
        driverMarker.current.setLngLat(lngLat);
      } else {
        // Create a driver element with custom style
        const driverElement = document.createElement('div');
        driverElement.className = 'driver-marker';
        driverElement.style.width = '20px';
        driverElement.style.height = '20px';
        driverElement.style.borderRadius = '50%';
        driverElement.style.backgroundColor = '#4353FF';
        driverElement.style.border = '2px solid white';
        driverElement.style.boxShadow = '0 0 0 2px rgba(67, 83, 255, 0.3)';
        
        driverMarker.current = new mapboxgl.Marker(driverElement)
          .setLngLat(lngLat)
          .addTo(map.current);
      }
      
      // Only center map on driver if there's no delivery location
      if (!deliveryLocation) {
        map.current.flyTo({
          center: lngLat,
          zoom: 14,
          speed: 0.8
        });
      }
    } else if (driverMarker.current) {
      driverMarker.current.remove();
      driverMarker.current = null;
    }

    // Update or create delivery marker
    if (deliveryLocation) {
      const lngLat: [number, number] = [deliveryLocation.lng, deliveryLocation.lat];
      
      if (deliveryMarker.current) {
        deliveryMarker.current.setLngLat(lngLat);
      } else {
        // Create a delivery element with custom style
        const deliveryElement = document.createElement('div');
        deliveryElement.className = 'delivery-marker';
        deliveryElement.style.width = '20px';
        deliveryElement.style.height = '20px';
        deliveryElement.style.borderRadius = '50%';
        deliveryElement.style.backgroundColor = '#FF4545';
        deliveryElement.style.border = '2px solid white';
        deliveryElement.style.boxShadow = '0 0 0 2px rgba(255, 69, 69, 0.3)';
        
        deliveryMarker.current = new mapboxgl.Marker(deliveryElement)
          .setLngLat(lngLat)
          .addTo(map.current);
      }

      // If we have both markers, fit bounds to include both
      if (driverLocation && deliveryLocation) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([driverLocation.lng, driverLocation.lat]);
        bounds.extend([deliveryLocation.lng, deliveryLocation.lat]);
        
        map.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 15
        });
      } else {
        // Only center on delivery location if no driver
        map.current.flyTo({
          center: lngLat,
          zoom: 14,
          speed: 0.8
        });
      }
    } else if (deliveryMarker.current) {
      deliveryMarker.current.remove();
      deliveryMarker.current = null;
    }
  }, [driverLocation, deliveryLocation, mounted]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setToken(newToken);
    localStorage.setItem('mapbox_token', newToken);
  };

  const handleMapReset = () => {
    if (map.current && driverLocation && deliveryLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([driverLocation.lng, driverLocation.lat]);
      bounds.extend([deliveryLocation.lng, deliveryLocation.lat]);
      
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15
      });
    }
  };

  return (
    <div className="space-y-4">
      {!mounted && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Please enter your Mapbox public token to view the map. You can get one at{' '}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-medical-blue hover:underline">
              mapbox.com
            </a>
          </p>
          <Input
            type="text"
            placeholder="Enter Mapbox public token"
            value={token}
            onChange={handleTokenChange}
            className="w-full"
          />
        </div>
      )}
      <div className={`w-full rounded-lg overflow-hidden`} style={{ height: height }}>
        <div ref={mapContainer} className="h-full w-full" />
        {mounted && driverLocation && deliveryLocation && (
          <div className="absolute bottom-4 right-4">
            <Button 
              size="sm" 
              onClick={handleMapReset}
              className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 shadow-md"
            >
              Reset View
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
