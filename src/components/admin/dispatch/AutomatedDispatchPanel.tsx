import { useState, useEffect, useCallback } from 'react';
import { DeliveryRequest, Driver } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, MapPin, RotateCw, Clock, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useDeliveryData } from '@/hooks/use-delivery-data';
import { useDriverData } from '@/hooks/use-driver-data';
import { useDispatchStore } from '@/store/dispatchStore';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface AutomatedDispatchPanelProps {
  pendingRequests: DeliveryRequest[];
  availableDrivers: Driver[];
  onSelectDelivery: (delivery: DeliveryRequest | null) => void;
}

const AutomatedDispatchPanel = ({
  pendingRequests,
  availableDrivers,
  onSelectDelivery
}: AutomatedDispatchPanelProps) => {
  const { updateDeliveryRequest } = useDeliveryData();
  const { assignDriver } = useDriverData();
  
  // Get dispatch store functionality
  const { 
    autoDispatchEnabled,
    nextScheduledRun,
    timeUntilNextRun,
    dispatchCount,
    enableAutoDispatch,
    disableAutoDispatch,
    incrementDispatchCount,
    triggerManualRun,
    setDispatchInterval
  } = useDispatchStore();

  const [dispatchSettings, setDispatchSettings] = useState({
    prioritizeUrgent: true,
    maxDistance: 10, // miles
    considerTraffic: true,
    dispatchMethod: 'proximity' as 'proximity' | 'balanced' | 'efficiency',
    dispatchInterval: 15, // seconds
  });
  
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [autoDispatchRunning, setAutoDispatchRunning] = useState(false);
  const [matchedCouriers, setMatchedCouriers] = useState<Record<string, string>>({});
  const [settingsApplied, setSettingsApplied] = useState(false);

  // Match couriers to pending requests based on proximity and settings
  useEffect(() => {
    if (pendingRequests.length && availableDrivers.length) {
      console.log('AutomatedDispatchPanel: Matching couriers to pending requests');
      const matches: Record<string, string> = {};
      
      // Get only truly available drivers (active and not currently assigned)
      const trulyAvailableDrivers = availableDrivers.filter(driver => 
        driver.status === 'active' && !driver.current_delivery
      );
      
      if (trulyAvailableDrivers.length === 0) {
        console.log('No truly available drivers found for auto dispatch matching');
        return;
      }
      
      console.log(`Matching ${pendingRequests.length} requests with ${trulyAvailableDrivers.length} available drivers`);
      
      // First, prioritize urgent requests if setting is enabled
      // Also prioritize requests that have tracking updates with 'Request Approved'
      const approvedRequests = pendingRequests.filter(req => 
        !req.assigned_driver && 
        req.tracking_updates?.some(update => update.status === 'Request Approved')
      );
      
      const urgentRequests = pendingRequests.filter(req => 
        req.priority === 'urgent' && 
        !req.assigned_driver && 
        !approvedRequests.some(ar => ar.id === req.id)
      );
      
      const regularRequests = pendingRequests.filter(req => 
        req.priority !== 'urgent' && 
        !req.assigned_driver && 
        !approvedRequests.some(ar => ar.id === req.id) &&
        !urgentRequests.some(ur => ur.id === req.id)
      );
      
      // Sort requests to process approved urgent ones first, then approved regular,
      // then other urgent, then other regular
      const sortedRequests = [
        ...approvedRequests.filter(req => req.priority === 'urgent'),
        ...approvedRequests.filter(req => req.priority !== 'urgent'),
        ...(dispatchSettings.prioritizeUrgent ? [...urgentRequests, ...regularRequests] : [...urgentRequests, ...regularRequests])
      ];
      
      // Assign drivers based on the dispatch method
      let driverIndex = 0;
      
      for (const request of sortedRequests) {
        // Skip already assigned requests
        if (request.assigned_driver) continue;
        
        // Skip if we've used all available drivers
        if (driverIndex >= trulyAvailableDrivers.length) break;
        
        // Assign based on dispatch method
        let selectedDriverIndex = driverIndex;
        if (dispatchSettings.dispatchMethod === 'balanced') {
          // Use round-robin assignment for balanced workload
          selectedDriverIndex = driverIndex % trulyAvailableDrivers.length;
        } else if (dispatchSettings.dispatchMethod === 'efficiency') {
          // Simulate route optimization by using a more complex selection
          // In a real app, this would use actual geographical distances
          const requestNumber = parseInt(request.id.substring(request.id.length - 2), 16) || 0;
          selectedDriverIndex = (driverIndex + requestNumber) % trulyAvailableDrivers.length;
        }
        
        matches[request.id] = trulyAvailableDrivers[selectedDriverIndex].id;
        driverIndex++;
      }
      
      setMatchedCouriers(matches);
      console.log(`Matched ${Object.keys(matches).length} requests to available drivers`);
    }
  }, [pendingRequests, availableDrivers, dispatchSettings, settingsApplied]);

  const handleDispatchSetting = (setting: string, value: any) => {
    setDispatchSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleAutoAssign = async (requestId: string) => {
    if (!availableDrivers.length) {
      toast.error("No available couriers to assign");
      return;
    }
    
    setProcessingRequest(requestId);
    
    try {
      // Find the delivery
      const delivery = pendingRequests.find(r => r.id === requestId);
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      // Get the matched driver
      const driverId = matchedCouriers[requestId];
      const driver = availableDrivers.find(d => d.id === driverId);
      
      if (!driver) {
        throw new Error('No matched driver found');
      }
      
      // First update delivery status to in_progress
      await updateDeliveryRequest.mutateAsync({
        id: delivery.id,
        status: 'in_progress'
      });
      
      // Then use assignDriver to properly link driver and delivery
      await assignDriver.mutateAsync({
        driverId: driver.id,
        deliveryId: delivery.id
      });
      
      // Update global dispatch count
      incrementDispatchCount();
      
      toast.success(`Auto-assigned courier ${driver.name} to request ${requestId.substring(0, 6)}...`);
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error('Assignment failed. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };
  
  const handleRunBatchDispatch = async () => {
    if (!pendingRequests.length) {
      toast.error("No pending requests to dispatch");
      return;
    }
    
    if (!availableDrivers.length) {
      toast.error("No available couriers for dispatch");
      return;
    }
    
    const dispatchCount = Math.min(pendingRequests.length, availableDrivers.length);
    
    setAutoDispatchRunning(true);
    
    try {
      // Create a queue of deliveries to process (prioritize urgent ones)
      const urgentDeliveries = pendingRequests.filter(d => d.priority === 'urgent');
      const regularDeliveries = pendingRequests.filter(d => d.priority !== 'urgent');
      const deliveryQueue = [...urgentDeliveries, ...regularDeliveries].slice(0, dispatchCount);
      
      // Process each delivery with a delay
      for (const delivery of deliveryQueue) {
        // Get matched driver
        const driverId = matchedCouriers[delivery.id];
        const driver = availableDrivers.find(d => d.id === driverId);
        
        if (!driver) continue;
        
        // First update delivery status to in_progress
        await updateDeliveryRequest.mutateAsync({
          id: delivery.id,
          status: 'in_progress'
        });
        
        // Then use assignDriver to properly link driver and delivery
        await assignDriver.mutateAsync({
          driverId: driver.id,
          deliveryId: delivery.id
        });
        
        // Update global dispatch count for each delivery
        incrementDispatchCount();
        
        // Add a small delay between assignments
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`Successfully dispatched ${deliveryQueue.length} ${deliveryQueue.length === 1 ? 'delivery' : 'deliveries'}`);
    } catch (error) {
      console.error('Batch dispatch error:', error);
      toast.error('Dispatch failed. Please try again.');
    } finally {
      setAutoDispatchRunning(false);
    }
  };

  const getDriverForRequest = (request: DeliveryRequest, index: number) => {
    if (availableDrivers.length === 0) return null;
    
    // In a real application, this would be based on actual matching logic
    // For demo, use the matched driver from our effect or fallback to index-based assignment
    const driverId = matchedCouriers[request.id];
    const driver = availableDrivers.find(d => d.id === driverId) || 
                  availableDrivers[index % availableDrivers.length];
    
    return driver;
  };
  
  // Calculate estimated distance (simulation)
  const getEstimatedDistance = (index: number) => {
    // Apply a multiplier based on dispatch method to simulate different routing strategies
    const methodMultiplier = 
      dispatchSettings.dispatchMethod === 'efficiency' ? 0.85 : 
      dispatchSettings.dispatchMethod === 'balanced' ? 0.95 : 1;
      
    return ((2 + index * 1.5) * methodMultiplier).toFixed(1);
  };
  
  // Apply dispatch settings
  const applySettings = () => {
    setSettingsApplied(true);
    toast.success(`Applied automated dispatch settings`);
    
    // Toggle back to false after a delay so re-applying with the same settings will trigger a re-match
    setTimeout(() => {
      setSettingsApplied(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Automated Dispatch Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Auto-Dispatch</h4>
                  <p className="text-sm text-muted-foreground">
                    {autoDispatchEnabled ? (
                      <>
                        <Clock className="h-3 w-3 inline mr-1 text-green-500" />
                        Active - Next run in {timeUntilNextRun || '...'}
                      </>
                    ) : (
                      'Disabled - Enable to automatically assign drivers'
                    )}
                  </p>
                </div>
                <Switch 
                  checked={autoDispatchEnabled} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      enableAutoDispatch(runDispatchProcess);
                    } else {
                      disableAutoDispatch();
                    }
                  }}
                />
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Dispatch Interval</h4>
                <div className="flex items-center gap-4">
                  <Slider
                    disabled={autoDispatchEnabled}
                    value={[dispatchSettings.dispatchInterval]}
                    min={5}
                    max={60}
                    step={5}
                    onValueChange={(value) => {
                      setDispatchSettings(prev => ({
                        ...prev,
                        dispatchInterval: value[0]
                      }));
                    }}
                  />
                  <span className="min-w-[4rem] text-sm">
                    {dispatchSettings.dispatchInterval}s
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={applySettings}
                  variant="outline"
                  className="flex-1"
                >
                  Apply Settings
                </Button>
                <Button 
                  onClick={() => triggerManualRun(runDispatchProcess)}
                  className="flex-1"
                >
                  Run Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Dispatch Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="prioritize" 
                    checked={dispatchSettings.prioritizeUrgent}
                    onCheckedChange={(checked) => handleDispatchSetting('prioritizeUrgent', checked)}
                  />
                  <label htmlFor="prioritize" className="text-sm font-medium">
                    Prioritize urgent specimens/samples
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="traffic" 
                    checked={dispatchSettings.considerTraffic}
                    onCheckedChange={(checked) => handleDispatchSetting('considerTraffic', checked)}
                  />
                  <label htmlFor="traffic" className="text-sm font-medium">
                    Consider real-time traffic conditions
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dispatch method</label>
                  <Select 
                    value={dispatchSettings.dispatchMethod}
                    onValueChange={(value: 'proximity' | 'balanced' | 'efficiency') => handleDispatchSetting('dispatchMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proximity">By proximity (nearest courier)</SelectItem>
                      <SelectItem value="balanced">Balanced (workload distribution)</SelectItem>
                      <SelectItem value="efficiency">Efficiency (route optimization)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Maximum dispatch distance</label>
                    <span className="text-sm text-gray-500">{dispatchSettings.maxDistance} miles</span>
                  </div>
                  <Slider
                    value={[dispatchSettings.maxDistance]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(values) => handleDispatchSetting('maxDistance', values[0])}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Pending Deliveries</CardTitle>
          <CardDescription>
            {pendingRequests.length} deliveries awaiting dispatch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">ID/Type</th>
                  <th className="p-2 text-left">Priority</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Pickup</th>
                  <th className="p-2 text-left">Delivery</th>
                  <th className="p-2 text-left">Est. Distance</th>
                  <th className="p-2 text-left">Recommended Courier</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No pending deliveries</p>
                    </td>
                  </tr>
                ) : (
                  pendingRequests.slice(0, 5).map((request, index) => {
                    const matchedDriver = getDriverForRequest(request, index);
                    const estimatedDistance = getEstimatedDistance(index);
                    const isApproved = request.tracking_updates?.some(update => update.status === 'Request Approved');
                    
                    return (
                      <tr key={request.id} className={isApproved ? "border-t bg-green-50" : "border-t"}>
                        <td className="p-2" onClick={() => onSelectDelivery(request)}>
                          <div className="cursor-pointer hover:text-blue-500">
                            {request.id.substring(0, 6)}...
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {request.packageType || 'Standard'}
                          </div>
                        </td>
                        <td className="p-2">
                          {request.priority === 'urgent' ? (
                            <Badge variant="destructive">Urgent</Badge>
                          ) : (
                            <Badge variant="outline">Normal</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className={isApproved ? "bg-green-100 border-green-300" : ""}>Pending</Badge>
                          {isApproved && (
                            <div className="text-xs text-green-600 mt-1">
                              Approved
                            </div>
                          )}
                        </td>
                        <td className="p-2 max-w-[120px] truncate">
                          {request.pickup_location}
                        </td>
                        <td className="p-2 max-w-[120px] truncate">
                          {request.delivery_location}
                        </td>
                        <td className="p-2">
                          {estimatedDistance} miles
                        </td>
                        <td className="p-2">
                          {matchedDriver ? (
                            <div className="text-xs">
                              <span className="font-semibold">
                                {matchedDriver.name}
                              </span>
                              <div className="text-muted-foreground">
                                {(0.8 + index * 0.3).toFixed(1)} miles away • {(4 + index * 2)} min
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-red-500 border-red-500">
                              No couriers available
                            </Badge>
                          )}
                        </td>
                        <td className="p-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={isApproved ? "h-8 px-2 border-green-500 text-green-600 hover:text-green-700" : "h-8 px-2"}
                            onClick={() => handleAutoAssign(request.id)}
                            disabled={!matchedDriver || processingRequest === request.id || autoDispatchRunning}
                          >
                            {processingRequest === request.id ? (
                              <>
                                <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                                Assigning...
                              </>
                            ) : isApproved ? (
                              <>
                                <Zap className="w-3 h-3 mr-1" />
                                Dispatch Now
                              </>
                            ) : (
                              'Auto-assign'
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {pendingRequests.length > 5 && (
            <div className="mt-2 text-sm text-center text-muted-foreground">
              + {pendingRequests.length - 5} more pending deliveries
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  
  // Function to run the dispatch process 
  async function runDispatchProcess() {
    // Ensure we have the right dispatch interval
    if (dispatchSettings.dispatchInterval !== 15) {
      setDispatchInterval(dispatchSettings.dispatchInterval);
    }
    
    // Then manually trigger a dispatch cycle using the existing logic
    setAutoDispatchRunning(true);
    
    try {
      if (!pendingRequests?.length) {
        toast.info("No pending requests to dispatch");
        return;
      }
      
      // Get truly available drivers
      const trulyAvailableDrivers = availableDrivers.filter(d => 
        d.status === 'active' && !d.current_delivery
      );
      
      if (!trulyAvailableDrivers?.length) {
        toast.info("No available drivers to dispatch");
        return;
      }
      
      console.log(`Auto dispatch running: ${pendingRequests.length} pending requests, ${trulyAvailableDrivers.length} available drivers`);
      
      // Identify newly approved requests
      const approvedRequests = pendingRequests.filter(req => 
        !req.assigned_driver && 
        req.tracking_updates?.some(update => update.status === 'Request Approved')
      );
      
      // Sort requests with approved first, then urgent, then regular
      let sortedRequests = [
        // First all approved requests (urgent first)
        ...approvedRequests.filter(req => req.priority === 'urgent'),
        ...approvedRequests.filter(req => req.priority !== 'urgent'),
        
        // Then other pending requests (urgent first if setting enabled)
        ...pendingRequests.filter(req => 
          req.priority === 'urgent' && 
          !req.assigned_driver && 
          !approvedRequests.some(ar => ar.id === req.id)
        ),
        ...pendingRequests.filter(req => 
          req.priority !== 'urgent' && 
          !req.assigned_driver && 
          !approvedRequests.some(ar => ar.id === req.id)
        )
      ];
      
      // Only consider unassigned requests
      sortedRequests = sortedRequests.filter(req => !req.assigned_driver);
      
      if (sortedRequests.length === 0) {
        toast.info("No unassigned requests to dispatch");
        return;
      }
      
      // Log the dispatch plan
      if (approvedRequests.length > 0) {
        console.log(`Found ${approvedRequests.length} newly approved requests to prioritize`);
      }
      
      let processed = 0;
      let assignedDriverIds = new Set();
      
      for (const request of sortedRequests) {
        // Stop if we've used all available drivers
        if (assignedDriverIds.size >= trulyAvailableDrivers.length) {
          console.log("All available drivers have been assigned, stopping dispatch process");
          break;
        }
        
        // Get matched driver from our pre-computed matches if available
        let driverId = matchedCouriers[request.id];
        let driver = trulyAvailableDrivers.find(d => d.id === driverId && !assignedDriverIds.has(d.id));
        
        // If no matched driver or already assigned, find another available one
        if (!driver) {
          driver = trulyAvailableDrivers.find(d => !assignedDriverIds.has(d.id));
          if (driver) {
            driverId = driver.id;
          }
        }
        
        if (!driver) {
          console.log(`No available driver for request ${request.id}`);
          continue;
        }
        
        // Process this assignment
        try {
          console.log(`Assigning driver ${driver.name} (${driver.id}) to request ${request.id}`);
          await handleAssignSpecificDriver(request.id, driver.id);
          assignedDriverIds.add(driver.id);
          processed++;
        } catch (error) {
          console.error(`Error assigning driver to ${request.id}:`, error);
        }
      }
      
      if (processed > 0) {
        toast.success(`Successfully dispatched ${processed} deliveries`);
      } else {
        toast.info("No deliveries could be dispatched");
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Auto-dispatch error:", error);
      toast.error("Failed to run auto-dispatch");
      return Promise.reject(error);
    } finally {
      setAutoDispatchRunning(false);
    }
  }
  
  // Add a new function to handle auto-assignment with a specific driver ID
  async function handleAssignSpecificDriver(requestId: string, driverId: string) {
    if (!availableDrivers.length) {
      toast.error("No available couriers to assign");
      return;
    }
    
    setProcessingRequest(requestId);
    
    try {
      // Find the delivery
      const delivery = pendingRequests.find(r => r.id === requestId);
      if (!delivery) {
        throw new Error('Delivery not found');
      }
      
      // Get the driver
      const driver = availableDrivers.find(d => d.id === driverId);
      
      if (!driver) {
        throw new Error('No driver found');
      }
      
      // First update delivery status to in_progress
      await updateDeliveryRequest.mutateAsync({
        id: delivery.id,
        status: 'in_progress'
      });
      
      // Then use assignDriver to properly link driver and delivery
      await assignDriver.mutateAsync({
        driverId: driver.id,
        deliveryId: delivery.id
      });
      
      // Update global dispatch count
      incrementDispatchCount();
      
      console.log(`Auto-assigned courier ${driver.name} to request ${requestId.substring(0, 6)}...`);
    } catch (error) {
      console.error('Assignment error:', error);
      throw error;
    } finally {
      setProcessingRequest(null);
    }
  }
};

export default AutomatedDispatchPanel; 