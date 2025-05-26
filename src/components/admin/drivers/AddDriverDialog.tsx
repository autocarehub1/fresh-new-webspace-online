import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  vehicle_type: z.string().min(3, {
    message: 'Vehicle type must be at least 3 characters.',
  }),
  vehicle_number: z.string().optional(),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  current_location: z.array(z.number()).length(2, {
    message: 'Please select a valid location on the map.',
  }),
  photo: z.string().url({
    message: 'Please enter a valid URL for the photo.',
  }),
});

const AddDriverDialog: React.FC<AddDriverDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      vehicle_type: '',
      vehicle_number: '',
      address: '',
      current_location: [],
      photo: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Convert coordinates array to proper format
      const coordinates = {
        lat: values.current_location[0],
        lng: values.current_location[1]
      };
      
      const driverData = {
        ...values,
        current_location: {
          address: values.address,
          coordinates: coordinates
        }
      };

      const { data, error } = await supabase.from('drivers').insert([
        {
          ...driverData,
          status: 'active',
          average_response_time: 0,
          rating: 5,
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success('Driver added successfully!');
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Error adding driver:', error);
      toast.error('Failed to add driver. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="" {...register('name')} />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="" {...register('phone')} />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Input id="vehicle_type" defaultValue="" {...register('vehicle_type')} />
              {errors.vehicle_type && (
                <p className="text-red-500 text-sm">{errors.vehicle_type.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="vehicle_number">Vehicle Number (Optional)</Label>
              <Input id="vehicle_number" defaultValue="" {...register('vehicle_number')} />
              {errors.vehicle_number && (
                <p className="text-red-500 text-sm">{errors.vehicle_number.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="" {...register('address')} />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="current_location">Current Location (Latitude, Longitude)</Label>
              <Input id="current_location" defaultValue="" placeholder="[lat, lng]" {...register('current_location')} />
              {errors.current_location && (
                <p className="text-red-500 text-sm">{errors.current_location.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="photo">Photo URL</Label>
              <Input id="photo" defaultValue="" {...register('photo')} />
              {errors.photo && (
                <p className="text-red-500 text-sm">{errors.photo.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Driver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;
