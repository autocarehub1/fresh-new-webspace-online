
import { useState, useEffect } from 'react';
import { useDeliveryData } from '@/hooks/use-delivery-data';
import { useDriverData } from '@/hooks/use-driver-data';
import { useInterval } from '@/hooks/use-interval';
import { useRequestActions } from '@/hooks/use-request-actions';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import RequestsStats from './RequestsStats';
import RequestsTable from './RequestsTable';
import RequestDetailsDialog from './RequestDetailsDialog';
import TrackingMapDialog from './TrackingMapDialog';
import type { DeliveryRequest, Driver } from '@/types/delivery';
import { Package } from 'lucide-react';

interface RequestsPanelProps {
  simulationActive?: boolean;
  availableDrivers?: Driver[];
}

const RequestsPanel = ({ simulationActive = false }: RequestsPanelProps) => {
  const { deliveries: requests, isLoading, simulateMovement } = useDeliveryData();
  const { drivers } = useDriverData();
  const { handleRequestAction, handleDeleteRequest, handleStatusUpdate } = useRequestActions();
  
  const [selectedRequest, setSelectedRequest] = useState<DeliveryRequest | null>(null);
  const [viewTrackingMap, setViewTrackingMap] = useState(false);
  const [isLocalLoading, setLocalLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
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
  
  useEffect(() => {
    if (selectedRequest && requests) {
      const requestStillExists = requests.some(req => req.id === selectedRequest.id);
      if (!requestStillExists) {
        console.log(`Selected request ${selectedRequest.id} no longer exists, clearing selection`);
        setSelectedRequest(null);
        setViewTrackingMap(false);
      }
    }
  }, [requests, selectedRequest]);

  useInterval(() => {
    if (viewTrackingMap && selectedRequest && selectedRequest.id) {
      simulateMovement.mutate(selectedRequest.id);
    }
  }, viewTrackingMap ? 1000 : null);

  const getDriverName = (driverId: string | undefined) => {
    if (!driverId) return 'None';
    const driver = drivers?.find(d => d.id === driverId);
    return driver ? driver.name : 'Unknown';
  };

  const handleViewTracking = (request: DeliveryRequest) => {
    setSelectedRequest(request);
    setViewTrackingMap(true);
  };

  const handleAdminStatusUpdate = async (request: DeliveryRequest, status: 'picked_up' | 'in_transit' | 'delivered') => {
    console.log(`Admin updating delivery ${request.id} to status: ${status}`);
    
    // Use the hook's status update function which handles the mapping correctly
    const success = await handleStatusUpdate(request, status);
    
    if (success) {
      console.log(`Successfully updated delivery ${request.id} to ${status}`);
    }
  };
  
  const onDeleteRequest = (id: string) => {
    // Ask for confirmation before deletion
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return;
    }
    
    // Clear selection if the deleted request is currently selected
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest(null);
      setViewTrackingMap(false);
    }
    
    // Call the hook's delete function
    handleDeleteRequest(id);
    
    // Ensure any open dialogs are closed
    setViewTrackingMap(false);
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
  const inProgressRequests = requests?.filter(req => ['in_progress', 'picked_up', 'in_transit'].includes(req.status)).length;
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
        onStatusUpdate={handleAdminStatusUpdate}
        onViewDetails={setSelectedRequest}
        onViewTracking={handleViewTracking}
        onDelete={onDeleteRequest}
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
