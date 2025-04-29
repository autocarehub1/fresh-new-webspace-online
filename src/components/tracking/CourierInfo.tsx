import React from 'react';
import { Button } from '@/components/ui/button';
import { useDriverData } from '@/hooks/use-driver-data';
import type { Driver } from '@/types/delivery';
import { Phone, User } from 'lucide-react';
import { DualSourceImage } from '@/components/ui/dual-source-image';

interface CourierInfoProps {
  info?: { 
    name: string; 
    photo: string; 
    vehicle: string; 
    phone: string;
  } | null;
  assigned_driver?: string | null;
}

const CourierInfo = ({ info: initialInfo, assigned_driver }: CourierInfoProps) => {
  // Fetch latest drivers and match by assigned_driver
  const { drivers, isLoading } = useDriverData();
  let info = initialInfo;
  
  if (assigned_driver) {
    const drv: Driver | undefined = drivers.find(d => d.id === assigned_driver);
    console.log('Found driver in drivers list:', {
      driverId: assigned_driver,
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
  
  // Debug: log assigned_driver and resolved info
  console.log('CourierInfo - assigned_driver:', assigned_driver, 'resolved info:', info);

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading courier info...</p>;
  }
  
  if (!info) {
    return (
      <div className="flex flex-col items-center text-gray-500 py-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-center">No courier assigned yet</p>
        <p className="text-xs text-gray-400 mt-2">A driver will be assigned soon</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
        {info.photo ? (
          <DualSourceImage
            photoData={info.photo}
            alt={info.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <User className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute -bottom-1 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
      </div>
      
      <h3 className="text-lg font-medium">{info.name}</h3>
      <p className="text-gray-600 mb-1">{info.vehicle}</p>
      <div className="flex items-center gap-1 text-xs text-green-600 mb-4">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span>Available now</span>
      </div>
      
      <Button asChild variant="outline" size="sm" className="w-full flex gap-2 items-center">
        <a href={`tel:${info.phone}`}>
          <Phone size={14} />
          <span>{info.phone || 'Call Driver'}</span>
        </a>
      </Button>
      
      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-400 hidden">
        <p>Driver ID: {assigned_driver || 'None'}</p>
        <p>Photo: {info.photo ? (info.photo.substring(0, 20) + '...') : 'None'}</p>
      </div>
    </div>
  );
};

export default CourierInfo;
