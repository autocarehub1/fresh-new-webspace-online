
import { Card, CardContent } from '@/components/ui/card';
import Map from '../../map/Map';
import { DeliveryRequest } from '@/types/delivery';
import MapHeader from './map/MapHeader';
import MapOverview from './map/MapOverview';

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
      <MapHeader isSimulating={isSimulating} onToggleSimulation={onToggleSimulation} />
      <CardContent className="p-0 h-[300px] relative">
        {mapLoaded && (
          <Map 
            driverLocation={activeDelivery?.current_coordinates}
            deliveryLocation={activeDelivery?.delivery_coordinates}
            height="300px"
          />
        )}
        <MapOverview 
          activeDeliveries={activeDeliveries}
          pendingRequests={pendingRequests}
        />
      </CardContent>
    </Card>
  );
};

export default LiveDeliveryMap;
