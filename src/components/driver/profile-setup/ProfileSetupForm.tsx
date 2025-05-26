
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { ProfileFormData } from './types';

interface ProfileSetupFormProps {
  profileData: ProfileFormData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  photoPreview: string | null;
  setPhotoPreview: (preview: string | null) => void;
  validationErrors: Record<string, string>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const vehicleTypes = [
  'Car', 'SUV', 'Van', 'Pickup Truck', 'Box Truck', 'Motorcycle', 'Bicycle', 'Other'
];

const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({
  profileData,
  setProfileData,
  photoPreview,
  setPhotoPreview,
  validationErrors,
  loading,
  onSubmit
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Complete Your Driver Profile</CardTitle>
        <CardDescription>
          Please provide the following information to start accepting deliveries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
            <Input
              id="name"
              value={profileData.name}
              onChange={e => setProfileData({ ...profileData, name: e.target.value })}
              required
              disabled={loading}
              className={validationErrors.name ? 'border-red-500' : ''}
              placeholder="Enter your full name"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone Number</label>
            <Input
              id="phone"
              type="tel"
              value={profileData.phone}
              onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
              required
              disabled={loading}
              className={validationErrors.phone ? 'border-red-500' : ''}
              placeholder="+1 (555) 555-5555"
            />
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="vehicle">Vehicle Type</label>
            <select
              id="vehicle"
              className={`w-full border rounded px-3 py-2 ${validationErrors.vehicle_type ? 'border-red-500' : 'border-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={profileData.vehicle_type}
              onChange={e => setProfileData({ ...profileData, vehicle_type: e.target.value })}
              required
              disabled={loading}
            >
              <option value="">Select your vehicle type</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {validationErrors.vehicle_type && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.vehicle_type}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="photo">Profile Photo (Optional)</label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setProfileData({ ...profileData, photo: e.target.files[0] });
                  setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              disabled={loading}
            />
            {photoPreview && (
              <div className="mt-2 flex justify-center">
                <img src={photoPreview} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border" />
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Setting Up...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSetupForm;
