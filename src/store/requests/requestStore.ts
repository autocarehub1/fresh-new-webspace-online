
import { create } from 'zustand';
import { DeliveryRequest, DeliveryStatus, TrackingUpdate, Coordinates } from '@/types/delivery';
import { initialRequests } from './mockData';
import { createStatusUpdate, createDeliveryUpdate, calculateMovement } from './requestUtils';
import { useDriverStore } from '../drivers/driverStore';

interface RequestStore {
  requests: DeliveryRequest[];
  updateRequestStatus: (requestId: string, status: DeliveryStatus) => void;
  addTrackingUpdate: (requestId: string, update: TrackingUpdate) => void;
  getRequestByTrackingId: (trackingId: string) => DeliveryRequest | undefined;
  assignDriverToRequest: (requestId: string, driverId: string) => void;
  updateDeliveryLocation: (requestId: string, coordinates: Coordinates) => void;
  simulateMovement: (requestId: string) => void;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
  requests: initialRequests,
  
  updateRequestStatus: (requestId, status) => {
    set((state) => ({
      requests: state.requests.map((request) => {
        if (request.id === requestId) {
          const update = createStatusUpdate(status);
          return {
            ...request,
            status,
            tracking_updates: [...(request.tracking_updates || []), update]
          };
        }
        return request;
      })
    }));
  },
  
  addTrackingUpdate: (requestId, update) => {
    set((state) => ({
      requests: state.requests.map((request) => {
        if (request.id === requestId) {
          return {
            ...request,
            tracking_updates: [...(request.tracking_updates || []), update]
          };
        }
        return request;
      })
    }));
  },
  
  getRequestByTrackingId: (trackingId) => {
    return get().requests.find((request) => 
      request.trackingId === trackingId || request.id === trackingId
    );
  },
  
  assignDriverToRequest: (requestId, driverId) => {
    const driver = useDriverStore.getState().drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    useDriverStore.getState().updateDriverDelivery(driverId, requestId);
    
    set((state) => ({
      requests: state.requests.map((request) => {
        if (request.id === requestId) {
          const update = {
            status: 'Driver Assigned',
            timestamp: new Date().toISOString(),
            location: driver.current_location.address,
            note: `Driver ${driver.name} assigned to delivery`
          };
          
          return {
            ...request,
            assigned_driver: driverId,
            status: 'in_progress',
            tracking_updates: [...(request.tracking_updates || []), update],
            current_coordinates: driver.current_location.coordinates
          };
        }
        return request;
      })
    }));
  },
  
  updateDeliveryLocation: (requestId, coordinates) => {
    set((state) => ({
      requests: state.requests.map((request) => {
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
    const request = get().requests.find(r => r.id === requestId || r.trackingId === requestId);
    if (!request || !request.current_coordinates || !request.delivery_coordinates) return;

    const newCoordinates = calculateMovement(
      request.current_coordinates,
      request.delivery_coordinates,
      0.001
    );
    
    if (!newCoordinates) {
      set((state) => ({
        requests: state.requests.map((req) => {
          if (req.id === request.id) {
            const update = createDeliveryUpdate(req);
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
    
    get().updateDeliveryLocation(requestId, newCoordinates);
    
    if (request.assigned_driver) {
      const driver = useDriverStore.getState().drivers.find(d => d.id === request.assigned_driver);
      if (driver) {
        useDriverStore.getState().updateDriverLocation(driver.id, {
          address: driver.current_location.address,
          coordinates: newCoordinates
        });
      }
    }
  }
}));
