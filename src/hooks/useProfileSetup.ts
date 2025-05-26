
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
    
    console.log('=== Starting driver profile setup ===');
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);
    console.log('Profile Data:', profileData);
    
    if (!validateForm(profileData)) {
      setLoading(false);
      return;
    }
    
    try {
      if (!userId) {
        throw new Error("Please log in to continue with profile setup");
      }

      if (!userEmail) {
        throw new Error("Email is required for profile setup");
      }
      
      // Check if driver already exists
      console.log('Checking for existing driver profile...');
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('id, name, email')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing driver:', checkError);
        if (checkError.message.includes('relation "drivers" does not exist')) {
          throw new Error('Database not properly configured. Please contact support.');
        }
        throw new Error('Unable to check existing profile. Please try again.');
      }
        
      if (existingDriver) {
        console.log('Driver profile already exists, redirecting...');
        toast.success("Profile already exists! Redirecting to dashboard...");
        navigate(`/driver/${userId}`);
        return;
      }
      
      // Upload photo if provided
      let photoUrl = '';
      if (profileData.photo) {
        console.log('Uploading profile photo...');
        try {
          const fileExt = profileData.photo.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('driver-photos')
            .upload(fileName, profileData.photo, { upsert: true });
            
          if (uploadError) {
            console.warn('Photo upload failed, continuing without photo:', uploadError);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('driver-photos')
              .getPublicUrl(fileName);
              
            photoUrl = publicUrlData?.publicUrl || '';
            console.log('Photo uploaded successfully');
          }
        } catch (photoError) {
          console.warn('Photo upload error, continuing without photo:', photoError);
        }
      }
      
      // Create driver profile with essential fields
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
        created_at: new Date().toISOString()
      };
      
      console.log('Inserting driver data:', driverData);
      
      const { data: insertedDriver, error: insertError } = await supabase
        .from('drivers')
        .insert(driverData)
        .select()
        .single();
        
      if (insertError) {
        console.error('Driver profile creation error:', insertError);
        
        if (insertError.message.includes('duplicate key value')) {
          throw new Error('A profile with this information already exists.');
        }
        
        if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
          throw new Error('Database schema needs to be updated. Please contact support.');
        }
        
        throw new Error('Failed to create profile. Please try again.');
      }
      
      console.log('Driver profile created successfully:', insertedDriver);
      
      // Update user metadata
      try {
        await supabase.auth.updateUser({
          data: {
            name: profileData.name.trim(),
            phone: profileData.phone.trim(),
            vehicle_type: profileData.vehicle_type,
            has_completed_profile: true,
            driver_id: userId
          }
        });
        console.log('User metadata updated successfully');
      } catch (metadataError) {
        console.warn('Metadata update failed, but continuing:', metadataError);
      }
      
      console.log('Profile setup completed successfully');
      toast.success("Profile created successfully! Welcome to the driver portal.");
      navigate(`/driver/${userId}`);
      
    } catch (err: any) {
      console.error('Profile setup error:', err);
      let errorMessage = 'Failed to set up profile. Please try again.';
      
      if (err?.message) {
        errorMessage = err.message;
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
