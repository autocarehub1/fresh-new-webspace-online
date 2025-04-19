
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
  current_location: {
    address: string;
    coordinates: Coordinates;
  };
  photo: string;
  phone: string;
  current_delivery: string | null;
}

export interface DeliveryRequest {
  id: string;
  status: DeliveryStatus;
  pickup_location: string;
  delivery_location: string;
  created_at: string;
  tracking_updates?: TrackingUpdate[];
  
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
  
  // Real-time tracking fields
  pickup_coordinates?: Coordinates;
  delivery_coordinates?: Coordinates;
  current_coordinates?: Coordinates;
  assigned_driver?: string;
}
