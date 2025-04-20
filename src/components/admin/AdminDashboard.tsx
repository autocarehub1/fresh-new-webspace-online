
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RequestsPanel from './RequestsPanel';
import DriversPanel from './DriversPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeliveryStore } from '@/store/deliveryStore';
import Map from '../map/Map';
import { BadgeCheck, Clock, Package, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const { requests } = useDeliveryStore();
  
  // Count deliveries for the overview
  const activeDeliveries = requests.filter(r => r.status === 'in_progress').length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const completedDeliveries = requests.filter(r => r.status === 'completed').length;
  const totalRequests = requests.length;

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
          <CardTitle className="text-lg">Live Delivery Map</CardTitle>
        </CardHeader>
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
