
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface DriverSignInFormProps {
  onForgotPassword: () => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

const DriverSignInForm: React.FC<DriverSignInFormProps> = ({
  onForgotPassword,
  errors,
  setErrors
}) => {
  const { signIn } = useAuth();
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    } else if (signInData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched({ ...touched, [field]: true });
    if (field === 'email' && signInData.email && !validateEmail(signInData.email)) {
      setErrors({ ...errors, email: 'Please enter a valid email address' });
    } else if (field === 'password' && signInData.password && signInData.password.length < 6) {
      setErrors({ ...errors, password: 'Password must be at least 6 characters' });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Driver sign in form submitted');
    
    if (!validateSignInForm()) {
      console.log('Form validation failed');
      setTouched({ email: true, password: true });
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log('Attempting to sign in driver with:', signInData.email);
      const { error } = await signIn(signInData.email, signInData.password, signInData.rememberMe);
      
      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please verify your email address before signing in. Check your inbox for a verification link.' });
        } else if (error.message.includes('Too many requests')) {
          setErrors({ general: 'Too many login attempts. Please wait a few minutes and try again.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        console.log('Driver sign in successful');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="signin-email"
              type="email"
              placeholder="Enter your email address"
              value={signInData.email}
              onChange={(e) => {
                setSignInData({ ...signInData, email: e.target.value });
                if (errors.email) {
                  const newErrors = { ...errors };
                  delete newErrors.email;
                  setErrors(newErrors);
                }
              }}
              onBlur={() => handleBlur('email')}
              className={`pl-10 h-12 ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } transition-colors`}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={signInData.password}
              onChange={(e) => {
                setSignInData({ ...signInData, password: e.target.value });
                if (errors.password) {
                  const newErrors = { ...errors };
                  delete newErrors.password;
                  setErrors(newErrors);
                }
              }}
              onBlur={() => handleBlur('password')}
              className={`pl-10 pr-12 h-12 ${
                errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } transition-colors`}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="remember-me"
            checked={signInData.rememberMe}
            onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
            disabled={isSubmitting}
          />
          <Label htmlFor="remember-me" className="text-sm text-gray-600">
            Keep me signed in
          </Label>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto font-medium"
          disabled={isSubmitting}
        >
          Forgot password?
        </Button>
      </div>

      {errors.general && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing you in...
          </>
        ) : (
          'Sign In to Dashboard'
        )}
      </Button>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          New driver?{' '}
          <span className="text-blue-600 font-medium">Create an account above</span>
        </p>
      </div>
    </form>
  );
};

export default DriverSignInForm;
