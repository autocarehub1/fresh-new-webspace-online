
import React from 'react';
import Map from './Map';
import { Coordinates } from '@/types/delivery';

interface MapWrapperProps {
  driverLocation?: Coordinates;
  deliveryLocation?: Coordinates;
  height?: string;
}

const MapWrapper = ({ driverLocation, deliveryLocation, height = '400px' }: MapWrapperProps) => {
  return (
    <div className="rounded-md overflow-hidden" style={{ height }}>
      <Map driverLocation={driverLocation} deliveryLocation={deliveryLocation} />
    </div>
  );
};

export default MapWrapper;
