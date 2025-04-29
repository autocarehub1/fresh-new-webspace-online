import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Pencil, Trash, MapPin } from 'lucide-react';
import type { Driver } from '@/types/delivery';
import { StorageImage } from '@/components/ui/storage-image';
import { DirectStorageImage } from '@/components/ui/direct-storage-image';
import { DualSourceImage } from '@/components/ui/dual-source-image';

interface DriversTableProps {
  drivers: Driver[];
  onStatusToggle: (driverId: string) => void;
  onDeleteDriver: (driverId: string) => void;
  onLocateDriver: (driver: Driver) => void;
  onUnassignDriver: (driverId: string) => void;
}

const DriversTable = ({
  drivers,
  onStatusToggle,
  onDeleteDriver,
  onLocateDriver,
  onUnassignDriver,
}: DriversTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Driver>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: keyof Driver) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Driver Name
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('vehicle_number')}
              >
                Vehicle Number
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('current_delivery')}
              >
                Current Delivery
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('average_response_time')}
              >
                Avg. Response Time
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDrivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <DualSourceImage 
                    photoData={driver.photo}
                    alt={driver.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{driver.name}</TableCell>
                <TableCell>{driver.vehicle_number}</TableCell>
                <TableCell>
                  <Badge
                    variant={driver.status === 'active' ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => onStatusToggle(driver.id)}
                  >
                    {driver.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {driver.current_delivery ? (
                    <Badge variant="outline">On Delivery</Badge>
                  ) : (
                    <Badge variant="secondary">Available</Badge>
                  )}
                </TableCell>
                <TableCell>{driver.average_response_time?.toFixed(1)} min</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onLocateDriver(driver)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="sr-only">Locate</span>
                    </Button>
                    <Button
                      onClick={() => onStatusToggle(driver.id)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      onClick={() => onDeleteDriver(driver.id)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button
                      onClick={() => window.open(`/driver/${driver.id}`, '_blank')}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="sr-only">Driver Interface</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DriversTable;

