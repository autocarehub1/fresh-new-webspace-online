
import { create } from 'zustand';
import { useDriverStore } from '../drivers/driverStore';
import { Coordinates } from '@/types/delivery';

interface TrackingOperationsStore {
  updateDeliveryLocation: (requestId: string, coordinates: Coordinates) => void;
  simulateMovement: (requestId: string) => void;
}

export const useTrackingOperations = create<TrackingOperationsStore>((set, get) => ({
  updateDeliveryLocation: (requestId, coordinates) => {
    set((state) => ({
      requests: state.requests?.map((request) => {
        if (request.id === requestId || request.trackingId === requestId) {
          return {
            ...request,
            current_coordinates: coordinates
          };
        }
        return request;
      })
    }));
  },
  
  simulateMovement: (requestId) => {
    const state = get();
    const request = state.requests?.find(r => r.id === requestId || r.trackingId === requestId);
    
    if (!request || !request.current_coordinates || !request.delivery_coordinates) return;
    
    const stepSize = 0.001;
    const currentLat = request.current_coordinates.lat;
    const currentLng = request.current_coordinates.lng;
    const targetLat = request.delivery_coordinates.lat;
    const targetLng = request.delivery_coordinates.lng;
    
    const latDiff = targetLat - currentLat;
    const lngDiff = targetLng - currentLng;
    
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    if (distance < 0.002) {
      set((state) => ({
        requests: state.requests?.map((req) => {
          if (req.id === request.id) {
            const update = {
              status: 'Delivered',
              timestamp: new Date().toISOString(),
              location: req.delivery_location,
              note: 'Package has been delivered successfully'
            };
            
            return {
              ...req,
              status: 'completed',
              current_coordinates: req.delivery_coordinates,
              tracking_updates: [...(req.tracking_updates || []), update]
            };
          }
          return req;
        })
      }));
      
      if (request.assigned_driver) {
        useDriverStore.getState().updateDriverDelivery(request.assigned_driver, null);
      }
      return;
    }
    
    const moveLat = currentLat + (latDiff / distance) * stepSize;
    const moveLng = currentLng + (lngDiff / distance) * stepSize;
    
    get().updateDeliveryLocation(requestId, { lat: moveLat, lng: moveLng });
    
    if (request.assigned_driver) {
      const driver = useDriverStore.getState().drivers.find(d => d.id === request.assigned_driver);
      if (driver) {
        useDriverStore.getState().updateDriverLocation(driver.id, {
          address: driver.current_location.address,
          coordinates: { lat: moveLat, lng: moveLng }
        });
      }
    }
  }
}));
