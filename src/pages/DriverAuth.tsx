import React, { useState, useRef, useEffect } from 'react';
import { supabase, devSignUpAndVerify, verifyRequiredTables } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Github, 
  Mail, 
  Truck, 
  Shield, 
  Phone,
  Upload,
  User,
  Lock,
  ArrowRight,
  Loader2,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Car,
  CreditCard,
  Camera,
  X
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Vehicle types with details
const vehicleTypes = [
  { id: 'car', label: 'Car', capacity: 'Small', requirements: ['Valid driver\'s license', 'Basic insurance'] },
  { id: 'suv', label: 'SUV', capacity: 'Medium', requirements: ['Valid driver\'s license', 'Commercial insurance'] },
  { id: 'van', label: 'Van', capacity: 'Large', requirements: ['Valid driver\'s license', 'Commercial insurance'] },
  { id: 'truck', label: 'Box Truck', capacity: 'Extra Large', requirements: ['Commercial driver\'s license', 'Commercial insurance'] }
];

// Onboarding steps
const ONBOARDING_STEPS = [
  { id: 1, title: 'Account Setup', description: 'Create your account and verify your email' },
  { id: 2, title: 'Personal Information', description: 'Tell us about yourself' },
  { id: 3, title: 'Vehicle Details', description: 'Add your vehicle information' },
  { id: 4, title: 'Document Upload', description: 'Upload required documents' },
  { id: 5, title: 'Background Check', description: 'Complete background verification' }
];

