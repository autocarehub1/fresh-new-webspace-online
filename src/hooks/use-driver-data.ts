
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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

// Maps DB driver to frontend driver
const mapDbToDriver = (dbDriver: DbDriver): Driver => {
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
  
  // Update driver status
  const updateDriver = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('drivers')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return mapDbToDriver(data as DbDriver);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating driver: ${error.message}`);
    }
  });
  
  // Assign driver to delivery
  const assignDriver = useMutation({
    mutationFn: async ({ driverId, deliveryId }: { driverId: string, deliveryId: string }) => {
      // First, update the driver's current_delivery
      const { error: driverError } = await supabase
        .from('drivers')
        .update({ current_delivery: deliveryId })
        .eq('id', driverId);
        
      if (driverError) throw driverError;
      
      // Then, update the delivery's assigned_driver
      const { error: deliveryError } = await supabase
        .from('delivery_requests')
        .update({ 
          assigned_driver: driverId,
          status: 'in_progress'
        })
        .eq('id', deliveryId);
        
      if (deliveryError) throw deliveryError;

      // Add a tracking update for driver assignment
      const driver = drivers?.find(d => d.id === driverId);
      
      const { error: trackingError } = await supabase
        .from('tracking_updates')
        .insert({
          request_id: deliveryId,
          status: 'Driver Assigned',
          timestamp: new Date().toISOString(),
          location: driver?.current_location.address || 'Driver location',
          note: `Driver ${driver?.name || 'Unknown'} assigned to delivery`
        });
      
      if (trackingError) throw trackingError;
      
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
  
  // Update driver location
  const updateDriverLocation = useMutation({
    mutationFn: async ({ id, location }: { id: string, location: { address: string, coordinates: { lat: number, lng: number } } }) => {
      const { data, error } = await supabase
        .from('drivers')
        .update({ current_location: location })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return mapDbToDriver(data as DbDriver);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating driver location: ${error.message}`);
    }
  });
  
  return {
    drivers: drivers || [],
    isLoading,
    error,
    updateDriver,
    assignDriver,
    updateDriverLocation
  };
};
