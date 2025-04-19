import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, Trash, User, MapPin, RefreshCw, Check, X, 
  Package, Locate, Link, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryStore } from '@/store/deliveryStore';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import Map from '../map/Map';

const DriversPanel = () => {
  const { 
    drivers, 
    requests, 
    updateDriverStatus, 
    assignDriverToRequest, 
    simulateMovement 
  } = useDeliveryStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
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

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (isLoading) {
    return <div>Loading drivers...</div>;
  }

  const activeDrivers = drivers.filter(d => d.status === 'active');
  const activeDeliveries = requests.filter(r => r.status === 'in_progress');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeDrivers.length}</div>
            <p className="text-sm text-gray-500">of {drivers.length} total drivers</p>
            <Progress className="mt-2" value={(activeDrivers.length / drivers.length) * 100} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeDeliveries.length}</div>
            <p className="text-sm text-gray-500">in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
            <p className="text-sm text-gray-500">awaiting assignment</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
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
          
          <div className="rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Current Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>{driver.id}</TableCell>
                    <TableCell>{driver.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={driver.status === 'active' ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleStatusToggle(driver.id)}
                      >
                        {driver.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{driver.vehicle_type}</TableCell>
                    <TableCell className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {driver.current_location.address}
                      
                      {driver.current_delivery && (
                        <Badge variant="secondary" className="ml-2">
                          <Package className="h-3 w-3 mr-1" /> On Delivery
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDriver(driver)}
                      >
                        <Locate className="h-4 w-4 mr-1" />
                        Locate
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteDriver(driver.id)}
                        disabled={driver.current_delivery !== null}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Assign Driver to Delivery</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="select-driver">Select Driver</Label>
                <select 
                  id="select-driver" 
                  className="w-full mt-1 rounded-md border border-gray-300 p-2"
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                >
                  <option value="">Select a driver...</option>
                  {drivers
                    .filter(d => d.status === 'active' && !d.current_delivery)
                    .map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} - {driver.vehicle_type}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div>
                <Label htmlFor="select-request">Select Request</Label>
                <select 
                  id="select-request" 
                  className="w-full mt-1 rounded-md border border-gray-300 p-2"
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                >
                  <option value="">Select a request...</option>
                  {requests
                    .filter(r => r.status === 'pending')
                    .map(request => (
                      <option key={request.id} value={request.id}>
                        {request.id} - {request.pickup_location} to {request.delivery_location}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  className="w-full" 
                  onClick={handleAssignDriver}
                  disabled={!selectedDriverId || !selectedRequestId}
                >
                  <Send className="h-4 w-4 mr-2" /> 
                  Assign Driver
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <span className="hidden">Open Map</span>
        </DialogTrigger>
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
