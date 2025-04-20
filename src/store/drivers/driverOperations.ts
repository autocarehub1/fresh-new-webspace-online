
import { create } from 'zustand';
import { Driver } from '@/types/delivery';

interface DriverOperationsStore {
  updateDriverStatus: (driverId: string, status: 'active' | 'inactive') => void;
  updateDriverLocation: (driverId: string, location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  updateDriverDelivery: (driverId: string, deliveryId: string | null) => void;
}

export const useDriverOperations = create<DriverOperationsStore>((set, get) => ({
  updateDriverStatus: (driverId, status) => {
    set((state) => ({
      drivers: state.drivers?.map((driver) => {
        if (driver.id === driverId) {
          return { ...driver, status };
        }
        return driver;
      })
    }));
  },
  
  updateDriverLocation: (driverId, location) => {
    set((state) => ({
      drivers: state.drivers?.map((driver) => {
        if (driver.id === driverId) {
          return { ...driver, current_location: location };
        }
        return driver;
      })
    }));
  },
  
  updateDriverDelivery: (driverId, deliveryId) => {
    set((state) => ({
      drivers: state.drivers?.map((driver) => {
        if (driver.id === driverId) {
          return { ...driver, current_delivery: deliveryId };
        }
        return driver;
      })
    }));
  }
}));
