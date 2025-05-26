import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Format phone number to E.164 format
 * This ensures consistent format before sending to server
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add country code if needed
  if (digits.length === 10) {
    return `+1${digits}`; // Assuming US phone numbers
  } else if (digits.length > 10 && !phoneNumber.startsWith('+')) {
    return `+${digits}`;
  }
  
  return phoneNumber;
};

/**
 * Send SMS verification code to user's phone
 */
export const sendVerificationCode = async (phoneNumber: string): Promise<{ 
  success: boolean; 
  message?: string; 
  error?: string;
}> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const response = await axios.post(`${API_BASE_URL}/verify/sms/send`, {
      phoneNumber: formattedPhone
    });
    
    return {
      success: true,
      message: response.data.message || 'Verification code sent'
    };
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to send verification code'
    };
  }
};

/**
 * Verify the code entered by the user
 */
export const verifyCode = async (phoneNumber: string, code: string): Promise<{
  success: boolean;
  verified?: boolean;
  message?: string;
  error?: string;
  remainingAttempts?: number;
}> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const response = await axios.post(`${API_BASE_URL}/verify/sms/check`, {
      phoneNumber: formattedPhone,
      code
    });
    
    return {
      success: true,
      verified: response.data.verified,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error verifying code:', error);
    return {
      success: false,
      verified: false,
      error: error.response?.data?.error || error.message || 'Failed to verify code',
      remainingAttempts: error.response?.data?.remainingAttempts
    };
  }
}; 