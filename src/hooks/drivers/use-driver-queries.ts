
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
        console.log('Fetching drivers from database...');
        
        // Query with only essential columns that should always exist
        const { data, error } = await supabase
          .from('drivers')
          .select('id, name, phone, photo, status, vehicle_type, current_location, current_delivery, created_at')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching drivers:', error);
          
          if (error.message.includes('relation "drivers" does not exist')) {
            console.warn('Drivers table does not exist, using local data');
            return localDrivers;
          }
          
          if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.warn('Some columns missing, trying with basic columns only');
            
            // Fallback to basic columns
            const { data: basicData, error: basicError } = await supabase
              .from('drivers')
              .select('id, name, status')
              .order('created_at', { ascending: false });
              
            if (basicError) {
              console.error('Basic query also failed:', basicError);
              return localDrivers;
            }
            
            // Ensure complete Driver objects with all required properties
            return (basicData as any[]).map(driver => ({
              id: driver.id,
              name: driver.name || 'Unknown Driver',
              phone: '',
              photo: '',
              status: driver.status || 'active',
              vehicle_type: 'Car',
              current_location: { 
                address: 'Location not available',
                coordinates: { lat: 0, lng: 0 }
              },
              current_delivery: null,
              rating: undefined,
              average_response_time: undefined,
              vehicle_number: undefined,
              created_at: new Date().toISOString()
            } as Driver));
          }
          
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No drivers found in database');
          return localDrivers;
        }
        
        console.log(`Successfully fetched ${data.length} drivers`);
        const mappedDrivers = (data as any[]).map(mapDbToDriver);
        return mappedDrivers;
        
      } catch (err) {
        console.error('Exception when fetching drivers:', err);
        return localDrivers;
      }
    },
    refetchInterval: 30000, // Increased interval to reduce load
    retry: 1,
    staleTime: 10000,
  });

  return {
    drivers: drivers || localDrivers,
    isLoading,
    error,
    refetch
  };
};
