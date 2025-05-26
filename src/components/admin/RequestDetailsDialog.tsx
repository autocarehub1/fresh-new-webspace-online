import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DeliveryRequest } from "@/types/delivery";

interface RequestDetailsDialogProps {
  open: boolean;
  request: DeliveryRequest | null;
  getDriverName: (driverId: string | undefined) => string;
  onOpenChange: (open: boolean) => void;
}

const RequestDetailsDialog = ({
  open,
  request,
  getDriverName,
  onOpenChange,
}: RequestDetailsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>Delivery Request Details</DialogTitle>
        <DialogDescription>
          Complete information about this delivery request.
        </DialogDescription>
      </DialogHeader>
      {request && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium">Request ID</h3>
              <p>{request.id}</p>
            </div>
            <div>
              <h3 className="font-medium">Tracking ID</h3>
              <p>{request.trackingId || 'Not assigned'}</p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <Badge variant={
                request.status === 'pending' ? 'outline' : 
                request.status === 'in_progress' ? 'default' :
                request.status === 'declined' ? 'destructive' : 'secondary'
              }>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium">Priority</h3>
              <Badge variant={request.priority === 'urgent' ? 'destructive' : 'outline'}>
                {request.priority?.toUpperCase() || 'NORMAL'}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium">Package Type</h3>
              <p>{request.packageType || 'Standard'}</p>
            </div>
            <div>
              <h3 className="font-medium">Estimated Cost</h3>
              <p>${request.estimatedCost || '0'}</p>
            </div>
            <div>
              <h3 className="font-medium">Pickup Location</h3>
              <p>{request.pickup_location}</p>
            </div>
            <div>
              <h3 className="font-medium">Delivery Location</h3>
              <p>{request.delivery_location}</p>
            </div>
            <div>
              <h3 className="font-medium">Requester</h3>
              <p>{request.requester_name || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-medium">Company</h3>
              <p>{request.company_name || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-medium">Created At</h3>
              <p>{new Date(request.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-medium">Assigned Driver</h3>
              <p>{getDriverName(request.assigned_driver)}</p>
            </div>
          </div>
          <h3 className="font-medium mb-2">Tracking Updates</h3>
          <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
            {request.tracking_updates
              ?.slice()
              .sort((a, b) => {
                // Define the exact status order based on the screenshot
                const statusPriority = {
                  'Delivered': 1,
                  'In Transit': 2,
                  'Picked Up': 3,
                  'Driver Assigned': 4,
                  'Request Approved': 5,
                  'Request Submitted': 6
                };
                
                // Get the priority for each status (use a high number if not in our predefined list)
                const priorityA = statusPriority[a.status] || 999;
                const priorityB = statusPriority[b.status] || 999;
                
                // First sort by priority (statuses in our defined order)
                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }
                
                // If same status type, sort by timestamp (newest first)
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              })
              .map((update, index) => (
                <div key={index} className="mb-3 pb-3 border-b last:border-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{update.status}</span>
                    <span className="text-sm text-gray-600">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{update.note}</p>
                  <p className="text-xs text-gray-500">{update.location}</p>
                </div>
              ))}
            {!request.tracking_updates?.length && (
              <p className="text-gray-500 text-center">No tracking updates available</p>
            )}
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default RequestDetailsDialog;
