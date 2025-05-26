import { useState, useEffect } from 'react';
import { DeliveryRequest } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Route, Clock, ArrowUpDown, RotateCw, TrendingDown, BarChart, Fuel, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface RouteOptimizationPanelProps {
  activeDeliveries: DeliveryRequest[];
  onSelectDelivery: (delivery: DeliveryRequest | null) => void;
}

interface OptimizationStats {
  timeSavings: string;
  emissionsReduction: string;
  routingEfficiency: string;
  courierCapacity: string;
}

const RouteOptimizationPanel = ({
  activeDeliveries,
  onSelectDelivery
}: RouteOptimizationPanelProps) => {
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [optimizedRoutes, setOptimizedRoutes] = useState<string[]>([]);
  const [stats, setStats] = useState<OptimizationStats>({
    timeSavings: '0 minutes',
    emissionsReduction: '0%',
    routingEfficiency: '0%',
    courierCapacity: '0%'
  });
  
  // Calculate optimization stats based on optimized routes and active deliveries
  useEffect(() => {
    if (activeDeliveries.length === 0) {
      setStats({
        timeSavings: '0 minutes',
        emissionsReduction: '0%',
        routingEfficiency: '0%',
        courierCapacity: '0%'
      });
      return;
    }
    
    // Generate realistic stats based on how many routes are optimized
    const optimizedCount = optimizedRoutes.length;
    const totalRoutes = activeDeliveries.length;
    const optimizationRatio = optimizedCount / totalRoutes;
    
    setStats({
      timeSavings: `${Math.round(optimizationRatio * 45)} minutes`,
      emissionsReduction: `${Math.round(optimizationRatio * 26)}%`,
      routingEfficiency: `${Math.round(70 + (optimizationRatio * 30))}%`,
      courierCapacity: `${Math.round(60 + (optimizationRatio * 25))}%`
    });
  }, [optimizedRoutes, activeDeliveries]);

  const handleOptimizeRoute = (id: string) => {
    setOptimizingId(id);
    
    // Simulate API call for route optimization
    toast.promise(
      new Promise(resolve => {
        setTimeout(() => {
          setOptimizingId(null);
          
          // Add to optimized routes
          if (!optimizedRoutes.includes(id)) {
            setOptimizedRoutes(prev => [...prev, id]);
          }
          
          resolve(true);
        }, 2000);
      }),
      {
        loading: 'Optimizing route...',
        success: () => {
          // Find the delivery being optimized
          const delivery = activeDeliveries.find(d => d.id === id);
          const routeName = delivery ? 
            `${delivery.pickup_location.split(',')[0]} → ${delivery.delivery_location.split(',')[0]}` : 
            'Route';
          
          return `Optimized ${routeName}! Saved 8-12 minutes of travel time`;
        },
        error: 'Optimization failed. Please try again.',
      }
    );
  };
  
  const handleOptimizeAll = () => {
    if (activeDeliveries.length === 0) {
      toast.error('No active deliveries to optimize');
      return;
    }
    
    // Store IDs that aren't already optimized
    const unoptimizedIds = activeDeliveries
      .filter(delivery => !optimizedRoutes.includes(delivery.id))
      .map(delivery => delivery.id);
      
    if (unoptimizedIds.length === 0) {
      toast.info('All routes are already optimized');
      return;
    }
    
    toast.promise(
      new Promise(resolve => {
        // Optimize one route at a time with a small delay to show progress
        let counter = 0;
        const interval = setInterval(() => {
          if (counter < unoptimizedIds.length) {
            setOptimizingId(unoptimizedIds[counter]);
            counter++;
          } else {
            clearInterval(interval);
            setOptimizingId(null);
            setOptimizedRoutes(prev => [...new Set([...prev, ...unoptimizedIds])]);
            resolve(true);
          }
        }, 500);
      }),
      {
        loading: `Optimizing ${unoptimizedIds.length} routes...`,
        success: `Optimized ${unoptimizedIds.length} routes! Estimated savings of ${Math.round(unoptimizedIds.length * 9)} minutes`,
        error: 'Optimization failed. Please try again.',
      }
    );
  };
  
  // Reset all optimizations
  const handleResetOptimizations = () => {
    if (optimizedRoutes.length === 0) {
      toast.info('No optimized routes to reset');
      return;
    }
    
    toast.promise(
      new Promise(resolve => {
        setTimeout(() => {
          setOptimizedRoutes([]);
          resolve(true);
        }, 1000);
      }),
      {
        loading: 'Resetting optimizations...',
        success: 'All route optimizations have been reset',
        error: 'Reset failed. Please try again.',
      }
    );
  };

  // Get traffic status and optimization potential for a route
  const getRouteDetails = (index: number) => {
    // Simulate different traffic conditions and optimization potential
    const trafficStatus = index % 3 === 0 ? 'heavy' : index % 3 === 1 ? 'moderate' : 'light';
    const potentialSavings = trafficStatus === 'heavy' ? 10 + (index * 2) : 
                           trafficStatus === 'moderate' ? 5 + (index * 1.5) : 
                           3 + index;
                           
    const optimizationPotential = trafficStatus === 'heavy' ? 80 : 
                                trafficStatus === 'moderate' ? 50 : 
                                25;
                                
    return { trafficStatus, potentialSavings, optimizationPotential };
  };
  
  // Check if a route is already optimized
  const isRouteOptimized = (id: string) => optimizedRoutes.includes(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Route Optimization Dashboard</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResetOptimizations}
            disabled={optimizingId !== null || optimizedRoutes.length === 0}
          >
            Reset Optimizations
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleOptimizeAll}
            disabled={optimizingId !== null || activeDeliveries.length === 0 || 
                     activeDeliveries.length === optimizedRoutes.length}
          >
            <Zap className="w-4 h-4 mr-2" />
            Optimize All Routes
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Est. Time Savings</CardDescription>
              <CardTitle className="text-2xl">{stats.timeSavings}</CardTitle>
            </div>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>CO₂ Reduction</CardDescription>
              <CardTitle className="text-2xl">{stats.emissionsReduction}</CardTitle>
            </div>
            <Fuel className="h-5 w-5 text-green-500" />
          </CardHeader>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Routing Efficiency</CardDescription>
              <CardTitle className="text-2xl">{stats.routingEfficiency}</CardTitle>
            </div>
            <TrendingDown className="h-5 w-5 text-purple-500" />
          </CardHeader>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Courier Capacity</CardDescription>
              <CardTitle className="text-2xl">{stats.courierCapacity}</CardTitle>
            </div>
            <BarChart className="h-5 w-5 text-amber-500" />
          </CardHeader>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Active Delivery Routes</CardTitle>
          <CardDescription>Optimize and monitor in-progress deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Courier/Order</th>
                  <th className="p-2 text-left">Current Route</th>
                  <th className="p-2 text-left">Current ETA</th>
                  <th className="p-2 text-left">Distance</th>
                  <th className="p-2 text-left">Traffic</th>
                  <th className="p-2 text-left">Optimization</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <Route className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No active deliveries to optimize</p>
                    </td>
                  </tr>
                ) : (
                  activeDeliveries.map((delivery, index) => {
                    const { trafficStatus, potentialSavings, optimizationPotential } = getRouteDetails(index);
                    const isOptimized = isRouteOptimized(delivery.id);
                    
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
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                            {/* Simulated ETAs */}
                            {delivery.estimatedDelivery ? 
                              new Date(delivery.estimatedDelivery).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 
                              `${10 + (index * 5)}:${index * 10 < 10 ? '0' + index * 10 : index * 10} ${index % 2 === 0 ? 'AM' : 'PM'}`
                            }
                            
                            {isOptimized && (
                              <span className="ml-1 text-xs text-green-600">
                                (-{Math.round(potentialSavings)} min)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          {/* Simulated distances */}
                          {(2.5 + index * 0.9).toFixed(1)} miles
                        </td>
                        <td className="p-2">
                          {/* Simulate different traffic conditions */}
                          {trafficStatus === 'heavy' ? (
                            <Badge className="bg-red-500">Heavy</Badge>
                          ) : trafficStatus === 'moderate' ? (
                            <Badge className="bg-yellow-500">Moderate</Badge>
                          ) : (
                            <Badge className="bg-green-500">Light</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="space-y-1">
                            <div className="text-xs flex justify-between">
                              <span>{isOptimized ? 'Time saved' : 'Potential savings'}</span>
                              <span className="font-medium">{potentialSavings.toFixed(0)} min</span>
                            </div>
                            <Progress 
                              value={isOptimized ? 100 : optimizationPotential} 
                              className="h-2" 
                              indicatorClassName={
                                isOptimized ? "bg-green-500" :
                                trafficStatus === 'heavy' ? "bg-red-500" : 
                                trafficStatus === 'moderate' ? "bg-yellow-500" : 
                                "bg-blue-500"
                              }
                            />
                          </div>
                        </td>
                        <td className="p-2">
                          <Button 
                            variant={isOptimized ? "outline" : "default"} 
                            size="sm" 
                            onClick={() => handleOptimizeRoute(delivery.id)}
                            disabled={optimizingId !== null}
                            className={optimizingId === delivery.id ? "opacity-50" : ""}
                          >
                            {optimizingId === delivery.id ? (
                              <>
                                <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                                Optimizing...
                              </>
                            ) : isOptimized ? (
                              <>
                                <ArrowUpDown className="w-3 h-3 mr-1" />
                                Re-optimize
                              </>
                            ) : (
                              <>
                                <ArrowUpDown className="w-3 h-3 mr-1" />
                                Optimize
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
      
      <Card>
        <CardHeader>
          <CardTitle>Traffic-Aware Routing</CardTitle>
          <CardDescription>
            Our system uses real-time traffic data to calculate the most efficient routes
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-md p-4 space-y-2">
            <div className="font-medium">Traffic Monitoring</div>
            <p className="text-sm text-muted-foreground">
              Continuously monitors traffic conditions along active delivery routes
            </p>
            <Badge variant="outline" className="mt-2">Active</Badge>
          </div>
          
          <div className="border rounded-md p-4 space-y-2">
            <div className="font-medium">Historical Data Analysis</div>
            <p className="text-sm text-muted-foreground">
              Uses historical traffic patterns to predict optimal timing
            </p>
            <Badge variant="outline" className="mt-2">Enabled</Badge>
          </div>
          
          <div className="border rounded-md p-4 space-y-2">
            <div className="font-medium">Scheduled Optimization</div>
            <p className="text-sm text-muted-foreground">
              Automatically triggers route optimization during peak hours
            </p>
            <div className="flex justify-between items-center mt-2">
              <Badge variant="outline" className="mt-2">Every 30 min</Badge>
              <Button size="sm" variant="ghost">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteOptimizationPanel; 