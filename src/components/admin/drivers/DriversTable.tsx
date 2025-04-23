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
import { MoreHorizontal, Search } from 'lucide-react';
import type { Driver } from '@/types/delivery';

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
                <TableCell className="px-2 py-1">
                  <img
                    src={driver.photo || 'https://placehold.co/80x80?text=No+Image'}
                    alt={driver.name}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      console.error('Driver image failed to load:', driver.photo);
                      e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image';
                    }}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onLocateDriver(driver)}>
                        View Location
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusToggle(driver.id)}>
                        Toggle Status
                      </DropdownMenuItem>
                      {driver.current_delivery && (
                        <DropdownMenuItem onClick={() => onUnassignDriver(driver.id)}>
                          Unassign Driver
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteDriver(driver.id)}
                      >
                        Delete Driver
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

