import { useDriverQueries } from './drivers/use-driver-queries';
import { useDriverMutations } from './drivers/use-driver-mutations';

export const useDriverData = () => {
  const { drivers, isLoading, error } = useDriverQueries();
  const { updateDriver, assignDriver, unassignDriver, addDriver, deleteDriver } = useDriverMutations();

  console.log('useDriverData - Current drivers:', drivers?.map(d => ({
    id: d.id,
    name: d.name,
    photo: d.photo
  })));

  // Add the missing updateDriverLocation function
  const updateDriverLocation = (driverId: string, location: { 
    address: string; 
    coordinates: { lat: number; lng: number } 
  }) => {
    console.log('Updating driver location', driverId, location);
    // This is a placeholder that would normally update the driver's location
    // Since it's not fully implemented in the mutations yet, we're providing a stub
  };

  return {
    drivers,
    isLoading,
    error,
    updateDriver,
    assignDriver,
    unassignDriver,
    addDriver,
    deleteDriver,
    updateDriverLocation
  };
};
