import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield, Truck, Clock, CheckCircle } from 'lucide-react';
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
      console.log('User authenticated, redirecting to driver dashboard');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-blue-400" />
          <p className="text-white text-lg">Loading Driver Portal...</p>
        </div>
      </div>
    );
  }

  // Password reset form
  if (showResetForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/2cc5b47e-c0a1-4e3c-91b8-6bb24e0b8f97.png" 
                alt="Catalyst Network Logistics" 
                className="h-20 w-auto filter brightness-0 invert"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Driver Portal</h1>
            <p className="text-blue-200">Secure Password Recovery</p>
          </div>
          <DriverPasswordResetForm 
            onBackToSignIn={() => setShowResetForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <img 
              src="/lovable-uploads/2cc5b47e-c0a1-4e3c-91b8-6bb24e0b8f97.png" 
              alt="Catalyst Network Logistics" 
              className="h-16 w-auto mr-4 filter brightness-0 invert"
              onError={(e) => {
                console.error('Logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Catalyst Network</h1>
              <p className="text-blue-200">Medical Logistics</p>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Professional Driver Portal
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-lg">
            Access your dashboard, manage deliveries, and track your performance with our advanced driver management system.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Secure Access</h3>
                <p className="text-blue-200">Multi-factor authentication and encrypted data</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Route Management</h3>
                <p className="text-blue-200">Optimized delivery routes and real-time tracking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">24/7 Support</h3>
                <p className="text-blue-200">Round-the-clock assistance for all drivers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/2cc5b47e-c0a1-4e3c-91b8-6bb24e0b8f97.png" 
                alt="Catalyst Network Logistics" 
                className="h-16 w-auto filter brightness-0 invert"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Driver Portal</h1>
            <p className="text-blue-200">Access your professional dashboard</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Sign in to access your driver dashboard or create a new account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {errors.general && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="signin" className="space-y-4 mt-6">
                  <DriverSignInForm 
                    onForgotPassword={() => setShowResetForm(true)}
                    errors={errors}
                    setErrors={setErrors}
                  />
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <DriverSignUpForm 
                    onSwitchToSignIn={() => setActiveTab('signin')}
                    errors={errors}
                    setErrors={setErrors}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-2 text-blue-200 text-sm">
              <CheckCircle className="w-4 h-4" />
              <p>HIPAA Compliant • Secure • Professional</p>
            </div>
            <p className="text-blue-200 text-sm mt-2">
              Need help? Contact our 24/7 driver support team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverAuth;
