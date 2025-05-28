
import { BrevoEmailService } from './brevoEmailService';

export const sendDriverSignupWelcomeEmail = async (
  email: string, 
  driverName: string, 
  userId: string
): Promise<boolean> => {
  try {
    console.log('Attempting to send welcome email via Brevo to:', email);
    
    const success = await BrevoEmailService.sendDriverSignupWelcomeEmail(
      email, 
      driverName, 
      userId
    );

    if (success) {
      console.log('Welcome email sent successfully via Brevo');
      return true;
    } else {
      console.log('Brevo email service returned false');
      return false;
    }
  } catch (error) {
    console.error('Brevo email sending failed:', error);
    return false;
  }
};
