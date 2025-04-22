
import { Json } from '@/integrations/supabase/types';
import { Driver } from '@/types/delivery';

type DbDriver = {
  id: string;
  name: string;
  status: string;
  vehicle_type: string;
  current_location: Json;
  photo: string | null;
  phone: string | null;
  current_delivery: string | null;
  created_at: string;
  user_id: string | null;
};

export const mapDbToDriver = (dbDriver: DbDriver): Driver => {
  const currentLocation = dbDriver.current_location as any;
  
  return {
    id: dbDriver.id,
    name: dbDriver.name,
    status: dbDriver.status as 'active' | 'inactive',
    vehicle_type: dbDriver.vehicle_type,
    current_location: {
      address: currentLocation?.address || '',
      coordinates: {
        lat: currentLocation?.coordinates?.lat || 0,
        lng: currentLocation?.coordinates?.lng || 0
      }
    },
    photo: dbDriver.photo || '',
    phone: dbDriver.phone || '',
    current_delivery: dbDriver.current_delivery
  };
};
