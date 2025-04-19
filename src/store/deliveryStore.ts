
import { create } from 'zustand';
import { DeliveryRequest, DeliveryStatus, TrackingUpdate, Driver } from '@/types/delivery';

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

// Initial mock data for drivers
const initialDrivers: Driver[] = [
  {
    id: 'DRV-001',
    name: 'John Smith',
    status: 'active',
    vehicle_type: 'Temperature-Controlled Van',
    current_location: {
      address: 'Medical District, San Antonio',
      coordinates: { lat: 29.508, lng: -98.579 }
    },
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    phone: '+1 (555) 123-4567',
    current_delivery: 'MED-A1B2C3'
  },
  {
    id: 'DRV-002',
    name: 'Maria Rodriguez',
    status: 'active',
    vehicle_type: 'Standard Delivery Vehicle',
    current_location: {
      address: 'Downtown, San Antonio',
      coordinates: { lat: 29.424, lng: -98.493 }
    },
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    phone: '+1 (555) 987-6543',
    current_delivery: null
  },
  {
    id: 'DRV-003',
    name: 'David Chen',
    status: 'inactive',
    vehicle_type: 'Motorcycle Courier',
    current_location: {
      address: 'North San Antonio',
      coordinates: { lat: 29.555, lng: -98.496 }
    },
    photo: 'https://randomuser.me/api/portraits/men/75.jpg',
    phone: '+1 (555) 234-5678',
    current_delivery: null
  }
];

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

interface DeliveryStore {
  requests: DeliveryRequest[];
  drivers: Driver[];
  updateRequestStatus: (requestId: string, status: DeliveryStatus) => void;
  addTrackingUpdate: (requestId: string, update: TrackingUpdate) => void;
  getRequestByTrackingId: (trackingId: string) => DeliveryRequest | undefined;
  generateTrackingId: () => string;
  assignDriverToRequest: (requestId: string, driverId: string) => void;
  updateDriverStatus: (driverId: string, status: 'active' | 'inactive') => void;
  updateDriverLocation: (driverId: string, location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  updateDeliveryLocation: (requestId: string, coordinates: { lat: number; lng: number }) => void;
  simulateMovement: (requestId: string) => void;
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  requests: initialRequests,
  drivers: initialDrivers,
  
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
  
  generateTrackingId,
  
  assignDriverToRequest: (requestId, driverId) => {
    const driver = get().drivers.find(d => d.id === driverId);
    
    if (!driver) return;
    
    // Update driver's current delivery
    set((state) => ({
      drivers: state.drivers.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            current_delivery: requestId
          };
        }
        return d;
      }),
      
      // Update request with assigned driver
      requests: state.requests.map((request) => {
        if (request.id === requestId) {
          // Create tracking update
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
  
  updateDriverStatus: (driverId, status) => {
    set((state) => ({
      drivers: state.drivers.map((driver) => {
        if (driver.id === driverId) {
          return {
            ...driver,
            status
          };
        }
        return driver;
      })
    }));
  },
  
  updateDriverLocation: (driverId, location) => {
    set((state) => {
      const updatedDrivers = state.drivers.map((driver) => {
        if (driver.id === driverId) {
          return {
            ...driver,
            current_location: location
          };
        }
        return driver;
      });
      
      // If driver is assigned to a delivery, update that delivery's current location
      const updatedDriver = updatedDrivers.find(d => d.id === driverId);
      const updatedRequests = [...state.requests];
      
      if (updatedDriver && updatedDriver.current_delivery) {
        const requestIndex = updatedRequests.findIndex(r => 
          r.trackingId === updatedDriver.current_delivery || r.id === updatedDriver.current_delivery
        );
        
        if (requestIndex >= 0) {
          updatedRequests[requestIndex] = {
            ...updatedRequests[requestIndex],
            current_coordinates: location.coordinates
          };
        }
      }
      
      return {
        drivers: updatedDrivers,
        requests: updatedRequests
      };
    });
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
  
  // For demo purposes - simulate movement of delivery
  simulateMovement: (requestId) => {
    const request = get().requests.find(r => r.id === requestId || r.trackingId === requestId);
    
    if (!request || !request.current_coordinates || !request.delivery_coordinates) return;
    
    // Calculate a step toward the delivery location
    const stepSize = 0.001; // Small step for smooth movement
    const currentLat = request.current_coordinates.lat;
    const currentLng = request.current_coordinates.lng;
    const targetLat = request.delivery_coordinates.lat;
    const targetLng = request.delivery_coordinates.lng;
    
    // Calculate direction vector
    const latDiff = targetLat - currentLat;
    const lngDiff = targetLng - currentLng;
    
    // Normalize and apply step
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    // If we're close to the destination, complete the delivery
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
        }),
        
        // Free up the driver
        drivers: state.drivers.map((driver) => {
          if (driver.id === request.assigned_driver) {
            return {
              ...driver,
              current_delivery: null
            };
          }
          return driver;
        })
      }));
      return;
    }
    
    // Move a step toward destination
    const moveLat = currentLat + (latDiff / distance) * stepSize;
    const moveLng = currentLng + (lngDiff / distance) * stepSize;
    
    get().updateDeliveryLocation(requestId, { lat: moveLat, lng: moveLng });
    
    // Also update driver location
    if (request.assigned_driver) {
      const driver = get().drivers.find(d => d.id === request.assigned_driver);
      if (driver) {
        get().updateDriverLocation(driver.id, {
          address: driver.current_location.address,
          coordinates: { lat: moveLat, lng: moveLng }
        });
      }
    }
  }
}));
