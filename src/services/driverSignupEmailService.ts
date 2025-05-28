
export const sendDriverSignupWelcomeEmail = async (email: string, driverName: string, userId: string): Promise<boolean> => {
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
