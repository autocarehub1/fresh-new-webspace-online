import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useDriverData } from '@/hooks/use-driver-data';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { fixImageUrl } from '@/lib/storage-helpers';

const vehicleTypes = [
  { id: 'standard', label: 'Standard Delivery Vehicle', capacity: 'Medium' },
  { id: 'temperature', label: 'Temperature-Controlled Van', capacity: 'Large' },
  { id: 'motorcycle', label: 'Motorcycle Courier', capacity: 'Small' },
  { id: 'bus', label: 'Bus', capacity: 'Extra Large' },
];

const AddDriverDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const { addDriver } = useDriverData();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Vehicle type is required';
    }

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Upload driver photo if provided, and retrieve its public URL
    let photoUrl = '';
    let photoBase64 = '';

    if (photoFile) {
      console.log('Starting photo upload for file:', photoFile.name);
      
      // First, store the image as a base64 string we can use as a fallback
      try {
        const reader = new FileReader();
        photoBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(photoFile);
        });
        
        console.log(`Created base64 image data (${photoBase64.length} chars)`);
        
        // Store the base64 data in localStorage as a fallback mechanism
        localStorage.setItem(`driver-photo-${Date.now()}`, photoBase64);
      } catch (err) {
        console.error('Failed to create base64 image:', err);
      }
      
      // Now try the regular Supabase upload
      const ext = photoFile.name.split('.').pop();
      const fileName = `driver-${Date.now()}.${ext}`;
      
      try {
        // First, try to upload the file
        const { error: uploadError } = await supabase
          .storage
          .from('driver-photos')
          .upload(fileName, photoFile, { cacheControl: '3600', upsert: false });
        
        if (uploadError) {
          console.error('Error uploading driver photo:', uploadError);
          toast.error('Driver photo upload failed - using base64 fallback');
          photoUrl = photoBase64; // Use the base64 data directly as the URL
        } else {
          console.log('Photo uploaded successfully to path:', fileName);
          
          // Store BOTH the filename AND the base64 data separated by a special marker
          // This way we can try multiple approaches when displaying
          photoUrl = `${fileName}|||${photoBase64}`;
          console.log('Saving combined photo data with both filename and base64');
        }
      } catch (err) {
        console.error('Exception during upload process:', err);
        toast.error('Using base64 fallback due to upload error');
        photoUrl = photoBase64;
      }
    }

    try {
      console.log('Adding driver with data:', {
        name: formData.name,
        phone: formData.phone,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        status: 'active',
        current_location: {
          coordinates: [0, 0], // Default coordinates
          address: 'Not specified',
        },
        photo: photoUrl,
      });
      
      await addDriver.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        status: 'active',
        current_location: {
          coordinates: [0, 0], // Default coordinates
          address: 'Not specified',
        },
        photo: photoUrl,
      });

      toast.success('Driver added successfully');
      setOpen(false);
      setFormData({
        name: '',
        phone: '',
        vehicleType: '',
        vehicleNumber: '',
      });
      setPhotoFile(null);
      setPhotoPreview('');
    } catch (error) {
      console.error('Failed to add driver:', error);
      toast.error('Failed to add driver');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new driver to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
              >
                <SelectTrigger className={errors.vehicleType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center justify-between">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {type.capacity}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleType && (
                <p className="text-sm text-red-500">{errors.vehicleType}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className={errors.vehicleNumber ? 'border-red-500' : ''}
              />
              {errors.vehicleNumber && (
                <p className="text-sm text-red-500">{errors.vehicleNumber}</p>
              )}
            </div>

            {/* Driver photo upload */}
            <div className="grid gap-2">
              <Label htmlFor="photo">Driver Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPhotoFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setPhotoPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {photoPreview && (
                <img src={photoPreview} alt="Driver Preview" className="h-20 w-20 object-cover rounded-md mt-2" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Driver</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;
