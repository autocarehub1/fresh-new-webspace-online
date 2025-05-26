
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          onClick={onForgotPassword}
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
  );
};

export default DriverSignInForm;
