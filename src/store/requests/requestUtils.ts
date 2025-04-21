import { DeliveryRequest, DeliveryStatus, TrackingUpdate } from '@/types/delivery';
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
