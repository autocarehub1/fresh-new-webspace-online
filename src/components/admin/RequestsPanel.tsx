
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setRequests(mockRequests);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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
                <Badge variant={request.status === 'pending' ? 'outline' : 'default'}>
                  {request.status === 'in_progress' ? 'In Progress' : 
                   request.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </TableCell>
              <TableCell>{request.pickup_location}</TableCell>
              <TableCell>{request.delivery_location}</TableCell>
              <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestsPanel;
