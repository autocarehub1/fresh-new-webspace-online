
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Edit, Trash, Locate, Car, Truck, Bus, TrafficCone } from 'lucide-react';
import { Driver } from '@/types/delivery';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

const vehicleIcons: Record<string, React.ReactNode> = {
  "Temperature-Controlled Van": <Truck className="inline-block h-4 w-4 mr-1 text-blue-700" />,
  "Standard Delivery Vehicle": <Car className="inline-block h-4 w-4 mr-1 text-purple-600" />,
  "Motorcycle Courier": <TrafficCone className="inline-block h-4 w-4 mr-1 text-orange-500" />,
  "Bus": <Bus className="inline-block h-4 w-4 mr-1 text-gray-700" />
};

// fallback initials utility
const initials = (name?: string) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'D';

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
            <TableHead>Vehicle</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No drivers found.
              </TableCell>
            </TableRow>
          )}
          {drivers.map((driver) => (
            <TableRow key={driver.id} className="hover:bg-[#f8f6ff] transition">
              <TableCell className={cellBase}>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={driver.photo || undefined} alt={driver.name} />
                    <AvatarFallback>{initials(driver.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">{driver.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className={cellBase}>
                {driver.name}
                <div className="text-xs text-gray-500">{driver.phone}</div>
              </TableCell>
              <TableCell className={cellBase}>
                <Badge 
                  variant={driver.status === 'active' ? 'default' : 'outline'}
                  className={`cursor-pointer transition ${statusColors[driver.status]} px-3 py-1 rounded-md`}
                  onClick={() => onStatusToggle(driver.id)}
                  title={driver.status === 'active' ? "Click to set inactive" : "Click to set active"}
                >
                  {driver.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className={cellBase}>
                <span className="inline-flex items-center">
                  {vehicleIcons[driver.vehicle_type] || <Car className="inline-block h-4 w-4 mr-1" />}
                  {driver.vehicle_type}
                </span>
              </TableCell>
              <TableCell className={`${cellBase} flex flex-col min-w-[160px]`}>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {driver.current_location.address}
                </span>
                {driver.current_delivery && (
                  <Badge variant="secondary" className="mt-1 px-2 py-0.5">
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
                  title="Locate driver on map"
                >
                  <Locate className="h-4 w-4 mr-1" />
                  Locate
                </Button>
                <Button variant="outline" size="sm" className="rounded-md" title="Edit (not implemented)">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 rounded-md"
                  onClick={() => onDeleteDriver(driver.id)}
                  disabled={driver.current_delivery !== null}
                  title={driver.current_delivery ? "Driver is on delivery and cannot be deleted" : "Delete driver"}
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

