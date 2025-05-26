import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { AlertCircle, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TwoFactorVerifyProps {
  onVerified: () => void;
  onCancel: () => void;
}

const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({ onVerified, onCancel }) => {
  const { verifyTwoFactor } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60 * 5); // 5 minutes
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      onCancel(); // Timeout, go back to login
      toast.error('Verification timed out. Please try again.');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, onCancel]);

  // Format countdown time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle verifying the code
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code');
      return;
    }
    
    setIsVerifying(true);
    setErrorMessage('');
    
    try {
      const result = await verifyTwoFactor(verificationCode);
      
      if (result.success) {
        toast.success('Verification successful!');
        onVerified();
      } else {
        setErrorMessage(result.error || 'Invalid verification code');
        toast.error(result.error || 'Invalid verification code');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Verification failed');
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Shield className="mr-2 h-5 w-5 text-medical-blue" />
          Two-Factor Verification
        </CardTitle>
        <CardDescription>
          Enter the verification code to complete sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Enter the 6-digit verification code. For this demo, enter <span className="font-mono font-medium">123456</span>
            </div>
            
            <Input
              ref={inputRef}
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              disabled={isVerifying}
              autoComplete="one-time-code"
            />
            
            {errorMessage && (
              <div className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errorMessage}
              </div>
            )}
            
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Code expires in {formatTime(countdown)}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={verificationCode.length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Cancel
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-center">
            <button
              type="button"
              className="text-medical-blue hover:underline"
              onClick={onCancel}
            >
              Use recovery code instead
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TwoFactorVerify; 