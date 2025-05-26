import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeliveryRequest, Driver, Coordinates } from '@/types/delivery';
import { Loader2, Maximize2, MapPin, Navigation, Layers, Filter, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface DispatchMapProps {
  activeDeliveries: DeliveryRequest[];
  pendingRequests: DeliveryRequest[];
  availableDrivers: Driver[];
  selectedDelivery: DeliveryRequest | null;
}

// Traffic areas with severity
const trafficAreas = [
  { id: 1, x: 350, y: 300, radius: 15, severity: 'moderate', color: '#fbbf24' },
  { id: 2, x: 450, y: 300, radius: 15, severity: 'heavy', color: '#ef4444' },
  { id: 3, x: 500, y: 400, radius: 15, severity: 'heavy', color: '#ef4444' },
  { id: 4, x: 300, y: 200, radius: 15, severity: 'light', color: '#22c55e' }
];

const DispatchMap = ({
  activeDeliveries,
  pendingRequests,
  availableDrivers,
  selectedDelivery
}: DispatchMapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapView, setMapView] = useState<'standard' | 'traffic' | 'satellite'>('standard');
  const [showLayers, setShowLayers] = useState({
    active: true,
    pending: true,
    drivers: true,
    traffic: true
  });
  const [refreshingMap, setRefreshingMap] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [trafficPoints, setTrafficPoints] = useState(trafficAreas);
  
  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle map refresh - ensure it completes and updates something visible
  const handleRefreshMap = useCallback(async () => {
    if (refreshingMap) return; // Prevent multiple refreshes
    
    setRefreshingMap(true);
    
    try {
      // Simulate API call for map data refresh
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Update traffic data to show visible change after refresh
      setTrafficPoints(prev => {
        // Create a copy of the current points
        const newPoints = [...prev];
        
        // Randomly adjust positions slightly
        return newPoints.map(point => ({
          ...point,
          x: point.x + (Math.random() * 40 - 20),
          y: point.y + (Math.random() * 40 - 20),
          radius: 10 + Math.random() * 10,
          severity: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as 'light' | 'moderate' | 'heavy',
          color: point.severity === 'heavy' ? '#ef4444' : 
                 point.severity === 'moderate' ? '#fbbf24' : '#22c55e'
        }));
      });
      
      toast.success("Map data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh map data");
      console.error("Map refresh error:", error);
    } finally {
      setRefreshingMap(false);
    }
  }, [refreshingMap]);
  
  // Toggle layer visibility
  const toggleLayer = (layer: keyof typeof showLayers) => {
    setShowLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };
  
  // Format distance for display
  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)} miles`;
  };
  
  // Toggle map expansion
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className={`relative ${expanded ? 'col-span-2' : ''}`}>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle>Live Dispatch Map</CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={handleRefreshMap} disabled={refreshingMap}>
              <RefreshCw className={`h-4 w-4 ${refreshingMap ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowLayers(prev => ({...prev, traffic: !prev.traffic}))}>
              <Layers className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleExpand}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Real-time view of couriers, pending orders, and traffic conditions
        </CardDescription>
      </CardHeader>
      
      <div className="px-4 pt-1 pb-0 flex justify-between items-center">
        <Tabs 
          defaultValue="standard" 
          value={mapView} 
          onValueChange={(value) => setMapView(value as 'standard' | 'traffic' | 'satellite')}
          className="w-auto"
        >
          <TabsList className="h-8">
            <TabsTrigger value="standard" className="text-xs px-2.5 py-1">Standard</TabsTrigger>
            <TabsTrigger value="traffic" className="text-xs px-2.5 py-1">Traffic</TabsTrigger>
            <TabsTrigger value="satellite" className="text-xs px-2.5 py-1">Satellite</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <Checkbox 
              id="active-layer" 
              checked={showLayers.active} 
              onCheckedChange={() => toggleLayer('active')}
              className="h-3 w-3"
            />
            <label htmlFor="active-layer" className="text-xs">Active</label>
          </div>
          <div className="flex items-center space-x-1.5">
            <Checkbox 
              id="pending-layer" 
              checked={showLayers.pending} 
              onCheckedChange={() => toggleLayer('pending')}
              className="h-3 w-3"
            />
            <label htmlFor="pending-layer" className="text-xs">Pending</label>
          </div>
          <div className="flex items-center space-x-1.5">
            <Checkbox 
              id="drivers-layer" 
              checked={showLayers.drivers} 
              onCheckedChange={() => toggleLayer('drivers')}
              className="h-3 w-3"
            />
            <label htmlFor="drivers-layer" className="text-xs">Drivers</label>
          </div>
        </div>
      </div>
      
      <CardContent className="p-0 mt-2">
        <div className={`relative w-full ${expanded ? 'h-[500px]' : 'h-[300px]'} bg-gray-100 overflow-hidden`}>
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">Loading map data...</p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* This would normally be a map integration like Google Maps, Mapbox, etc. */}
              {/* For now, we'll simulate the map with placeholders */}
              <div className={`absolute inset-0 ${
                mapView === 'standard' ? 'bg-blue-50' :
                mapView === 'traffic' ? 'bg-gray-100' :
                'bg-green-50'
              } bg-opacity-50`}>
                {/* Simulated map image */}
                <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                  {/* Roads */}
                  <path d="M0,300 L800,300" stroke="#ccc" strokeWidth="8" />
                  <path d="M400,0 L400,600" stroke="#ccc" strokeWidth="8" />
                  <path d="M200,100 L600,500" stroke="#ccc" strokeWidth="6" />
                  <path d="M600,100 L200,500" stroke="#ccc" strokeWidth="6" />
                  <path d="M100,100 C100,100 300,200 700,200" stroke="#ccc" strokeWidth="4" fill="none" />
                  
                  {/* Traffic indicators - only show if traffic layer is enabled */}
                  {showLayers.traffic && mapView !== 'satellite' && trafficPoints.map(area => (
                    <circle 
                      key={area.id}
                      cx={area.x} 
                      cy={area.y} 
                      r={area.radius} 
                      fill={area.color} 
                      opacity={mapView === 'traffic' ? 0.8 : 0.5}
                    />
                  ))}
                  
                  {/* Traffic labels - only in traffic view */}
                  {showLayers.traffic && mapView === 'traffic' && trafficPoints.map(area => (
                    <text 
                      key={`label-${area.id}`}
                      x={area.x} 
                      y={area.y - 12} 
                      fontSize="10" 
                      fill="#333" 
                      textAnchor="middle"
                    >
                      {area.severity.charAt(0).toUpperCase() + area.severity.slice(1)}
                    </text>
                  ))}
                </svg>
                
                {/* Active Deliveries */}
                {showLayers.active && activeDeliveries.map((delivery, index) => {
                  // Simulate different positions on the map
                  const left = (20 + (index * 15) + Math.random() * 40) + '%';
                  const top = (20 + (index * 10) + Math.random() * 40) + '%';
                  
                  const isSelected = selectedDelivery?.id === delivery.id;
                  
                  return (
                    <div 
                      key={delivery.id}
                      className={`absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                        isSelected ? 'z-20' : ''
                      }`}
                      style={{ left, top }}
                    >
                      <div className={`
                        w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs
                        ${isSelected ? 'ring-4 ring-blue-300 scale-125' : ''}
                        cursor-pointer transition-all hover:scale-110
                      `}>
                        <Navigation className="h-3 w-3" />
                      </div>
                      {(isSelected || expanded) && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                          <div className="font-medium">{delivery.courier?.name || 'Courier'}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistance(2.5 + index * 0.7)} to destination
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Pending Requests */}
                {showLayers.pending && pendingRequests.map((request, index) => {
                  // Simulate different positions on the map for pending deliveries
                  const left = (30 + (index * 10) + Math.random() * 30) + '%';
                  const top = (40 + (index * 8) + Math.random() * 30) + '%';
                  
                  const isSelected = selectedDelivery?.id === request.id;
                  const isUrgent = request.priority === 'urgent';
                  
                  return (
                    <div 
                      key={request.id}
                      className={`absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                        isSelected ? 'z-20' : ''
                      }`}
                      style={{ left, top }}
                    >
                      <div className={`
                        w-6 h-6 ${isUrgent ? 'bg-red-500' : 'bg-amber-500'} rounded-full flex items-center justify-center text-white text-xs
                        ${isSelected ? 'ring-4 ring-amber-300 scale-125' : ''}
                        cursor-pointer transition-all hover:scale-110
                      `}>
                        <MapPin className="h-3 w-3" />
                      </div>
                      {(isSelected || expanded) && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                          <div className="font-medium">{request.packageType || 'Standard'}</div>
                          <div className="text-xs text-muted-foreground">
                            {isUrgent ? 'Urgent Delivery' : 'Standard Delivery'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Available Drivers */}
                {showLayers.drivers && availableDrivers.map((driver, index) => {
                  // Simulate different positions on the map for available drivers
                  const left = (50 + (index * 12) + Math.random() * 30) + '%';
                  const top = (60 + (index * 7) + Math.random() * 20) + '%';
                  
                  return (
                    <div 
                      key={driver.id}
                      className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ left, top }}
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer transition-all hover:scale-110">
                        <span>{driver.name.substring(0, 1)}</span>
                      </div>
                      {expanded && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Available • {driver.vehicle_type}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="absolute bottom-2 left-2 bg-white rounded p-2 shadow-md z-10 text-xs">
                <div className="text-xs font-medium mb-1">Map Legend</div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                    <span>Active ({activeDeliveries.length})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
                    <span>Pending ({pendingRequests.length})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span>Available ({availableDrivers.length})</span>
                  </div>
                </div>
                
                {showLayers.traffic && (
                  <div className="flex items-center space-x-4 text-xs mt-1 pt-1 border-t">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1 opacity-60"></div>
                      <span>Light</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-1 opacity-60"></div>
                      <span>Moderate</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-1 opacity-60"></div>
                      <span>Heavy</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DispatchMap; 