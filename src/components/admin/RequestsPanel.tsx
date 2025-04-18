
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for demo purposes
const mockRequests = [
  {
    id: 'REQ-001',
    status: 'pending',
    pickup_location: '123 Medical Center, San Antonio, TX',
    delivery_location: '456 Hospital Ave, San Antonio, TX',
    created_at: '2025-04-16T14:22:00Z'
  },
  {
    id: 'REQ-002',
    status: 'in_progress',
    pickup_location: '789 Clinic Road, San Antonio, TX',
    delivery_location: '101 Emergency Dept, San Antonio, TX',
    created_at: '2025-04-17T09:15:00Z'
  },
  {
    id: 'REQ-003',
    status: 'completed',
    pickup_location: '222 Lab Building, San Antonio, TX',
    delivery_location: '333 Research Center, San Antonio, TX',
    created_at: '2025-04-17T11:45:00Z'
  }
];

const RequestsPanel = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setRequests(mockRequests);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestAction = (requestId: string, action: 'approve' | 'decline') => {
    setRequests(prevRequests =>
      prevRequests.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            status: action === 'approve' ? 'in_progress' : 'declined'
          };
        }
        return request;
      })
    );

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
            <TableHead>Status</TableHead>
            <TableHead>Pickup Location</TableHead>
            <TableHead>Delivery Location</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.id}</TableCell>
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
