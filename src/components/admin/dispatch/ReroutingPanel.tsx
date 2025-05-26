import { useState, useEffect } from 'react';
import { DeliveryRequest } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Clock, MapPin, Navigation, CornerUpRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReroutingPanelProps {
  activeDeliveries: DeliveryRequest[];
  onSelectDelivery: (delivery: DeliveryRequest | null) => void;
}

interface TrafficIssue {
  id: string;
  location: string;
  type: string;
  impact: string;
  affectedDeliveries: number;
  timeReported: string;
  severity: 'low' | 'medium' | 'high';
}

interface ReroutedDelivery {
  id: string;
  originalEta: string;
  newEta: string;
  reason: string;
  timestamp: string;
}

const ReroutingPanel = ({
  activeDeliveries,
  onSelectDelivery
}: ReroutingPanelProps) => {
  const [reroutingId, setReroutingId] = useState<string | null>(null);
  const [reroutedDeliveries, setReroutedDeliveries] = useState<ReroutedDelivery[]>([]);
  const [delayThreshold, setDelayThreshold] = useState<number>(10); // minutes
  const [automatedRerouting, setAutomatedRerouting] = useState<boolean>(true);
  const [trafficRefreshing, setTrafficRefreshing] = useState<boolean>(false);
  
  // Simulated traffic issues with severity
  const [trafficIssues, setTrafficIssues] = useState<TrafficIssue[]>([
    {
      id: 'issue1',
      location: 'Main Street & 5th Avenue',
      type: 'Accident',
      impact: 'Heavy delays',
      affectedDeliveries: 2,
      timeReported: '10 min ago',
      severity: 'high'
    },
    {
      id: 'issue2',
      location: 'Highway 101, Mile 24',
      type: 'Construction',
      impact: 'Moderate delays',
      affectedDeliveries: 1,
      timeReported: '25 min ago',
      severity: 'medium'
    },
    {
      id: 'issue3',
      location: 'Downtown Central Area',
      type: 'Event',
      impact: 'Road closures',
      affectedDeliveries: 3,
      timeReported: '45 min ago',
      severity: 'high'
    }
  ]);

  // Refresh traffic data with more reliable completion
  const refreshTrafficData = async () => {
    if (trafficRefreshing) return; // Prevent multiple refresh calls
    
    setTrafficRefreshing(true);
    
    try {
      // Simulate API call for traffic data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update traffic issues to simulate real data refresh
      const issueTypes = ['Accident', 'Construction', 'Traffic Jam', 'Road Closure', 'Event', 'Lane Closure'];
      const impactTypes = ['Heavy delays', 'Moderate delays', 'Minor delays', 'Road closures'];
      
      setTrafficIssues(prev => {
        // Keep some existing issues but update their values
        const updatedIssues = [...prev];
        
        // Update timeReported for all issues
        updatedIssues.forEach(issue => {
          issue.timeReported = 'Just now';
        });
        
        // Random chance to add/remove issues to show visible change
        const shouldAddNew = Math.random() > 0.5;
        
        if (shouldAddNew && updatedIssues.length < 5) {
          // Add a new issue
          updatedIssues.push({
            id: `issue${Date.now()}`,
            location: `Lincoln Blvd & Washington Ave`,
            type: issueTypes[Math.floor(Math.random() * issueTypes.length)],
            impact: impactTypes[Math.floor(Math.random() * impactTypes.length)],
            affectedDeliveries: Math.floor(Math.random() * 4) + 1,
            timeReported: 'Just now',
            severity: Math.random() > 0.5 ? 'high' : 'medium'
          });
        } else if (updatedIssues.length > 1) {
          // Remove a random issue
          const indexToRemove = Math.floor(Math.random() * updatedIssues.length);
          updatedIssues.splice(indexToRemove, 1);
        }
        
        return updatedIssues;
      });
      
      toast.success('Traffic data updated successfully');
    } catch (error) {
      toast.error('Failed to refresh traffic data. Please try again.');
      console.error('Traffic refresh error:', error);
    } finally {
      setTrafficRefreshing(false);
    }
  };
  
  // Determine affected deliveries based on traffic issues
  const getAffectedDeliveries = () => {
    if (activeDeliveries.length === 0) return [];

    // In a real app, we would match delivery routes with traffic issues
    // For demo, we'll mark some deliveries as affected based on index
    return activeDeliveries
      .filter((_, index) => index % 2 === 0) // Simulate that half the deliveries are affected
      .filter(delivery => !reroutedDeliveries.some(r => r.id === delivery.id)); // Filter out already rerouted
  };

  const handleReroute = (id: string) => {
    if (reroutingId) return; // Don't allow multiple reroutings at once
    
    setReroutingId(id);
    
    toast.promise(
      new Promise(resolve => {
        setTimeout(() => {
          const delivery = activeDeliveries.find(d => d.id === id);
          
          if (delivery) {
            // Create a new rerouted delivery record
            const reroutedDelivery: ReroutedDelivery = {
              id: delivery.id,
              originalEta: delivery.estimatedDelivery || new Date().toISOString(),
              newEta: new Date(Date.now() + 20 * 60000).toISOString(), // 20 minutes from now
              reason: "Heavy traffic on original route",
              timestamp: new Date().toISOString()
            };
            
            setReroutedDeliveries(prev => [...prev, reroutedDelivery]);
          }
          
          setReroutingId(null);
          resolve(true);
        }, 2000);
      }),
      {
        loading: 'Calculating alternative route...',
        success: 'Rerouted successfully! New ETA calculated',
        error: 'Rerouting failed. Please try again.',
      }
    );
  };
  
  // Auto-reroute all affected deliveries
  const handleBatchReroute = async () => {
    const affectedDeliveries = getAffectedDeliveries();
    
    if (affectedDeliveries.length === 0) {
      toast.info('No deliveries require rerouting');
      return;
    }
    
    try {
      let processed = 0;
      const total = affectedDeliveries.length;
      
      for (const delivery of affectedDeliveries) {
        setReroutingId(delivery.id);
        
        // Process each delivery with a small delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create a rerouted delivery record
        const reroutedDelivery: ReroutedDelivery = {
          id: delivery.id,
          originalEta: delivery.estimatedDelivery || new Date().toISOString(),
          newEta: new Date(Date.now() + 15 * 60000 + Math.random() * 600000).toISOString(),
          reason: "Batch rerouting due to traffic conditions",
          timestamp: new Date().toISOString()
        };
        
        setReroutedDeliveries(prev => [...prev, reroutedDelivery]);
        processed++;
      }
      
      toast.success(`Successfully rerouted ${total} deliveries`);
    } catch (error) {
      toast.error('Rerouting failed. Please try again.');
      console.error('Batch reroute error:', error);
    } finally {
      setReroutingId(null);
    }
  };
  
  // Get traffic alert color based on severity
  const getTrafficAlertColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-amber-50 border-amber-200';
      case 'low': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-amber-50 border-amber-200';
    }
  };

  // Get delay and alternative route info for a delivery
  const getDeliveryRerouteInfo = (delivery: DeliveryRequest, index: number) => {
    // Check if it's already been rerouted
    const rerouted = reroutedDeliveries.find(r => r.id === delivery.id);
    
    if (rerouted) {
      return {
        isRerouted: true,
        originalEta: new Date(rerouted.originalEta).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        newEta: new Date(rerouted.newEta).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        reason: rerouted.reason,
        delay: '-5 min', // Time saved by rerouting
        alternativeRoute: `Route #${index + 1}`,
        additionalDistance: (0.4 + index * 0.2).toFixed(1)
      };
    }
    
    // Get random issue type if not rerouted
    const issueType = index % 2 === 0 ? "Accident" : "Heavy Traffic";
    const delay = issueType === "Accident" ? (10 + index * 5) : (5 + index * 3);
    
    return {
      isRerouted: false,
      delay: `+${delay} min`,
      issueType,
      alternativeRoute: `Alternative #${index + 1}`,
      savedTime: (delay * 0.6).toFixed(0),
      additionalDistance: (0.8 + index * 0.3).toFixed(1)
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Traffic & Rerouting</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshTrafficData}
            disabled={trafficRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${trafficRefreshing ? 'animate-spin' : ''}`} />
            {trafficRefreshing ? 'Refreshing...' : 'Refresh Traffic'}
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleBatchReroute}
            disabled={reroutingId !== null || getAffectedDeliveries().length === 0}
          >
            <CornerUpRight className="w-4 h-4 mr-2" />
            Auto-Reroute All
          </Button>
        </div>
      </div>
      
      <Card className={`border-amber-200 bg-amber-50`}>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Traffic Alerts</CardTitle>
          </div>
          <CardDescription>
            Current traffic issues that may affect deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trafficIssues.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>No traffic issues to report. All routes are clear.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {trafficIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  className={`border rounded-md overflow-hidden ${getTrafficAlertColor(issue.severity)}`}
                >
                  <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-medium flex items-center">
                        <span>{issue.location}</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 border-amber-500 text-amber-700 ${
                            issue.severity === 'high' ? 'border-red-500 text-red-700' : 
                            issue.severity === 'medium' ? 'border-amber-500 text-amber-700' : 
                            'border-yellow-500 text-yellow-700'
                          }`}
                        >
                          {issue.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center space-x-4">
                        <span>{issue.impact}</span>
                        <span>•</span>
                        <span>{issue.timeReported}</span>
                        <span>•</span>
                        <span>{issue.affectedDeliveries} {issue.affectedDeliveries === 1 ? 'delivery' : 'deliveries'} affected</span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast.success(`Analyzed impact on ${issue.affectedDeliveries} deliveries`);
                        }}
                      >
                        Analyze Impact
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="affected">
        <TabsList>
          <TabsTrigger value="affected">Affected Deliveries</TabsTrigger>
          <TabsTrigger value="rerouted">Rerouted History</TabsTrigger>
          <TabsTrigger value="settings">Rerouting Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="affected" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Deliveries Requiring Rerouting</CardTitle>
              <CardDescription>
                Active deliveries affected by traffic conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Courier/Order</th>
                      <th className="p-2 text-left">Current Route</th>
                      <th className="p-2 text-left">Issue</th>
                      <th className="p-2 text-left">Delay</th>
                      <th className="p-2 text-left">Alternative Route</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDeliveries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          <Navigation className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No active deliveries to display</p>
                        </td>
                      </tr>
                    ) : getAffectedDeliveries().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                          <p>No deliveries require rerouting at this time</p>
                        </td>
                      </tr>
                    ) : (
                      // Show affected deliveries
                      getAffectedDeliveries().map((delivery, index) => {
                        const rerouteInfo = getDeliveryRerouteInfo(delivery, index);
                        
                        return (
                          <tr key={delivery.id} className="border-t">
                            <td className="p-2" onClick={() => onSelectDelivery(delivery)}>
                              <div className="cursor-pointer hover:text-blue-500 font-medium">
                                {delivery.courier?.name || `Courier ${index + 1}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {delivery.id.substring(0, 6)}...
                              </div>
                            </td>
                            <td className="p-2 max-w-[150px]">
                              <div className="truncate">
                                {delivery.pickup_location} → {delivery.delivery_location}
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                                {rerouteInfo.issueType}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-1 text-red-600">
                                <Clock className="h-4 w-4" />
                                <span>{rerouteInfo.delay}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="text-xs">
                                <span className="font-medium">{rerouteInfo.alternativeRoute}</span>
                                <div className="text-muted-foreground">
                                  -{rerouteInfo.savedTime} min • +{rerouteInfo.additionalDistance} miles
                                </div>
                              </div>
                            </td>
                            <td className="p-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                onClick={() => handleReroute(delivery.id)}
                                disabled={reroutingId !== null}
                              >
                                {reroutingId === delivery.id ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    Rerouting...
                                  </>
                                ) : (
                                  <>
                                    <CornerUpRight className="w-3 h-3 mr-1" />
                                    Reroute
                                  </>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rerouted" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rerouting History</CardTitle>
              <CardDescription>
                Recently rerouted deliveries and their updated ETAs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reroutedDeliveries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No rerouting history available</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Order ID</th>
                        <th className="p-2 text-left">Rerouted At</th>
                        <th className="p-2 text-left">Original ETA</th>
                        <th className="p-2 text-left">New ETA</th>
                        <th className="p-2 text-left">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reroutedDeliveries.map((rerouted, index) => {
                        const delivery = activeDeliveries.find(d => d.id === rerouted.id);
                        
                        return (
                          <tr key={`${rerouted.id}-${index}`} className="border-t">
                            <td className="p-2">
                              <div className="font-medium">{rerouted.id.substring(0, 6)}...</div>
                              <div className="text-xs text-muted-foreground">
                                {delivery?.packageType || 'Standard'}
                              </div>
                            </td>
                            <td className="p-2">
                              {new Date(rerouted.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-2">
                              {new Date(rerouted.originalEta).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-1">
                                {new Date(rerouted.newEta).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                <Badge className="ml-2 bg-green-100 text-green-800">
                                  Optimized
                                </Badge>
                              </div>
                            </td>
                            <td className="p-2 max-w-[200px] truncate">
                              {rerouted.reason}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Urgent Rerouting Settings</CardTitle>
              <CardDescription>
                Configure how the system handles urgent rerouting requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Automatic Rerouting</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically reroute deliveries when delays exceed threshold
                      </div>
                    </div>
                    <Switch 
                      checked={automatedRerouting}
                      onCheckedChange={setAutomatedRerouting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">Delay Threshold</div>
                    <div className="text-sm text-muted-foreground">
                      Trigger rerouting when delay exceeds this amount
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        className="w-20" 
                        value={delayThreshold} 
                        onChange={(e) => setDelayThreshold(parseInt(e.target.value) || 0)}
                        min={1}
                        max={60}
                      />
                      <span>minutes</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Priority Override</div>
                      <div className="text-sm text-muted-foreground">
                        Always reroute urgent deliveries regardless of delay time
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Courier Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Send push notifications to couriers when routes change
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Real-time Traffic Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Check traffic conditions automatically
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">Traffic Check Frequency</div>
                    <Select defaultValue="5">
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Every 3 minutes</SelectItem>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="10">Every 10 minutes</SelectItem>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Customer ETA Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Notify customers when ETA changes due to rerouting
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Admin Approvals</div>
                      <div className="text-sm text-muted-foreground">
                        Require admin approval for major route changes
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button onClick={() => toast.success('Urgent rerouting settings saved')}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReroutingPanel; 