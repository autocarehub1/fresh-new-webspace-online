
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';

interface MapProps {
  center: [number, number];
  zoom?: number;
}

const Map = ({ center, zoom = 15 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
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

      // Add marker
      marker.current = new mapboxgl.Marker()
        .setLngLat(center)
        .addTo(map.current);

      setMounted(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, [token, center, zoom]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newToken = e.target.value;
    setToken(newToken);
    localStorage.setItem('mapbox_token', newToken);
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
      <div className="h-[400px] w-full rounded-lg overflow-hidden">
        <div ref={mapContainer} className="h-full w-full" />
      </div>
    </div>
  );
};

export default Map;
