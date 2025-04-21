
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
  
  // Fetch all delivery requests from Supabase
  const { 
    data: deliveries, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['deliveryRequests'],
    queryFn: async () => {
      try {
        // Try to fetch from Supabase first
        const { data: supabaseData, error } = await supabase
          .from('delivery_requests')
          .select('*, tracking_updates(*)');
        
        if (error) {
          console.error('Error fetching from Supabase:', error);
          throw error;
        }

        if (supabaseData && supabaseData.length > 0) {
          // Format data to match our application's structure
          return supabaseData.map((item: any) => ({
            ...item,
            id: item.id,
            trackingId: item.tracking_id,
            pickup_location: item.pickup_location,
            delivery_location: item.delivery_location,
            status: item.status,
            priority: item.priority,
            packageType: item.package_type,
            created_at: item.created_at,
            assigned_driver: item.assigned_driver,
            current_coordinates: item.current_coordinates,
            delivery_coordinates: item.delivery_coordinates,
            pickup_coordinates: item.pickup_coordinates,
            distance: item.distance,
            estimatedCost: item.estimated_cost,
            estimatedDelivery: item.estimated_delivery,
            temperature: item.temperature,
            tracking_updates: item.tracking_updates || []
          }));
        } else {
          // Fallback to store data if Supabase returns empty
          console.log('No data from Supabase, using store data');
          return requestStore.requests;
        }
      } catch (e) {
        console.error('Failed to fetch from Supabase, using store data:', e);
        // Fallback to store data
        return requestStore.requests;
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
  
  // Update delivery request status in Supabase
  const updateDeliveryRequest = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'pending' | 'in_progress' | 'completed' | 'declined' }) => {
      try {
        // Update in Supabase
        const { data, error } = await supabase
          .from('delivery_requests')
          .update({ 
            status: status,
            tracking_id: status === 'in_progress' && !deliveries?.find(d => d.id === id)?.trackingId 
              ? `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}` 
              : undefined
          })
          .eq('id', id)
          .select();
        
        if (error) throw error;
        
        // Also update in local store for immediate UI update
        requestStore.updateRequestStatus(id, status);
        
        return { id, status };
      } catch (e) {
        console.error('Error updating request in Supabase:', e);
        // Still update local store for UI responsiveness
        requestStore.updateRequestStatus(id, status);
        return { id, status };
      }
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
      try {
        // Add tracking update to Supabase
        const { data, error } = await supabase
          .from('tracking_updates')
          .insert({
            request_id: requestId,
            status: update.status,
            timestamp: update.timestamp,
            location: update.location,
            note: update.note
          });
        
        if (error) throw error;
        
        // Update local store for immediate UI update
        requestStore.addTrackingUpdate(requestId, update);
        
        return { success: true };
      } catch (e) {
        console.error('Error adding tracking update to Supabase:', e);
        // Still update local store for UI responsiveness
        requestStore.addTrackingUpdate(requestId, update);
        return { success: true };
      }
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
      const request = deliveries?.find(r => r.id === requestId);
      
      if (!request || !request.current_coordinates || !request.delivery_coordinates) {
        requestStore.simulateMovement(requestId);
        return { success: true };
      }
      
      // Calculate new coordinates (simplified for now)
      const currentCoords = request.current_coordinates;
      const targetCoords = request.delivery_coordinates;
      
      const latDiff = targetCoords.lat - currentCoords.lat;
      const lngDiff = targetCoords.lng - currentCoords.lng;
      
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      const stepSize = 0.001;
      
      // If we've reached the destination
      if (distance < 0.002) {
        try {
          // Update delivery status to completed in Supabase
          await supabase
            .from('delivery_requests')
            .update({ 
              status: 'completed', 
              current_coordinates: request.delivery_coordinates 
            })
            .eq('id', requestId);
          
          // Add delivery completed tracking update
          await supabase
            .from('tracking_updates')
            .insert({
              request_id: requestId,
              status: 'Delivered',
              timestamp: new Date().toISOString(),
              location: request.delivery_location,
              note: 'Package has been delivered successfully'
            });
          
          // If there's a driver, update their status
          if (request.assigned_driver) {
            await supabase
              .from('drivers')
              .update({ current_delivery: null })
              .eq('id', request.assigned_driver);
          }
        } catch (e) {
          console.error('Error updating Supabase for delivery completion:', e);
        }
        
        // Update local stores
        requestStore.simulateMovement(requestId);
        return { success: true };
      }
      
      // Calculate new position
      const newLat = currentCoords.lat + (latDiff / distance) * stepSize;
      const newLng = currentCoords.lng + (lngDiff / distance) * stepSize;
      const newCoords = { lat: newLat, lng: newLng };
      
      try {
        // Update current coordinates in Supabase
        await supabase
          .from('delivery_requests')
          .update({ current_coordinates: newCoords })
          .eq('id', requestId);
        
        // If there's a driver, update their location too
        if (request.assigned_driver) {
          const driver = driverStore.drivers.find(d => d.id === request.assigned_driver);
          if (driver) {
            await supabase
              .from('drivers')
              .update({ 
                current_location: {
                  address: driver.current_location.address,
                  coordinates: newCoords
                }
              })
              .eq('id', request.assigned_driver);
          }
        }
      } catch (e) {
        console.error('Error updating coordinates in Supabase:', e);
      }
      
      // Update local stores for immediate UI update
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
