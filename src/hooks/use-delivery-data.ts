
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryRequest } from '@/types/delivery';
import { toast } from 'sonner';

export const useDeliveryData = () => {
  const queryClient = useQueryClient();
  
  // Fetch all delivery requests
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['deliveryRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*');
        
      if (error) throw error;
      return data as DeliveryRequest[];
    },
  });
  
  // Create a new delivery request
  const createDelivery = useMutation({
    mutationFn: async (newDelivery: Partial<DeliveryRequest>) => {
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert(newDelivery)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      toast.success('Delivery request created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating delivery: ${error.message}`);
    }
  });
  
  // Update a delivery request
  const updateDelivery = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DeliveryRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('delivery_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      toast.success('Delivery updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating delivery: ${error.message}`);
    }
  });
  
  // Get a delivery by tracking ID
  const getDeliveryByTrackingId = async (trackingId: string) => {
    const { data, error } = await supabase
      .from('delivery_requests')
      .select(`
        *,
        tracking_updates(*)
      `)
      .eq('tracking_id', trackingId)
      .single();
      
    if (error) {
      toast.error(`Error finding delivery: ${error.message}`);
      return null;
    }
    return data as DeliveryRequest & { tracking_updates: any[] };
  };
  
  return {
    requests: requests || [],
    isLoading,
    error,
    createDelivery,
    updateDelivery,
    getDeliveryByTrackingId
  };
};
