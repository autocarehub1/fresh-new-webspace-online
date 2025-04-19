
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryStore } from '@/store/deliveryStore';
import type { DeliveryRequest } from '@/types/delivery';

const RequestsPanel = () => {
  const { requests, updateRequestStatus } = useDeliveryStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestAction = (requestId: string, action: 'approve' | 'decline') => {
    const newStatus = action === 'approve' ? 'in_progress' : 'declined';
    updateRequestStatus(requestId, newStatus);
    toast.success(`Request ${requestId} ${action === 'approve' ? 'approved' : 'declined'}`);
  };

  if (isLoading) {
    return <div>Loading requests...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tracking ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pickup Location</TableHead>
            <TableHead>Delivery Location</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Est. Cost</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
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
              </TableCell>
              <TableCell>{request.pickup_location}</TableCell>
              <TableCell>{request.delivery_location}</TableCell>
              <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{request.estimatedCost ? `$${request.estimatedCost}` : '-'}</TableCell>
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
                {request.trackingId && (
                  <Button asChild variant="outline" size="sm" className="ml-2">
                    <a href={`/tracking?id=${request.trackingId}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Track
                    </a>
                  </Button>
                )}
                {request.status !== 'pending' && (
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestsPanel;
