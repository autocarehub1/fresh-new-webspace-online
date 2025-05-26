
export type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'declined';

export interface TrackingUpdate {
  status: string;
  timestamp: string;
  location: string;
  note: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  vehicle_type: string;
  vehicle_number?: string;
  current_location: {
    address: string;
    coordinates: Coordinates;
  };
  photo: string;
  phone: string;
  current_delivery: string | null;
  rating?: number;
  average_response_time?: number;
}

export interface DeliveryRequest {
  id: string;
  status: DeliveryStatus;
  pickup_location: string;
  delivery_location: string;
  created_at: string;
  tracking_updates?: TrackingUpdate[];
  
  // Database fields
  email?: string; // Email field from the database
  tracking_id?: string; // Database version of tracking ID
  package_type?: string; // Database version of package type
  requester_name?: string; // Name of the person requesting the delivery
  company_name?: string; // Optional company name
  
  // Additional fields needed for the tracking UI
  priority?: 'normal' | 'urgent';
  estimatedDelivery?: string;
  packageType?: string;
  temperature?: {
    current: string;
    required: string;
    status: 'normal' | 'warning';
  };
  pickupLocation?: {
    name: string;
    address: string;
  };
  deliveryLocation?: {
    name: string;
    address: string;
  };
  courier?: {
    name: string;
    photo: string;
    vehicle: string;
    phone: string;
  };
  trackingId?: string;
  estimatedCost?: number;
  distance?: number;
  notes?: string;
  
  // Client information for UI/presentation purposes (not in database)
  clientName?: string;
  
  // Real-time tracking fields
  pickup_coordinates?: Coordinates;
  delivery_coordinates?: Coordinates;
  current_coordinates?: Coordinates;
  assigned_driver?: string;

  // Proof of delivery photo URL
  proofOfDeliveryPhoto?: string;

  // Additional time fields that are being referenced
  pickup_time?: string;
  delivery_time?: string;
  pickup_address?: string;
  delivery_address?: string;
}

// Export Delivery as an alias for DeliveryRequest for compatibility
export type Delivery = DeliveryRequest;
