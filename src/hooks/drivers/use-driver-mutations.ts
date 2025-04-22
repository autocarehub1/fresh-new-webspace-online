
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Driver } from '@/types/delivery';
import { toast } from 'sonner';
import { mapDbToDriver } from './driver-utils';
import { useDriverStore } from '@/store/driverStore';

export const useDriverMutations = () => {
  const queryClient = useQueryClient();
  const updateLocalDriverStatus = useDriverStore((state) => state.updateDriverStatus);
  const updateLocalDriverDelivery = useDriverStore((state) => state.updateDriverDelivery);

  const updateDriver = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'active' | 'inactive' }) => {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          console.error('Supabase driver update error:', error);
          updateLocalDriverStatus(id, status);
          return { id, status };
        }
        
        return mapDbToDriver(data as any);
      } catch (err) {
        console.error('Exception when updating driver:', err);
        updateLocalDriverStatus(id, status);
        return { id, status };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating driver: ${error.message}`);
    }
  });

  const assignDriver = useMutation({
    mutationFn: async ({ driverId, deliveryId }: { driverId: string, deliveryId: string }) => {
      try {
        const { error: driverError } = await supabase
          .from('drivers')
          .update({ current_delivery: deliveryId })
          .eq('id', driverId);
          
        if (driverError) throw driverError;
        
        const { error: deliveryError } = await supabase
          .from('delivery_requests')
          .update({ 
            assigned_driver: driverId,
            status: 'in_progress'
          })
          .eq('id', deliveryId);
          
        if (deliveryError) throw deliveryError;

        const { error: trackingError } = await supabase
          .from('tracking_updates')
          .insert({
            request_id: deliveryId,
            status: 'Driver Assigned',
            timestamp: new Date().toISOString(),
            location: 'Driver location',
            note: `Driver assigned to delivery`
          });
        
        if (trackingError) throw trackingError;
        
        updateLocalDriverDelivery(driverId, deliveryId);
        return { success: true };
      } catch (err) {
        console.error('Exception when assigning driver:', err);
        updateLocalDriverDelivery(driverId, deliveryId);
        throw err;
      }
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

  const addDriver = useMutation({
    mutationFn: async (driverData: Omit<Driver, 'id' | 'status'>) => {
      const driverId = `DRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('drivers')
        .insert({
          id: driverId,
          name: driverData.name,
          status: 'active',
          vehicle_type: driverData.vehicle_type,
          current_location: driverData.current_location,
          photo: driverData.photo,
          phone: driverData.phone,
          current_delivery: driverData.current_delivery || null
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToDriver(data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error: any) => {
      toast.error(`Error adding driver: ${error.message}`);
    }
  });

  return {
    updateDriver,
    assignDriver,
    addDriver
  };
};
