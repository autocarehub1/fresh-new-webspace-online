import { DeliveryRequest, DeliveryStatus, TrackingUpdate, Coordinates } from '@/types/delivery';
import { generateTrackingId } from '@/utils/deliveryUtils';
import { useDriverStore } from '@/store/driverStore';

export const createStatusUpdate = (status: DeliveryStatus, location: string = 'Admin Dashboard'): TrackingUpdate => ({
  status: status === 'in_progress' ? 'Driver Assigned' : status.charAt(0).toUpperCase() + status.slice(1),
  timestamp: new Date().toISOString(),
  location,
  note: `Request ${status === 'in_progress' ? 'approved and driver assigned' : status}`
});

export const createDeliveryUpdate = (request: DeliveryRequest): TrackingUpdate => ({
  status: 'Delivered',
  timestamp: new Date().toISOString(),
  location: request.delivery_location,
  note: 'Package has been delivered successfully'
});

export const calculateMovement = (current: { lat: number; lng: number }, target: { lat: number; lng: number }, stepSize: number) => {
  const latDiff = target.lat - current.lat;
  const lngDiff = target.lng - current.lng;
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  
  if (distance < 0.002) {
    return null;
  }
  
  return {
    lat: current.lat + (latDiff / distance) * stepSize,
    lng: current.lng + (lngDiff / distance) * stepSize
  };
};

// Calculate ETA based on distance and average speed
export const calculateETA = (
  current: Coordinates, 
  destination: Coordinates, 
  trafficCondition: 'good' | 'moderate' | 'heavy' = 'good'
) => {
  // Earth's radius in kilometers
  const R = 6371;
  
  // Get speeds based on traffic condition (km/h)
  const speeds = {
    good: 35,
    moderate: 20,
    heavy: 10
  };
  
  // Convert latitude and longitude from degrees to radians
  const lat1 = current.lat * Math.PI / 180;
  const lng1 = current.lng * Math.PI / 180;
  const lat2 = destination.lat * Math.PI / 180;
  const lng2 = destination.lng * Math.PI / 180;
  
  // Calculate distance using Haversine formula
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  
  // Calculate approximate time based on speed
  const avgSpeed = speeds[trafficCondition];
  const timeHours = distanceKm / avgSpeed;
  const timeMinutes = timeHours * 60;
  
  return {
    distance: distanceKm.toFixed(1),
    eta: Math.round(timeMinutes),
    arrivalTime: new Date(Date.now() + timeMinutes * 60000).toISOString()
  };
};

// Generate detailed status updates based on progress
export const generateDetailedStatus = (
  request: DeliveryRequest,
  distanceRemaining: number
): string => {
  // If delivery is completed
  if (request.status === 'completed') {
    return 'Delivery completed successfully';
  }
  
  // If delivery hasn't started yet
  if (request.status === 'pending') {
    return 'Awaiting driver assignment';
  }
  
  // If delivery is in progress, provide detailed status based on distance
  if (distanceRemaining < 0.2) {
    return 'Arriving at destination';
  } else if (distanceRemaining < 0.5) {
    return 'Very close to destination (less than 0.5km)';
  } else if (distanceRemaining < 1) {
    return 'Approaching destination';
  } else if (distanceRemaining < 3) {
    return 'In delivery area';
  } else if (distanceRemaining < 5) {
    return 'Nearby delivery area';
  } else {
    return 'En route to delivery location';
  }
};

// Create a detailed tracking update with location information
export const createDetailedTrackingUpdate = (
  request: DeliveryRequest,
  status: string,
  coordinates: Coordinates,
  note?: string
): TrackingUpdate => {
  // Generate a location description based on coordinates
  // In a real application, you'd use reverse geocoding to get the actual address
  const locationDescription = `Near ${coordinates.lat.toFixed(3)}, ${coordinates.lng.toFixed(3)}`;
  
  return {
    status: status,
    timestamp: new Date().toISOString(),
    location: locationDescription,
    note: note || `Courier is ${status.toLowerCase()}`,
    coordinates: coordinates
  };
};
