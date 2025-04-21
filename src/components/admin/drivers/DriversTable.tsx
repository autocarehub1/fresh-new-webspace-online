
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

const statusColors = {
  active: 'bg-[#F2FCE2] text-green-800',
  inactive: 'bg-[#FEF7CD] text-yellow-800 border border-yellow-300'
};

const cellBase = "py-2 px-4 align-middle";
const actionCell = "space-x-2 flex flex-wrap";

const DriversTable = ({ drivers, onStatusToggle, onDeleteDriver, onLocateDriver }: DriversTableProps) => {
  return (
    <div className="rounded-lg border bg-[#F1F0FB] mb-6 overflow-auto">
      <Table>
        <TableHeader className="bg-[#E5DEFF]">
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
            <TableRow key={driver.id} className="hover:bg-[#f8f6ff]">
              <TableCell className={cellBase}>{driver.id}</TableCell>
              <TableCell className={cellBase}>{driver.name}</TableCell>
              <TableCell className={cellBase}>
                <Badge 
                  variant={driver.status === 'active' ? 'default' : 'outline'}
                  className={`cursor-pointer transition ${statusColors[driver.status]} px-3 py-1 rounded-md`}
                  onClick={() => onStatusToggle(driver.id)}
                >
                  {driver.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className={cellBase}>{driver.vehicle_type}</TableCell>
              <TableCell className={`${cellBase} flex items-center`}>
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {driver.current_location.address}
                
                {driver.current_delivery && (
                  <Badge variant="secondary" className="ml-2">
                    <Package className="h-3 w-3 mr-1" /> On Delivery
                  </Badge>
                )}
              </TableCell>
              <TableCell className={actionCell}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onLocateDriver(driver)}
                  className="rounded-md"
                >
                  <Locate className="h-4 w-4 mr-1" />
                  Locate
                </Button>
                
                <Button variant="outline" size="sm" className="rounded-md">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 rounded-md"
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
