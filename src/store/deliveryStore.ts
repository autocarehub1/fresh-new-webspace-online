
import { create } from 'zustand';
import { DeliveryRequest } from '@/types/delivery';

// Initial mock data
const initialRequests: DeliveryRequest[] = [
  {
    id: 'REQ-001',
    status: 'pending',
    pickup_location: '123 Medical Center, San Antonio, TX',
    delivery_location: '456 Hospital Ave, San Antonio, TX',
    created_at: '2025-04-16T14:22:00Z',
    tracking_updates: [
      {
        status: 'Request Created',
        timestamp: '2025-04-16T14:22:00Z',
        location: 'Online System',
        note: 'Delivery request submitted'
      }
    ]
  },
  {
    id: 'REQ-002',
    status: 'in_progress',
    pickup_location: '789 Clinic Road, San Antonio, TX',
    delivery_location: '101 Emergency Dept, San Antonio, TX',
    created_at: '2025-04-17T09:15:00Z',
    tracking_updates: [
      {
        status: 'Request Created',
        timestamp: '2025-04-17T09:15:00Z',
        location: 'Online System',
        note: 'Delivery request submitted'
      },
      {
        status: 'Driver Assigned',
        timestamp: '2025-04-17T09:20:00Z',
        location: 'Dispatch Center',
        note: 'Driver John assigned to pickup'
      }
    ]
  }
];

interface DeliveryStore {
  requests: DeliveryRequest[];
  updateRequestStatus: (requestId: string, status: DeliveryStatus) => void;
  addTrackingUpdate: (requestId: string, update: TrackingUpdate) => void;
  getRequestByTrackingId: (trackingId: string) => DeliveryRequest | undefined;
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  requests: initialRequests,
  updateRequestStatus: (requestId, status) => {
    set((state) => ({
      requests: state.requests.map((request) => {
        if (request.id === requestId) {
          const update = {
            status: status === 'in_progress' ? 'Driver Assigned' : status.charAt(0).toUpperCase() + status.slice(1),
            timestamp: new Date().toISOString(),
            location: 'Admin Dashboard',
            note: `Request ${status === 'in_progress' ? 'approved and driver assigned' : status}`
          };
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
    return get().requests.find((request) => request.id === trackingId);
  }
}));
