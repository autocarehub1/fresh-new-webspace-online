
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Map from '../../map/Map';
import { DeliveryRequest } from '@/types/delivery';

interface LiveDeliveryMapProps {
  activeDelivery: DeliveryRequest | undefined;
  mapLoaded: boolean;
  isSimulating: boolean;
  activeDeliveries: number;
  pendingRequests: number;
  onToggleSimulation: () => void;
}

const LiveDeliveryMap = ({
  activeDelivery,
  mapLoaded,
  isSimulating,
  activeDeliveries,
  pendingRequests,
  onToggleSimulation
}: LiveDeliveryMapProps) => {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Live Delivery Map</span>
          <button 
            onClick={onToggleSimulation}
            className={`text-sm px-3 py-1 rounded ${isSimulating ? 
              'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
          >
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[300px] relative">
        {mapLoaded && (
          <Map 
            driverLocation={activeDelivery?.current_coordinates}
            deliveryLocation={activeDelivery?.delivery_coordinates}
            height="300px"
          />
        )}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Live Overview</h3>
          <p className="text-sm mb-1">Active Deliveries: <span className="font-bold text-blue-600">{activeDeliveries}</span></p>
          <p className="text-sm">Pending Requests: <span className="font-bold text-yellow-600">{pendingRequests}</span></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveDeliveryMap;
