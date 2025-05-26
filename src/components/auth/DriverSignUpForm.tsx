
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

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
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
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
          onSwitchToSignIn();
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
        onSwitchToSignIn();
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
  );
};

export default DriverSignUpForm;
