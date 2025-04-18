
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data for demo purposes
const mockDrivers = [
  {
    id: 'DRV-001',
    name: 'John Smith',
    status: 'active',
    vehicle_type: 'Temperature-Controlled Van',
    current_location: 'Medical District, San Antonio'
  },
  {
    id: 'DRV-002',
    name: 'Maria Rodriguez',
    status: 'active',
    vehicle_type: 'Standard Delivery Vehicle',
    current_location: 'Downtown, San Antonio'
  },
  {
    id: 'DRV-003',
    name: 'David Chen',
    status: 'inactive',
    vehicle_type: 'Motorcycle Courier',
    current_location: 'North San Antonio'
  }
];

const DriversPanel = () => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setDrivers(mockDrivers);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div>Loading drivers...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vehicle Type</TableHead>
            <TableHead>Current Location</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.id}</TableCell>
              <TableCell>{driver.name}</TableCell>
              <TableCell>
                <Badge variant={driver.status === 'active' ? 'default' : 'outline'}>
                  {driver.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{driver.vehicle_type}</TableCell>
              <TableCell>{driver.current_location}</TableCell>
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

export default DriversPanel;
