import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DeliveryRequest, TrackingUpdate } from '@/types/delivery';
import { toast } from 'sonner';
import { useRequestStore } from '@/store/requests/requestStore';
import { useDriverStore } from '@/store/drivers/driverStore';

export const useDeliveryData = () => {
  const queryClient = useQueryClient();
  const requestStore = useRequestStore();
  const driverStore = useDriverStore();
  
  // Fetch all delivery requests
  const { 
    data: deliveries, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['deliveryRequests'],
    queryFn: async () => {
      // In a real environment, we would fetch from Supabase
      // For now, return data from our store
      return requestStore.requests;
    },
  });
  
  // Update delivery request status
  const updateDeliveryRequest = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'pending' | 'in_progress' | 'completed' | 'declined' }) => {
      // In a real environment, we would update Supabase
      requestStore.updateRequestStatus(id, status);
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating request: ${error.message}`);
    }
  });
  
  // Add tracking update to delivery request
  const addTrackingUpdate = useMutation({
    mutationFn: async ({ requestId, update }: { requestId: string, update: TrackingUpdate }) => {
      // In a real environment, we would update Supabase
      requestStore.addTrackingUpdate(requestId, update);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
    },
    onError: (error: any) => {
      toast.error(`Error adding tracking update: ${error.message}`);
    }
  });
  
  // Simulate movement of delivery
  const simulateMovement = useMutation({
    mutationFn: async (requestId: string) => {
      // Simulate movement in the store
      requestStore.simulateMovement(requestId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
  
  return {
    deliveries,
    isLoading,
    error,
    updateDeliveryRequest,
    addTrackingUpdate,
    simulateMovement
  };
};
