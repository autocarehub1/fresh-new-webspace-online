import twilio from 'twilio';

// Twilio credentials - should be stored in environment variables
const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'AC123'; // Replace with your actual SID in env 
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'your_auth_token'; // Replace with your actual token in env
const twilioPhone = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '+15555555555'; // Replace with your Twilio phone number in env

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Store verification codes with expiration (in-memory store - replace with database in production)
interface VerificationEntry {
  code: string;
  expires: number; // timestamp
  attempts: number;
}

const verificationStore: Record<string, VerificationEntry> = {};

/**
 * Generate a random verification code
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification SMS to user's phone
 */
export const sendVerificationSMS = async (phoneNumber: string): Promise<{success: boolean; error?: string}> => {
  try {
    // Generate a 6-digit code
    const code = generateVerificationCode();
    
    // Store the code with 10-minute expiration
    verificationStore[phoneNumber] = {
      code,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    };
    
    // Send SMS via Twilio
    await client.messages.create({
      body: `Your Express Med Dispatch verification code is: ${code}. Valid for 10 minutes.`,
      from: twilioPhone,
      to: phoneNumber
    });
    
    console.log(`Verification SMS sent to ${phoneNumber}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending verification SMS:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send verification SMS' 
    };
  }
};

/**
 * Verify code entered by user
 */
export const verifyCode = (phoneNumber: string, code: string): {valid: boolean; message?: string} => {
  const entry = verificationStore[phoneNumber];
  
  // Check if verification entry exists
  if (!entry) {
    return { valid: false, message: 'No verification code was sent to this number' };
  }
  
  // Check if code is expired
  if (Date.now() > entry.expires) {
    delete verificationStore[phoneNumber];
    return { valid: false, message: 'Verification code has expired' };
  }
  
  // Increment attempt counter
  entry.attempts += 1;
  
  // Check for too many attempts (max 5)
  if (entry.attempts > 5) {
    delete verificationStore[phoneNumber];
    return { valid: false, message: 'Too many failed attempts. Please request a new code.' };
  }
  
  // Check if code matches
  if (entry.code === code) {
    // Code is valid, clean up
    delete verificationStore[phoneNumber];
    return { valid: true };
  }
  
  // Code doesn't match
  return { valid: false, message: 'Invalid verification code' };
};

/**
 * Check if a phone number is currently awaiting verification
 */
export const isAwaitingVerification = (phoneNumber: string): boolean => {
  return !!verificationStore[phoneNumber] && 
         Date.now() < verificationStore[phoneNumber].expires;
};

/**
 * Format phone number to E.164 format for Twilio
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