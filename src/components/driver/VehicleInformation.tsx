
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VehicleInformationProps {
  userId: string;
  onComplete: () => void;
}

interface VehicleData {
  type: string;
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  vin: string;
  capacity: string;
  specialEquipment: string;
  notes: string;
}

const vehicleTypes = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Pickup Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'other', label: 'Other' }
];

const VehicleInformation: React.FC<VehicleInformationProps> = ({ userId, onComplete }) => {
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    type: '',
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vin: '',
    capacity: '',
    specialEquipment: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!vehicleData.type) {
      newErrors.type = 'Vehicle type is required';
    }

    if (!vehicleData.make) {
      newErrors.make = 'Vehicle make is required';
    }

    if (!vehicleData.model) {
      newErrors.model = 'Vehicle model is required';
    }

    if (!vehicleData.year) {
      newErrors.year = 'Vehicle year is required';
    } else {
      const currentYear = new Date().getFullYear();
      const year = parseInt(vehicleData.year);
      if (year < 1990 || year > currentYear + 1) {
        newErrors.year = `Year must be between 1990 and ${currentYear + 1}`;
      }
    }

    if (!vehicleData.color) {
      newErrors.color = 'Vehicle color is required';
    }

    if (!vehicleData.licensePlate) {
      newErrors.licensePlate = 'License plate is required';
    }

    if (vehicleData.type !== 'bicycle' && vehicleData.type !== 'motorcycle' && !vehicleData.vin) {
      newErrors.vin = 'VIN is required for this vehicle type';
    }

    if (vehicleData.vin && vehicleData.vin.length !== 17) {
      newErrors.vin = 'VIN must be exactly 17 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Update driver profile with vehicle information
      const { error } = await supabase
        .from('driver_profiles')
        .update({
          vehicle_type: vehicleData.type,
          vehicle_details: {
            make: vehicleData.make,
            model: vehicleData.model,
            year: parseInt(vehicleData.year),
            color: vehicleData.color,
            licensePlate: vehicleData.licensePlate,
            vin: vehicleData.vin || null,
            capacity: vehicleData.capacity || null,
            specialEquipment: vehicleData.specialEquipment || null,
            notes: vehicleData.notes || null
          }
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Vehicle information saved successfully');
      onComplete();

    } catch (error) {
      console.error('Error saving vehicle information:', error);
      toast.error('Failed to save vehicle information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof VehicleData, value: string) => {
    setVehicleData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle Information</h3>
        <p className="text-gray-600">
          Tell us about the vehicle you'll be using for deliveries
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Vehicle Type *</Label>
            <Select value={vehicleData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
          </div>

          {/* Make */}
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              placeholder="e.g., Toyota, Honda, Ford"
              value={vehicleData.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
              className={errors.make ? 'border-red-500' : ''}
            />
            {errors.make && <p className="text-sm text-red-500">{errors.make}</p>}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              placeholder="e.g., Camry, Civic, F-150"
              value={vehicleData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className={errors.model ? 'border-red-500' : ''}
            />
            {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g., 2020"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={vehicleData.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              className={errors.year ? 'border-red-500' : ''}
            />
            {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <Input
              id="color"
              placeholder="e.g., White, Black, Silver"
              value={vehicleData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className={errors.color ? 'border-red-500' : ''}
            />
            {errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
          </div>

          {/* License Plate */}
          <div className="space-y-2">
            <Label htmlFor="licensePlate">License Plate *</Label>
            <Input
              id="licensePlate"
              placeholder="e.g., ABC123"
              value={vehicleData.licensePlate}
              onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
              className={errors.licensePlate ? 'border-red-500' : ''}
            />
            {errors.licensePlate && <p className="text-sm text-red-500">{errors.licensePlate}</p>}
          </div>
        </div>

        {/* VIN */}
        {vehicleData.type && vehicleData.type !== 'bicycle' && vehicleData.type !== 'motorcycle' && (
          <div className="space-y-2">
            <Label htmlFor="vin">Vehicle Identification Number (VIN) *</Label>
            <Input
              id="vin"
              placeholder="17-character VIN"
              maxLength={17}
              value={vehicleData.vin}
              onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
              className={errors.vin ? 'border-red-500' : ''}
            />
            {errors.vin && <p className="text-sm text-red-500">{errors.vin}</p>}
            <p className="text-sm text-gray-500">
              Find the VIN on your dashboard, driver's side door, or vehicle registration
            </p>
          </div>
        )}

        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="capacity">Cargo Capacity (optional)</Label>
          <Input
            id="capacity"
            placeholder="e.g., 500 lbs, 2 cubic meters, 4 passengers"
            value={vehicleData.capacity}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Describe the carrying capacity of your vehicle
          </p>
        </div>

        {/* Special Equipment */}
        <div className="space-y-2">
          <Label htmlFor="specialEquipment">Special Equipment (optional)</Label>
          <Input
            id="specialEquipment"
            placeholder="e.g., Refrigeration, GPS tracker, Delivery bags"
            value={vehicleData.specialEquipment}
            onChange={(e) => handleInputChange('specialEquipment', e.target.value)}
          />
          <p className="text-sm text-gray-500">
            List any special equipment for deliveries
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about your vehicle..."
            value={vehicleData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="px-8">
            {isLoading ? 'Saving...' : 'Save Vehicle Information'}
          </Button>
        </div>
      </form>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Make sure all information is accurate. This will be verified against your vehicle registration and insurance documents.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VehicleInformation;
