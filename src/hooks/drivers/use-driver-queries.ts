
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Driver } from '@/types/delivery';
import { mapDbToDriver } from './driver-utils';
import { useDriverStore } from '@/store/driverStore';

export const useDriverQueries = () => {
  const localDrivers = useDriverStore((state) => state.drivers);

  const { data: drivers, isLoading, error } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*');
          
        if (error) {
          console.error('Error fetching drivers:', error);
          return localDrivers;
        }
        
        return (data as any[]).map(mapDbToDriver);
      } catch (err) {
        console.error('Exception when fetching drivers:', err);
        return localDrivers;
      }
    },
  });

  return {
    drivers: drivers || localDrivers,
    isLoading,
    error
  };
};
