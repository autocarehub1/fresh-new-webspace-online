import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token_hash = urlParams.get('token_hash');
        const type = urlParams.get('type');
        
        console.log('Auth callback params:', { token_hash, type }); // Debug log
        
        if (token_hash && type) {
          // Verify the OTP token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error('OTP verification error:', error);
            throw error;
          }

          if (data?.user) {
            toast.success('Email verified successfully!');
            console.log('Email verification successful:', data.user);
            
            // Update the driver profile to mark email as verified
            try {
              const { error: profileError } = await supabase
                .from('driver_profiles')
                .update({ email_verified: true })
                .eq('user_id', data.user.id);
                
              if (profileError) {
                console.error('Profile update error:', profileError);
              }
            } catch (profileErr) {
              console.error('Failed to update profile:', profileErr);
            }
            
            navigate('/driver-auth?verified=true');
          } else {
            throw new Error('No user data returned from verification');
          }
        } else {
          // Fallback: check if user is already logged in and verified
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) throw error;
          
          if (user?.email_confirmed_at) {
            toast.success('Email already verified!');
            navigate('/driver-auth?verified=true');
          } else {
            toast.error('Email verification failed. Invalid or expired link.');
            navigate('/driver-auth');
          }
        }
      } catch (err: any) {
        console.error('Email confirmation error:', err);
        const errorMessage = err.message || 'Failed to verify email';
        toast.error(errorMessage);
        navigate('/driver-auth?error=' + encodeURIComponent(errorMessage));
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-4">Verifying your email...</h2>
        <p className="text-gray-500">Please wait while we confirm your email address.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 