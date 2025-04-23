import { create } from 'zustand';
import { Driver } from '@/types/delivery';

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
    photo: 'https://placehold.co/200x200/4ECDC4/FFFFFF/png?text=John',
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
    photo: 'https://placehold.co/200x200/FF6B6B/FFFFFF/png?text=Maria',
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
    photo: 'https://placehold.co/200x200/6B4CE6/FFFFFF/png?text=David',
    phone: '+1 (555) 234-5678',
    current_delivery: null
  },
  {
    id: 'DRV-004',
    name: 'Sarah Johnson',
    status: 'active',
    vehicle_type: 'Standard Delivery Vehicle',
    current_location: {
      address: 'East San Antonio',
      coordinates: { lat: 29.45, lng: -98.41 }
    },
    photo: 'https://placehold.co/200x200/FF9966/FFFFFF/png?text=Sarah',
    phone: '+1 (555) 345-6789',
    current_delivery: null
  }
];

interface DriverStore {
  drivers: Driver[];
  updateDriverStatus: (driverId: string, status: 'active' | 'inactive') => void;
  updateDriverLocation: (driverId: string, location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  updateDriverDelivery: (driverId: string, deliveryId: string | null) => void;
}

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: initialDrivers,
  
  updateDriverStatus: (driverId, status) => {
    set((state) => ({
      drivers: state.drivers.map((driver) => {
        if (driver.id === driverId) {
          return { ...driver, status };
        }
        return driver;
      })
    }));
  },
  
  updateDriverLocation: (driverId, location) => {
    set((state) => ({
      drivers: state.drivers.map((driver) => {
        if (driver.id === driverId) {
          return { ...driver, current_location: location };
        }
        return driver;
      })
    }));
  },
  
  updateDriverDelivery: (driverId, deliveryId) => {
    set((state) => ({
      drivers: state.drivers.map((driver) => {
        if (driver.id === driverId) {
          return { ...driver, current_delivery: deliveryId };
        }
        return driver;
      })
    }));
  }
}));
