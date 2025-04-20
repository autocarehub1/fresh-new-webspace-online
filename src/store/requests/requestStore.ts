import { create } from 'zustand';
import { DeliveryRequest } from '@/types/delivery';
import { useRequestOperations } from './requestOperations';
import { useTrackingOperations } from '../tracking/trackingOperations';

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
}

export const useRequestStore = create<RequestStore>((set) => ({
  requests: initialRequests,
  ...useRequestOperations.getState(),
  ...useTrackingOperations.getState()
}));
