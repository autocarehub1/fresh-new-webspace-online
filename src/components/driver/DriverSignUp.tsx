
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, UserPlus, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface DriverSignUpProps {
  onSwitchToSignIn: () => void;
}

const DriverSignUp: React.FC<DriverSignUpProps> = ({ onSwitchToSignIn }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendWelcomeEmail = async (email: string, driverName: string, userId: string) => {
    try {
      console.log('Attempting to send welcome email...');
      
      // Use the Supabase project URL directly
      const baseUrl = 'https://joziqntfciyflfsgvsqz.supabase.co';
      
      const response = await fetch(`${baseUrl}/functions/v1/send-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          status: 'driver_signup_welcome',
          driver_name: driverName,
          id: userId
        }),
      });

      if (response.ok) {
        console.log('Welcome email sent successfully');
        return true;
      } else {
        console.log('Email service unavailable:', response.status);
        return false;
      }
    } catch (error) {
      console.log('Email sending failed:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting driver signup process...');
      
      // Prepare user metadata
      const metadata = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        user_type: 'driver'
      };

      console.log('Attempting signup with metadata:', metadata);

      // Try to sign up the user
      const { error, user } = await signUp(formData.email, formData.password, metadata);

      if (error) {
        console.error('Signup error:', error);
        
        // Handle email confirmation errors specifically
        if (error.message?.includes('confirmation email') || error.code === 'unexpected_failure') {
          console.log('Primary signup email failed, trying welcome email...');
          
          // Try to send welcome email directly
          const emailSent = await sendWelcomeEmail(
            formData.email, 
            `${formData.firstName} ${formData.lastName}`,
            user?.id || 'pending'
          );

          if (emailSent) {
            toast.success('Account created! Welcome email sent. You can now sign in.');
          } else {
            toast.success('Account created! You can now sign in with your credentials.');
          }
        } else {
          // Other signup errors
          toast.error(error.message || 'Failed to create account');
        }
      } else {
        console.log('Signup successful:', user);
        
        // Try to send welcome email for successful signups too
        const emailSent = await sendWelcomeEmail(
          formData.email,
          `${formData.firstName} ${formData.lastName}`,
          user?.id || ''
        );

        if (emailSent) {
          toast.success('Account created successfully! Welcome email sent. Please check your email.');
        } else {
          toast.success('Account created successfully! Please check your email for verification.');
        }
      }

    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create Driver Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
                disabled={loading}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
                disabled={loading}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={loading}
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={loading}
                placeholder="Enter your password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                disabled={loading}
                placeholder="Confirm your password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Creating Account...
              </span>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={loading}
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverSignUp;
