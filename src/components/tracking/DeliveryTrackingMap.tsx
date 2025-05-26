
import React from 'react';

interface DeliveryTrackingMapProps {
  driverLocation: any;
  deliveryLocation: any;
  pickupLocation: any;
  height: string;
  showTraffic: boolean;
  trafficCondition: 'good' | 'moderate' | 'heavy';
  estimatedTimeMinutes?: number;
}

const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({
  driverLocation,
  deliveryLocation,
  pickupLocation,
  height,
  showTraffic,
  trafficCondition,
  estimatedTimeMinutes
}) => {
  return (
    <div className={`bg-gray-100 rounded-md flex items-center justify-center`} style={{ height }}>
      <p className="text-gray-500">Map View - Driver tracking in progress</p>
    </div>
  );
};

export default DeliveryTrackingMap;
