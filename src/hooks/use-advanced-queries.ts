
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useAdvancedQueries = () => {
  const queryClient = useQueryClient();

  // Advanced driver analytics query
  const useDriverAnalytics = (driverId: string) => {
    return useQuery({
      queryKey: ['driver-analytics', driverId],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_driver_analytics', {
          driver_id: driverId
        });
        
        if (error) throw error;
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Advanced delivery tracking with geolocation history
  const useDeliveryTracking = (deliveryId: string) => {
    return useQuery({
      queryKey: ['delivery-tracking', deliveryId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('delivery_requests')
          .select(`
            *,
            tracking_updates (
              id,
              status,
              timestamp,
              location,
              note,
              coordinates
            ),
            driver:assigned_driver (
              id,
              name,
              phone,
              photo,
              current_location
            )
          `)
          .eq('id', deliveryId)
          .single();
        
        if (error) throw error;
        return data;
      },
      refetchInterval: 30000, // Real-time updates every 30 seconds
    });
  };

  // Batch delivery status updates
  const useBatchStatusUpdate = () => {
    return useMutation({
      mutationFn: async ({ deliveryIds, status }: { deliveryIds: string[]; status: string }) => {
        const { data, error } = await supabase.rpc('batch_update_delivery_status', {
          delivery_ids: deliveryIds,
          new_status: status
        });
        
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
        toast.success('Delivery statuses updated successfully');
      },
      onError: (error) => {
        console.error('Batch update error:', error);
        toast.error('Failed to update delivery statuses');
      }
    });
  };

  // Advanced driver performance metrics
  const useDriverPerformance = (driverId: string, timeRange: string = '30d') => {
    return useQuery({
      queryKey: ['driver-performance', driverId, timeRange],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_driver_performance', {
          driver_id: driverId,
          time_range: timeRange
        });
        
        if (error) throw error;
        return data;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  return {
    useDriverAnalytics,
    useDeliveryTracking,
    useBatchStatusUpdate,
    useDriverPerformance
  };
};
