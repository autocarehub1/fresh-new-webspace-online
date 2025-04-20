import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryStore } from '@/store/deliveryStore';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import Map from '../map/Map';
import DriversOverview from './drivers/DriversOverview';
import DriversTable from './drivers/DriversTable';
import DriverAssignment from './drivers/DriverAssignment';
import type { Driver } from '@/types/delivery';

const DriversPanel = () => {
  const { 
    drivers, 
    requests, 
    updateDriverStatus, 
    assignDriverToRequest, 
    simulateMovement 
  } = useDeliveryStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isSimulating) return;

    const activeRequests = requests.filter(r => 
      r.status === 'in_progress' && r.assigned_driver && r.current_coordinates
    );

    if (activeRequests.length === 0) {
      setIsSimulating(false);
      return;
    }

    const interval = setInterval(() => {
      activeRequests.forEach(request => {
        simulateMovement(request.id);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, requests, simulateMovement]);

  const handleStatusToggle = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      const newStatus = driver.status === 'active' ? 'inactive' : 'active';
      updateDriverStatus(driverId, newStatus);
      toast.success(`Driver ${driver.name}'s status changed to ${newStatus}`);
    }
  };

  const handleDeleteDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    toast.success(`Driver ${driver?.name} has been removed`);
  };

  const handleAssignDriver = () => {
    if (!selectedDriverId || !selectedRequestId) {
      toast.error('Please select both a driver and a request');
      return;
    }
    assignDriverToRequest(selectedRequestId, selectedDriverId);
    toast.success('Driver assigned successfully');
    setSelectedDriverId('');
    setSelectedRequestId('');
  };

  const handleToggleSimulation = () => {
    setIsSimulating(prev => !prev);
    toast.success(isSimulating ? 
      'Real-time tracking simulation stopped' : 
      'Real-time tracking simulation started'
    );
  };

  if (isLoading) {
    return <div>Loading drivers...</div>;
  }

  const activeDrivers = drivers.filter(d => d.status === 'active');
  
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
          requests={requests}
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
            <Map />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriversPanel;
