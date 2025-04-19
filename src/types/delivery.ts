
export type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'declined';

export interface DeliveryRequest {
  id: string;
  status: DeliveryStatus;
  pickup_location: string;
  delivery_location: string;
  created_at: string;
  tracking_updates?: TrackingUpdate[];
}

export interface TrackingUpdate {
  status: string;
  timestamp: string;
  location: string;
  note: string;
}
