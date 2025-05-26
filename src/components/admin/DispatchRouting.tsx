import { useState, useEffect } from 'react';
import { useDeliveryData } from '@/hooks/use-delivery-data';
import { useDriverData } from '@/hooks/use-driver-data';
import { DeliveryRequest, Driver } from '@/types/delivery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Clock, AlertTriangle, RefreshCw, Truck, RotateCw, Boxes, Gauge, Zap } from 'lucide-react';
import { toast } from 'sonner';
import AutomatedDispatchPanel from './dispatch/AutomatedDispatchPanel';
import RouteOptimizationPanel from './dispatch/RouteOptimizationPanel';
import ReroutingPanel from './dispatch/ReroutingPanel';
import DispatchMap from './dispatch/DispatchMap';
import { useDispatchStore } from '@/store/dispatchStore';
import { supabase } from '@/lib/supabase';

const DispatchRouting = () => {
  const { 
    deliveries: requests, 
    isLoading: requestsLoading, 
    refetch: refetchDeliveries,
    updateDeliveryRequest 
  } = useDeliveryData();
  
  const { 
    drivers, 
    isLoading: driversLoading, 
    refetch: refetchDrivers,
    updateDriver,
    assignDriver
  } = useDriverData();
  
  // Global dispatch store
  const { 
    autoDispatchEnabled,
    nextScheduledRun,
    timeUntilNextRun,
    dispatchCount,
    enableAutoDispatch,
    disableAutoDispatch,
    incrementDispatchCount,
    triggerManualRun
  } = useDispatchStore();
  
  const [activeTab, setActiveTab] = useState<string>('automated');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null);
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data for displaying
  const activeDeliveries = requests?.filter(r => r.status === 'in_progress') || [];
  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  
  // Improve driver availability check to strictly confirm no current delivery is assigned
  const availableDrivers = drivers?.filter(d => {
    const isActive = d.status === 'active';
    const hasNoDelivery = !d.current_delivery;
    
    // Special log for Maume Ayeni to debug why they're not being assigned
    if (d.name === 'Maume Ayeni') {
      console.log(`🔍 DRIVER CHECK - Maume Ayeni: active=${isActive}, hasNoDelivery=${hasNoDelivery}, status=${d.status}, current_delivery=${d.current_delivery || 'none'}`);
    }
    
    // Log each driver status for debugging
    console.log(`Driver ${d.name}: active=${isActive}, hasNoDelivery=${hasNoDelivery}`);
    return isActive && hasNoDelivery;
  }) || [];
  
  // Performance metrics
  const [metrics, setMetrics] = useState({
    averageDeliveryTime: '36 min',
    onTimeDeliveryRate: '92%',
    fleetEfficiency: '84%',
    fuelUsage: '-12%'
  });
  
  // Initialize auto-dispatch if it's enabled in the store
  useEffect(() => {
    // Check if auto-dispatch should be running
    if (autoDispatchEnabled && !nextScheduledRun) {
      console.log("🔄 Initializing auto-dispatch from DispatchRouting component");
      // Re-enable to ensure the runScheduledDispatch function from this component is used
      enableAutoDispatch(runScheduledDispatch);
    }
  }, [autoDispatchEnabled, nextScheduledRun, enableAutoDispatch]);
  
  // Format time for display
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Toggle auto-dispatch
  const toggleAutoDispatch = () => {
    if (autoDispatchEnabled) {
      disableAutoDispatch();
    } else {
      enableAutoDispatch(runScheduledDispatch);
    }
  };
  
  // Function to run on schedule that will be used by the global store
  const runScheduledDispatch = async () => {
    try {
      console.log("🏃‍♂️ Starting scheduled auto-dispatch run...");
      
      // Use a more reliable approach to fetch latest data
      console.log("📡 Fetching latest delivery and driver data...");
      
      let hasDeliveryData = false;
      let hasDriverData = false;
      
      try {
        // Try fetching delivery data first
        const deliveryResult = await refetchDeliveries();
        hasDeliveryData = !!deliveryResult?.data;
        console.log(`✅ Delivery data refresh successful: ${hasDeliveryData ? 'data received' : 'no data received'}`);
      } catch (deliveryError) {
        console.error("❌ Error fetching delivery data:", deliveryError);
        // Continue with existing data, don't throw yet
      }
      
      try {
        // Try fetching driver data
        const driverResult = await refetchDrivers();
        hasDriverData = !!driverResult?.data;
        console.log(`✅ Driver data refresh successful: ${hasDriverData ? 'data received' : 'no data received'}`);
      } catch (driverError) {
        console.error("❌ Error fetching driver data:", driverError);
        // Continue with existing data, don't throw yet
      }
      
      // Check if we have data from at least one source
      if (!hasDeliveryData && !hasDriverData && !requests?.length && !drivers?.length) {
        console.error("❌ Failed to fetch any data and no existing data available");
        toast.error("Auto-dispatch failed: Couldn't fetch or use any data");
        return Promise.resolve(); // Resolve to prevent errors in the store
      }
      
      // Get the current data - make sure to re-filter after data fetch
      const currentPendingRequests = requests?.filter(r => r.status === 'pending' && !r.assigned_driver) || [];
      const currentAvailableDrivers = drivers?.filter(d => d.status === 'active' && !d.current_delivery) || [];
      
      console.log(`📊 Auto-dispatch status: ${currentPendingRequests.length} pending requests, ${currentAvailableDrivers.length} available drivers`);
      
      // Check if we have pending requests and available drivers
      if (currentPendingRequests.length > 0 && currentAvailableDrivers.length > 0) {
        toast.info(`Running scheduled auto-dispatch for ${Math.min(currentPendingRequests.length, currentAvailableDrivers.length)} deliveries...`);
        
        // Run automated dispatch with current data (which may be from cache if fetch failed)
        try {
          const processedCount = await processDeliveriesWithData(currentPendingRequests, currentAvailableDrivers);
          console.log(`✅ Auto-dispatch complete: ${processedCount} deliveries assigned`);
          
          if (processedCount > 0) {
            toast.success(`Auto-dispatch completed: ${processedCount} ${processedCount === 1 ? 'delivery' : 'deliveries'} assigned`);
          } else {
            toast.info("Auto-dispatch complete: No deliveries assigned");
          }
        } catch (processError) {
          console.error("❌ Error processing deliveries:", processError);
          toast.error("Auto-dispatch failed: Error processing deliveries");
          // Continue execution despite error
        }
      } else {
        console.log("⏸️ Auto-dispatch skipped: No pending deliveries or available drivers");
        toast.info("Scheduled auto-dispatch: No pending deliveries or available drivers");
      }
      
      // Always return resolved promise to prevent store error
      return Promise.resolve();
    } catch (error) {
      console.error("❌ Error during scheduled dispatch:", error);
      toast.error("Failed to run scheduled auto-dispatch");
      // Return resolved promise to prevent store from failing
      return Promise.resolve();
    }
  };
  
  // Find the best driver for a delivery based on proximity/priority
  const findBestDriver = (delivery: DeliveryRequest, availableDriverList = availableDrivers) => {
    if (!availableDriverList.length) return null;
    
    // In a real app, we would use geolocation to find the closest driver
    // For demo, prioritize drivers based on delivery priority
    
    if (delivery.priority === 'urgent') {
      // Sort by rating (descending) and get the highest rated available driver
      const sortedDrivers = [...availableDriverList].sort((a, b) => 
        (b.rating || 0) - (a.rating || 0)
      );
      return sortedDrivers[0];
    }
    
    // For normal deliveries, do simple matching based on vehicle_type if possible
    if (delivery.packageType === 'Refrigerated' || delivery.packageType === 'Temperature Controlled') {
      // Find drivers with refrigerated vehicles first
      const specializedDrivers = availableDriverList.filter(
        d => d.vehicle_type?.toLowerCase().includes('refrig') || 
             d.vehicle_type?.toLowerCase().includes('temper')
      );
      
      if (specializedDrivers.length > 0) {
        return specializedDrivers[0];
      }
    }
    
    // For normal deliveries, just get the next available driver
    return availableDriverList[0];
  };
  
  // Dispatch a single delivery
  const dispatchNextDelivery = async () => {
    // Check if we have pending requests and available drivers
    if (pendingRequests.length === 0 || availableDrivers.length === 0) return;
    
    try {
      // Get the next delivery - prioritize urgent deliveries
      const urgentDeliveries = pendingRequests.filter(d => d.priority === 'urgent');
      const nextDelivery = urgentDeliveries.length > 0 ? urgentDeliveries[0] : pendingRequests[0];
      
      // Find the best driver
      const selectedDriver = findBestDriver(nextDelivery);
      if (!selectedDriver) return;
      
      // Check if the request and driver are still available (double-check in database)
      const { data: requestData } = await supabase
        .from('delivery_requests')
        .select('id, status, assigned_driver')
        .eq('id', nextDelivery.id)
        .single();
        
      if (!requestData || requestData.status !== 'pending' || requestData.assigned_driver) {
        console.log(`⚠️ Request ${nextDelivery.id} is no longer available for assignment`);
        return; // Skip this request
      }
      
      const { data: driverData } = await supabase
        .from('drivers')
        .select('id, status, current_delivery')
        .eq('id', selectedDriver.id)
        .single();
        
      if (!driverData || driverData.status !== 'active' || driverData.current_delivery) {
        console.log(`⚠️ Driver ${selectedDriver.id} is no longer available for assignment`);
        return; // Skip this driver
      }
      
      // Update delivery status using updateDeliveryRequest instead of updateDelivery
      await updateDeliveryRequest.mutateAsync({
        id: nextDelivery.id,
        status: 'in_progress'
      });
      
      // Use assignDriver mutation to assign the driver properly
      await assignDriver.mutateAsync({
        driverId: selectedDriver.id,
        deliveryId: nextDelivery.id
      });
      
      // Update count of dispatched deliveries using global store
      incrementDispatchCount();
      
      // Show notification to user
      toast.success(`Auto-dispatched: ${nextDelivery.id.substring(0, 6)}... to ${selectedDriver.name}`);
      
      // No need to manually refresh as mutations handle this
    } catch (error) {
      console.error('Auto-dispatch error:', error);
      toast.error('Failed to auto-dispatch delivery');
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    if (refreshing) return; // Prevent multiple refresh calls
    
    setRefreshing(true);
    
    try {
      // Create promises for both refetch operations
      const deliveriesPromise = refetchDeliveries();
      const driversPromise = refetchDrivers();
      
      // Wait for both to complete
      await Promise.all([deliveriesPromise, driversPromise]);
      
      // Update metrics with some random variations to simulate real data changes
      setMetrics(prev => ({
        averageDeliveryTime: `${35 + Math.floor(Math.random() * 4)} min`,
        onTimeDeliveryRate: `${90 + Math.floor(Math.random() * 9)}%`,
        fleetEfficiency: `${82 + Math.floor(Math.random() * 6)}%`,
        fuelUsage: `-${10 + Math.floor(Math.random() * 5)}%`
      }));
      
      toast.success('Dispatch data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data. Please try again.');
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // A new function that processes specific deliveries and drivers
  const processDeliveriesWithData = async (pendingDeliveries: any[], availableDrivers: any[]) => {
    if (!pendingDeliveries.length || !availableDrivers.length) {
      console.log("⚠️ Process deliveries aborted: No pending requests or available drivers provided");
      return 0;
    }
    
    try {
      const assignableCount = Math.min(pendingDeliveries.length, availableDrivers.length);
      console.log(`🚀 Starting to process ${assignableCount} deliveries with ${availableDrivers.length} drivers`);
      
      let processed = 0;
      let remainingDrivers = [...availableDrivers];
      
      // Process up to the assignable count
      for (let i = 0; i < assignableCount && remainingDrivers.length > 0; i++) {
        try {
          // Double-check no new delivery has been assigned to these drivers in the meantime
          const driverRechecks = await Promise.all(
            remainingDrivers.map(async driver => {
              try {
                const { data } = await supabase
                  .from('drivers')
                  .select('id, current_delivery, status')
                  .eq('id', driver.id)
                  .single();
                
                return {
                  ...driver,
                  isStillAvailable: data && data.status === 'active' && !data.current_delivery
                };
              } catch (error) {
                console.error(`Error rechecking driver ${driver.id}:`, error);
                return { ...driver, isStillAvailable: true }; // Assume available if check fails
              }
            })
          );
          
          // Filter to only still-available drivers
          remainingDrivers = driverRechecks.filter(d => d.isStillAvailable);
          
          if (remainingDrivers.length === 0) {
            console.log("⚠️ No drivers available after recheck, stopping dispatch");
            break;
          }
          
          // Get the next delivery - prioritize urgent deliveries
          const urgentDeliveries = pendingDeliveries.filter(d => 
            d.priority === 'urgent' && 
            !d.assigned_driver);
          
          const nextDelivery = urgentDeliveries.length > 0 
            ? urgentDeliveries[0] 
            : pendingDeliveries.find(d => !d.assigned_driver);
          
          if (!nextDelivery) {
            console.log("⚠️ No more unassigned deliveries, stopping dispatch");
            break;
          }
          
          // Find the best driver from remaining available drivers
          const selectedDriver = findBestDriver(nextDelivery, remainingDrivers);
          
          if (!selectedDriver) {
            console.log("⚠️ No drivers available, stopping dispatch");
            break;
          }
          
          // Check if the request and driver are still available (double-check in database)
          const { data: requestData } = await supabase
            .from('delivery_requests')
            .select('id, status, assigned_driver')
            .eq('id', nextDelivery.id)
            .single();
            
          if (!requestData || requestData.status !== 'pending' || requestData.assigned_driver) {
            console.log(`⚠️ Request ${nextDelivery.id} is no longer available for assignment`);
            continue; // Skip this request
          }
          
          const { data: driverData } = await supabase
            .from('drivers')
            .select('id, status, current_delivery')
            .eq('id', selectedDriver.id)
            .single();
            
          if (!driverData || driverData.status !== 'active' || driverData.current_delivery) {
            console.log(`⚠️ Driver ${selectedDriver.id} is no longer available for assignment`);
            continue; // Skip this driver
          }
          
          console.log(`🔄 Assigning delivery ${nextDelivery.id} to driver ${selectedDriver.id} (${selectedDriver.name})`);
          
          // Use existing hooks instead of direct database calls
          // First, update the delivery status to in-progress
          console.log(`Updating delivery ${nextDelivery.id} status to in_progress`);
          await updateDeliveryRequest.mutateAsync({
            id: nextDelivery.id,
            status: 'in_progress'
          });
          
          // Then assign the driver to the delivery
          console.log(`Assigning driver ${selectedDriver.id} to delivery ${nextDelivery.id}`);
          await assignDriver.mutateAsync({
            driverId: selectedDriver.id,
            deliveryId: nextDelivery.id
          });
          
          console.log(`✅ Successfully assigned delivery ${nextDelivery.id} to driver ${selectedDriver.id} (${selectedDriver.name})`);
          
          // Show a toast notification for each successful assignment
          toast.success(`Assigned delivery to ${selectedDriver.name}`);
          
          // Update count of dispatched deliveries using global store
          incrementDispatchCount();
          processed++;
          
          // Remove the assigned driver from the available list
          remainingDrivers = remainingDrivers.filter(d => d.id !== selectedDriver.id);
          pendingDeliveries = pendingDeliveries.filter(d => d.id !== nextDelivery.id);
          
          // Add a small delay between assignments to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Error during individual assignment process:`, error);
        }
      }
      
      // Refresh the data after all assignments
      try {
        console.log("Refreshing data after assignments...");
        await Promise.all([refetchDeliveries(), refetchDrivers()]);
        console.log("Data refresh complete");
      } catch (refreshError) {
        console.error("Error refreshing data after assignments:", refreshError);
      }
      
      console.log(`📊 Successfully processed ${processed} deliveries`);
      return processed;
    } catch (error) {
      console.error('❌ Batch dispatch error:', error);
      return 0; // Return 0 instead of throwing to prevent further errors
    }
  };

  // Replace the existing processDeliveries function with one that gets fresh data
  const processDeliveries = async () => {
    try {
      // Fetch the latest data to ensure we have current lists
      console.log("📡 Fetching latest data for manual dispatch...");
      
      // Use hooks to refetch data instead of direct database calls
      await refetchDeliveries();
      await refetchDrivers();
      
      // Filter to get the latest data after refetching
      const latestPendingRequests = requests?.filter(r => r.status === 'pending') || [];
      const latestAvailableDrivers = drivers?.filter(d => d.status === 'active' && !d.current_delivery) || [];
      
      console.log(`Found ${latestPendingRequests.length} pending requests and ${latestAvailableDrivers.length} available drivers`);
      
      if (!latestPendingRequests.length || !latestAvailableDrivers.length) {
        console.log("No pending requests or available drivers for dispatch");
        return 0;
      }
      
      return processDeliveriesWithData(latestPendingRequests, latestAvailableDrivers);
    } catch (error) {
      console.error('❌ Error fetching data for dispatch:', error);
      toast.error('Failed to get latest data for dispatch');
      return 0;
    }
  };

  // Function to simulate automation (used for manual "Dispatch Now" button)
  const runAutomatedDispatch = () => {
    if (!pendingRequests.length || !availableDrivers.length) {
      toast.error(`${!pendingRequests.length ? 'No pending requests' : 'No available couriers'} for automated dispatch`);
      return;
    }
    
    const assignableCount = Math.min(pendingRequests.length, availableDrivers.length);
    
    setOptimizationRunning(true);
    
    toast.promise(
      processDeliveries().finally(() => {
        setOptimizationRunning(false);
        // Refresh data after dispatching
        refetchDeliveries();
        refetchDrivers();
      }),
      {
        loading: 'Running automated dispatch...',
        success: (processedCount) => `Dispatch completed! ${assignableCount} ${assignableCount === 1 ? 'delivery' : 'deliveries'} automatically assigned`,
        error: 'Dispatch failed. Please try again.',
      }
    );
  };

  // Function to force dispatch a specific driver to a specific delivery
  const forceDispatchSingleDelivery = async () => {
    if (!pendingRequests.length || !availableDrivers.length) {
      toast.error('No pending requests or available drivers');
      return;
    }
    
    try {
      const nextDelivery = pendingRequests[0];
      const selectedDriver = availableDrivers[0];
      
      console.log(`Force dispatching: ${nextDelivery.id} to ${selectedDriver.name} (${selectedDriver.id})`);
      
      // Update delivery status
      await updateDeliveryRequest.mutateAsync({
        id: nextDelivery.id,
        status: 'in_progress'
      });
      
      // Assign driver
      await assignDriver.mutateAsync({
        driverId: selectedDriver.id,
        deliveryId: nextDelivery.id
      });
      
      toast.success(`Force assigned: ${selectedDriver.name} to delivery`);
      
      // Refresh data
      await Promise.all([refetchDeliveries(), refetchDrivers()]);
    } catch (error) {
      console.error('Force dispatch error:', error);
      toast.error('Failed to force dispatch');
    }
  };

  // Add function to check driver database state directly
  const checkDriverDatabaseState = async (driverId: string) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();
        
      if (error) {
        console.error(`Error checking driver ${driverId} database state:`, error);
        return null;
      }
      
      console.log(`📊 DATABASE STATE - Driver ${data.name}: status=${data.status}, current_delivery=${data.current_delivery || 'none'}`);
      return data;
    } catch (error) {
      console.error(`Failed to check driver database state:`, error);
      return null;
    }
  };

  // Add a function to force dispatch specifically for Maume Ayeni if available
  const forceDispatchMaumeAyeni = async () => {
    if (!pendingRequests.length) {
      toast.error('No pending requests available');
      return;
    }
    
    // Find Maume Ayeni specifically
    const maumeAyeni = drivers?.find(d => d.name === 'Maume Ayeni');
    
    if (!maumeAyeni) {
      toast.error('Maume Ayeni not found in drivers list');
      return;
    }
    
    // Check database state first
    const dbState = await checkDriverDatabaseState(maumeAyeni.id);
    
    if (!dbState) {
      toast.error('Could not verify Maume Ayeni state from database');
      return;
    }
    
    if (dbState.status !== 'active') {
      toast.error('Maume Ayeni is not active in database');
      return;
    }
    
    if (dbState.current_delivery) {
      toast.error(`Maume Ayeni already has delivery: ${dbState.current_delivery}`);
      return;
    }
    
    // If all checks pass, force assign
    try {
      const nextDelivery = pendingRequests[0];
      
      console.log(`🚨 FORCE ASSIGNING Maume Ayeni (${maumeAyeni.id}) to delivery ${nextDelivery.id}`);
      
      // Update delivery status 
      await updateDeliveryRequest.mutateAsync({
        id: nextDelivery.id,
        status: 'in_progress'
      });
      
      // Assign driver
      await assignDriver.mutateAsync({
        driverId: maumeAyeni.id,
        deliveryId: nextDelivery.id
      });
      
      toast.success(`💯 SUCCESS: Assigned Maume Ayeni to delivery`);
      
      // Refresh data
      await Promise.all([refetchDeliveries(), refetchDrivers()]);
    } catch (error) {
      console.error('Failed to force assign Maume Ayeni:', error);
      toast.error(`Failed to assign: ${error.message}`);
    }
  };

  if (requestsLoading || driversLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Loading dispatch data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dispatch & Routing</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={optimizationRunning || refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          
          <div className="flex flex-col items-end">
            <Button 
              variant={autoDispatchEnabled ? "destructive" : "default"}
              size="sm"
              onClick={toggleAutoDispatch}
            >
              <Zap className="w-4 h-4 mr-2" /> 
              {autoDispatchEnabled ? 'Disable Auto-Dispatch' : 'Enable 15s Test Dispatch'}
            </Button>
            
            {autoDispatchEnabled && (
              <span className="text-xs text-muted-foreground mt-1">
                Next run: {formatTime(nextScheduledRun)} (in {timeUntilNextRun})
              </span>
            )}
          </div>
          
          <Button 
            onClick={runAutomatedDispatch}
            disabled={optimizationRunning || !pendingRequests.length || !availableDrivers.length}
          >
            <Truck className="w-4 h-4 mr-2" /> 
            {optimizationRunning ? (
              <>
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                Dispatching...
              </>
            ) : (
              'Dispatch Now'
            )}
          </Button>
          
          {/* Force immediate dispatch run button for testing */}
          <Button 
            variant="outline"
            onClick={() => triggerManualRun(runScheduledDispatch)}
            className="bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            <Zap className="w-4 h-4 mr-2" />
            Force Dispatch Run
          </Button>
          
          {/* Direct dispatch for testing */}
          {pendingRequests.length > 0 && availableDrivers.length > 0 && (
            <Button
              variant="outline"
              onClick={forceDispatchSingleDelivery}
              className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Truck className="w-4 h-4 mr-2" />
              Direct Assign {availableDrivers[0]?.name}
            </Button>
          )}
          
          {/* Special button for Maume Ayeni */}
          {pendingRequests.length > 0 && drivers?.some(d => d.name === 'Maume Ayeni') && (
            <Button
              variant="default"
              onClick={forceDispatchMaumeAyeni}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Truck className="w-4 h-4 mr-2" />
              Force Assign Maume Ayeni
            </Button>
          )}
        </div>
      </div>
      
      {autoDispatchEnabled && (
        <div className="bg-green-50 border border-green-200 rounded-md p-2 text-green-600 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            <span>Auto-dispatch enabled - {dispatchCount} deliveries processed</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>Next run: {formatTime(nextScheduledRun)} (in {timeUntilNextRun})</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle>Dispatch Overview</CardTitle>
            <CardDescription>Current delivery status across the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-500">Active Deliveries</div>
                  <div className="text-2xl font-bold">{activeDeliveries.length}</div>
                </div>
                <Badge className="bg-blue-500">{activeDeliveries.length} Couriers on Route</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-500">Pending Requests</div>
                  <div className="text-2xl font-bold">{pendingRequests.length}</div>
                </div>
                <Badge variant="outline" className="border-amber-500 text-amber-500">
                  {pendingRequests.length} Awaiting Dispatch
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-500">Available Couriers</div>
                  <div className="text-2xl font-bold">{availableDrivers.length}</div>
                </div>
                <Badge variant="outline" className="border-green-500 text-green-500">
                  {availableDrivers.length} Ready for Dispatch
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-500">Urgent Deliveries</div>
                  <div className="text-2xl font-bold">
                    {requests?.filter(r => r.priority === 'urgent').length || 0}
                  </div>
                </div>
                <Badge variant="destructive">
                  Priority Routing
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-7">
          <DispatchMap 
            activeDeliveries={activeDeliveries}
            pendingRequests={pendingRequests}
            availableDrivers={availableDrivers}
            selectedDelivery={selectedDelivery}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Avg. Delivery Time</CardDescription>
              <CardTitle className="text-xl">{metrics.averageDeliveryTime}</CardTitle>
            </div>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>On-Time Rate</CardDescription>
              <CardTitle className="text-xl">{metrics.onTimeDeliveryRate}</CardTitle>
            </div>
            <Gauge className="h-5 w-5 text-green-500" />
          </CardHeader>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Fleet Efficiency</CardDescription>
              <CardTitle className="text-xl">{metrics.fleetEfficiency}</CardTitle>
            </div>
            <Truck className="h-5 w-5 text-purple-500" />
          </CardHeader>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Fuel Usage</CardDescription>
              <CardTitle className="text-xl">{metrics.fuelUsage}</CardTitle>
            </div>
            <Boxes className="h-5 w-5 text-amber-500" />
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="automated" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="automated">Automated Dispatch</TabsTrigger>
            <TabsTrigger value="optimization">Route Optimization</TabsTrigger>
            <TabsTrigger value="rerouting">Rerouting</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="automated">
          <AutomatedDispatchPanel 
            pendingRequests={pendingRequests}
            availableDrivers={availableDrivers}
            onSelectDelivery={setSelectedDelivery}
          />
        </TabsContent>
        
        <TabsContent value="optimization">
          <RouteOptimizationPanel 
            activeDeliveries={activeDeliveries}
            onSelectDelivery={setSelectedDelivery}
          />
        </TabsContent>
        
        <TabsContent value="rerouting">
          <ReroutingPanel 
            activeDeliveries={activeDeliveries}
            onSelectDelivery={setSelectedDelivery}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatchRouting; 