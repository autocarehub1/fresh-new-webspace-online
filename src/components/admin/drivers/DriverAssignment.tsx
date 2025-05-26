import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Driver } from '@/types/delivery';

interface DriverAssignmentProps {
  drivers?: Driver[];
  requests: any[];
  selectedDriverId: string;
  selectedRequestId: string;
  onDriverSelect: (driverId: string) => void;
  onRequestSelect: (requestId: string) => void;
  onAssignDriver: () => void;
}

const DriverAssignment: React.FC<DriverAssignmentProps> = ({
  drivers = [],
  requests,
  selectedDriverId,
  selectedRequestId,
  onDriverSelect,
  onRequestSelect,
  onAssignDriver
}) => {
  const availableDrivers = drivers.filter(d => d.status === 'active' && !d.current_delivery);
  const pendingRequests = requests.filter(r => r.status === 'pending' && !r.assigned_driver);
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Driver Assignment</h3>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md">Assign Driver to Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Select Driver</label>
              <Select value={selectedDriverId} onValueChange={onDriverSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.length === 0 ? (
                    <SelectItem value="none" disabled>No available drivers</SelectItem>
                  ) : (
                    availableDrivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.vehicle_type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {availableDrivers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">All drivers are currently assigned or inactive</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Select Request</label>
              <Select value={selectedRequestId} onValueChange={onRequestSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select request" />
                </SelectTrigger>
                <SelectContent>
                  {pendingRequests.length === 0 ? (
                    <SelectItem value="none" disabled>No pending requests</SelectItem>
                  ) : (
                    pendingRequests.map(request => (
                      <SelectItem key={request.id} value={request.id}>
                        {request.id.substring(0, 8)} - {request.priority === 'urgent' ? '🔴 Urgent' : '🔵 Normal'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {pendingRequests.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No pending requests available</p>
              )}
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={onAssignDriver}
                disabled={!selectedDriverId || !selectedRequestId}
                className="w-full"
              >
                Assign Driver
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverAssignment;
