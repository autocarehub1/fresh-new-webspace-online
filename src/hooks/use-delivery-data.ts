
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryRequest, DeliveryStatus } from '@/types/delivery';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Type helpers for conversion between DB and frontend types
type DbDeliveryRequest = {
  id: string;
  assigned_driver: string | null;
  created_at: string;
  created_by: string | null;
  current_coordinates: Json | null;
  delivery_coordinates: Json | null;
  delivery_location: string;
  distance: number | null;
  estimated_cost: number | null;
  estimated_delivery: string | null;
  package_type: string | null;
  pickup_coordinates: Json | null;
  pickup_location: string;
  priority: string | null;
  status: string;
  temperature: Json | null;
  tracking_id: string | null;
};

// Type for insertion to ensure required fields
type DbDeliveryRequestInsert = Omit<Partial<DbDeliveryRequest>, 'pickup_location' | 'delivery_location' | 'id'> & {
  pickup_location: string;
  delivery_location: string;
  id: string;
};

// Converts DB model to frontend model
const mapDbToDeliveryRequest = (dbItem: DbDeliveryRequest): DeliveryRequest => {
  return {
    id: dbItem.id,
    status: dbItem.status as DeliveryStatus,
    pickup_location: dbItem.pickup_location,
    delivery_location: dbItem.delivery_location,
    created_at: dbItem.created_at,
    assigned_driver: dbItem.assigned_driver || undefined,
    trackingId: dbItem.tracking_id || undefined,
    estimatedDelivery: dbItem.estimated_delivery,
    packageType: dbItem.package_type,
    priority: (dbItem.priority as "normal" | "urgent") || "normal",
    estimatedCost: dbItem.estimated_cost || undefined,
    distance: dbItem.distance || undefined,
    pickup_coordinates: dbItem.pickup_coordinates as any,
    delivery_coordinates: dbItem.delivery_coordinates as any,
    current_coordinates: dbItem.current_coordinates as any,
    temperature: dbItem.temperature ? {
      current: (dbItem.temperature as any).current || "0°C",
      required: (dbItem.temperature as any).required || "0-8°C",
      status: (dbItem.temperature as any).status || "normal"
    } : undefined
  };
};

// Maps frontend model to DB model for insert/update
const mapDeliveryRequestToDb = (item: Partial<DeliveryRequest>): Partial<DbDeliveryRequest> => {
  const dbItem: Partial<DbDeliveryRequest> = {
    pickup_location: item.pickup_location,
    delivery_location: item.delivery_location,
    status: item.status,
    assigned_driver: item.assigned_driver || null,
    tracking_id: item.trackingId || null,
    estimated_delivery: item.estimatedDelivery || null,
    package_type: item.packageType || null,
    priority: item.priority || null,
    estimated_cost: item.estimatedCost || null,
    distance: item.distance || null,
  };

  if (item.current_coordinates) {
    dbItem.current_coordinates = item.current_coordinates as unknown as Json;
  }
  
  if (item.delivery_coordinates) {
    dbItem.delivery_coordinates = item.delivery_coordinates as unknown as Json;
  }
  
  if (item.pickup_coordinates) {
    dbItem.pickup_coordinates = item.pickup_coordinates as unknown as Json;
  }
  
  if (item.temperature) {
    dbItem.temperature = item.temperature as unknown as Json;
  }
  
  return dbItem;
};

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
      return (data as DbDeliveryRequest[]).map(mapDbToDeliveryRequest);
    },
  });
  
  // Create a new delivery request
  const createDelivery = useMutation({
    mutationFn: async (newDelivery: Partial<DeliveryRequest>) => {
      // For new delivery requests, ensure we have required fields
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
      toast.error(`Error creating delivery: ${error.message}`);
    }
  });
  
  // Update a delivery request
  const updateDelivery = useMutation({
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
    
    const delivery = mapDbToDeliveryRequest(data as DbDeliveryRequest);
    
    return {
      ...delivery,
      tracking_updates: data.tracking_updates || []
    };
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
