import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MapWrapper from "../map/MapWrapper";
import { useDriverData } from '@/hooks/use-driver-data';
import { DeliveryRequest } from "@/types/delivery";

interface TrackingMapDialogProps {
  open: boolean;
  request: DeliveryRequest | null;
  onOpenChange: (open: boolean) => void;
}

const TrackingMapDialog = ({
  open,
  request,
  onOpenChange
}: TrackingMapDialogProps) => {
  // Fetch drivers to find assigned driver details
  const { drivers, isLoading: loadingDrivers } = useDriverData();
  const driverInfo = request?.assigned_driver
    ? drivers.find(d => d.id === request.assigned_driver)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[600px]">
        <DialogHeader>
          <DialogTitle>Live Delivery Tracking</DialogTitle>
          <DialogDescription>
            Real-time location of the delivery.
          </DialogDescription>
        </DialogHeader>
        {/* Driver Information Section */}
        <div className="px-6 py-4 border-b flex items-center space-x-4">
          {loadingDrivers ? (
            <p className="text-sm text-gray-500">Loading driver info...</p>
          ) : driverInfo ? (
            <>
              <img
                src={driverInfo.photo}
                alt={driverInfo.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{driverInfo.name}</p>
                <p className="text-sm text-gray-500">{driverInfo.vehicle_type}</p>
                <p className="text-sm text-gray-500">{driverInfo.phone}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No driver assigned</p>
          )}
        </div>
        <div className="h-[500px] rounded-md overflow-hidden">
          {request && (
            <MapWrapper
              driverLocation={request.current_coordinates}
              deliveryLocation={request.delivery_coordinates}
              height="500px"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackingMapDialog;
