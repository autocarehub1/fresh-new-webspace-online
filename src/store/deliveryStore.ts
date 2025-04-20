
import { create } from 'zustand';
import { useDriverStore } from './driverStore';
import { useRequestStore } from './requestStore';
import { DeliveryRequest, Driver, DeliveryStatus, TrackingUpdate } from '@/types/delivery';
import { generateTrackingId, estimateDeliveryCost } from '@/utils/deliveryUtils';

interface DeliveryStore {
  // Combine stores functionality
  drivers: Driver[];
  requests: DeliveryRequest[];
  
  // Re-export utility functions
  generateTrackingId: () => string;
  estimateDeliveryCost: (distance: number, priority: string, packageType: string) => number;
  
  // Aggregated methods
  updateDriverStatus: (driverId: string, status: 'active' | 'inactive') => void;
  updateRequestStatus: (requestId: string, status: DeliveryStatus) => void;
  addTrackingUpdate: (requestId: string, update: TrackingUpdate) => void;
  assignDriverToRequest: (requestId: string, driverId: string) => void;
  getRequestByTrackingId: (trackingId: string) => DeliveryRequest | undefined;
  simulateMovement: (requestId: string) => void;
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => {
  const driverStore = useDriverStore.getState();
  const requestStore = useRequestStore.getState();

  return {
    // Combine initial states
    drivers: driverStore.drivers,
    requests: requestStore.requests,
    
    // Re-export utility functions
    generateTrackingId,
    estimateDeliveryCost,
    
    // Proxy methods to underlying stores
    updateDriverStatus: (driverId, status) => {
      useDriverStore.getState().updateDriverStatus(driverId, status);
      set({ drivers: useDriverStore.getState().drivers });
    },
    
    updateRequestStatus: (requestId, status) => {
      useRequestStore.getState().updateRequestStatus(requestId, status);
      set({ requests: useRequestStore.getState().requests });
    },
    
    addTrackingUpdate: (requestId, update) => {
      useRequestStore.getState().addTrackingUpdate(requestId, update);
      set({ requests: useRequestStore.getState().requests });
    },
    
    assignDriverToRequest: (requestId, driverId) => {
      useRequestStore.getState().assignDriverToRequest(requestId, driverId);
      set({ 
        requests: useRequestStore.getState().requests,
        drivers: useDriverStore.getState().drivers 
      });
    },
    
    getRequestByTrackingId: (trackingId) => {
      return useRequestStore.getState().getRequestByTrackingId(trackingId);
    },
    
    simulateMovement: (requestId) => {
      useRequestStore.getState().simulateMovement(requestId);
      set({ 
        requests: useRequestStore.getState().requests,
        drivers: useDriverStore.getState().drivers 
      });
    }
  };
});

// Re-export utility functions and other stores for convenience
export { useDriverStore, useRequestStore, generateTrackingId, estimateDeliveryCost };
