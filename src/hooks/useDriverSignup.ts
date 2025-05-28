
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
      
      // Prepare user metadata
      const metadata = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        full_name: `${formData.firstName} ${formData.lastName}`,
        user_type: 'driver',
        email_confirm: false // Disable Supabase email confirmation
      };

      console.log('Attempting signup with metadata:', metadata);

      // Try to sign up the user with email confirmation disabled
      const { error, user } = await signUp(formData.email, formData.password, metadata, { 
        emailRedirectTo: undefined // Disable email confirmation redirect
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

        // For email confirmation errors, continue if user was created
        if (error.message?.includes('confirmation email') && user?.id) {
          console.log('Email confirmation failed but user created, sending custom email...');
          
          const emailSent = await sendDriverSignupWelcomeEmail(
            formData.email, 
            `${formData.firstName} ${formData.lastName}`,
            user.id
          );

          if (emailSent) {
            toast.success('Account created successfully! Please check your email for welcome instructions.');
          } else {
            toast.success('Account created successfully! You can now sign in.');
          }
          return;
        }

        toast.error(error.message || 'Failed to create account. Please try again.');
        return;
      }

      if (user) {
        console.log('Signup successful:', user);
        
        // Send welcome email using our Brevo service
        const emailSent = await sendDriverSignupWelcomeEmail(
          formData.email,
          `${formData.firstName} ${formData.lastName}`,
          user.id
        );

        if (emailSent) {
          toast.success('Account created successfully! Please check your email for welcome instructions.');
        } else {
          toast.success('Account created successfully! You can now sign in.');
        }
      } else {
        console.warn('No error but no user returned from signup');
        toast.error('Something went wrong during signup. Please try again.');
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
