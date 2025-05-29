
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { DriverSignUpFormData } from '@/components/driver/signup/types';
import { validateSignUpForm } from '@/components/driver/signup/validation';
import { sendDriverSignupWelcomeEmail } from '@/services/driverSignupEmailService';

export const useDriverSignup = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (formData: DriverSignUpFormData) => {
    if (!validateSignUpForm(formData)) {
      return;
    }

    setLoading(true);

    try {
      console.log('Starting driver signup process...');
      
      // Prepare user metadata - explicitly disable email confirmation
      const metadata = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        user_type: 'driver',
        email_confirm: false // Disable Supabase email confirmation
      };

      console.log('Attempting signup with metadata:', metadata);

      // Sign up without email confirmation
      const { error, user } = await signUp(formData.email, formData.password, metadata, { 
        emailRedirectTo: undefined // Explicitly disable email redirect
      });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try signing in instead.');
          return;
        }
        
        if (error.message?.includes('Password should be at least 6 characters')) {
          toast.error('Password must be at least 6 characters long.');
          return;
        }
        
        if (error.message?.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
          return;
        }

        // For email confirmation errors, proceed anyway since we use Gmail
        if (error.message?.includes('Error sending confirmation email')) {
          console.log('Supabase email confirmation failed, but proceeding with Gmail email...');
          // Continue to try sending Gmail email
        } else {
          toast.error(error.message || 'Failed to create account. Please try again.');
          return;
        }
      }

      // Send welcome email using Gmail regardless of Supabase email status
      console.log('Sending welcome email via Gmail...');
      
      try {
        const emailSent = await sendDriverSignupWelcomeEmail(
          formData.email,
          `${formData.firstName} ${formData.lastName}`,
          user?.id || 'temp-id'
        );

        if (emailSent) {
          toast.success('Account created successfully! Please check your email for welcome instructions.');
        } else {
          toast.success('Account created successfully! You can now sign in to the driver portal.');
        }
      } catch (emailError) {
        console.error('Gmail email error:', emailError);
        toast.success('Account created successfully! You can now sign in to the driver portal.');
      }

    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignup
  };
};
