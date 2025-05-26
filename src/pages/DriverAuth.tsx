import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const DriverAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user, isLoading } = useAuth();
  
  // Form states
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: ''
  });

  const [resetEmail, setResetEmail] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Validation helpers
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateSignInForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signInData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signInData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signInData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUpForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signUpData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!signUpData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!signUpData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signUpData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signUpData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(signUpData.password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (!signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!signUpData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!signUpData.licenseNumber) {
      newErrors.licenseNumber = 'Driver license number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setErrors({ resetEmail: 'Email is required' });
      return;
    }
    
    if (!validateEmail(resetEmail)) {
      setErrors({ resetEmail: 'Please enter a valid email address' });
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setErrors({ resetEmail: error.message });
      } else {
        toast.success('Password reset email sent! Check your inbox.');
        setShowResetForm(false);
        setResetEmail('');
      }
    } catch (error) {
      setErrors({ resetEmail: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in form submitted');
    
    if (!validateSignInForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log('Attempting to sign in with:', signInData.email);
      const { error } = await signIn(signInData.email, signInData.password, signInData.rememberMe);
      
      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the verification link before signing in.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        console.log('Sign in successful');
        toast.success('Welcome back! Redirecting to your dashboard...');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up form submitted');
    
    if (!validateSignUpForm()) {
      console.log('Sign up validation failed');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const metadata = {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        phone: signUpData.phone,
        license_number: signUpData.licenseNumber,
        user_type: 'driver',
        onboarding_completed: false
      };
      
      console.log('Attempting to sign up with:', signUpData.email, metadata);
      const { error, user } = await signUp(signUpData.email, signUpData.password, metadata);
      
      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('already registered')) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' });
          setActiveTab('signin');
        } else {
          setErrors({ general: error.message });
        }
      } else if (user) {
        console.log('Sign up successful');
        toast.success('Account created successfully! Please check your email for verification.');
        setSignUpData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          licenseNumber: ''
        });
        setActiveTab('signin');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResetForm(false)}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>Reset Password</CardTitle>
                  <CardDescription>
                    Enter your email to receive a password reset link
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {errors.resetEmail && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.resetEmail}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (errors.resetEmail) setErrors({ ...errors, resetEmail: '' });
                    }}
                    className={errors.resetEmail ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
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
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) => {
                        setSignInData({ ...signInData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={errors.email ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => {
                          setSignInData({ ...signInData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember-me"
                        checked={signInData.rememberMe}
                        onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                        className="rounded border-gray-300"
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResetForm(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
                      disabled={isSubmitting}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Keep existing signup form exactly the same */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={signUpData.firstName}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, firstName: e.target.value });
                          if (errors.firstName) setErrors({ ...errors, firstName: '' });
                        }}
                        className={errors.firstName ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={signUpData.lastName}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, lastName: e.target.value });
                          if (errors.lastName) setErrors({ ...errors, lastName: '' });
                        }}
                        className={errors.lastName ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={signUpData.email}
                      onChange={(e) => {
                        setSignUpData({ ...signUpData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={errors.email ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={signUpData.phone}
                      onChange={(e) => {
                        setSignUpData({ ...signUpData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      className={errors.phone ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Driver License Number</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="DL123456789"
                      value={signUpData.licenseNumber}
                      onChange={(e) => {
                        setSignUpData({ ...signUpData, licenseNumber: e.target.value });
                        if (errors.licenseNumber) setErrors({ ...errors, licenseNumber: '' });
                      }}
                      className={errors.licenseNumber ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.licenseNumber && <p className="text-sm text-red-500">{errors.licenseNumber}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={signUpData.password}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => {
                          setSignUpData({ ...signUpData, confirmPassword: e.target.value });
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                        }}
                        className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
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
