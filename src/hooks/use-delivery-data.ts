import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DeliveryRequest, TrackingUpdate } from '@/types/delivery';
import { toast } from 'sonner';
import { useRequestStore } from '@/store/requests/requestStore';
import { useDriverStore } from '@/store/driverStore'; // Fixed import path

export const useDeliveryData = () => {
  const queryClient = useQueryClient();

  // Fetch all delivery requests from Supabase only
  const { 
    data: deliveries, 
    isLoading, 
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['deliveryRequests'],
    queryFn: async () => {
      // Log the start of data fetching
      console.log('Fetching delivery requests from Supabase...');
      
      // Fetch delivery requests and join with users table to get emails
      const { data: supabaseData, error } = await supabase
        .from('delivery_requests')
        .select(`
          *,
          tracking_updates(*),
          users:created_by(email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching from Supabase:', error);
        throw error;
      }

      // Log the fetched data with status breakdown
      console.log('Fetched delivery requests:', supabaseData?.length || 0);
      
      // Log status breakdown for debugging
      if (supabaseData) {
        const statusBreakdown = supabaseData.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('Delivery requests status breakdown:', statusBreakdown);
        
        // Log pending requests with no assigned driver
        const pendingUnassigned = supabaseData.filter(req => 
          req.status === 'pending' && !req.assigned_driver
        );
        console.log('Pending unassigned requests:', pendingUnassigned.length);
        console.log('Pending unassigned request IDs:', pendingUnassigned.map(req => req.id));
      }
      
      // Always return fresh data from Supabase
      if (supabaseData && supabaseData.length > 0) {
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
          tracking_updates: item.tracking_updates || [],
          // Additional fields
          company_name: item.company_name,
          requester_name: item.requester_name,
          // Extract email from users join
          email: item.users?.email || "catalystlogistics2025@gmail.com"
        }));
      }
      // If no records, return []
      return [];
    },
    refetchInterval: 5000, // More responsive
  });

  // Update delivery request status in Supabase and keep frontend up to date
  const updateDeliveryRequest = useMutation({
    mutationFn: async (updateData: { id: string, status?: 'pending' | 'in_progress' | 'completed' | 'declined', [key: string]: any }) => {
      const { id, ...fields } = updateData;
      
      // Guarantee tracking_id if moving to in_progress
      let updatedFields: any = { ...fields };
      
      if (fields.status === 'in_progress') {
        const req = deliveries?.find(d => d.id === id);
        if (!req?.trackingId) {
          updatedFields.tracking_id = `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
      }
      
      // For requests changing to pending, ensure they don't have an assigned driver
      if (fields.status === 'pending') {
        updatedFields.assigned_driver = null;
      }
      
      console.log(`Updating delivery request ${id} with fields:`, updatedFields);
      
      const { error } = await supabase
        .from('delivery_requests')
        .update(updatedFields)
        .eq('id', id);

      if (error) {
        console.error(`Error updating request ${id}:`, error);
        throw error;
      }
      
      console.log(`Successfully updated request ${id}`);
      return { id, ...updatedFields };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating request: ${error.message}`);
    }
  });

  // Add tracking update to delivery request, store instantly
  const addTrackingUpdate = useMutation({
    mutationFn: async ({ requestId, update }: { requestId: string, update: TrackingUpdate }) => {
      const { error } = await supabase
        .from('tracking_updates')
        .insert({
          request_id: requestId,
          status: update.status,
          timestamp: update.timestamp,
          location: update.location,
          note: update.note
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
    },
    onError: (error: any) => {
      toast.error(`Error adding tracking update: ${error.message}`);
    }
  });

  // Simulate movement — update Supabase for demo
  const simulateMovement = useMutation({
    mutationFn: async (requestId: string) => {
      const request = deliveries?.find(r => r.id === requestId);
      if (!request || !request.current_coordinates || !request.delivery_coordinates) {
        return { success: true };
      }

      // Compute new position
      const currentCoords = request.current_coordinates;
      const targetCoords = request.delivery_coordinates;
      const latDiff = targetCoords.lat - currentCoords.lat;
      const lngDiff = targetCoords.lng - currentCoords.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      const stepSize = 0.001;

      if (distance < 0.002) {
        // Complete delivery in backend
        await supabase
          .from('delivery_requests')
          .update({ 
            status: 'completed', 
            current_coordinates: request.delivery_coordinates 
          })
          .eq('id', requestId);

        await supabase
          .from('tracking_updates')
          .insert({
            request_id: requestId,
            status: 'Delivered',
            timestamp: new Date().toISOString(),
            location: request.delivery_location,
            note: 'Package has been delivered successfully'
          });

        if (request.assigned_driver) {
          await supabase
            .from('drivers')
            .update({ current_delivery: null })
            .eq('id', request.assigned_driver);
        }
        return { success: true };
      }

      // Move the driver
      const newLat = currentCoords.lat + (latDiff / distance) * stepSize;
      const newLng = currentCoords.lng + (lngDiff / distance) * stepSize;
      const newCoords = { lat: newLat, lng: newLng };

      await supabase
        .from('delivery_requests')
        .update({ current_coordinates: newCoords })
        .eq('id', requestId);

      if (request.assigned_driver) {
        // Sync driver current_location in backend
        const driversQuery = await supabase.from('drivers').select('*').eq('id', request.assigned_driver).maybeSingle();
        if (driversQuery.data) {
          const address = (driversQuery.data as any).current_location?.address || '';
          await supabase
            .from('drivers')
            .update({ 
              current_location: { address, coordinates: newCoords }
            })
            .eq('id', request.assigned_driver);
        }
      }

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
    simulateMovement,
    // Add a dedicated refetch function with better error handling
    refetch: async () => {
      try {
        console.log('🔄 Manually refetching delivery requests...');
        const result = await queryRefetch();
        console.log(`✅ Successfully refetched ${result.data?.length || 0} delivery requests`);
        return result;
      } catch (error) {
        console.error('❌ Error manually refetching delivery requests:', error);
        toast.error('Failed to refresh delivery data');
        // Return current data to prevent errors
        return { data: deliveries };
      }
    },
    deleteDeliveryRequest: useMutation({
      mutationFn: async (id: string) => {
        // First, delete any associated tracking updates
        const { error: trackingError } = await supabase
          .from('tracking_updates')
          .delete()
          .eq('request_id', id);
        
        if (trackingError) {
          console.error('Error deleting tracking updates:', trackingError);
          throw trackingError;
        }
        
        // Then delete the delivery request
        const { error } = await supabase
          .from('delivery_requests')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting delivery request:', error);
          throw error;
        }
        
        return { success: true, deletedId: id };
      },
      onSuccess: (result) => {
        console.log('Delivery request deleted successfully:', result.deletedId);
        
        // First remove the item from any existing cached data to prevent UI flicker
        queryClient.setQueryData(['deliveryRequests'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((item: any) => item.id !== result.deletedId);
        });
        
        // Then invalidate the query to fetch fresh data
        queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
        
        // Also invalidate related queries that might need refresh
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
        
        toast.success('Delivery request deleted successfully');
      },
      onError: (error: any) => {
        console.error('Error in deleteDeliveryRequest mutation:', error);
        toast.error(`Error deleting request: ${error.message}`);
      }
    })
  };
};
