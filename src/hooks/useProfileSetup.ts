
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ProfileFormData } from '@/components/driver/profile-setup/types';

export const useProfileSetup = (userId: string, userEmail: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const sendDriverWelcomeEmail = async (driverName: string, email: string) => {
    try {
      const origin = window.location.origin;
      const baseUrl = origin.includes('localhost') 
        ? `https://joziqntfciyflfsgvsqz.supabase.co`
        : origin;

      const response = await fetch(`${baseUrl}/functions/v1/send-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          status: 'driver_welcome',
          driver_name: driverName,
          id: userId
        }),
      });

      if (response.ok) {
        console.log('Driver welcome email sent successfully');
      } else {
        console.log('Email service unavailable, continuing without email');
      }
    } catch (error) {
      console.log('Email notification failed, continuing:', error);
    }
  };

  const handleSubmit = async (profileData: ProfileFormData) => {
    // Reset errors
    setError(null);
    setValidationErrors({});
    
    // Validate required fields
    const errors: Record<string, string> = {};
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!profileData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!profileData.vehicle_type.trim()) {
      errors.vehicle_type = 'Vehicle type is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);

    try {
      console.log('Creating driver profile for:', userId);
      
      let photoUrl = '';
      
      // Upload photo if provided
      if (profileData.photo) {
        const fileExt = profileData.photo.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('driver-photos')
          .upload(fileName, profileData.photo, { upsert: true });

        if (uploadError) {
          console.warn('Photo upload failed:', uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('driver-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrlData.publicUrl;
        }
      }

      // Create driver profile
      const { data, error: insertError } = await supabase
        .from('drivers')
        .insert({
          id: userId,
          email: userEmail,
          name: profileData.name,
          phone: profileData.phone,
          vehicle_type: profileData.vehicle_type,
          photo_url: photoUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }

      console.log('Driver profile created successfully:', data);

      // Send welcome email
      await sendDriverWelcomeEmail(profileData.name, userEmail);

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          profile_setup_completed: true,
          driver_name: profileData.name 
        }
      });

      if (metadataError) {
        console.warn('Metadata update warning:', metadataError.message);
      }

      toast.success('Driver profile created successfully! Welcome email sent.');
      navigate(`/driver/${userId}`);

    } catch (error: any) {
      console.error('Profile setup error:', error);
      const errorMessage = error?.message || 'Failed to create profile';
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
