
import { EmailService } from './emailService';
import { toast } from 'sonner';

export const sendDriverSignupWelcomeEmail = async (
  email: string, 
  driverName: string, 
  userId: string
): Promise<boolean> => {
  try {
    console.log('Driver signup email service - sending to:', email);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      toast.error('Invalid email address format');
      return false;
    }
    
    const result = await EmailService.sendDriverWelcomeEmail(
      email, 
      driverName, 
      userId
    );

    if (result.success) {
      console.log('Welcome email sent successfully via Gmail');
      return true;
    } else {
      console.log('Gmail email service failed:', result.error);
      toast.error('Email service configuration issue. Please contact support.');
      return false;
    }
  } catch (error: any) {
    console.error('Email sending failed:', error);
    
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

// Test function with Gmail diagnostics
export const testDriverEmailService = async (): Promise<{ success: boolean; details?: any; error?: string }> => {
  try {
    console.log('Testing Gmail driver email service...');
    const result = await EmailService.testEmailSystem();
    
    if (result.success) {
      console.log('Gmail driver email service test passed');
      return { success: true, details: result.details };
    } else {
      console.error('Gmail driver email service test failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('Gmail driver email service test error:', error);
    return { success: false, error: error.message };
  }
};
