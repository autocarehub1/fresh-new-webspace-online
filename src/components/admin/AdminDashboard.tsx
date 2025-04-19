
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RequestsPanel from './RequestsPanel';
import DriversPanel from './DriversPanel';
import { Card, CardContent } from '@/components/ui/card';
import { useDeliveryStore } from '@/store/deliveryStore';
import Map from '../map/Map';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const { requests } = useDeliveryStore();
  
  // Count active deliveries for the overview
  const activeDeliveries = requests.filter(r => r.status === 'in_progress').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Overview Map Card */}
      <Card className="mb-8">
        <CardContent className="p-0 h-[300px] relative">
          <Map />
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Live Overview</h3>
            <p className="text-sm mb-1">Active Deliveries: <span className="font-bold text-blue-600">{activeDeliveries}</span></p>
            <p className="text-sm">Pending Requests: <span className="font-bold text-yellow-600">{pendingRequests}</span></p>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="requests" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="requests">Delivery Requests</TabsTrigger>
          <TabsTrigger value="drivers">Manage Drivers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <RequestsPanel />
        </TabsContent>
        
        <TabsContent value="drivers">
          <DriversPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
