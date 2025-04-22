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
import type { DeliveryRequest, Driver } from '@/types/delivery';
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
import RequestsStats from './RequestsStats';
import RequestsTable from './RequestsTable';
import RequestDetailsDialog from './RequestDetailsDialog';
import TrackingMapDialog from './TrackingMapDialog';

interface RequestsPanelProps {
  simulationActive?: boolean;
  availableDrivers?: Driver[];
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

  useEffect(() => {
    if (requests) {
      console.log("Requests data loaded:", requests.length, "items");
    } else {
      console.log("No requests data available yet");
    }
  }, [requests]);

  useInterval(() => {
    if (viewTrackingMap && selectedRequest && selectedRequest.id) {
      simulateMovement.mutate(selectedRequest.id);
    }
  }, viewTrackingMap ? 1000 : null);

  const sendStatusNotification = async (request: DeliveryRequest, status: string, status_note?: string) => {
    try {
      const email = (request as any).email || "demo@example.com";
      if (!email) return;
      
      console.log("Sending status notification email to:", email, "status:", status);
      
      const body = {
        id: request.id,
        trackingId: request.trackingId,
        pickup_location: request.pickup_location,
        delivery_location: request.delivery_location,
        priority: request.priority,
        package_type: request.packageType,
        email,
        status,
        status_note,
        assigned_driver: request.assigned_driver
          ? getDriverName(request.assigned_driver)
          : undefined,
      };
      
      const origin = window.location.origin;
      const baseUrl = origin.includes('localhost') 
        ? "https://joziqntfciyflfsgvsqz.supabase.co"
        : origin;
      
      const response = await fetch(`${baseUrl}/functions/v1/send-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send notification email");
      }
      
      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        console.log("Response was not valid JSON:", err);
      }
      
      toast.success("Status notification email sent");
    } catch (err) {
      console.error("Failed to send notification:", err);
      toast.error("Failed to send status notification email");
    }
  };

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
      const req = requests?.find(r => r.id === requestId);
      if (req) {
        await sendStatusNotification(req, newStatus);
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

      await sendStatusNotification(request, newStatus, statusText);

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
    return <div className="flex items-center justify-center p-8 h-64 bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p>Loading requests...</p>
      </div>
    </div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 h-64">
        <Package className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No delivery requests found</h3>
        <p className="text-gray-500 text-center max-w-md">
          There are currently no delivery requests in the system. New requests will appear here when customers submit them.
        </p>
      </div>
    );
  }

  const pendingRequests = requests?.filter(req => req.status === 'pending').length;
  const inProgressRequests = requests?.filter(req => req.status === 'in_progress').length;
  const completedRequests = requests?.filter(req => req.status === 'completed').length;

  return (
    <div className="space-y-6">
      <RequestsStats
        total={requests?.length}
        pending={pendingRequests}
        inProgress={inProgressRequests}
        completed={completedRequests}
      />
      <RequestsTable
        requests={requests}
        getDriverName={getDriverName}
        onApprove={(id) => handleRequestAction(id, 'approve')}
        onDecline={(id) => handleRequestAction(id, 'decline')}
        onStatusUpdate={handleStatusUpdate}
        onViewDetails={setSelectedRequest}
        onViewTracking={handleViewTracking}
      />
      <RequestDetailsDialog
        open={!!selectedRequest && !viewTrackingMap}
        request={selectedRequest}
        getDriverName={getDriverName}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      />
      <TrackingMapDialog
        open={viewTrackingMap && !!selectedRequest}
        request={selectedRequest}
        onOpenChange={(open) => !open && setViewTrackingMap(false)}
      />
    </div>
  );
};

export default RequestsPanel;
