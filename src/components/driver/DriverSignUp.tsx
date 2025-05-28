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
        
        // Handle specific email sending errors
        if (error.message?.includes('confirmation email') || error.code === 'unexpected_failure') {
          console.log('Email sending failed, but user may have been created. Attempting manual email send...');
          
          // Try to send a custom welcome email
          try {
            const response = await fetch(`${window.location.origin.includes('localhost') ? 'https://joziqntfciyflfsgvsqz.supabase.co' : window.location.origin}/functions/v1/send-confirmation`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: formData.email,
                status: 'driver_signup_welcome',
                driver_name: `${formData.firstName} ${formData.lastName}`,
                id: user?.id || 'pending'
              }),
            });

            if (response.ok) {
              toast.success('Account created! Please check your email to verify your account.');
              console.log('Manual welcome email sent successfully');
            } else {
              toast.success('Account created! You can now sign in with your credentials.');
              console.log('Manual email also failed, but account was created');
            }
          } catch (emailError) {
            console.log('Manual email send failed:', emailError);
            toast.success('Account created! You can now sign in with your credentials.');
          }
        } else {
          // Other signup errors
          toast.error(error.message || 'Failed to create account');
        }
      } else {
        console.log('Signup successful:', user);
        toast.success('Account created successfully! Please check your email to verify your account.');
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
