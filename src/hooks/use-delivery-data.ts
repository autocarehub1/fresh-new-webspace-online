
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DeliveryRequest, TrackingUpdate } from '@/types/delivery';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Type helpers for conversion between DB and frontend types
type DbDeliveryRequest = {
  id: string;
  tracking_id: string;
  status: string;
  pickup_location: string;
  delivery_location: string;
  created_at: string;
  priority: string;
  package_type: string | null;
  estimated_delivery: string | null;
  temperature: Json | null;
  pickup_coordinates: Json | null;
  delivery_coordinates: Json | null;
  current_coordinates: Json | null;
  assigned_driver: string | null;
  estimated_cost: number | null;
  distance: number | null;
  created_by: string | null;
};

// Type for insertion to ensure required fields
type DbDeliveryRequestInsert = Omit<Partial<DbDeliveryRequest>, 'pickup_location' | 'delivery_location' | 'id'> & {
  pickup_location: string;
  delivery_location: string;
  id: string;
};

// Converts DB model to frontend model
const mapDbToDeliveryRequest = (dbItem: DbDeliveryRequest): DeliveryRequest => {
  const pickupCoords = dbItem.pickup_coordinates as any;
  const deliveryCoords = dbItem.delivery_coordinates as any;
  const currentCoords = dbItem.current_coordinates as any;
  const tempData = dbItem.temperature as any;

  return {
    id: dbItem.id,
    trackingId: dbItem.tracking_id || undefined,
    status: dbItem.status as any,
    pickup_location: dbItem.pickup_location,
    delivery_location: dbItem.delivery_location,
    created_at: dbItem.created_at,
    priority: dbItem.priority as 'normal' | 'urgent',
    packageType: dbItem.package_type || undefined,
    estimatedDelivery: dbItem.estimated_delivery || undefined,
    temperature: tempData ? {
      current: tempData.current || '',
      required: tempData.required || '',
      status: tempData.status || 'normal'
    } : undefined,
    pickup_coordinates: pickupCoords ? {
      lat: pickupCoords.lat || 0,
      lng: pickupCoords.lng || 0
    } : undefined,
    delivery_coordinates: deliveryCoords ? {
      lat: deliveryCoords.lat || 0,
      lng: deliveryCoords.lng || 0
    } : undefined,
    current_coordinates: currentCoords ? {
      lat: currentCoords.lat || 0,
      lng: currentCoords.lng || 0
    } : undefined,
    assigned_driver: dbItem.assigned_driver || undefined,
    estimatedCost: dbItem.estimated_cost || 0,
    distance: dbItem.distance || 0
  };
};

// Maps frontend model to DB model for insert/update
const mapDeliveryRequestToDb = (item: Partial<DeliveryRequest>): Partial<DbDeliveryRequest> => {
  const dbItem: Partial<DbDeliveryRequest> = {
    tracking_id: item.trackingId,
    status: item.status,
    pickup_location: item.pickup_location,
    delivery_location: item.delivery_location,
    priority: item.priority,
    package_type: item.packageType || null,
    estimated_delivery: item.estimatedDelivery || null,
    assigned_driver: item.assigned_driver || null,
    estimated_cost: item.estimatedCost || null,
    distance: item.distance || null
  };
  
  if (item.temperature) {
    dbItem.temperature = item.temperature as unknown as Json;
  }
  
  if (item.pickup_coordinates) {
    dbItem.pickup_coordinates = item.pickup_coordinates as unknown as Json;
  }
  
  if (item.delivery_coordinates) {
    dbItem.delivery_coordinates = item.delivery_coordinates as unknown as Json;
  }
  
  if (item.current_coordinates) {
    dbItem.current_coordinates = item.current_coordinates as unknown as Json;
  }
  
  return dbItem;
};

export const useDeliveryData = () => {
  const queryClient = useQueryClient();
  
  // Fetch all delivery requests
  const { data: deliveries, isLoading, error } = useQuery({
    queryKey: ['deliveryRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*');
        
      if (error) throw error;
      return (data as DbDeliveryRequest[]).map(mapDbToDeliveryRequest);
    },
  });
  
  // Create a new delivery request
  const createDeliveryRequest = useMutation({
    mutationFn: async (newDelivery: Partial<DeliveryRequest>) => {
      // For new requests, ensure we have required fields
      if (!newDelivery.pickup_location || !newDelivery.delivery_location) {
        throw new Error("Pickup and delivery locations are required");
      }
      
      const dbDelivery = mapDeliveryRequestToDb(newDelivery);
      
      // Generate a unique ID for the new delivery request
      const uniqueId = crypto.randomUUID();
      
      // Ensure required fields for DB insert
      const insertData: DbDeliveryRequestInsert = {
        ...dbDelivery as Partial<DbDeliveryRequest>,
        id: uniqueId,
        pickup_location: newDelivery.pickup_location,
        delivery_location: newDelivery.delivery_location
      };
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert(insertData)
        .select()
        .single();
        
      if (error) throw error;
      return mapDbToDeliveryRequest(data as DbDeliveryRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      toast.success('Delivery request created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating delivery request: ${error.message}`);
    }
  });
  
  // Update a delivery request
  const updateDeliveryRequest = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DeliveryRequest> & { id: string }) => {
      const dbUpdates = mapDeliveryRequestToDb(updates);
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return mapDbToDeliveryRequest(data as DbDeliveryRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
      toast.success('Delivery request updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating delivery request: ${error.message}`);
    }
  });

  // Add tracking update
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

  // Get a delivery request by tracking ID
  const getDeliveryByTrackingId = async (trackingId: string) => {
    const { data, error } = await supabase
      .from('delivery_requests')
      .select('*')
      .or(`tracking_id.eq.${trackingId},id.eq.${trackingId}`)
      .single();
      
    if (error) throw error;
    return mapDbToDeliveryRequest(data as DbDeliveryRequest);
  };
  
  return {
    deliveries: deliveries || [],
    isLoading,
    error,
    createDeliveryRequest,
    updateDeliveryRequest,
    addTrackingUpdate,
    getDeliveryByTrackingId
  };
};
