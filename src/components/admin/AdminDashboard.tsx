import { useState, useEffect } from 'react';
import { useDeliveryData } from '@/hooks/use-delivery-data'; 
import { useDriverData } from '@/hooks/use-driver-data';
import { useInterval } from '@/hooks/use-interval';
import RequestsPanel from './RequestsPanel';
import DriversPanel from './DriversPanel';
import OrderManagement from './OrderManagement';
import DispatchRouting from './DispatchRouting';
import BillingInvoicingTab from './BillingInvoicingTab';
import SettingsTab from './settings/SettingsTab';
import StatisticsCards from './dashboard/StatisticsCards';
import LiveDeliveryMap from './dashboard/LiveDeliveryMap';
import DashboardTabs from './dashboard/DashboardTabs';

const AdminDashboard = () => {
  // Get the tab from URL or default to 'requests'
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['requests', 'drivers', 'orders', 'dispatch', 'billing', 'settings'].includes(tabParam)) {
        return tabParam as 'requests' | 'drivers' | 'orders' | 'dispatch' | 'billing' | 'settings';
      }
    }
    return 'requests';
  };

  const [activeTab, setActiveTab] = useState<'requests' | 'drivers' | 'orders' | 'dispatch' | 'billing' | 'settings'>(getInitialTab);
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

  // Add explicit logging for tab changes
  useEffect(() => {
    console.log('Current Active Tab:', activeTab);
    
    // Update URL with tab parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.pushState({}, '', url.toString());
    }
    
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

  // Listen for URL changes and update tab state
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['requests', 'drivers', 'orders', 'dispatch', 'billing', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam as 'requests' | 'drivers' | 'orders' | 'dispatch' | 'billing' | 'settings');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  // Simplified tab change handler
  const handleTabChange = (tab: 'requests' | 'drivers' | 'orders' | 'dispatch' | 'billing' | 'settings') => {
    console.log('Tab change requested to:', tab);
    
    // Use a short timeout to ensure state updates correctly
    setTimeout(() => {
      setActiveTab(tab);
    }, 10);
  };

  if (deliveriesLoading || driversLoading) {
    return <div className="container mx-auto px-4 py-8">Loading dashboard data...</div>;
  }

  console.log('Rendering Dashboard with active tab:', activeTab);
  
  // Determine which component to render based on activeTab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'requests':
        return (
          <RequestsPanel 
            simulationActive={isSimulating} 
            availableDrivers={drivers?.filter(d => d.status === 'active' && !d.current_delivery) || []}
          />
        );
      case 'drivers':
        return (
          <DriversPanel 
            simulationActive={isSimulating}
            availableRequests={requests?.filter(r => r.status === 'pending') || []}
          />
        );
      case 'orders':
        return <OrderManagement />;
      case 'dispatch':
        return <DispatchRouting />;
      case 'billing':
        console.log('Attempting to render BillingInvoicingTab component');
        const completedDelivs = requests?.filter(r => r.status === 'completed') || [];
        const pendingDelivs = requests?.filter(r => r.status === 'pending') || [];
        console.log('Completed deliveries count:', completedDelivs.length);
        console.log('Pending deliveries count:', pendingDelivs.length);
        return (
          <div id="billing-container" data-testid="billing-invoicing-container">
            <BillingInvoicingTab 
              completedDeliveries={completedDelivs}
              pendingDeliveries={pendingDelivs}
            />
          </div>
        );
      case 'settings':
        return <SettingsTab />;
      default:
        return <div>No content for this tab</div>;
    }
  };

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
        
        <div className="mt-6" id="tab-content-container">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
