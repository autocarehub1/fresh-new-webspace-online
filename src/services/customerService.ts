import { supabase } from "@/lib/supabase";
import { DeliveryRequest } from "@/types/delivery";

/**
 * Fetch delivery requests for a specific customer
 */
export const fetchCustomerDeliveries = async (userId: string): Promise<DeliveryRequest[]> => {
  const { data, error } = await supabase
    .from("delivery_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer deliveries:", error);
    throw new Error(`Failed to fetch delivery requests: ${error.message}`);
  }

  return data || [];
};

/**
 * Create a new delivery request for a customer
 */
export const createDeliveryRequest = async (request: Partial<DeliveryRequest>): Promise<DeliveryRequest> => {
  // Generate a tracking ID if not provided
  if (!request.id) {
    request.id = generateTrackingId();
  }

  // Ensure created_at is set
  if (!request.created_at) {
    request.created_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("delivery_requests")
    .insert([request])
    .select()
    .single();

  if (error) {
    console.error("Error creating delivery request:", error);
    throw new Error(`Failed to create delivery request: ${error.message}`);
  }

  return data;
};

/**
 * Fetch customer profile data
 */
export const fetchCustomerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    // If the profile doesn't exist yet, return an empty object
    if (error.code === "PGRST116") {
      return {};
    }
    console.error("Error fetching customer profile:", error);
    throw new Error(`Failed to fetch customer profile: ${error.message}`);
  }

  return data;
};

/**
 * Update a customer profile
 */
export const updateCustomerProfile = async (userId: string, profileData: any) => {
  // First check if profile exists
  const { data: existingProfile } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let result;

  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from("customer_profiles")
      .update({ 
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer profile:", error);
      throw new Error(`Failed to update customer profile: ${error.message}`);
    }

    result = data;
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from("customer_profiles")
      .insert([{ 
        ...profileData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer profile:", error);
      throw new Error(`Failed to create customer profile: ${error.message}`);
    }

    result = data;
  }

  return result;
};

/**
 * Generate a tracking ID for a new delivery request
 */
const generateTrackingId = (): string => {
  const prefix = "MED-";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = prefix;
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}; 