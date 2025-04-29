import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Package } from 'lucide-react';
import type { Driver, Delivery } from '@/types/delivery';

interface DriverAssignmentProps {
  drivers: Driver[];
  requests: Delivery[];
  selectedDriverId: string;
  selectedRequestId: string;
  onDriverSelect: (driverId: string) => void;
  onRequestSelect: (requestId: string) => void;
  onAssignDriver: () => void;
}

const DriverAssignment = ({
  drivers,
  requests,
  selectedDriverId,
  selectedRequestId,
  onDriverSelect,
  onRequestSelect,
  onAssignDriver,
}: DriverAssignmentProps) => {
  const [filter, setFilter] = useState<'all' | 'available'>('available');

  const availableDrivers = drivers.filter(d => {
    // Active drivers with no delivery are always available
    if (d.status === 'active' && !d.current_delivery) {
      return true;
    }
    
    // Active drivers with a completed delivery should also be considered available
    if (d.status === 'active' && d.current_delivery) {
      // Find the driver's current delivery in the requests array
      const currentDelivery = requests.find(r => r.id === d.current_delivery);
      
      // If the delivery is completed or doesn't exist (might have been deleted), consider the driver available
      return currentDelivery?.status === 'completed' || !currentDelivery;
    }
    
    return false;
  });

  const pendingRequests = requests.filter(r => 
    r.status === 'pending' && !r.assigned_driver
  );

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);
  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const calculateDistance = (driver: Driver, request: Delivery) => {
    // This would be replaced with actual distance calculation
    return Math.random() * 10; // Placeholder
  };

  const getBestMatch = () => {
    if (!selectedDriver || !pendingRequests.length) return null;
    
    return pendingRequests.reduce((best, request) => {
      const distance = calculateDistance(selectedDriver, request);
      if (!best || distance < calculateDistance(selectedDriver, best)) {
        return request;
      }
      return best;
    });
  };

  const bestMatch = getBestMatch();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Driver Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Driver
              </label>
              <Select
                value={selectedDriverId}
                onValueChange={onDriverSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {(filter === 'available' ? availableDrivers : drivers).map((driver) => {
                    // Check if the driver has a completed delivery
                    const hasCompletedDelivery = driver.current_delivery && 
                      requests.find(r => r.id === driver.current_delivery)?.status === 'completed';
                    
                    return (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center gap-2">
                          <span>{driver.name}</span>
                          {driver.status === 'active' && !driver.current_delivery && (
                            <Badge variant="secondary">Available</Badge>
                          )}
                          {driver.status === 'active' && hasCompletedDelivery && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Completed Delivery
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedDriver && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Current Location: {selectedDriver.current_location.address}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Avg. Response Time: {selectedDriver.average_response_time?.toFixed(1)} min
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Delivery Request
              </label>
              <Select
                value={selectedRequestId}
                onValueChange={onRequestSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a request" />
                </SelectTrigger>
                <SelectContent>
                  {pendingRequests.map((request) => (
                    <SelectItem key={request.id} value={request.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Request #{request.id}</span>
                        <Badge variant="outline">
                          {request.priority} Priority
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRequest && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Delivery Location: {selectedRequest.delivery_location.address}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Time Window: {selectedRequest.delivery_time_window}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {bestMatch && selectedDriver && !selectedRequestId && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Recommended assignment based on proximity:
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Request #{bestMatch.id}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRequestSelect(bestMatch.id)}
              >
                Assign
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            onClick={onAssignDriver}
            disabled={!selectedDriverId || !selectedRequestId}
          >
            Assign Driver to Delivery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverAssignment;
