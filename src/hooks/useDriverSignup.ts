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
          const emailSent = await sendDriverSignupWelcomeEmail(
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
        const emailSent = await sendDriverSignupWelcomeEmail(
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

  return {
    loading,
    handleSignup
  };
};
