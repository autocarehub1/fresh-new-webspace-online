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
        console.log(`Starting driver assignment: Driver ${driverId} to Delivery ${deliveryId}`);
        
        // Check if driver is truly available first to prevent conflicts
        const { data: driverData, error: driverCheckError } = await supabase
          .from('drivers')
          .select('id, status, current_delivery')
          .eq('id', driverId)
          .single();
          
        if (driverCheckError) {
          console.error(`Error checking driver ${driverId} availability:`, driverCheckError);
          throw new Error(`Failed to check driver availability: ${driverCheckError.message}`);
        }
        
        // Verify driver is active and not already assigned
        if (!driverData || driverData.status !== 'active') {
          console.error(`Driver ${driverId} is not active`);
          throw new Error(`Driver is not active and cannot be assigned`);
        }
        
        if (driverData.current_delivery) {
          console.error(`Driver ${driverId} already has delivery assignment: ${driverData.current_delivery}`);
          throw new Error(`Driver already has an active delivery assignment`);
        }
        
        // Check if delivery is available for assignment
        const { data: deliveryData, error: deliveryCheckError } = await supabase
          .from('delivery_requests')
          .select('id, status, assigned_driver')
          .eq('id', deliveryId)
          .single();
          
        if (deliveryCheckError) {
          console.error(`Error checking delivery ${deliveryId}:`, deliveryCheckError);
          throw new Error(`Failed to check delivery status: ${deliveryCheckError.message}`);
        }
        
        // Verify delivery is not already assigned
        if (!deliveryData || deliveryData.status !== 'pending') {
          console.error(`Delivery ${deliveryId} is not in pending status: ${deliveryData?.status}`);
          throw new Error(`Delivery is not available for assignment`);
        }
        
        if (deliveryData.assigned_driver) {
          console.error(`Delivery ${deliveryId} already assigned to driver: ${deliveryData.assigned_driver}`);
          throw new Error(`Delivery already assigned to another driver`);
        }
        
        // Now proceed with the actual assignment
        console.log(`Verified both driver and delivery are available for assignment`);
        
        // 1. Update driver first
        const { error: driverError } = await supabase
          .from('drivers')
          .update({ current_delivery: deliveryId })
          .eq('id', driverId);
          
        if (driverError) {
          console.error(`Error updating driver ${driverId}:`, driverError);
          throw driverError;
        }
        
        // 2. Then update delivery
        const { error: deliveryError } = await supabase
          .from('delivery_requests')
          .update({ 
            assigned_driver: driverId,
            status: 'in_progress'
          })
          .eq('id', deliveryId);
          
        if (deliveryError) {
          console.error(`Error updating delivery ${deliveryId}:`, deliveryError);
          
          // Attempt to rollback driver assignment if delivery update fails
          try {
            await supabase
              .from('drivers')
              .update({ current_delivery: null })
              .eq('id', driverId);
            console.log(`Rolled back driver assignment due to delivery update failure`);
          } catch (rollbackError) {
            console.error(`Failed to rollback driver assignment:`, rollbackError);
          }
          
          throw deliveryError;
        }

        // 3. Finally add tracking update
        const { error: trackingError } = await supabase
          .from('tracking_updates')
          .insert({
            request_id: deliveryId,
            status: 'Driver Assigned',
            timestamp: new Date().toISOString(),
            location: 'Driver location',
            note: `Driver assigned to delivery and request status changed to in_progress`
          });
          
        if (trackingError) {
          console.warn(`Warning: Tracking update failed, but assignment completed:`, trackingError);
          // We don't throw here since assignment was successful
        }
        
        console.log(`✅ Successfully assigned driver ${driverId} to delivery ${deliveryId}`);
        
        // Update local state
        updateLocalDriverDelivery(driverId, deliveryId);
        return { success: true, driverId, deliveryId };
      } catch (err) {
        console.error('Exception during driver assignment:', err);
        // Don't update local state on error
        throw err;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      toast.success('Driver assigned successfully');
    },
    onError: (error: any) => {
      toast.error(`Assignment failed: ${error.message}`);
    }
  });

  const unassignDriver = useMutation({
    mutationFn: async ({ driverId, deliveryId }: { driverId: string; deliveryId: string }) => {
      const { error: driverError } = await supabase
        .from('drivers')
        .update({ current_delivery: null })
        .eq('id', driverId);
      if (driverError) throw driverError;

      const { error: requestError } = await supabase
        .from('delivery_requests')
        .update({ assigned_driver: null, status: 'pending' })
        .eq('id', deliveryId);
      if (requestError) throw requestError;

      const { error: trackingError } = await supabase
        .from('tracking_updates')
        .insert({
          request_id: deliveryId,
          status: 'Driver Unassigned',
          timestamp: new Date().toISOString(),
          location: 'Driver location',
          note: 'Driver has been unassigned'
        });
      if (trackingError) console.warn('Driver unassign tracking update failed:', trackingError);

      updateLocalDriverDelivery(driverId, null);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      toast.success('Driver unassigned successfully');
    },
    onError: (error: any) => {
      toast.error(`Error unassigning driver: ${error.message}`);
    }
  });

  const addDriver = useMutation({
    mutationFn: async (driverData: Omit<Driver, 'id' | 'status' | 'current_delivery'> & { current_delivery?: string | null }) => {
      const driverId = `DRV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      console.log('Adding driver with data:', {
        id: driverId,
        name: driverData.name,
        vehicle_type: driverData.vehicle_type,
        photo: driverData.photo,
      });
      
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

      console.log('Driver added, returned data:', data);
      
      if (error) throw error;
      return mapDbToDriver(data as any);
    },
    onSuccess: (newDriver) => {
      queryClient.setQueryData<Driver[]>(['drivers'], (oldDrivers = []) => {
        return [...oldDrivers, newDriver];
      });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error: any) => {
      toast.error(`Error adding driver: ${error.message}`);
    }
  });

  const deleteDriver = useMutation({
    mutationFn: async (driverId: string) => {
      try {
        const { error } = await supabase
          .from('drivers')
          .delete()
          .eq('id', driverId);

        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('Exception when deleting driver:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Error deleting driver: ${error.message}`);
    }
  });

  return {
    updateDriver,
    assignDriver,
    unassignDriver,
    addDriver,
    deleteDriver
  };
};
