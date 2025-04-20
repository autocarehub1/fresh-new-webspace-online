
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Edit, Trash, Locate } from 'lucide-react';
import { Driver } from '@/types/delivery';

interface DriversTableProps {
  drivers: Driver[];
  onStatusToggle: (driverId: string) => void;
  onDeleteDriver: (driverId: string) => void;
  onLocateDriver: (driver: Driver) => void;
}

const DriversTable = ({ drivers, onStatusToggle, onDeleteDriver, onLocateDriver }: DriversTableProps) => {
  return (
    <div className="rounded-md border mb-6">
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
                  onClick={() => onStatusToggle(driver.id)}
                >
                  {driver.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{driver.vehicle_type}</TableCell>
              <TableCell className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {driver.current_location.address}
                
                {driver.current_delivery && (
                  <Badge variant="secondary" className="ml-2">
                    <Package className="h-3 w-3 mr-1" /> On Delivery
                  </Badge>
                )}
              </TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onLocateDriver(driver)}
                >
                  <Locate className="h-4 w-4 mr-1" />
                  Locate
                </Button>
                
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDeleteDriver(driver.id)}
                  disabled={driver.current_delivery !== null}
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
  );
};

export default DriversTable;
