
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import DriverSignInForm from '@/components/auth/DriverSignInForm';
import DriverSignUpForm from '@/components/auth/DriverSignUpForm';
import DriverPasswordResetForm from '@/components/auth/DriverPasswordResetForm';

const DriverAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('signin');
  const [showResetForm, setShowResetForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for URL parameters
  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');
    
    if (verified === 'true') {
      toast.success('Email verified successfully! You can now sign in.');
      setActiveTab('signin');
    } else if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      console.log('User authenticated, redirecting to driver dashboard or onboarding');
      // Check if user needs onboarding
      const userMetadata = user.user_metadata;
      if (!userMetadata?.onboarding_completed) {
        navigate('/driver-onboarding');
      } else {
        navigate('/driver-dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Password reset form
  if (showResetForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <DriverPasswordResetForm 
          onBackToSignIn={() => setShowResetForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Portal</h1>
          <p className="text-gray-600">Access your driver dashboard</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4">
                <DriverSignInForm 
                  onForgotPassword={() => setShowResetForm(true)}
                  errors={errors}
                  setErrors={setErrors}
                />
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <DriverSignUpForm 
                  onSwitchToSignIn={() => setActiveTab('signin')}
                  errors={errors}
                  setErrors={setErrors}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Need help? Contact support for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default DriverAuth;
