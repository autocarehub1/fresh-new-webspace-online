
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MapWrapper from "../map/MapWrapper";
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
}: TrackingMapDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[800px] h-[600px]">
      <DialogHeader>
        <DialogTitle>Live Delivery Tracking</DialogTitle>
        <DialogDescription>
          Real-time location of the delivery.
        </DialogDescription>
      </DialogHeader>
      <div className="h-[500px] rounded-md overflow-hidden">
        {request && (
          <MapWrapper 
            driverLocation={request?.current_coordinates}
            deliveryLocation={request?.delivery_coordinates}
            height="500px"
          />
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default TrackingMapDialog;
