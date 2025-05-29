
import { BrevoEmailService } from './brevoEmailService';
import { toast } from 'sonner';

export const sendDriverSignupWelcomeEmail = async (
  email: string, 
  driverName: string, 
  userId: string
): Promise<boolean> => {
  try {
    console.log('Attempting to send welcome email via Brevo to:', email);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      toast.error('Invalid email address format');
      return false;
    }
    
    const success = await BrevoEmailService.sendDriverSignupWelcomeEmail(
      email, 
      driverName, 
      userId
    );

    if (success) {
      console.log('Welcome email sent successfully via Brevo');
      return true;
    } else {
      console.log('Brevo email service returned false - check API configuration');
      toast.error('Email service configuration issue. Please contact support.');
      return false;
    }
  } catch (error: any) {
    console.error('Brevo email sending failed:', error);
    
    // Provide specific error messages based on the error type
    if (error.message?.includes('rate limit')) {
      toast.error('Email rate limit exceeded. Please try again later.');
    } else if (error.message?.includes('authentication')) {
      toast.error('Email service authentication error. Please contact support.');
    } else if (error.message?.includes('quota')) {
      toast.error('Email quota exceeded. Please contact support.');
    } else {
      toast.error('Failed to send welcome email. Please contact support if you need immediate access.');
    }
    
    return false;
  }
};

// Test function for email service
export const testDriverEmailService = async (): Promise<boolean> => {
  try {
    console.log('Testing driver email service...');
    const result = await BrevoEmailService.testConnection();
    
    if (result.success) {
      console.log('Driver email service test passed');
      return true;
    } else {
      console.error('Driver email service test failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Driver email service test error:', error);
    return false;
  }
};
