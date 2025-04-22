
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDriverData } from '@/hooks/use-driver-data';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const vehicleTypes = [
  'Temperature-Controlled Van',
  'Standard Delivery Vehicle',
  'Motorcycle Courier'
];

const AddDriverDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: '',
    photo: ''
  });

  const { addDriver } = useDriverData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDriver.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        vehicle_type: formData.vehicleType,
        photo: formData.photo || 'https://randomuser.me/api/portraits/men/32.jpg',
        current_location: {
          address: 'Medical District, San Antonio',
          coordinates: { lat: 29.508, lng: -98.579 }
        }
      });
      
      toast.success('Driver added successfully');
      setOpen(false);
      setFormData({
        name: '',
        phone: '',
        vehicleType: '',
        photo: ''
      });
    } catch (error) {
      toast.error('Failed to add driver');
      console.error('Error adding driver:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#6E59A5] hover:bg-[#7E69AB] text-white font-semibold rounded-lg shadow-none">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter driver's name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select 
              value={formData.vehicleType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL (optional)</Label>
            <Input
              id="photo"
              value={formData.photo}
              onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
              placeholder="Enter photo URL"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Driver</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;
