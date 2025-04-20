import { create } from 'zustand';
import { DeliveryRequest, DeliveryStatus, TrackingUpdate } from '@/types/delivery';
import { generateTrackingId } from '@/utils/deliveryUtils';

interface RequestOperationsStore {
  updateRequestStatus: (requestId: string, status: DeliveryStatus) => void;
  addTrackingUpdate: (requestId: string, update: TrackingUpdate) => void;
  getRequestByTrackingId: (trackingId: string) => DeliveryRequest | undefined;
}

// Create a store with only the operations
export const useRequestOperations = create<RequestOperationsStore>()((set, get) => ({
  updateRequestStatus: (requestId, status) => {
    set((state) => ({
      requests: state.requests?.map((request) => {
        if (request.id === requestId) {
          const trackingId = request.trackingId || (status === 'in_progress' ? generateTrackingId() : undefined);
          
          const update = {
            status: status === 'in_progress' ? 'Driver Assigned' : status.charAt(0).toUpperCase() + status.slice(1),
            timestamp: new Date().toISOString(),
            location: 'Admin Dashboard',
            note: `Request ${status === 'in_progress' ? 'approved and driver assigned' : status}`
          };
          
          return {
            ...request,
            status,
            trackingId,
            tracking_updates: [...(request.tracking_updates || []), update]
          };
        }
        return request;
      })
    }));
  },
  
  addTrackingUpdate: (requestId, update) => {
    set((state) => ({
      requests: state.requests?.map((request) => {
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
    const state = get();
    return state.requests?.find((request) => 
      request.trackingId === trackingId || request.id === trackingId
    );
  }
}));