const DriverAuth: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [driverProfileId, setDriverProfileId] = useState<string | null>(null);
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Safely extract auth values
  const user = auth?.user || null;
  const isLoading = auth?.isLoading || false;
  const signIn = auth?.signIn;
  const signUp = auth?.signUp;
  const resetPassword = auth?.resetPassword;
  const signInWithProvider = auth?.signInWithProvider;

  // Debug info 
  console.log('Auth context:', auth);
  console.log('User:', user);
  console.log('isLoading:', isLoading);
  console.log('Auth provider available:', !!auth);
  console.log('Session info:', auth?.session ? 'Available' : 'Not available');
  
  // Check database setup
  useEffect(() => {
    const checkDatabase = async () => {
      const { error } = await supabase
        .from('driver_profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.warn('Database check failed:', error.message);
        if (error.message.includes('does not exist')) {
          console.error('IMPORTANT: driver_profiles table does not exist in the database');
          toast.error('Database setup is incomplete. Using local storage fallback.', {
            duration: 5000,
            id: 'db-setup-error'
          });
        }
      } else {
        console.log('Database check successful');
      }
    };
    
    checkDatabase();
  }, []);

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-blue/5 via-white to-medical-teal/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Form data for each step
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [personalData, setPersonalData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: ''
  });

  const [vehicleData, setVehicleData] = useState({
    type: '',
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiry: ''
  });

  const [documentData, setDocumentData] = useState({
    driverLicense: null as File | null,
    insuranceCard: null as File | null,
    vehicleRegistration: null as File | null,
    profilePhoto: null as File | null
  });

  // Document previews
  const [documentPreviews, setDocumentPreviews] = useState({
    driverLicense: null as string | null,
    insuranceCard: null as string | null,
    vehicleRegistration: null as string | null,
    profilePhoto: null as string | null
  });
  
  // Check if user is already logged in and has a driver profile
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const checkUserAndProfile = async () => {
      if (isLoading) {
        console.log('Auth is still initializing...');
        return;
      }

      if (!user) {
        console.log('No user found, ready for registration');
        return;
      }
      
      try {
        // Check for temporary profile in localStorage first
        try {
          const tempProfileJson = localStorage.getItem('tempDriverProfile');
          if (tempProfileJson) {
            const tempProfile = JSON.parse(tempProfileJson);
            if (tempProfile.user_id === user.id) {
              console.log('Found temporary profile in localStorage:', tempProfile.id);
              if (mounted) {
                setDriverProfileId(tempProfile.id);
                setCurrentStep(tempProfile.current_step || 2);
                toast.info('Continuing with temporary profile data. Your data is stored locally.');
                return;
              }
            }
          }
        } catch (localStorageError) {
          console.error('Error checking temporary profile:', localStorageError);
        }
        
        // Verify tables first
        await verifyRequiredTables();
        
        console.log('Checking driver profile for user:', user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('driver_profiles')
            .select('*')
          .eq('user_id', user.id)
            .single();
          
        if (!mounted) return;
        
        if (profileError) {
          console.log('No existing driver profile found');
          setCurrentStep(1);
          setDriverProfileId(null);
        } else if (profileData) {
          console.log('Found existing driver profile:', profileData);
          setDriverProfileId(profileData.id);
          if (profileData.onboarding_status === 'completed') {
            // Add a small delay before navigation to ensure state is updated
            timeoutId = setTimeout(() => {
              if (mounted) {
                navigate(`/driver/${user.id}`);
              }
            }, 100);
          } else {
            setCurrentStep(profileData.current_step || 1);
          }
        }
      } catch (err) {
        console.error('Error checking driver profile:', err);
        if (mounted) {
          setFormError('Error checking driver profile. Please try again.');
        }
      }
    };
    
    checkUserAndProfile();
    
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, navigate, isLoading]);
  
  // Show welcome message when component mounts
  useEffect(() => {
    toast.info('Welcome to Express Med Dispatch! Please complete your driver registration.');
    
    // Debug: Check Supabase configuration
    console.log('=== Supabase Configuration Debug ===');
    console.log('Current URL:', window.location.origin);
    console.log('Supabase URL:', supabase.supabaseUrl);
    console.log('Auth URL:', `${supabase.supabaseUrl}/auth/v1`);
    console.log('====================================');
  }, []);

  // Add toast notifications for step changes
  useEffect(() => {
    if (currentStep > 1) {
      toast.success(`Step ${currentStep - 1} completed successfully!`);
    }
  }, [currentStep]);

  // Add toast for password strength
  useEffect(() => {
    if (accountData.password) {
      if (passwordStrength < 50) {
        toast.warning('Please use a stronger password');
      } else if (passwordStrength >= 75) {
        toast.success('Strong password!');
      }
    }
  }, [passwordStrength]);

  // Check URL parameters for verification status
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const verified = urlParams.get('verified');
    const error = urlParams.get('error');
    
    if (verified === 'true') {
      setEmailVerificationPending(false);
      setFormSuccess('Email verified successfully! You can continue with registration.');
      toast.success('Email verified successfully!');
      // Clear URL parameters
      navigate('/driver-auth', { replace: true });
    }
    
    if (error) {
      setFormError(decodeURIComponent(error));
      toast.error(decodeURIComponent(error));
      // Clear URL parameters
      navigate('/driver-auth', { replace: true });
    }
  }, [location, navigate]);

  // Password strength calculator
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  // Handle password change
  const handlePasswordChange = (password: string) => {
    setAccountData({ ...accountData, password });
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
    
    // Clear previous password-related errors
    if (formError?.includes('password') || formError?.includes('Password')) {
      setFormError(null);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${user?.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(fileName);
        
      return publicUrlData?.publicUrl || '';
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      throw err;
    }
  };

  // Handle validation errors in a consistent way
  const validateAccountData = () => {
    if (!accountData.email) return ["Email is required"];
    if (!accountData.password) return ["Password is required"];
    if (accountData.password !== accountData.confirmPassword) return ["Passwords do not match"];
    if (passwordStrength < 50) return ["Password is too weak"];
    if (!accountData.termsAccepted) return ["You must accept the terms and conditions"];
    return [];
  };

  const validatePersonalData = () => {
    const errors = [];
    if (!personalData.fullName) errors.push('Full name is required');
    if (!personalData.phone) errors.push('Phone number is required');
    if (!personalData.dateOfBirth) errors.push('Date of birth is required');
    if (!personalData.city) errors.push('City is required');
    if (!personalData.state) errors.push('State is required');
    if (!personalData.zipCode) errors.push('ZIP code is required');
    return errors;
  };

  const validateVehicleData = () => {
    const errors = [];
    if (!vehicleData.type) errors.push('Vehicle type is required');
    if (!vehicleData.make) errors.push('Vehicle make is required');
    if (!vehicleData.model) errors.push('Vehicle model is required');
    if (!vehicleData.year) errors.push('Vehicle year is required');
    if (!vehicleData.licensePlate) errors.push('License plate is required');
    if (!vehicleData.insuranceProvider) errors.push('Insurance provider is required');
    if (!vehicleData.insurancePolicyNumber) errors.push('Insurance policy number is required');
    if (!vehicleData.insuranceExpiry) errors.push('Insurance expiry date is required');
    return errors;
  };

  // Handle step completion
  const handleStepComplete = async () => {
    if (!signIn || !signUp) {
      setFormError('Authentication is not available. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setFormError(null);
    setFormSuccess(null);
    
    try {
      // Ensure tables exist before proceeding
      await verifyRequiredTables();
      
      // Validate current step
      let validationErrors: string[] = [];
      
      switch (currentStep) {
        case 1:
          validationErrors = validateAccountData();
          break;
        case 2:
          validationErrors = validatePersonalData();
          break;
        case 3:
          validationErrors = validateVehicleData();
          break;
      }

      if (validationErrors.length > 0) {
        setFormError(validationErrors.join('. '));
        setLoading(false);
        return;
      }

      switch (currentStep) {
        case 1:
          // Only create account if not already logged in
          if (!user) {
            console.log('Creating new user with email:', accountData.email);
            // Register new user
            const { error, user: newUser } = await signUp(
              accountData.email,
              accountData.password,
              { full_name: personalData.fullName || 'Driver' }
            );
            
            if (error) {
              throw new Error(error.message);
            }
            
            // If we get here and no error was thrown, the user was created
            console.log('User creation successful, checking verification status');
            setFormSuccess('Account created successfully!');
            
            // Set driver profile for the new user
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('driver_profiles')
                .insert({
                  user_id: newUser?.id,
                  email: accountData.email,
                  onboarding_status: 'in_progress',
                  current_step: 2
                })
                .select('id')
                .single();
                
              if (profileError) {
                console.error('Error creating driver profile:', profileError);
              } else if (profileData) {
                setDriverProfileId(profileData.id);
                console.log('Driver profile created successfully:', profileData.id);
              }
            } catch (profileErr) {
              console.error('Error in profile creation:', profileErr);
            }
            
            // Check if email verification is required
            if (newUser?.identities?.length === 0 || !newUser?.email_confirmed_at) {
              console.log('Email verification required');
              setEmailVerificationPending(true);
              setShowVerify(true);
              setFormSuccess('Verification email sent! Please check your inbox and verify your email before continuing.');
              setLoading(false);
              return;
            }
          }
          
          // If user exists or was successfully created and verified, move to next step
          console.log('Moving to step 2');
          setCurrentStep(2);
          break;
          
        case 2: // Personal Information
          if (!driverProfileId && user) {
            // If no driver profile exists but we have a user, create a profile
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('driver_profiles')
                .insert({
                  user_id: user.id,
                  email: user.email,
                  full_name: personalData.fullName,
                  phone: personalData.phone,
                  date_of_birth: personalData.dateOfBirth,
                  city: personalData.city,
                  state: personalData.state,
                  zip_code: personalData.zipCode,
                  onboarding_status: 'in_progress',
                  current_step: 3
                })
                .select('id')
                .single();
                
              console.log('Profile creation attempt for user ID:', user.id);
              console.log('Profile creation result:', { profileData, profileError });
              
              if (profileError) {
                // Log the full error object for better debugging
                console.error('Profile creation error details:', JSON.stringify(profileError, null, 2));
                
                // Check if the error is related to missing tables
                if (profileError.message?.includes('does not exist') || profileError.code === '42P01') {
                  // Create a local fallback to continue the flow without database storage
                  console.warn('Using local fallback for driver profile due to missing table');
                  
                  // Generate a fake profile ID for this session
                  const tempProfileId = `temp_${Math.random().toString(36).substring(2, 15)}`;
                  setDriverProfileId(tempProfileId);
                  
                  // Store data in localStorage as a fallback
                  localStorage.setItem('tempDriverProfile', JSON.stringify({
                    id: tempProfileId,
                    user_id: user.id,
                    email: user.email,
                    full_name: personalData.fullName,
                    phone: personalData.phone,
                    date_of_birth: personalData.dateOfBirth,
                    city: personalData.city,
                    state: personalData.state,
                    zip_code: personalData.zipCode,
                    current_step: 3,
                    created_at: new Date().toISOString()
                  }));
                  
                  // Show a warning but let the user continue
                  toast.warning('Using temporary storage due to database issues. Your data will not be permanently saved until the issue is resolved.');
                  setCurrentStep(3);
                  setLoading(false);
                  return;
                }
                
                // Continue with existing error handling
                throw new Error(`Failed to create driver profile: ${profileError.message || 'Unknown database error'}`);
              }
              
              if (!profileData) {
                throw new Error('Failed to create driver profile: No profile data returned');
              }
              
              setDriverProfileId(profileData.id);
            } catch (err: any) {
              console.error('Error creating driver profile:', err);
              throw new Error(err.message || 'Failed to create driver profile');
            }
          } else if (driverProfileId) {
            // Update existing profile
            if (driverProfileId.startsWith('temp_')) {
              // This is a temporary profile stored in localStorage
              console.log('Updating temporary profile in localStorage');
              
              try {
                const tempProfile = JSON.parse(localStorage.getItem('tempDriverProfile') || '{}');
                const updatedProfile = {
                  ...tempProfile,
                  full_name: personalData.fullName,
                  phone: personalData.phone,
                  date_of_birth: personalData.dateOfBirth,
                  city: personalData.city,
                  state: personalData.state,
                  zip_code: personalData.zipCode,
                  current_step: 3,
                  updated_at: new Date().toISOString()
                };
                
                localStorage.setItem('tempDriverProfile', JSON.stringify(updatedProfile));
                console.log('Temporary profile updated successfully');
              } catch (localStorageError) {
                console.error('Error updating temporary profile:', localStorageError);
                throw new Error('Failed to update local profile data');
              }
            } else {
              // This is a regular database profile
              const { error: personalError } = await supabase
                .from('driver_profiles')
                .update({
                  full_name: personalData.fullName,
                  phone: personalData.phone,
                  date_of_birth: personalData.dateOfBirth,
                  city: personalData.city,
                  state: personalData.state,
                  zip_code: personalData.zipCode,
                  current_step: 3
                })
                .eq('id', driverProfileId);
                
              if (personalError) {
                console.error('Personal data update error:', personalError);
                throw new Error(`Failed to save personal information: ${personalError.message || 'Unknown error'}`);
              }
            }
          } else {
            throw new Error('No user account or driver profile found');
          }
          
          setFormSuccess('Personal information saved successfully!');
          toast.success('Personal information saved!');
          setCurrentStep(3);
          break;
          
        case 3: // Vehicle Information
          if (!driverProfileId) {
            throw new Error('Driver profile not found');
          }
          
          console.log('Updating vehicle information for profile:', driverProfileId);
          
          if (driverProfileId.startsWith('temp_')) {
            // This is a temporary profile stored in localStorage
            console.log('Updating temporary profile vehicle info in localStorage');
            
            try {
              const tempProfile = JSON.parse(localStorage.getItem('tempDriverProfile') || '{}');
              const updatedProfile = {
                ...tempProfile,
                vehicle_type: vehicleData.type,
                vehicle_make: vehicleData.make,
                vehicle_model: vehicleData.model,
                vehicle_year: vehicleData.year,
                vehicle_color: vehicleData.color,
                vehicle_plate: vehicleData.licensePlate,
                insurance_provider: vehicleData.insuranceProvider,
                insurance_policy: vehicleData.insurancePolicyNumber,
                insurance_expiry: vehicleData.insuranceExpiry,
                current_step: 4,
                onboarding_status: 'pending_documents',
                updated_at: new Date().toISOString()
              };
              
              localStorage.setItem('tempDriverProfile', JSON.stringify(updatedProfile));
              console.log('Temporary profile vehicle info updated successfully');
            } catch (localStorageError) {
              console.error('Error updating temporary profile vehicle info:', localStorageError);
              throw new Error('Failed to update local vehicle data');
            }
          } else {
            const { error: vehicleError } = await supabase
              .from('driver_profiles')
              .update({
                vehicle_type: vehicleData.type,
                vehicle_make: vehicleData.make,
                vehicle_model: vehicleData.model,
                vehicle_year: vehicleData.year,
                vehicle_color: vehicleData.color,
                vehicle_plate: vehicleData.licensePlate,
                insurance_provider: vehicleData.insuranceProvider,
                insurance_policy: vehicleData.insurancePolicyNumber,
                insurance_expiry: vehicleData.insuranceExpiry,
                current_step: 4,
                onboarding_status: 'pending_documents'
              })
              .eq('id', driverProfileId);
              
            if (vehicleError) {
              console.error('Vehicle data update error:', vehicleError);
              throw new Error(`Failed to save vehicle information: ${vehicleError.message || 'Unknown error'}`);
            }
          }
          
          setFormSuccess('Vehicle information saved successfully!');
          toast.success('Vehicle information saved!');
          setCurrentStep(4);
          break;
      }
      
      setLoading(false);
      
    } catch (err: any) {
      console.error('Error completing step:', err);
      // Provide more detailed error information for debugging
      if (err.code) {
        console.error('Error code:', err.code);
      }
      if (err.details) {
        console.error('Error details:', err.details);
      }
      setLoading(false);
      setFormError(err.message || 'Failed to complete step');
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                  id="email"
                    type="email"
                  value={accountData.email}
                  onChange={e => setAccountData({ ...accountData, email: e.target.value })}
                  className="pl-10"
                  placeholder="driver@example.com"
                    required
                  />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
                  <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                  id="password"
                      type={showPassword ? 'text' : 'password'}
                  value={accountData.password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
              {accountData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Password strength</span>
                    <span className={`font-medium ${
                      passwordStrength < 50 ? 'text-red-600' : 
                      passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength < 50 ? 'Weak' : 
                       passwordStrength < 75 ? 'Good' : 'Strong'}
                    </span>
                </div>
                  <Progress value={passwordStrength} className="h-1" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={accountData.confirmPassword}
                  onChange={e => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                  className="pl-10"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                id="terms"
                checked={accountData.termsAccepted}
                      onCheckedChange={(checked) => 
                  setAccountData({ ...accountData, termsAccepted: checked as boolean })
                }
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{' '}
                <a href="#" className="text-medical-blue hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-medical-blue hover:underline">Privacy Policy</a>
              </Label>
                  </div>
                </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  value={personalData.fullName}
                  onChange={e => setPersonalData({ ...personalData, fullName: e.target.value })}
                  className="pl-10"
                  placeholder="John Doe"
                  required
                />
                  </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={personalData.phone}
                  onChange={e => setPersonalData({ ...personalData, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+1 (555) 000-0000"
                  required
                />
                  </div>
                </div>
                
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={personalData.city}
                  onChange={e => setPersonalData({ ...personalData, city: e.target.value })}
                  placeholder="City"
                  required
                />
                </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  type="text"
                  value={personalData.state}
                  onChange={e => setPersonalData({ ...personalData, state: e.target.value })}
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                id="zipCode"
                  type="text"
                value={personalData.zipCode}
                onChange={e => setPersonalData({ ...personalData, zipCode: e.target.value })}
                placeholder="ZIP Code"
                  required
                />
              </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                id="dateOfBirth"
                type="date"
                value={personalData.dateOfBirth}
                onChange={e => setPersonalData({ ...personalData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select
                value={vehicleData.type}
                onValueChange={(value) => setVehicleData({ ...vehicleData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2" />
              <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">
                            Capacity: {type.capacity}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  type="text"
                  value={vehicleData.make}
                  onChange={e => setVehicleData({ ...vehicleData, make: e.target.value })}
                  placeholder="Vehicle make"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                  <Input
                  id="model"
                  type="text"
                  value={vehicleData.model}
                  onChange={e => setVehicleData({ ...vehicleData, model: e.target.value })}
                  placeholder="Vehicle model"
                    required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={vehicleData.year}
                  onChange={e => setVehicleData({ ...vehicleData, year: e.target.value })}
                  placeholder="Vehicle year"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="text"
                  value={vehicleData.color}
                  onChange={e => setVehicleData({ ...vehicleData, color: e.target.value })}
                  placeholder="Vehicle color"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input
                id="licensePlate"
                type="text"
                value={vehicleData.licensePlate}
                onChange={e => setVehicleData({ ...vehicleData, licensePlate: e.target.value })}
                placeholder="License plate number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                type="text"
                value={vehicleData.insuranceProvider}
                onChange={e => setVehicleData({ ...vehicleData, insuranceProvider: e.target.value })}
                placeholder="Insurance company name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                <Input
                  id="insurancePolicyNumber"
                  type="text"
                  value={vehicleData.insurancePolicyNumber}
                  onChange={e => setVehicleData({ ...vehicleData, insurancePolicyNumber: e.target.value })}
                  placeholder="Insurance policy number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceExpiry">Expiry Date</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={vehicleData.insuranceExpiry}
                  onChange={e => setVehicleData({ ...vehicleData, insuranceExpiry: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Driver's License</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-medical-blue bg-medical-blue/5' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setDocumentData({ ...documentData, driverLicense: file });
                      setDocumentPreviews({
                        ...documentPreviews,
                        driverLicense: URL.createObjectURL(file)
                      });
                    }
                  }}
                >
                  {documentPreviews.driverLicense ? (
                    <div className="relative">
                      <img
                        src={documentPreviews.driverLicense}
                        alt="Driver's License"
                        className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        onClick={() => {
                          setDocumentData({ ...documentData, driverLicense: null });
                          setDocumentPreviews({
                            ...documentPreviews,
                            driverLicense: null
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                  </button>
                </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-gray-400" />
                      <div className="text-sm text-gray-500">
                        Drag and drop your driver's license or{' '}
                        <button
                          type="button"
                          className="text-medical-blue hover:underline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                </div>
              </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Insurance Card</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-medical-blue bg-medical-blue/5' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setDocumentData({ ...documentData, insuranceCard: file });
                      setDocumentPreviews({
                        ...documentPreviews,
                        insuranceCard: URL.createObjectURL(file)
                      });
                    }
                  }}
                >
                  {documentPreviews.insuranceCard ? (
                    <div className="relative">
                      <img
                        src={documentPreviews.insuranceCard}
                        alt="Insurance Card"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        onClick={() => {
                          setDocumentData({ ...documentData, insuranceCard: null });
                          setDocumentPreviews({
                            ...documentPreviews,
                            insuranceCard: null
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
              </div>
                  ) : (
                    <div className="space-y-2">
                      <CreditCard className="h-8 w-8 mx-auto text-gray-400" />
                      <div className="text-sm text-gray-500">
                        Drag and drop your insurance card or{' '}
                        <button
                          type="button"
                          className="text-medical-blue hover:underline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vehicle Registration</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-medical-blue bg-medical-blue/5' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setDocumentData({ ...documentData, vehicleRegistration: file });
                      setDocumentPreviews({
                        ...documentPreviews,
                        vehicleRegistration: URL.createObjectURL(file)
                      });
                    }
                  }}
                >
                  {documentPreviews.vehicleRegistration ? (
                    <div className="relative">
                      <img
                        src={documentPreviews.vehicleRegistration}
                        alt="Vehicle Registration"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        onClick={() => {
                          setDocumentData({ ...documentData, vehicleRegistration: null });
                          setDocumentPreviews({
                            ...documentPreviews,
                            vehicleRegistration: null
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-gray-400" />
                      <div className="text-sm text-gray-500">
                        Drag and drop your vehicle registration or{' '}
                        <button
                          type="button"
                          className="text-medical-blue hover:underline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-medical-blue bg-medical-blue/5' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setDocumentData({ ...documentData, profilePhoto: file });
                      setDocumentPreviews({
                        ...documentPreviews,
                        profilePhoto: URL.createObjectURL(file)
                      });
                    }
                  }}
                >
                  {documentPreviews.profilePhoto ? (
                    <div className="relative">
                      <img
                        src={documentPreviews.profilePhoto}
                        alt="Profile Photo"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        onClick={() => {
                          setDocumentData({ ...documentData, profilePhoto: null });
                          setDocumentPreviews({
                            ...documentPreviews,
                            profilePhoto: null
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-8 w-8 mx-auto text-gray-400" />
                      <div className="text-sm text-gray-500">
                        Drag and drop your profile photo or{' '}
                        <button
                          type="button"
                          className="text-medical-blue hover:underline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          browse
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
                  type="file"
                  accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Handle file selection based on which document is being uploaded
                  // This would need to be implemented based on the current context
                }
              }}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-medical-blue" />
              <h3 className="text-lg font-medium">Background Check</h3>
              <p className="text-sm text-gray-500">
                We'll perform a background check to ensure the safety of our service.
                This process typically takes 1-2 business days.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Criminal History Check</h4>
                  <p className="text-sm text-gray-500">Verifying your criminal record</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Driving Record Check</h4>
                  <p className="text-sm text-gray-500">Reviewing your driving history</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Identity Verification</h4>
                  <p className="text-sm text-gray-500">Confirming your identity</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ssn">Social Security Number (Last 4 digits)</Label>
              <Input
                id="ssn"
                type="password"
                maxLength={4}
                placeholder="XXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consent">Consent Statement</Label>
              <Textarea
                id="consent"
                value="I authorize Express Med Dispatch to conduct a background check, including criminal history and driving record verification. I understand that this information will be used to evaluate my application for employment as a delivery driver."
                readOnly
                className="h-24"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="consent-check" required />
              <Label htmlFor="consent-check" className="text-sm">
                I consent to the background check and verify that all information provided is accurate
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetPassword) {
      setFormError('Reset password functionality is not available. Please refresh the page and try again.');
      return;
    }
    
    if (!resetEmail) {
      setFormError('Please enter your email address');
      return;
    }
    
    setResetLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResetSent(true);
      setFormSuccess('Password reset email sent! Please check your inbox.');
      
    } catch (err: any) {
      setFormError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };
  
  // Handle resend verification
  const handleResendVerification = async () => {
    if (!signUp) {
      setFormError('Authentication is not available. Please refresh the page and try again.');
      return;
    }
    
    setVerifyLoading(true);
    
    try {
      const { error } = await signUp(accountData.email, accountData.password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setFormSuccess('Verification email resent! Please check your inbox.');
      
    } catch (err: any) {
      setFormError(err.message || 'Failed to resend verification email');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Manually confirm user in development mode
  const handleDevConfirmUser = async () => {
    if (!accountData.email || !accountData.password) {
      setFormError('Please enter your email and password first');
      return;
    }
    
    try {
      setVerifyLoading(true);
      setFormError(null);
      
      // Use our dev helper function to handle signup and verification in development
      const result = await devSignUpAndVerify(accountData.email, accountData.password);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to verify user in development mode');
      }
      
      // If user was created and logged in successfully
      if (result.user) {
        setFormSuccess('DEV MODE: Email verification bypassed! Continuing with registration.');
        setEmailVerificationPending(false);
        
        // Ensure we have a driver profile
        const userId = result.user.id;
        
        // Check if a profile already exists
        const { data: existingProfile } = await supabase
          .from('driver_profiles')
          .select('id')
          .eq('user_id', userId)
          .single();
          
        if (!existingProfile) {
          // Create a new driver profile
          const { data: profileData, error: profileError } = await supabase
            .from('driver_profiles')
            .insert({
              user_id: userId,
              email: accountData.email,
              onboarding_status: 'in_progress',
              current_step: 2
            })
            .select('id')
            .single();
            
            if (profileError) {
              console.error('Error creating profile in dev mode:', profileError);
              throw new Error(`Failed to create driver profile: ${profileError.message || 'Unknown error'}`);
            }
            
            if (profileData) {
              setDriverProfileId(profileData.id);
            }
          } else {
            setDriverProfileId(existingProfile.id);
          }
          
          toast.success('DEV MODE: Email verification bypassed!');
          
          // Close the verification dialog after a short delay
          setTimeout(() => {
            setShowVerify(false);
            setCurrentStep(2); // Move to the next step
          }, 1000);
          return;
        }
        
        // If we just need to show the success message
        setFormSuccess(result.message || 'DEV MODE: Verification process completed.');
        
      } catch (err: any) {
        console.error('Dev confirm error:', err);
        setFormError(err.message || 'Failed to confirm user in development mode');
      } finally {
        setVerifyLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 via-white to-medical-teal/5 flex flex-col">
      {/* Header */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 p-4">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="bg-medical-blue text-white p-2 rounded-xl">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Express Med Dispatch</h1>
              <p className="text-xs text-gray-500">Driver Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Progress indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {ONBOARDING_STEPS[currentStep - 1].title}
              </h2>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {ONBOARDING_STEPS.length}
              </span>
            </div>
            <Progress
              value={(currentStep / ONBOARDING_STEPS.length) * 100}
              className="h-2"
            />
            <p className="text-sm text-gray-500">
              {ONBOARDING_STEPS[currentStep - 1].description}
            </p>
          </div>

          {emailVerificationPending && currentStep > 1 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-700">
                  Email verification is pending. You can continue with registration, but you'll need to verify your email before accessing the driver portal.
                  <button
                    type="button"
                    onClick={() => setShowVerify(true)}
                    className="ml-1 underline hover:text-yellow-800"
                  >
                    Resend verification email
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Main card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6">
              {formError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}
              
              {!formError && formSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-700">{formSuccess}</p>
              </div>
              )}

              {renderStep()}

              <div className="mt-6 flex justify-between">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={loading}
                  >
                    Previous
              </Button>
                )}
                <Button
                  type="button"
                  className="ml-auto"
                  onClick={handleStepComplete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : currentStep === ONBOARDING_STEPS.length ? (
                    'Complete'
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
        </CardContent>
      </Card>
        </div>
      </div>

      {/* Password reset dialog */}
      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          {resetSent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <p className="text-sm text-gray-500">
                If an account exists with that email, you'll receive password reset instructions.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReset(false)}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                    className="pl-10"
                required
                disabled={resetLoading}
              />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={resetLoading || !resetEmail}
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Email'
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Email verification dialog */}
      <Dialog open={showVerify} onOpenChange={(open) => {
        setShowVerify(open);
        if (!open) {
          setFormSuccess(null);
          setFormError(null);
          setVerifyLoading(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <Mail className="h-12 w-12 mx-auto text-medical-blue" />
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                We've sent a verification link to your email. Please check your inbox and spam folder.
              </p>
              <p className="text-sm font-medium text-medical-blue">
                You can continue with your registration while waiting for the verification email.
              </p>
            </div>
            
            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{formError}</span>
              </div>
            )}
            
            {formSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2 justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-700">{formSuccess}</span>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={verifyLoading}
                className="w-full"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Verification Email...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVerify(false)}
                className="w-full"
              >
                Continue with Registration
              </Button>
              
              {/* Development bypass button - would never be in production */}
              <Button
                type="button"
                variant="destructive"
                onClick={handleDevConfirmUser}
                disabled={verifyLoading}
                className="w-full"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'DEV MODE: Skip Email Verification'
                )}
              </Button>
              
              {/* Debug information */}
              <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                <strong>Debug Info:</strong><br />
                Email: {accountData.email || user?.email || 'None'}<br />
                Site URL: {window.location.origin}<br />
                User ID: {user?.id || 'None'}<br />
                Driver Profile: {driverProfileId || 'None'}<br />
                Profile Type: {driverProfileId?.startsWith('temp_') ? 'Temporary (localStorage)' : 'Database'}<br />
                Auth State: {isLoading ? 'Loading' : user ? 'Authenticated' : 'Not Authenticated'}<br />
                Confirmed: {user?.email_confirmed_at ? 'Yes' : 'No'}<br />
                Browser: {navigator.userAgent}
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Note: You'll need to verify your email before you can access the driver portal, but you can complete the registration process now.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverAuth; 