
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Auth callback initiated');
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token_hash = urlParams.get('token_hash');
        const type = urlParams.get('type');
        const access_token = urlParams.get('access_token');
        const refresh_token = urlParams.get('refresh_token');
        
        console.log('Auth callback params:', { token_hash, type, access_token: !!access_token, refresh_token: !!refresh_token });
        
        if (token_hash && type) {
          console.log('Verifying OTP token...');
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
            navigate('/driver-auth?verified=true');
          } else {
            throw new Error('No user data returned from verification');
          }
        } else if (access_token && refresh_token) {
          console.log('Setting session from tokens...');
          // Handle OAuth callback or other auth flows
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error('Session set error:', error);
            throw error;
          }

          if (data?.user) {
            toast.success('Authentication successful!');
            console.log('Authentication successful:', data.user);
            navigate('/driver-dashboard');
          }
        } else {
          // Fallback: check if user is already logged in and verified
          console.log('Checking existing session...');
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error('Get user error:', error);
            throw error;
          }
          
          if (user?.email_confirmed_at) {
            toast.success('Email already verified!');
            navigate('/driver-auth?verified=true');
          } else {
            console.log('No valid authentication found, redirecting to sign in');
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
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/2cc5b47e-c0a1-4e3c-91b8-6bb24e0b8f97.png" 
            alt="Company Logo" 
            className="h-12 w-auto"
            onError={(e) => {
              console.error('Logo failed to load');
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Verifying your email...</h2>
        <p className="text-gray-500">Please wait while we confirm your email address.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
