import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { sendVerificationCode, verifyCode } from '@/services/smsVerification';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface SMSVerificationProps {
  phoneNumber: string;
  onVerified: (verified: boolean) => void;
  isDisabled?: boolean;
}

const SMSVerification: React.FC<SMSVerificationProps> = ({
  phoneNumber,
  onVerified,
  isDisabled = false
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  // Format countdown time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Send verification code
  const handleSendCode = async () => {
    if (!phoneNumber || isSending || isDisabled) return;
    
    setIsSending(true);
    setErrorMessage('');
    setVerificationStatus('idle');
    
    try {
      const result = await sendVerificationCode(phoneNumber);
      
      if (result.success) {
        setIsCodeSent(true);
        setCountdown(60 * 2); // 2 minutes countdown
        toast.success(result.message || 'Verification code sent!');
      } else {
        setErrorMessage(result.error || 'Failed to send verification code');
        toast.error(result.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send verification code');
      toast.error('Failed to send verification code');
    } finally {
      setIsSending(false);
    }
  };

  // Verify the code
  const handleVerifyCode = async () => {
    if (!verificationCode || isVerifying || isDisabled) return;
    
    setIsVerifying(true);
    setErrorMessage('');
    
    try {
      const result = await verifyCode(phoneNumber, verificationCode);
      
      if (result.success && result.verified) {
        setVerificationStatus('success');
        onVerified(true);
        toast.success('Phone number verified successfully!');
      } else {
        setVerificationStatus('error');
        setErrorMessage(result.error || 'Invalid verification code');
        onVerified(false);
        toast.error(result.error || 'Invalid verification code');
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Verification failed');
      onVerified(false);
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Phone Verification</div>
      
      {!isCodeSent ? (
        <div className="flex gap-2 items-start">
          <Button 
            size="sm"
            onClick={handleSendCode}
            disabled={isSending || isDisabled || !phoneNumber}
            className="whitespace-nowrap"
          >
            {isSending ? 'Sending...' : 'Send Code'}
          </Button>
          <div className="text-xs text-gray-500">
            We'll send a verification code to your phone to verify it's really you.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isVerifying || verificationStatus === 'success' || isDisabled}
              className={`w-40 text-center ${
                verificationStatus === 'success' 
                  ? 'border-green-500 focus:border-green-500' 
                  : verificationStatus === 'error'
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }`}
            />
            <Button
              size="sm"
              onClick={handleVerifyCode}
              disabled={
                verificationCode.length !== 6 || 
                isVerifying || 
                verificationStatus === 'success' ||
                isDisabled
              }
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
            
            {verificationStatus === 'success' && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Verified
              </div>
            )}
          </div>
          
          {verificationStatus === 'error' && (
            <div className="text-red-500 text-xs flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errorMessage}
            </div>
          )}
          
          {countdown > 0 ? (
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Code expires in {formatTime(countdown)}
            </div>
          ) : (
            <div className="text-xs">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSending || isDisabled}
                className="text-medical-blue hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {isSending ? 'Sending...' : 'Resend'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SMSVerification; 