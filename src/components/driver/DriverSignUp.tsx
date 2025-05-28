
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail } from 'lucide-react';
import { DriverSignUpProps, DriverSignUpFormData } from './signup/types';
import { useDriverSignup } from '@/hooks/useDriverSignup';
import PasswordField from './signup/PasswordField';

const DriverSignUp: React.FC<DriverSignUpProps> = ({ onSwitchToSignIn }) => {
  const { loading, handleSignup } = useDriverSignup();
  const [formData, setFormData] = useState<DriverSignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignup(formData);
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

          <PasswordField
            label="Password"
            value={formData.password}
            onChange={(value) => setFormData({...formData, password: value})}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            placeholder="Enter your password"
            disabled={loading}
          />

          <PasswordField
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(value) => setFormData({...formData, confirmPassword: value})}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            placeholder="Confirm your password"
            disabled={loading}
          />

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
