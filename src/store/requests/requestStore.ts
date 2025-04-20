
import { create } from 'zustand';
import { DeliveryRequest, DeliveryStatus, TrackingUpdate, Coordinates } from '@/types/delivery';
import { generateTrackingId } from '@/utils/deliveryUtils';
import { useDriverStore } from '../drivers/driverStore';

// Initial mock data for delivery requests
const initialRequests: DeliveryRequest[] = [
  {
    id: 'REQ-001',
    trackingId: 'MED-A1B2C3',
    status: 'in_progress',
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
      },
      {
        status: 'Driver Assigned',
        timestamp: '2025-04-16T14:30:00Z',
        location: 'Dispatch Center',
        note: 'Driver John Smith assigned to pickup'
      }
    ],
    assigned_driver: 'DRV-001',
    pickup_coordinates: { lat: 29.508, lng: -98.579 },
    delivery_coordinates: { lat: 29.468, lng: -98.539 },
    current_coordinates: { lat: 29.488, lng: -98.559 },
    estimatedDelivery: '2025-04-16T16:22:00Z',
    temperature: {
      current: '2°C',
      required: '2-8°C',
      status: 'normal'
    }
  },
  {
    id: 'REQ-002',
    trackingId: 'MED-D4E5F6',
    status: 'pending',
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
      }
    ],
    pickup_coordinates: { lat: 29.424, lng: -98.493 },
    delivery_coordinates: { lat: 29.432, lng: -98.456 }
  }
];

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
  
  assignDriverToRequest: (requestId, driverId) => {
    const driver = useDriverStore.getState().drivers.find(d => d.id === driverId);
    
    if (!driver) return;
    
    // Update driver's current delivery
    useDriverStore.getState().updateDriverDelivery(driverId, requestId);
    
    // Update request with assigned driver
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
        requests: state.requests.map((req) => {
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
