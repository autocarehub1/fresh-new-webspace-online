
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import LoadingState from '@/components/driver/profile-setup/LoadingState';
import ErrorAlert from '@/components/driver/profile-setup/ErrorAlert';
import ProfileSetupForm from '@/components/driver/profile-setup/ProfileSetupForm';
import { useProfileSetup } from '@/hooks/useProfileSetup';
import { ProfileFormData } from '@/components/driver/profile-setup/types';

const DriverProfileSetup = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Show loading state while auth is initializing
  if (isLoading) {
    return <LoadingState />;
  }

  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    vehicle_type: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Get userId from location state or current user
  const userId = location.state?.userId || user?.id;
  const userEmail = user?.email || '';
  
  const { loading, error, validationErrors, handleSubmit } = useProfileSetup(userId, userEmail);
  
  useEffect(() => {
    // Redirect if no user
    if (!userId) {
      toast.error("Authentication required");
      navigate('/driver-auth');
      return;
    }
    
    // Pre-fill name if available from user metadata
    const firstName = user?.user_metadata?.first_name || '';
    const lastName = user?.user_metadata?.last_name || '';
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    
    if (fullName) {
      setProfileData(prev => ({ ...prev, name: fullName }));
    } else if (firstName || lastName) {
      setProfileData(prev => ({ ...prev, name: `${firstName} ${lastName}`.trim() }));
    }
    
    // Pre-fill phone if available
    const phone = user?.user_metadata?.phone || '';
    if (phone) {
      setProfileData(prev => ({ ...prev, phone }));
    }
    
    // Check if user already has a profile
    const checkProfile = async () => {
      try {
        console.log('Checking for existing profile for user:', userId);
        
        // Check drivers table
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (driverData && !driverError) {
          console.log('Driver profile exists, redirecting to dashboard');
          toast.info("Your profile is already set up");
          navigate(`/driver/${userId}`);
          return;
        }
        
        console.log('No existing profile found, continuing with setup');
      } catch (err) {
        console.log('No profile exists, that\'s expected for new users');
      }
    };
    
    checkProfile();
  }, [userId, user, navigate]);
  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(profileData);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      {error && <ErrorAlert error={error} />}
      <ProfileSetupForm
        profileData={profileData}
        setProfileData={setProfileData}
        photoPreview={photoPreview}
        setPhotoPreview={setPhotoPreview}
        validationErrors={validationErrors}
        loading={loading}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default DriverProfileSetup;
