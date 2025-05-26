
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ProfileData } from '@/components/driver/profile-completion/types';
import { validateProfileForm } from '@/components/driver/profile-completion/validation';
import { refreshSchemaCache } from '@/lib/supabase';

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
      console.log('Updating driver profile with additional information for user:', user.id);
      
      if (!user?.id) {
        throw new Error('User ID is required for profile update');
      }

      if (!user?.email) {
        throw new Error('User email is required for profile update');
      }

      // First, try to refresh the schema cache
      console.log('Refreshing schema cache...');
      await refreshSchemaCache();

      // Check if the driver record exists first
      console.log('Checking if driver record exists...');
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('id, name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing driver:', checkError);
        throw new Error(`Failed to check existing driver: ${checkError.message}`);
      }

      if (!existingDriver) {
        throw new Error('Driver profile not found. Please complete the initial profile setup first.');
      }

      console.log('Existing driver found:', existingDriver);

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
        
        // Provide more specific error messages based on the error
        if (updateError.message.includes('column') && updateError.message.includes('does not exist')) {
          throw new Error('Database schema is not up to date. Please contact support or try refreshing the page.');
        }
        
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
