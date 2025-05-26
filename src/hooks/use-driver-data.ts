import { useDriverQueries } from './drivers/use-driver-queries';
import { useDriverMutations } from './drivers/use-driver-mutations';
import { toast } from 'sonner';

export const useDriverData = () => {
  const { drivers, isLoading, error, refetch: queryRefetch } = useDriverQueries();
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

  // Add a dedicated refetch function with better error handling
  const refetch = async () => {
    try {
      console.log('🔄 Manually refetching drivers...');
      const result = await queryRefetch();
      console.log(`✅ Successfully refetched ${result.data?.length || 0} drivers`);
      return result;
    } catch (error) {
      console.error('❌ Error manually refetching drivers:', error);
      toast.error('Failed to refresh driver data');
      // Return current data to prevent errors
      return { data: drivers };
    }
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
    updateDriverLocation,
    refetch
  };
};
