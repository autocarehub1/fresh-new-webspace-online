
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RequestsPanel from './RequestsPanel';
import DriversPanel from './DriversPanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
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
