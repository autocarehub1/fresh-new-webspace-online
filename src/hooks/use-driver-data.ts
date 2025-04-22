
import { useDriverQueries } from './drivers/use-driver-queries';
import { useDriverMutations } from './drivers/use-driver-mutations';

export const useDriverData = () => {
  const { drivers, isLoading, error } = useDriverQueries();
  const { updateDriver, assignDriver, addDriver } = useDriverMutations();

  return {
    drivers,
    isLoading,
    error,
    updateDriver,
    assignDriver,
    addDriver
  };
};
