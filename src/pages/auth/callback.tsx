
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Auth callback initiated');
        
        const urlParams = new URLSearchParams(window.location.search);
        const token_hash = urlParams.get('token_hash');
        const type = urlParams.get('type');
        const access_token = urlParams.get('access_token');
        const refresh_token = urlParams.get('refresh_token');
        
        console.log('Auth callback params:', { token_hash, type, access_token: !!access_token, refresh_token: !!refresh_token });
        
        if (token_hash && type) {
          console.log('Verifying OTP token...');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="text-center p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/2cc5b47e-c0a1-4e3c-91b8-6bb24e0b8f97.png" 
            alt="Catalyst Network Logistics" 
            className="h-12 w-auto"
            onError={(e) => {
              console.error('Logo failed to load');
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Verifying Your Access</h2>
        <p className="text-gray-600">Please wait while we securely confirm your email address and activate your driver account.</p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">🔐 Your data is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
