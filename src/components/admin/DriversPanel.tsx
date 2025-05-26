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
import { supabase } from '@/lib/supabase';

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
    deleteDriver,
    refetch: refetchDrivers
  } = useDriverData();
  
  const { 
    deliveries: requests, 
    isLoading: requestsLoading, 
    simulateMovement,
    refetch: refetchDeliveries
  } = useDeliveryData();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSimulating, setIsSimulating] = useState(simulationActive);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [showAddDriverDialog, setShowAddDriverDialog] = useState(false);

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

  // Effect to check for completed deliveries and update driver availability
  useEffect(() => {
    const updateDriversForCompletedDeliveries = async () => {
      if (!drivers || !requests) return;
      
      // Find drivers that are still assigned to completed requests
      const driversToUpdate = drivers.filter(driver => {
        if (!driver.current_delivery) return false;
        
        const assignedRequest = requests.find(req => 
          req.id === driver.current_delivery && req.status === 'completed'
        );
        
        return !!assignedRequest;
      });
      
      if (driversToUpdate.length > 0) {
        console.log(`Found ${driversToUpdate.length} drivers with completed deliveries that need to be made available`);
        
        for (const driver of driversToUpdate) {
          console.log(`Making driver ${driver.name} (${driver.id}) available after completed delivery`);
          
          const { error } = await supabase
            .from('drivers')
            .update({ current_delivery: null })
            .eq('id', driver.id);
            
          if (error) {
            console.error(`Error making driver ${driver.id} available:`, error);
          } else {
            console.log(`Driver ${driver.name} is now available for new deliveries`);
            toast.success(`Driver ${driver.name} is now available for new deliveries`);
          }
        }
      }
      
      // Clear the selected driver if they have a completed delivery
      if (selectedDriverId) {
        const selectedDriver = drivers.find(d => d.id === selectedDriverId);
        if (selectedDriver?.current_delivery) {
          const deliveryCompleted = requests.find(
            r => r.id === selectedDriver.current_delivery && r.status === 'completed'
          );
          
          if (deliveryCompleted) {
            // Reset selection to allow new assignment
            console.log(`Clearing selected driver ${selectedDriverId} as they now have a completed delivery`);
            setSelectedDriverId('');
          }
        }
      }
    };
    
    updateDriversForCompletedDeliveries();
  }, [drivers, requests, selectedDriverId]);

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
      console.log('Attempting to assign driver:', selectedDriverId, 'to request:', selectedRequestId);
      
      // Get the driver and request details to verify assignment is valid
      const driver = drivers.find(d => d.id === selectedDriverId);
      const request = requests.find(r => r.id === selectedRequestId);
      
      if (!driver) {
        toast.error('Selected driver not found');
        return;
      }
      
      if (!request) {
        toast.error('Selected request not found');
        return;
      }
      
      if (driver.status !== 'active') {
        toast.error('Driver must be active to be assigned');
        return;
      }
      
      if (driver.current_delivery) {
        toast.error('Driver already has an active delivery assignment');
        return;
      }
      
      if (request.status !== 'pending') {
        toast.error('Only pending requests can be assigned to drivers');
        return;
      }
      
      if (request.assigned_driver) {
        toast.error('Request already has an assigned driver');
        return;
      }
      
      console.log('Assignment validation passed, proceeding with assignment');
      await assignDriver.mutateAsync({ 
        driverId: selectedDriverId, 
        deliveryId: selectedRequestId 
      });
      
      console.log('Assignment successful');
      toast.success(`Assigned driver ${driver.name} to request #${selectedRequestId}`);
      setSelectedDriverId('');
      setSelectedRequestId('');
      
      // Refresh data after assignment
      await refreshData();
    } catch (error: any) {
      console.error('Failed to assign driver:', error);
      toast.error(`Failed to assign driver: ${error?.message || 'Unknown error'}`);
    }
  };

  // Add a refresh function to ensure data is up to date
  const refreshData = async () => {
    console.log('Refreshing drivers and deliveries data...');
    await Promise.all([
      refetchDrivers(),
      refetchDeliveries()
    ]);
    console.log('Data refresh complete');
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

  const handleAddDriverSuccess = () => {
    refetchDrivers();
    setShowAddDriverDialog(false);
  };

  if (isLoading || requestsLoading) {
    console.log('DriversPanel: Loading data...');
    return <div className="flex items-center justify-center py-10">Loading drivers data...</div>;
  }

  console.log('DriversPanel: Data loaded, rendering content. Drivers:', drivers);
  console.log('DriversPanel: Data loaded, rendering content. Requests:', requests);

  const activeDrivers = drivers?.filter(d => d.status === 'active') || [];
  const availableRequests = requests?.filter(r => 
    r.status === 'pending' && !r.assigned_driver
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
            
            <Button 
              onClick={() => setShowAddDriverDialog(true)}
              className="rounded-lg shadow-none bg-[#9b87f5] hover:bg-[#7E69AB]"
            >
              Add Driver
            </Button>
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

      <AddDriverDialog 
        open={showAddDriverDialog}
        onOpenChange={setShowAddDriverDialog}
        onSuccess={handleAddDriverSuccess}
      />
    </div>
  );
};

export default DriversPanel;
