import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Driver } from '@/types/delivery';
import { mapDbToDriver } from './driver-utils';
import { useDriverStore } from '@/store/driverStore';

export const useDriverQueries = () => {
  const localDrivers = useDriverStore((state) => state.drivers);

  const { data: drivers, isLoading, error, refetch } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      try {
        console.log('Fetching drivers from Supabase...');
        const { data, error } = await supabase
          .from('drivers')
          .select('*');
          
        if (error) {
          console.error('Error fetching drivers:', error);
          return localDrivers;
        }
        
        console.log('Raw driver data from Supabase:', data);
        const mappedDrivers = (data as any[]).map(mapDbToDriver);
        console.log('Mapped drivers:', mappedDrivers.map(d => ({
          id: d.id,
          name: d.name,
          photo: d.photo
        })));
        
        return mappedDrivers;
      } catch (err) {
        console.error('Exception when fetching drivers:', err);
        return localDrivers;
      }
    },
    refetchInterval: 10000,
  });

  return {
    drivers: drivers || localDrivers,
    isLoading,
    error,
    refetch
  };
};
