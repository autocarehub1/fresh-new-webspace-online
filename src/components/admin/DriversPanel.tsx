import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import MapWrapper from '../map/MapWrapper';
import DriversOverview from './drivers/DriversOverview';
import DriversTable from './drivers/DriversTable';
import DriverAssignment from './drivers/DriverAssignment';
import AddDriverDialog from './drivers/AddDriverDialog';
import type { Driver } from '@/types/delivery';
import { useDriverData } from '@/hooks/use-driver-data';
import { useDeliveryData } from '@/hooks/use-delivery-data';
import { useInterval } from '@/hooks/use-interval';

interface DriversPanelProps {
  simulationActive?: boolean;
}

const panelBg = "bg-white shadow-lg border rounded-xl";
const accentBanner = "bg-[#E5DEFF] px-6 py-4 rounded-t-xl border-b border-[#9b87f5] flex items-center justify-between";
const headerText = "text-xl font-bold text-[#6E59A5]";
const subText = "text-sm text-gray-600";
const actionBar = "flex gap-2";

const DriversPanel = ({ simulationActive = false }: DriversPanelProps) => {
  const { 
    drivers,
    isLoading,
    updateDriver,
    assignDriver,
    unassignDriver,
    updateDriverLocation,
    addDriver,
    deleteDriver
  } = useDriverData();
  
  const { deliveries: requests, isLoading: requestsLoading, simulateMovement } = useDeliveryData();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSimulating, setIsSimulating] = useState(simulationActive);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');

  useEffect(() => {
    setIsSimulating(simulationActive);
  }, [simulationActive]);

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
        console.error('Failed to update driver status:', error);
        toast.error('Failed to update driver status');
      }
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      toast.error('Driver not found');
      return;
    }
    if (driver.current_delivery) {
      toast.warning('Cannot delete a driver currently on delivery.');
      return;
    }

    try {
      await deleteDriver.mutateAsync(driverId);
    } catch (error) {
      console.error('Failed to delete driver:', error);
    }
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
      setSelectedDriverId('');
      setSelectedRequestId('');
    } catch (error: any) {
      console.error('Failed to assign driver:', error);
      toast.error(`Failed to assign driver: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleToggleSimulation = () => {
    setIsSimulating(prev => !prev);
    toast.success(isSimulating ? 
      'Real-time tracking simulation stopped' : 
      'Real-time tracking simulation started'
    );
  };

  const handleUnassignDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      toast.error('Driver not found');
      return;
    }
    if (!driver.current_delivery) {
      toast.error('Driver is not assigned to any delivery');
      return;
    }
    unassignDriver.mutate({ driverId, deliveryId: driver.current_delivery });
  };

  if (isLoading || requestsLoading) {
    console.log('DriversPanel: Loading data...');
    return <div className="flex items-center justify-center py-10">Loading drivers data...</div>;
  }

  console.log('DriversPanel: Data loaded, rendering content. Drivers:', drivers);
  console.log('DriversPanel: Data loaded, rendering content. Requests:', requests);

  const activeDrivers = drivers?.filter(d => d.status === 'active') || [];
  const availableRequests = requests?.filter(r => 
    (r.status === 'pending' || r.status === 'in_progress') && !r.assigned_driver
  ) || [];
  
  return (
    <div className="space-y-6">
      <DriversOverview activeDrivers={activeDrivers} totalDrivers={drivers} />

      <div className={`${panelBg}`}>
        <div className={`${accentBanner}`}>
          <div>
            <h2 className={headerText}>Driver Management</h2>
            <div className={subText}>Assign, locate, and manage all drivers.</div>
          </div>
          <div className={actionBar}>
            <Button 
              onClick={handleToggleSimulation} 
              className={`rounded-lg shadow-none ${isSimulating ? "bg-red-500 hover:bg-red-600" : "bg-[#9b87f5] hover:bg-[#7E69AB]"}`}
              variant={isSimulating ? "destructive" : "default"}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSimulating ? "animate-spin" : ""}`} />
              {isSimulating ? "Stop Simulation" : "Simulate Movement"}
            </Button>
            
            <AddDriverDialog />
          </div>
        </div>
        <div className="p-6 md:p-8">
          <DriversTable 
            drivers={drivers}
            onStatusToggle={handleStatusToggle}
            onDeleteDriver={handleDeleteDriver}
            onLocateDriver={setSelectedDriver}
            onUnassignDriver={handleUnassignDriver}
          />
          <DriverAssignment 
            drivers={drivers}
            requests={requests || []}
            selectedDriverId={selectedDriverId}
            selectedRequestId={selectedRequestId}
            onDriverSelect={setSelectedDriverId}
            onRequestSelect={setSelectedRequestId}
            onAssignDriver={handleAssignDriver}
          />
        </div>
      </div>
      
      <Dialog open={!!selectedDriver} onOpenChange={(open) => !open && setSelectedDriver(null)}>
        <DialogContent className="sm:max-w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>Driver Location</DialogTitle>
            <DialogDescription>
              Real-time location of {selectedDriver?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[500px] rounded-md overflow-hidden">
            <MapWrapper 
              driverLocation={selectedDriver?.current_location.coordinates} 
              height="500px" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversPanel;
