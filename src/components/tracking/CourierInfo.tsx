import React from 'react';
import { Button } from '@/components/ui/button';
import { useDriverData } from '@/hooks/use-driver-data';
import type { DeliveryRequest, Driver } from '@/types/delivery';

interface CourierInfoProps {
  delivery: DeliveryRequest;
}

const CourierInfo = ({ delivery }: CourierInfoProps) => {
  // Fetch latest drivers and match by assigned_driver
  const { drivers, isLoading } = useDriverData();
  let info: { name: string; photo: string; vehicle: string; phone: string } | null = null;
  if (delivery.assigned_driver) {
    const drv: Driver | undefined = drivers.find(d => d.id === delivery.assigned_driver);
    console.log('Found driver in drivers list:', {
      driverId: delivery.assigned_driver,
      found: !!drv,
      driverData: drv
    });
    if (drv) {
      info = {
        name: drv.name,
        photo: drv.photo,
        vehicle: drv.vehicle_type,
        phone: drv.phone
      };
      console.log('Created info from driver:', info);
    }
  }
  // Fallback to static courier data
  if (!info && delivery.courier) {
    console.log('Using fallback courier data:', delivery.courier);
    info = delivery.courier;
  }
  // Debug: log assigned_driver and resolved info
  console.log('CourierInfo - assigned_driver:', delivery.assigned_driver, 'resolved info:', info);

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading courier info...</p>;
  }
  if (!info) {
    return <p className="text-center text-gray-600">No courier assigned yet</p>;
  }
  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full overflow-hidden mb-4 relative">
        {/* Debug info for image loading */}
        <div className="text-xs text-gray-400 absolute -mt-5 text-center w-full">
          Photo URL: {info.photo ? info.photo.substring(0, 30) + "..." : "None"}
        </div>
        {info.photo ? (
          <img 
            src={info.photo} 
            alt={info.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              console.error('Image failed to load:', {
                photoUrl: info.photo,
                error: e,
                driverName: info.name
              });
              e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', {
                photoUrl: info.photo,
                driverName: info.name
              });
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium">{info.name}</h3>
      <p className="text-gray-600 mb-4">{info.vehicle}</p>
      <Button asChild variant="outline" size="sm" className="w-full">
        <a href={`tel:${info.phone}`}>{info.phone}</a>
      </Button>
    </div>
  );
};

export default CourierInfo;
