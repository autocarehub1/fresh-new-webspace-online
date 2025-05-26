
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
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    vehicle_type: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  
  // Get userId from location state or current user
  const userId = location.state?.userId || user?.id;
  const userEmail = user?.email || '';
  
  const { loading, error, validationErrors, handleSubmit } = useProfileSetup(userId, userEmail);
  
  useEffect(() => {
    const initializeProfileSetup = async () => {
      try {
        // Wait for auth to load
        if (authLoading) {
          return;
        }
        
        // Check if user is authenticated
        if (!userId) {
          console.log('No user found, redirecting to auth');
          toast.error("Please log in to continue");
          navigate('/driver-auth');
          return;
        }
        
        console.log('Initializing profile setup for user:', userId);
        
        // Pre-fill user data if available
        const firstName = user?.user_metadata?.first_name || '';
        const lastName = user?.user_metadata?.last_name || '';
        const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
        const phone = user?.user_metadata?.phone || '';
        
        if (fullName) {
          setProfileData(prev => ({ ...prev, name: fullName }));
        } else if (firstName || lastName) {
          setProfileData(prev => ({ ...prev, name: `${firstName} ${lastName}`.trim() }));
        }
        
        if (phone) {
          setProfileData(prev => ({ ...prev, phone }));
        }
        
        // Check if profile already exists
        try {
          const { data: existingDriver, error: checkError } = await supabase
            .from('drivers')
            .select('id, name, email')
            .eq('id', userId)
            .maybeSingle();
            
          if (existingDriver && !checkError) {
            console.log('Profile already exists, redirecting to dashboard');
            toast.info("Your profile is already set up");
            navigate(`/driver/${userId}`);
            return;
          }
          
          if (checkError && !checkError.message.includes('relation "drivers" does not exist')) {
            console.warn('Error checking existing profile:', checkError);
          }
          
        } catch (err) {
          console.log('Profile check failed, continuing with setup:', err);
        }
        
        console.log('Profile setup ready');
        
      } catch (error) {
        console.error('Error initializing profile setup:', error);
        toast.error("Error initializing profile setup");
      } finally {
        setInitializing(false);
      }
    };
    
    initializeProfileSetup();
  }, [userId, user, navigate, authLoading]);
  
  // Show loading while auth or initialization is in progress
  if (authLoading || initializing) {
    return <LoadingState />;
  }
  
  // If no user after loading, redirect (should have happened in useEffect)
  if (!userId) {
    return <LoadingState />;
  }
  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(profileData);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
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
    </div>
  );
};

export default DriverProfileSetup;
