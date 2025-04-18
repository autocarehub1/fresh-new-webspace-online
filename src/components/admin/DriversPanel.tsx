
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash, User } from 'lucide-react';
import { toast } from 'sonner';

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
  const [drivers, setDrivers] = useState(mockDrivers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setDrivers(mockDrivers);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleStatusToggle = (driverId: string) => {
    setDrivers(prevDrivers =>
      prevDrivers.map(driver => {
        if (driver.id === driverId) {
          const newStatus = driver.status === 'active' ? 'inactive' : 'active';
          toast.success(`Driver ${driver.name}'s status changed to ${newStatus}`);
          return {
            ...driver,
            status: newStatus
          };
        }
        return driver;
      })
    );
  };

  const handleDeleteDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    setDrivers(prevDrivers => prevDrivers.filter(d => d.id !== driverId));
    toast.success(`Driver ${driver?.name} has been removed`);
  };

  if (isLoading) {
    return <div>Loading drivers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
          <User className="h-4 w-4 mr-2" />
          Add New Driver
        </Button>
      </div>
      
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
                  <Badge 
                    variant={driver.status === 'active' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleStatusToggle(driver.id)}
                  >
                    {driver.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{driver.vehicle_type}</TableCell>
                <TableCell>{driver.current_location}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteDriver(driver.id)}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DriversPanel;
