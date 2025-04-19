
import { create } from 'zustand';
import { DeliveryRequest, DeliveryStatus, TrackingUpdate } from '@/types/delivery';

const generateTrackingId = () => {
  return `MED-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

const estimateDeliveryCost = (distance: number, priority: string, packageType: string): number => {
  // Base rate
  let baseCost = 15;
  
  // Distance cost (assuming $2 per mile)
  const distanceCost = distance * 2;
  
  // Priority multiplier
  const priorityMultiplier = priority === 'urgent' ? 1.5 : 1;
  
  // Package type additional costs
  const packageMultiplier = packageType === 'temperature-controlled' ? 1.3 : 1;
  
  return Math.round((baseCost + distanceCost) * priorityMultiplier * packageMultiplier);
};

// Initial mock data
const initialRequests: DeliveryRequest[] = [
  {
    id: 'REQ-001',
    trackingId: 'MED-A1B2C3',
    status: 'pending',
    pickup_location: '123 Medical Center, San Antonio, TX',
    delivery_location: '456 Hospital Ave, San Antonio, TX',
    created_at: '2025-04-16T14:22:00Z',
    distance: 5.2,
    estimatedCost: 25,
    priority: 'normal',
    packageType: 'medical-supplies',
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
    trackingId: 'MED-D4E5F6',
    status: 'in_progress',
    pickup_location: '789 Clinic Road, San Antonio, TX',
    delivery_location: '101 Emergency Dept, San Antonio, TX',
    created_at: '2025-04-17T09:15:00Z',
    distance: 3.8,
    estimatedCost: 22,
    priority: 'urgent',
    packageType: 'pharmaceuticals',
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
  generateTrackingId: () => string; // Expose the generateTrackingId function
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  requests: initialRequests,
  updateRequestStatus: (requestId, status) => {
    set((state) => ({
      requests: state.requests.map((request) => {
        if (request.id === requestId) {
          // Generate tracking ID if not already present when request is approved
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
  generateTrackingId // Expose the function for consistent ID generation
}));
