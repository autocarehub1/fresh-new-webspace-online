
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ProfileFormData } from '@/components/driver/profile-setup/types';
import { refreshDriversSchema } from '@/lib/schema-helper';

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
    
    console.log('=== DEBUG: Starting profile setup ===');
    console.log('User ID:', userId);
    console.log('User Email:', userEmail);
    console.log('Profile Data:', profileData);
    
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
      
      // First, check if the drivers table exists and what columns it has
      console.log('=== DEBUG: Checking drivers table schema ===');
      const { data: schemaCheck, error: schemaError } = await supabase
        .from('drivers')
        .select('*')
        .limit(1);
        
      console.log('Schema check result:', { schemaCheck, schemaError });
      
      if (schemaError) {
        console.error('Schema error details:', schemaError);
        if (schemaError.message.includes('relation "drivers" does not exist')) {
          throw new Error('The drivers table does not exist. Please run the database migration first.');
        }
        if (schemaError.message.includes('column') && schemaError.message.includes('does not exist')) {
          throw new Error('The drivers table is missing required columns. Please run the latest migration.');
        }
      }
      
      // Check if driver already exists
      console.log('=== DEBUG: Checking for existing driver ===');
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('id, name, email')
        .eq('id', userId)
        .maybeSingle();
        
      console.log('Existing driver check:', { existingDriver, checkError });
      
      if (existingDriver) {
        console.log('Driver already exists, redirecting to dashboard');
        toast.info("Your profile is already set up");
        navigate(`/driver/${userId}`);
        return;
      }
      
      // Upload photo if provided
      let photoUrl = '';
      if (profileData.photo) {
        console.log('=== DEBUG: Uploading photo ===');
        const fileExt = profileData.photo.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('driver-photos')
          .upload(fileName, profileData.photo, { upsert: true });
          
        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          console.warn('Continuing without photo');
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('driver-photos')
            .getPublicUrl(fileName);
            
          photoUrl = publicUrlData?.publicUrl || '';
          console.log('Photo uploaded successfully:', photoUrl);
        }
      }
      
      // Create driver profile
      console.log('=== DEBUG: Creating driver profile ===');
      const driverData = {
        id: userId,
        name: profileData.name.trim(),
        email: userEmail,
        phone: profileData.phone.trim(),
        vehicle_type: profileData.vehicle_type,
        photo: photoUrl,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Driver data to insert:', driverData);
      
      const { data: insertedDriver, error: profileError } = await supabase
        .from('drivers')
        .insert(driverData)
        .select()
        .single();
        
      console.log('Insert result:', { insertedDriver, profileError });
        
      if (profileError) {
        console.error('Driver profile creation error:', profileError);
        
        if (profileError.message.includes('column') && profileError.message.includes('does not exist')) {
          throw new Error('Database schema is missing required columns. Please run the migration: supabase/migrations/20250526_fix_drivers_table.sql');
        }
        
        if (profileError.message.includes('duplicate key value')) {
          throw new Error('A driver profile with this ID already exists.');
        }
        
        throw new Error(`Failed to create driver profile: ${profileError.message}`);
      }
      
      console.log('=== DEBUG: Driver profile created successfully ===');
      console.log('Inserted driver:', insertedDriver);
      
      // Update user metadata
      console.log('=== DEBUG: Updating user metadata ===');
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
        console.warn('Continuing despite metadata update error');
      } else {
        console.log('User metadata updated successfully');
      }
      
      console.log('=== DEBUG: Profile setup completed successfully ===');
      toast.success("Profile setup complete! Welcome to the driver portal.");
      navigate(`/driver/${userId}`);
      
    } catch (err: any) {
      console.error('=== DEBUG: Profile setup error ===', err);
      let errorMessage = 'Failed to set up profile';
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
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
