
export const sendDriverSignupWelcomeEmail = async (email: string, driverName: string, userId: string): Promise<boolean> => {
  try {
    console.log('Attempting to send welcome email to:', email);
    
    // Use the correct Supabase project URL
    const baseUrl = 'https://joziqntfciyflfsgvsqz.supabase.co';
    
    const emailData = {
      email,
      status: 'driver_signup_welcome',
      driver_name: driverName,
      id: userId
    };

    console.log('Email data:', emailData);
    
    const response = await fetch(`${baseUrl}/functions/v1/send-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemlxbnRmY2l5Zmxmc2d2c3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTYwNDksImV4cCI6MjA2MDQ5MjA0OX0.7j-9MsQNma6N1fnKvFB7wBJReL6PHy_ncwJqDdMeIQA`
      },
      body: JSON.stringify(emailData),
    });

    console.log('Email service response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('Welcome email sent successfully:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.log('Email service error:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};
