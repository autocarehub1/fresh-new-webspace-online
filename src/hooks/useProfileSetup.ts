
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ProfileFormData } from '@/components/driver/profile-setup/types';

export const useProfileSetup = (userId: string, userEmail: string) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (profileData: ProfileFormData) => {
    const errors: Record<string, string> = {};
    
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!profileData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(profileData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!profileData.vehicle_type) {
      errors.vehicle_type = 'Please select a vehicle type';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (profileData: ProfileFormData) => {
    setLoading(true);
    setError(null);
    
    console.log('Starting profile setup for user:', userId);
    
    if (!validateForm(profileData)) {
      setLoading(false);
      return;
    }
    
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      if (!userEmail) {
        throw new Error("User email is required");
      }
      
      // 1. Upload photo if provided
      let photoUrl = '';
      if (profileData.photo) {
        console.log('Uploading photo...');
        const fileExt = profileData.photo.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('driver-photos')
          .upload(fileName, profileData.photo, { upsert: true });
          
        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Don't fail the whole process for photo upload issues
          console.warn('Continuing without photo');
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('driver-photos')
            .getPublicUrl(fileName);
            
          photoUrl = publicUrlData?.publicUrl || '';
          console.log('Photo uploaded successfully:', photoUrl);
        }
      }
      
      // 2. Create driver profile in drivers table
      console.log('Creating driver profile...');
      const driverData = {
        id: userId,
        name: profileData.name.trim(),
        email: userEmail,
        phone: profileData.phone.trim(),
        vehicle_type: profileData.vehicle_type,
        photo: photoUrl,
        status: 'active',
        current_location: { lat: 0, lng: 0 }, // Default location
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Driver data to insert:', driverData);
      
      const { data: insertedDriver, error: profileError } = await supabase
        .from('drivers')
        .insert(driverData)
        .select()
        .single();
        
      if (profileError) {
        console.error('Driver profile creation error:', profileError);
        throw new Error(`Failed to create driver profile: ${profileError.message}`);
      }
      
      console.log('Driver profile created successfully:', insertedDriver);
      
      // 3. Update user metadata
      console.log('Updating user metadata...');
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name.trim(),
          phone: profileData.phone.trim(),
          vehicle_type: profileData.vehicle_type,
          has_completed_profile: true,
          onboarding_completed: true,
          driver_id: userId
        }
      });
      
      if (updateError) {
        console.error('User metadata update error:', updateError);
        // Don't fail the whole process for metadata update issues
        console.warn('Continuing despite metadata update error');
      }
      
      console.log('Profile setup completed successfully');
      toast.success("Profile setup complete! Welcome to the driver portal.");
      navigate(`/driver/${userId}`);
      
    } catch (err: any) {
      console.error('Profile setup error:', err);
      let errorMessage = 'Failed to set up profile';
      
      if (err?.message) {
        errorMessage = `Failed to set up profile: ${err.message}`;
      } else if (err?.error?.message) {
        errorMessage = `Failed to set up profile: ${err.error.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Failed to set up profile: ${err}`;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    validationErrors,
    handleSubmit
  };
};
