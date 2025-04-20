
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/types/delivery';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Type helpers for conversion between DB and frontend types
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

// Type for insertion to ensure required fields
type DbDriverInsert = Omit<Partial<DbDriver>, 'name' | 'vehicle_type' | 'current_location'> & {
  name: string;
  vehicle_type: string;
  current_location: Json;
};

// Converts DB model to frontend model
const mapDbToDriver = (dbItem: DbDriver): Driver => {
  const currentLocation = dbItem.current_location as any;
  
  return {
    id: dbItem.id,
    name: dbItem.name,
    status: dbItem.status as 'active' | 'inactive',
    vehicle_type: dbItem.vehicle_type,
    current_location: {
      address: currentLocation.address || 'Unknown location',
      coordinates: {
        lat: currentLocation.coordinates?.lat || 0,
        lng: currentLocation.coordinates?.lng || 0
      }
    },
    photo: dbItem.photo || '',
    phone: dbItem.phone || '',
    current_delivery: dbItem.current_delivery || null
  };
};

// Maps frontend model to DB model for insert/update
const mapDriverToDb = (item: Partial<Driver>): Partial<DbDriver> => {
  const dbItem: Partial<DbDriver> = {
    name: item.name,
    status: item.status,
    vehicle_type: item.vehicle_type,
    photo: item.photo || null,
    phone: item.phone || null,
    current_delivery: item.current_delivery || null,
  };
  
  if (item.current_location) {
    dbItem.current_location = {
      address: item.current_location.address,
      coordinates: {
        lat: item.current_location.coordinates.lat,
        lng: item.current_location.coordinates.lng
      }
    } as unknown as Json;
  }
  
  return dbItem;
};

export const useDriverData = () => {
  const queryClient = useQueryClient();
  
  // Fetch all drivers
  const { data: drivers, isLoading, error } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('*');
        
      if (error) throw error;
      return (data as DbDriver[]).map(mapDbToDriver);
    },
  });
  
  // Create a new driver
  const createDriver = useMutation({
    mutationFn: async (newDriver: Partial<Driver>) => {
      // For new drivers, ensure we have required fields
      if (!newDriver.name || !newDriver.vehicle_type || !newDriver.current_location) {
        throw new Error("Name, vehicle type, and current location are required");
      }
      
      const dbDriver = mapDriverToDb(newDriver);
      
      // Ensure required fields for DB insert
      const insertData: DbDriverInsert = {
        ...dbDriver as Partial<DbDriver>,
        name: newDriver.name,
        vehicle_type: newDriver.vehicle_type,
        current_location: dbDriver.current_location as Json
      };
      
      const { data, error } = await supabase
        .from('drivers')
        .insert(insertData)
        .select()
        .single();
        
      if (error) throw error;
      return mapDbToDriver(data as DbDriver);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating driver: ${error.message}`);
    }
  });
  
  // Update a driver
  const updateDriver = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Driver> & { id: string }) => {
      const dbUpdates = mapDriverToDb(updates);
      
      const { data, error } = await supabase
        .from('drivers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return mapDbToDriver(data as DbDriver);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating driver: ${error.message}`);
    }
  });
  
  // Assign driver to delivery
  const assignDriver = useMutation({
    mutationFn: async ({ driverId, deliveryId }: { driverId: string, deliveryId: string }) => {
      // First update the delivery request
      const { error: deliveryError } = await supabase
        .from('delivery_requests')
        .update({ assigned_driver: driverId, status: 'in_progress' })
        .eq('id', deliveryId);
        
      if (deliveryError) throw deliveryError;
      
      // Then update the driver's current delivery
      const { error: driverError } = await supabase
        .from('drivers')
        .update({ current_delivery: deliveryId })
        .eq('id', driverId);
        
      if (driverError) throw driverError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      toast.success('Driver assigned successfully');
    },
    onError: (error: any) => {
      toast.error(`Error assigning driver: ${error.message}`);
    }
  });
  
  return {
    drivers: drivers || [],
    isLoading,
    error,
    createDriver,
    updateDriver,
    assignDriver
  };
};
