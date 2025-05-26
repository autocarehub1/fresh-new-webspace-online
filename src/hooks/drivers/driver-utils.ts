
import { Driver } from '@/types/delivery';

export const mapDbToDriver = (dbDriver: any): Driver => {
  return {
    id: dbDriver.id,
    name: dbDriver.name || 'Unknown Driver',
    phone: dbDriver.phone || '',
    photo: dbDriver.photo || '',
    status: dbDriver.status || 'active',
    vehicle_type: dbDriver.vehicle_type || 'Car',
    vehicle_number: dbDriver.vehicle_number || undefined,
    current_location: dbDriver.current_location || { 
      address: 'Location not available',
      coordinates: { lat: 0, lng: 0 }
    },
    current_delivery: dbDriver.current_delivery || null,
    rating: dbDriver.rating || undefined,
    average_response_time: dbDriver.average_response_time || undefined,
    created_at: dbDriver.created_at || new Date().toISOString()
  };
};
