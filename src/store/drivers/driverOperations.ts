import { create } from 'zustand';
import { Driver } from '@/types/delivery';

interface DriverOperationsStore {
  updateDriverStatus: (driverId: string, status: 'active' | 'inactive') => void;
  updateDriverLocation: (driverId: string, location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  updateDriverDelivery: (driverId: string, deliveryId: string | null) => void;
}

// Create a store with only the operations
export const useDriverOperations = create<DriverOperationsStore>()((set) => ({
  updateDriverStatus: (driverId, status) => {
    // This function will be implemented in driverStore
  },
  
  updateDriverLocation: (driverId, location) => {
    // This function will be implemented in driverStore
  },
  
  updateDriverDelivery: (driverId, deliveryId) => {
    // This function will be implemented in driverStore
  }
}));
