
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Driver } from '@/types/delivery';
import { toast } from 'sonner';

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
      return data as Driver[];
    },
  });
  
  // Create a new driver
  const createDriver = useMutation({
    mutationFn: async (newDriver: Partial<Driver>) => {
      const { data, error } = await supabase
        .from('drivers')
        .insert(newDriver)
        .select()
        .single();
        
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
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
