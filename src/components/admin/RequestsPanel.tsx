import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Check, X, ExternalLink, Clock, Truck, 
  MapPin, User, Package,
  ArrowRight, PackageCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryData } from '@/hooks/use-delivery-data';
import type { DeliveryRequest } from '@/types/delivery';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapWrapper from '../map/MapWrapper';
import { useDriverData } from '@/hooks/use-driver-data';
import { useInterval } from '@/hooks/use-interval';

interface RequestsPanelProps {
  simulationActive?: boolean;
}

const RequestsPanel = ({ simulationActive = false }: RequestsPanelProps) => {
  const { 
    deliveries: requests, 
    isLoading,
    updateDeliveryRequest,
    addTrackingUpdate,
    simulateMovement
  } = useDeliveryData();

  const { drivers } = useDriverData();
  const [selectedRequest, setSelectedRequest] = useState<DeliveryRequest | null>(null);
  const [viewTrackingMap, setViewTrackingMap] = useState(false);
  const [isLocalLoading, setLocalIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useInterval(() => {
    if (viewTrackingMap && selectedRequest && selectedRequest.id) {
      simulateMovement.mutate(selectedRequest.id);
    }
  }, viewTrackingMap ? 1000 : null);

  const handleRequestAction = async (requestId: string, action: 'approve' | 'decline') => {
    const newStatus = action === 'approve' ? 'in_progress' : 'declined';
    try {
      await updateDeliveryRequest.mutateAsync({ 
        id: requestId, 
        status: newStatus 
      });

      if (action === 'approve') {
        await addTrackingUpdate.mutateAsync({
          requestId,
          update: {
            status: 'Request Approved',
            timestamp: new Date().toISOString(),
            location: 'Admin Dashboard',
            note: 'Delivery request has been approved'
          }
        });
      }
      
      toast.success(`Request ${requestId} ${action === 'approve' ? 'approved' : 'declined'}`);
    } catch (error) {
      toast.error('Failed to update request status');
    }
  };

  const handleMarkDelivered = async (requestId: string) => {
    try {
      await updateDeliveryRequest.mutateAsync({ 
        id: requestId, 
        status: 'completed' 
      });

      await addTrackingUpdate.mutateAsync({
        requestId,
        update: {
          status: 'Delivered',
          timestamp: new Date().toISOString(),
          location: 'Delivery Location',
          note: 'Package has been delivered successfully'
        }
      });
      
      toast.success(`Request ${requestId} marked as delivered`);
    } catch (error) {
      toast.error('Failed to update request status');
    }
  };

  const handleStatusUpdate = async (
    request: DeliveryRequest, 
    newStatus: 'picked_up' | 'in_transit' | 'delivered'
  ) => {
    let statusText = '';
    let trackingStatus = '';
    let location = '';
    
    switch (newStatus) {
      case 'picked_up':
        statusText = 'Picked up by courier';
        trackingStatus = 'Picked Up';
        location = request.pickup_location;
        break;
      case 'in_transit':
        statusText = 'Package is in transit';
        trackingStatus = 'In Transit';
        location = 'En route to delivery location';
        break;
      case 'delivered':
        statusText = 'Package delivered to destination';
        trackingStatus = 'Delivered';
        location = request.delivery_location;
        break;
      default:
        return;
    }

    try {
      const statusForMain = newStatus === 'delivered' ? 'completed' : 'in_progress';
      
      await updateDeliveryRequest.mutateAsync({
        id: request.id,
        status: statusForMain
      });
      
      await addTrackingUpdate.mutateAsync({
        requestId: request.id,
        update: {
          status: trackingStatus,
          timestamp: new Date().toISOString(),
          location: location,
          note: statusText
        }
      });
      
      toast.success(`Status updated: ${trackingStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleViewTracking = (request: DeliveryRequest) => {
    setSelectedRequest(request);
    setViewTrackingMap(true);
  };

  const getDriverName = (driverId: string | undefined) => {
    if (!driverId) return 'None';
    const driver = drivers?.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown';
  };

  if (isLoading || isLocalLoading) {
    return <div>Loading requests...</div>;
  }

  const pendingRequests = requests?.filter(req => req.status === 'pending').length;
  const inProgressRequests = requests?.filter(req => req.status === 'in_progress').length;
  const completedRequests = requests?.filter(req => req.status === 'completed').length;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests?.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-3xl font-bold">{pendingRequests}</div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-3xl font-bold">{inProgressRequests}</div>
            <Truck className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-3xl font-bold">{completedRequests}</div>
            <Check className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Assigned Driver</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.trackingId || '-'}</TableCell>
                <TableCell>
                  <Badge variant={
                    request.status === 'pending' ? 'outline' : 
                    request.status === 'in_progress' ? 'default' :
                    request.status === 'declined' ? 'destructive' : 'secondary'
                  }>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                  {request.priority === 'urgent' && (
                    <Badge variant="destructive" className="ml-2">Urgent</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[180px] truncate">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{request.pickup_location}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[180px] truncate">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{request.delivery_location}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {request.assigned_driver ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      {getDriverName(request.assigned_driver)}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleRequestAction(request.id, 'approve')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRequestAction(request.id, 'decline')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                  {request.status === 'in_progress' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleStatusUpdate(request, 'picked_up')}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Picked Up
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-700 hover:text-yellow-800"
                        onClick={() => handleStatusUpdate(request, 'in_transit')}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        In Transit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleStatusUpdate(request, 'delivered')}
                      >
                        <PackageCheck className="h-4 w-4 mr-1" />
                        Delivered
                      </Button>
                    </>
                  )}
                  {request.trackingId && (
                    <Button asChild variant="outline" size="sm">
                      <a href={`/tracking?id=${request.trackingId}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Track
                      </a>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  {request.current_coordinates && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTracking(request)}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Map
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={!!selectedRequest && !viewTrackingMap} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Delivery Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this delivery request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium">Request ID</h3>
                  <p>{selectedRequest.id}</p>
                </div>
                <div>
                  <h3 className="font-medium">Tracking ID</h3>
                  <p>{selectedRequest.trackingId || 'Not assigned'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <Badge variant={
                    selectedRequest.status === 'pending' ? 'outline' : 
                    selectedRequest.status === 'in_progress' ? 'default' :
                    selectedRequest.status === 'declined' ? 'destructive' : 'secondary'
                  }>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium">Priority</h3>
                  <Badge variant={selectedRequest.priority === 'urgent' ? 'destructive' : 'outline'}>
                    {selectedRequest.priority?.toUpperCase() || 'NORMAL'}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium">Package Type</h3>
                  <p>{selectedRequest.packageType || 'Standard'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Estimated Cost</h3>
                  <p>${selectedRequest.estimatedCost || '0'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Pickup Location</h3>
                  <p>{selectedRequest.pickup_location}</p>
                </div>
                <div>
                  <h3 className="font-medium">Delivery Location</h3>
                  <p>{selectedRequest.delivery_location}</p>
                </div>
                <div>
                  <h3 className="font-medium">Created At</h3>
                  <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-medium">Assigned Driver</h3>
                  <p>{getDriverName(selectedRequest.assigned_driver)}</p>
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Tracking Updates</h3>
              <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                {selectedRequest.tracking_updates?.map((update, index) => (
                  <div key={index} className="mb-3 pb-3 border-b last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium">{update.status}</span>
                      <span className="text-sm text-gray-600">{new Date(update.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{update.note}</p>
                    <p className="text-xs text-gray-500">{update.location}</p>
                  </div>
                ))}
                
                {!selectedRequest.tracking_updates?.length && (
                  <p className="text-gray-500 text-center">No tracking updates available</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={viewTrackingMap && !!selectedRequest} onOpenChange={(open) => !open && setViewTrackingMap(false)}>
        <DialogContent className="sm:max-w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>Live Delivery Tracking</DialogTitle>
            <DialogDescription>
              Real-time location of the delivery.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[500px] rounded-md overflow-hidden">
            {selectedRequest && (
              <MapWrapper 
                driverLocation={selectedRequest?.current_coordinates}
                deliveryLocation={selectedRequest?.delivery_coordinates}
                height="500px"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsPanel;
