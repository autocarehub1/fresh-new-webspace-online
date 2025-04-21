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

interface DriversPanelProps {
  simulationActive?: boolean;
}

const DriversPanel = ({ simulationActive = false }: DriversPanelProps) => {
  const { 
    drivers,
    isLoading,
    updateDriver,
    assignDriver,
    updateDriverLocation
  } = useDriverData();
  
  const { deliveries: requests, simulateMovement } = useDeliveryData();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSimulating, setIsSimulating] = useState(simulationActive);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(true); 
  
  useEffect(() => {
    setIsSimulating(simulationActive);
  }, [simulationActive]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLocalLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useInterval(() => {
    if (isSimulating && drivers) {
      const activeDrivers = drivers.filter(d => 
        d.status === 'active' && d.current_delivery
      );
      
      activeDrivers.forEach(driver => {
        if (driver.current_delivery) {
          simulateMovement.mutate(driver.current_delivery);
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
    return <div className="flex items-center justify-center py-10">Loading drivers...</div>;
  }

  const activeDrivers = drivers.filter(d => d.status === 'active');
  const availableRequests = requests?.filter(r => 
    (r.status === 'pending' || r.status === 'in_progress') && !r.assigned_driver
  ) || [];
  
  return (
    <div className="space-y-6">
      <DriversOverview activeDrivers={activeDrivers} totalDrivers={drivers} />

      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Driver Management</h2>
          <div className="space-x-2">
            <Button 
              onClick={handleToggleSimulation} 
              className={isSimulating ? "bg-red-500 hover:bg-red-600" : ""}
              variant={isSimulating ? "destructive" : "default"}
            >
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
            <MapWrapper driverLocation={selectedDriver?.current_location.coordinates} height="500px" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversPanel;
