
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Driver, DeliveryRequest } from '@/types/delivery';

interface DriverAssignmentProps {
  drivers: Driver[];
  requests: DeliveryRequest[];
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
  onAssignDriver
}: DriverAssignmentProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Assign Driver to Delivery</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="select-driver">Select Driver</Label>
          <select 
            id="select-driver" 
            className="w-full mt-1 rounded-md border border-gray-300 p-2"
            value={selectedDriverId}
            onChange={(e) => onDriverSelect(e.target.value)}
          >
            <option value="">Select a driver...</option>
            {drivers
              .filter(d => d.status === 'active' && !d.current_delivery)
              .map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.vehicle_type}
                </option>
              ))
            }
          </select>
        </div>
        
        <div>
          <Label htmlFor="select-request">Select Request</Label>
          <select 
            id="select-request" 
            className="w-full mt-1 rounded-md border border-gray-300 p-2"
            value={selectedRequestId}
            onChange={(e) => onRequestSelect(e.target.value)}
          >
            <option value="">Select a request...</option>
            {requests
              .filter(r => r.status === 'pending')
              .map(request => (
                <option key={request.id} value={request.id}>
                  {request.id} - {request.pickup_location} to {request.delivery_location}
                </option>
              ))
            }
          </select>
        </div>
        
        <div className="flex items-end">
          <Button 
            className="w-full" 
            onClick={onAssignDriver}
            disabled={!selectedDriverId || !selectedRequestId}
          >
            <Send className="h-4 w-4 mr-2" /> 
            Assign Driver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverAssignment;
