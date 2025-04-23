import { useState, useEffect } from 'react';
import { useDeliveryData } from '@/hooks/use-delivery-data'; 
import { useDriverData } from '@/hooks/use-driver-data';
import { useInterval } from '@/hooks/use-interval';
import RequestsPanel from './RequestsPanel';
import DriversPanel from './DriversPanel';
import StatisticsCards from './dashboard/StatisticsCards';
import LiveDeliveryMap from './dashboard/LiveDeliveryMap';
import DashboardTabs from './dashboard/DashboardTabs';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'drivers'>('requests');
  const { 
    deliveries: requests, 
    isLoading: deliveriesLoading, 
    simulateMovement 
  } = useDeliveryData();
  
  const { drivers, isLoading: driversLoading } = useDriverData();
  
  const activeDeliveries = requests?.filter(r => r.status === 'in_progress').length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  const completedDeliveries = requests?.filter(r => r.status === 'completed').length || 0;
  const totalRequests = requests?.length || 0;

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    console.log('AdminDashboard - Tab state changed:', activeTab);
  }, [activeTab]);

  useEffect(() => {
    console.log("AdminDashboard - Requests data:", requests?.length || 0, "items");
    console.log("AdminDashboard - Drivers data:", drivers?.length || 0, "drivers");
  }, [requests, drivers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const activeDelivery = requests?.find(r => 
    r.status === 'in_progress' && r.assigned_driver && r.current_coordinates
  );
  
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

  const handleTabChange = (tab: 'requests' | 'drivers') => {
    console.log('AdminDashboard: Tab change requested:', tab);
    console.log('AdminDashboard: Current tab:', activeTab);
    if (tab !== activeTab) {
      console.log('AdminDashboard: Changing tab to:', tab);
      setActiveTab(tab);
    } else {
      console.log('AdminDashboard: Tab is already active, no change needed');
    }
  };

  if (deliveriesLoading || driversLoading) {
    return <div className="container mx-auto px-4 py-8">Loading dashboard data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <StatisticsCards
        activeDeliveries={activeDeliveries}
        pendingRequests={pendingRequests}
        completedDeliveries={completedDeliveries}
        totalRequests={totalRequests}
      />
      
      <LiveDeliveryMap
        activeDelivery={activeDelivery}
        mapLoaded={mapLoaded}
        isSimulating={isSimulating}
        activeDeliveries={activeDeliveries}
        pendingRequests={pendingRequests}
        onToggleSimulation={handleToggleSimulation}
      />
      
      <div className="w-full mt-8">
        <DashboardTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />
        
        <div className="mt-6">
          {activeTab === "requests" ? (
            <RequestsPanel 
              simulationActive={isSimulating} 
              availableDrivers={drivers?.filter(d => d.status === 'active' && !d.current_delivery) || []}
            />
          ) : (
            <DriversPanel 
              simulationActive={isSimulating}
              availableRequests={requests?.filter(r => r.status === 'pending') || []}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
