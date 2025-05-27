
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MapPin, User, Package, Check, X, Truck, ArrowRight, PackageCheck, Trash } from 'lucide-react';
import { DeliveryRequest } from '@/types/delivery';

interface RequestsTableProps {
  requests: DeliveryRequest[];
  getDriverName: (driverId: string | undefined) => string;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onStatusUpdate: (req: DeliveryRequest, status: 'picked_up' | 'in_transit' | 'delivered') => void;
  onViewDetails: (req: DeliveryRequest) => void;
  onViewTracking: (req: DeliveryRequest) => void;
  onDelete: (id: string) => void;
}

const RequestsTable = ({
  requests,
  getDriverName,
  onApprove,
  onDecline,
  onStatusUpdate,
  onViewDetails,
  onViewTracking,
  onDelete
}: RequestsTableProps) => {

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'in_progress': return 'default';
      case 'picked_up': return 'secondary';
      case 'in_transit': return 'default';
      case 'completed': return 'secondary';
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="rounded-md border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tracking ID</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pickup</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Delivery</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assigned Driver</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {requests.map((request) => (
            <tr key={request.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-4 align-middle">{request.id.substring(0, 6)}...</td>
              <td className="p-4 align-middle">{request.trackingId || request.tracking_id || '-'}</td>
              <td className="p-4 align-middle">
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {getStatusDisplay(request.status)}
                </Badge>
                {request.priority === 'urgent' && (
                  <Badge variant="destructive" className="ml-2">Urgent</Badge>
                )}
              </td>
              <td className="p-4 align-middle max-w-[180px] truncate">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{request.pickup_location}</span>
                </div>
              </td>
              <td className="p-4 align-middle max-w-[180px] truncate">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{request.delivery_location}</span>
                </div>
              </td>
              <td className="p-4 align-middle">{new Date(request.created_at).toLocaleDateString()}</td>
              <td className="p-4 align-middle">
                {request.assigned_driver ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    {getDriverName(request.assigned_driver)}
                  </div>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </td>
              <td className="p-4 align-middle space-x-2">
                {request.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => onApprove(request.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDecline(request.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </>
                )}
                {(request.status === 'in_progress' || request.status === 'picked_up' || request.status === 'in_transit') && (
                  <div className="flex flex-wrap gap-1">
                    {request.status === 'in_progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 hover:text-orange-700"
                        onClick={() => onStatusUpdate(request, 'picked_up')}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Picked Up
                      </Button>
                    )}
                    {request.status === 'picked_up' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700"
                        onClick={() => onStatusUpdate(request, 'in_transit')}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        In Transit
                      </Button>
                    )}
                    {request.status === 'in_transit' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => onStatusUpdate(request, 'delivered')}
                      >
                        <PackageCheck className="h-4 w-4 mr-1" />
                        Delivered
                      </Button>
                    )}
                  </div>
                )}
                {(request.trackingId || request.tracking_id) && (
                  <Button asChild variant="outline" size="sm">
                    <a href={`/tracking?id=${request.trackingId || request.tracking_id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Track
                    </a>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails(request)}
                >
                  <Package className="h-4 w-4 mr-1" />
                  Details
                </Button>
                {request.current_coordinates && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewTracking(request)}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Map
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(request.id)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
