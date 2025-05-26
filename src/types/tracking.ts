

export interface TrackingProps {
  trackingId?: string;
}

export interface TrackingUpdate {
  id?: string;
  status: string;
  timestamp: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  notes?: string;
  note?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

