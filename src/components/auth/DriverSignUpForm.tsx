
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface DriverSignUpFormProps {
  onSwitchToSignIn: () => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

const DriverSignUpForm: React.FC<DriverSignUpFormProps> = ({
  onSwitchToSignIn,
  errors,
  setErrors
}) => {
  const { signUp } = useAuth();
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    vehicleType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateSignUpForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signUpData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signUpData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signUpData.password) {
      newErrors.password = 'Password is required';
    } else if (signUpData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (!signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!signUpData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!signUpData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!signUpData.vehicleType) {
      newErrors.vehicleType = 'Vehicle type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up form submitted');
    
    if (!validateSignUpForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log('Attempting to sign up driver with:', signUpData.email);
      const { error } = await signUp(signUpData.email, signUpData.password, {
        full_name: signUpData.fullName,
        phone: signUpData.phone,
        vehicle_type: signUpData.vehicleType,
        user_type: 'driver'
      });
      
      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('already registered')) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        console.log('Sign up successful');
        setErrors({ success: 'Account created successfully! Please check your email for verification.' });
        setTimeout(() => {
          onSwitchToSignIn();
        }, 2000);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-fullname">Full Name</Label>
        <Input
          id="signup-fullname"
          type="text"
          placeholder="Enter your full name"
          value={signUpData.fullName}
          onChange={(e) => {
            setSignUpData({ ...signUpData, fullName: e.target.value });
            if (errors.fullName) setErrors({ ...errors, fullName: '' });
          }}
          className={errors.fullName ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
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
        <Label htmlFor="signup-phone">Phone Number</Label>
        <Input
          id="signup-phone"
          type="tel"
          placeholder="Enter your phone number"
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
        <Label htmlFor="signup-vehicle">Vehicle Type</Label>
        <select
          id="signup-vehicle"
          value={signUpData.vehicleType}
          onChange={(e) => {
            setSignUpData({ ...signUpData, vehicleType: e.target.value });
            if (errors.vehicleType) setErrors({ ...errors, vehicleType: '' });
          }}
          className={`w-full px-3 py-2 border rounded-md ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'}`}
          disabled={isSubmitting}
        >
          <option value="">Select your vehicle type</option>
          <option value="car">Car</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="van">Van</option>
          <option value="truck">Truck</option>
          <option value="bicycle">Bicycle</option>
        </select>
        {errors.vehicleType && <p className="text-sm text-red-500">{errors.vehicleType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
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
        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input
            id="signup-confirm-password"
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

      {errors.success && (
        <Alert className="border-green-500 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{errors.success}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          'Create Driver Account'
        )}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSwitchToSignIn}
          className="text-sm text-blue-600 hover:text-blue-700"
          disabled={isSubmitting}
        >
          Already have an account? Sign in
        </Button>
      </div>
    </form>
  );
};

export default DriverSignUpForm;
