
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RequestsPanel from './RequestsPanel';
import DriversPanel from './DriversPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeliveryData } from '@/hooks/use-delivery-data'; 
import { useDriverData } from '@/hooks/use-driver-data';
import Map from '../map/Map';
import { BadgeCheck, Clock, Package, TrendingUp } from 'lucide-react';
import { useInterval } from '@/hooks/use-interval';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const { 
    deliveries: requests, 
    isLoading: deliveriesLoading, 
    simulateMovement 
  } = useDeliveryData();
  
  const { drivers, isLoading: driversLoading } = useDriverData();
  
  // Count deliveries for the overview
  const activeDeliveries = requests?.filter(r => r.status === 'in_progress').length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  const completedDeliveries = requests?.filter(r => r.status === 'completed').length || 0;
  const totalRequests = requests?.length || 0;

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Log data for debugging
  useEffect(() => {
    console.log("AdminDashboard - Requests data:", requests?.length || 0, "items");
    console.log("AdminDashboard - Drivers data:", drivers?.length || 0, "drivers");
  }, [requests, drivers]);

  // Set loaded after delay to avoid render issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get a driver and delivery for map view
  const activeDelivery = requests?.find(r => 
    r.status === 'in_progress' && r.assigned_driver && r.current_coordinates
  );

  // Fix tab handling to ensure it's working properly
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
  };
  
  // Set up simulation interval for active deliveries
  useInterval(() => {
    if (isSimulating && requests) {
      const activeRequests = requests.filter(r => 
        r.status === 'in_progress' && r.assigned_driver && r.current_coordinates && r.delivery_coordinates
      );
      
      activeRequests.forEach(request => {
        simulateMovement.mutate(request.id);
      });
    }
  }, isSimulating ? 1000 : null);

  const handleToggleSimulation = () => {
    setIsSimulating(prev => !prev);
  };

  if (deliveriesLoading || driversLoading) {
    return <div className="container mx-auto px-4 py-8">Loading dashboard data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Deliveries</p>
              <h3 className="text-2xl font-bold text-blue-600">{activeDeliveries}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
              <h3 className="text-2xl font-bold text-yellow-600">{pendingRequests}</h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Deliveries</p>
              <h3 className="text-2xl font-bold text-green-600">{completedDeliveries}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <BadgeCheck className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
              <h3 className="text-2xl font-bold text-indigo-600">{totalRequests}</h3>
            </div>
            <div className="p-2 bg-indigo-100 rounded-full">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Overview Map Card */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Live Delivery Map</span>
            <button 
              onClick={handleToggleSimulation}
              className={`text-sm px-3 py-1 rounded ${isSimulating ? 
                'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
            >
              {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[300px] relative">
          {mapLoaded && (
            <Map 
              driverLocation={activeDelivery?.current_coordinates}
              deliveryLocation={activeDelivery?.delivery_coordinates}
              height="300px"
            />
          )}
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Live Overview</h3>
            <p className="text-sm mb-1">Active Deliveries: <span className="font-bold text-blue-600">{activeDeliveries}</span></p>
            <p className="text-sm">Pending Requests: <span className="font-bold text-yellow-600">{pendingRequests}</span></p>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs Implementation - Fix for tab click issues */}
      <Tabs value="requests" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger 
            value="requests" 
            onClick={() => setActiveTab("requests")}
            className="px-4 py-2"
          >
            Delivery Requests
          </TabsTrigger>
          <TabsTrigger 
            value="drivers" 
            onClick={() => setActiveTab("drivers")}
            className="px-4 py-2"
          >
            Manage Drivers
          </TabsTrigger>
        </TabsList>
        
        {activeTab === "requests" && (
          <div className="space-y-4">
            <RequestsPanel 
              simulationActive={isSimulating} 
              availableDrivers={drivers?.filter(d => d.status === 'active' && !d.current_delivery) || []}
            />
          </div>
        )}
        
        {activeTab === "drivers" && (
          <div className="space-y-4">
            <DriversPanel simulationActive={isSimulating} />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
