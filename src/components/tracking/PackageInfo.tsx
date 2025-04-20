
import React from 'react';
import { DeliveryRequest } from '@/types/delivery';
import { ThermometerSnowflake } from 'lucide-react';

interface PackageInfoProps {
  delivery: DeliveryRequest;
}

const PackageInfo = ({ delivery }: PackageInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Pickup Location */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">Pickup</h3>
        <p className="font-medium">{delivery.pickupLocation?.name}</p>
        <p className="text-sm text-gray-600">{delivery.pickupLocation?.address}</p>
      </div>
      
      {/* Package Info */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">Package</h3>
        <p className="font-medium">{delivery.packageType}</p>
        {delivery.temperature && (
          <div className="flex items-center gap-1 mt-1">
            <ThermometerSnowflake size={16} className="text-blue-500" />
            <p className="text-sm">
              <span className={delivery.temperature.status === 'normal' ? 'text-green-600' : 'text-medical-red'}>
                {delivery.temperature.current}
              </span>
              <span className="text-gray-500"> (Required: {delivery.temperature.required})</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Delivery Location */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">Delivery</h3>
        <p className="font-medium">{delivery.deliveryLocation?.name}</p>
        <p className="text-sm text-gray-600">{delivery.deliveryLocation?.address}</p>
      </div>
    </div>
  );
};

export default PackageInfo;
