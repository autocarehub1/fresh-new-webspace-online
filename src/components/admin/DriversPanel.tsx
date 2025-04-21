
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import MapWrapper from '../map/MapWrapper';
import DriversOverview from './drivers/DriversOverview';
import DriversTable from './drivers/DriversTable';
import DriverAssignment from './drivers/DriverAssignment';
import type { Driver } from '@/types/delivery';
import { useDriverData } from '@/hooks/use-driver-data';
import { useDeliveryData } from '@/hooks/use-delivery-data';
import { useInterval } from '@/hooks/use-interval';

const DriversPanel = () => {
  const { 
    drivers,
    isLoading,
    updateDriver,
    assignDriver,
    updateDriverLocation
  } = useDriverData();
  
  const { deliveries: requests } = useDeliveryData();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(true); 
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLocalLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Set up simulation interval
  useInterval(() => {
    if (isSimulating && drivers) {
      // Find active drivers with current deliveries
      const activeDrivers = drivers.filter(d => 
        d.status === 'active' && d.current_delivery
      );
      
      // Simulate movement for each active driver
      activeDrivers.forEach(driver => {
        if (driver.current_delivery) {
          const request = requests?.find(r => r.id === driver.current_delivery);
          if (request?.delivery_coordinates && driver.current_location.coordinates) {
            // Calculate new coordinates (simple linear interpolation)
            const target = request.delivery_coordinates;
            const current = driver.current_location.coordinates;
            
            const latDiff = target.lat - current.lat;
            const lngDiff = target.lng - current.lng;
            const stepSize = 0.001;
            
            // Check if we're close enough to destination
            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
            if (distance < 0.002) {
              // We've arrived at the destination
              return;
            }
            
            // Calculate new position
            const newLat = current.lat + (latDiff / distance) * stepSize;
            const newLng = current.lng + (lngDiff / distance) * stepSize;
            
            // Update driver location
            updateDriverLocation.mutate({ 
              id: driver.id, 
              location: {
                address: driver.current_location.address,
                coordinates: { lat: newLat, lng: newLng }
              }
            });
          }
        }
      });
    }
  }, isSimulating ? 1000 : null);

  const handleStatusToggle = async (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      try {
        const newStatus = driver.status === 'active' ? 'inactive' : 'active';
        await updateDriver.mutateAsync({ 
          id: driverId, 
          status: newStatus 
        });
        toast.success(`Driver ${driver.name}'s status changed to ${newStatus}`);
      } catch (error) {
        toast.error('Failed to update driver status');
      }
    }
  };

  const handleDeleteDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    toast.success(`Driver ${driver?.name} has been removed`);
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId || !selectedRequestId) {
      toast.error('Please select both a driver and a request');
      return;
    }

    try {
      await assignDriver.mutateAsync({ 
        driverId: selectedDriverId, 
        deliveryId: selectedRequestId 
      });
      toast.success('Driver assigned successfully');
      setSelectedDriverId('');
      setSelectedRequestId('');
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  const handleToggleSimulation = () => {
    setIsSimulating(prev => !prev);
    toast.success(isSimulating ? 
      'Real-time tracking simulation stopped' : 
      'Real-time tracking simulation started'
    );
  };

  if (isLoading || isLocalLoading) {
    return <div>Loading drivers...</div>;
  }

  const activeDrivers = drivers.filter(d => d.status === 'active');
  const availableRequests = requests?.filter(r => 
    (r.status === 'in_progress' || r.status === 'pending') && !r.assigned_driver
  ) || [];
  
  return (
    <div className="space-y-6">
      <DriversOverview activeDrivers={activeDrivers} totalDrivers={drivers} />

      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Driver Management</h2>
          <div className="space-x-2">
            <Button onClick={handleToggleSimulation} className={isSimulating ? "bg-red-500 hover:bg-red-600" : ""}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSimulating ? "animate-spin" : ""}`} />
              {isSimulating ? "Stop Simulation" : "Simulate Movement"}
            </Button>
            
            <Button>
              <User className="h-4 w-4 mr-2" />
              Add New Driver
            </Button>
          </div>
        </div>
        
        <DriversTable 
          drivers={drivers}
          onStatusToggle={handleStatusToggle}
          onDeleteDriver={handleDeleteDriver}
          onLocateDriver={setSelectedDriver}
        />
        
        <DriverAssignment 
          drivers={drivers}
          requests={availableRequests}
          selectedDriverId={selectedDriverId}
          selectedRequestId={selectedRequestId}
          onDriverSelect={setSelectedDriverId}
          onRequestSelect={setSelectedRequestId}
          onAssignDriver={handleAssignDriver}
        />
      </div>
      
      <Dialog open={!!selectedDriver} onOpenChange={(open) => !open && setSelectedDriver(null)}>
        <DialogContent className="sm:max-w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>Driver Location</DialogTitle>
            <DialogDescription>
              Real-time location of the selected driver.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[500px] rounded-md overflow-hidden">
            <MapWrapper driverLocation={selectedDriver?.current_location.coordinates} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversPanel;
