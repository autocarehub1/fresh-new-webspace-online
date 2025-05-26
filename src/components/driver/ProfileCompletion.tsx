
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileCompletionProps {
  user: SupabaseUser;
  onComplete: () => void;
}

interface ProfileData {
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  workExperience: string;
  availability: string;
  preferredAreas: string;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ user, onComplete }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    workExperience: '',
    availability: '',
    preferredAreas: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'Must be at least 18 years old';
      }
    }

    if (!profileData.address) {
      newErrors.address = 'Address is required';
    }

    if (!profileData.city) {
      newErrors.city = 'City is required';
    }

    if (!profileData.state) {
      newErrors.state = 'State is required';
    }

    if (!profileData.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(profileData.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format';
    }

    if (!profileData.emergencyContactName) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }

    if (!profileData.emergencyContactPhone) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(profileData.emergencyContactPhone)) {
      newErrors.emergencyContactPhone = 'Invalid phone number format';
    }

    if (!profileData.emergencyContactRelation) {
      newErrors.emergencyContactRelation = 'Emergency contact relation is required';
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
      console.log('Updating driver profile with additional information for user:', user.id);
      
      if (!user?.id) {
        throw new Error('User ID is required for profile update');
      }

      if (!user?.email) {
        throw new Error('User email is required for profile update');
      }

      // Update the existing driver record with additional profile information
      const updateData = {
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zipCode,
        date_of_birth: profileData.dateOfBirth,
        emergency_contact_name: profileData.emergencyContactName,
        emergency_contact_phone: profileData.emergencyContactPhone,
        emergency_contact_relation: profileData.emergencyContactRelation,
        work_experience: profileData.workExperience,
        availability: profileData.availability,
        preferred_areas: profileData.preferredAreas,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };

      console.log('Updating driver with data:', updateData);

      const { data: updatedDriver, error: updateError } = await supabase
        .from('drivers')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      console.log('Profile updated successfully:', updatedDriver);

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          profile_completed: true,
          onboarding_completed: true
        }
      });

      if (metadataError) {
        console.warn('Metadata update warning:', metadataError.message);
        // Don't fail the whole process for metadata issues
      }

      console.log('Profile completion successful');
      toast.success('Profile completed successfully');
      onComplete();

    } catch (error: any) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error?.message) {
        errorMessage = `Failed to update profile: ${error.message}`;
      } else if (error?.error?.message) {
        errorMessage = `Failed to update profile: ${error.error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `Failed to update profile: ${error}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const relations = [
    'Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other Family Member', 'Other'
  ];

  const availabilityOptions = [
    { value: 'full-time', label: 'Full-time (40+ hours/week)' },
    { value: 'part-time', label: 'Part-time (20-39 hours/week)' },
    { value: 'weekends', label: 'Weekends only' },
    { value: 'evenings', label: 'Evenings only' },
    { value: 'flexible', label: 'Flexible schedule' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile</h3>
        <p className="text-gray-600">
          Help us learn more about you to provide the best delivery experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <CardDescription>Basic information about you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
                max={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address Information</CardTitle>
            <CardDescription>Your current residential address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={profileData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={profileData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  placeholder="12345"
                  value={profileData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
            <CardDescription>Someone we can contact in case of emergency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Full Name *</Label>
              <Input
                id="emergencyContactName"
                placeholder="Emergency contact full name"
                value={profileData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                className={errors.emergencyContactName ? 'border-red-500' : ''}
              />
              {errors.emergencyContactName && <p className="text-sm text-red-500">{errors.emergencyContactName}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
                <Input
                  id="emergencyContactPhone"
                  placeholder="(555) 123-4567"
                  value={profileData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', formatPhoneNumber(e.target.value))}
                  className={errors.emergencyContactPhone ? 'border-red-500' : ''}
                />
                {errors.emergencyContactPhone && <p className="text-sm text-red-500">{errors.emergencyContactPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">Relationship *</Label>
                <Select value={profileData.emergencyContactRelation} onValueChange={(value) => handleInputChange('emergencyContactRelation', value)}>
                  <SelectTrigger className={errors.emergencyContactRelation ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relations.map((relation) => (
                      <SelectItem key={relation} value={relation.toLowerCase()}>
                        {relation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.emergencyContactRelation && <p className="text-sm text-red-500">{errors.emergencyContactRelation}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Work Preferences</CardTitle>
            <CardDescription>Tell us about your availability and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select value={profileData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredAreas">Preferred Delivery Areas</Label>
              <Input
                id="preferredAreas"
                placeholder="e.g., Downtown, Westside, Airport area"
                value={profileData.preferredAreas}
                onChange={(e) => handleInputChange('preferredAreas', e.target.value)}
              />
              <p className="text-sm text-gray-500">List areas where you prefer to make deliveries (optional)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workExperience">Previous Delivery Experience</Label>
              <Textarea
                id="workExperience"
                placeholder="Describe any previous delivery or driving experience..."
                value={profileData.workExperience}
                onChange={(e) => handleInputChange('workExperience', e.target.value)}
                rows={3}
              />
              <p className="text-sm text-gray-500">Optional: Tell us about your experience (if any)</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="px-8">
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCompletion;
