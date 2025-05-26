
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ProfileData } from '@/components/driver/profile-completion/types';
import { validateProfileForm } from '@/components/driver/profile-completion/validation';
import { refreshDriversSchema } from '@/lib/schema-helper';

export const useProfileCompletion = (user: any, onComplete: () => void) => {
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

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateProfileForm(profileData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== DEBUG: Starting profile completion ===');
      console.log('User:', user);
      console.log('Profile data:', profileData);
      
      if (!user?.id) {
        throw new Error('User ID is required for profile update');
      }

      if (!user?.email) {
        throw new Error('User email is required for profile update');
      }

      // Check if the driver record exists first
      console.log('=== DEBUG: Checking if driver record exists ===');
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('id, name, email, phone, vehicle_type')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Existing driver check:', { existingDriver, checkError });

      if (checkError) {
        console.error('Error checking existing driver:', checkError);
        
        if (checkError.message.includes('relation "drivers" does not exist')) {
          throw new Error('The drivers table does not exist. Please run the database migration first.');
        }
        
        if (checkError.message.includes('column') && checkError.message.includes('does not exist')) {
          throw new Error('The drivers table is missing required columns. Please run the latest migration.');
        }
        
        throw new Error(`Failed to check existing driver: ${checkError.message}`);
      }

      if (!existingDriver) {
        console.error('No driver profile found for user:', user.id);
        throw new Error('Driver profile not found. Please complete the initial profile setup first by going to /driver-profile-setup');
      }

      console.log('=== DEBUG: Existing driver found, updating profile ===');

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

      console.log('=== DEBUG: Updating driver with data ===', updateData);

      const { data: updatedDriver, error: updateError } = await supabase
        .from('drivers')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      console.log('Update result:', { updatedDriver, updateError });

      if (updateError) {
        console.error('Profile update error:', updateError);
        
        if (updateError.message.includes('column') && updateError.message.includes('does not exist')) {
          throw new Error('Database schema is missing required columns. Please run the migration: supabase/migrations/20250526_fix_drivers_table.sql');
        }
        
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      console.log('=== DEBUG: Profile updated successfully ===', updatedDriver);

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          profile_completed: true,
          onboarding_completed: true
        }
      });

      if (metadataError) {
        console.warn('Metadata update warning:', metadataError.message);
      }

      console.log('=== DEBUG: Profile completion successful ===');
      toast.success('Profile completed successfully');
      onComplete();

    } catch (error: any) {
      console.error('=== DEBUG: Error updating profile ===', error);
      let errorMessage = 'Failed to update profile';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profileData,
    errors,
    isLoading,
    handleInputChange,
    handleSubmit
  };
};
