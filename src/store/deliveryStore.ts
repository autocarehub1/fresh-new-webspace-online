
import { create } from 'zustand';
import { useDriverStore } from './drivers/driverStore';
import { useRequestStore } from './requests/requestStore';
import { DeliveryRequest, Driver, DeliveryStatus, TrackingUpdate } from '@/types/delivery';
import { generateTrackingId, estimateDeliveryCost } from '@/utils/deliveryUtils';

interface DeliveryStore {
  drivers: Driver[];
  requests: DeliveryRequest[];
  generateTrackingId: () => string;
  estimateDeliveryCost: (distance: number, priority: string, packageType: string) => number;
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
    drivers: driverStore.drivers,
    requests: requestStore.requests,
    generateTrackingId,
    estimateDeliveryCost,
    
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

export { useDriverStore, useRequestStore, generateTrackingId, estimateDeliveryCost };
