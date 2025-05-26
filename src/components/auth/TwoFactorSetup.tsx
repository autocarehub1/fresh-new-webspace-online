import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete }) => {
  const { user, isTwoFactorEnabled, initiateTwoFactor, verifyTwoFactor } = useAuth();
  const [isInitiating, setIsInitiating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupStarted, setSetupStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Check if 2FA is already enabled
  useEffect(() => {
    if (isTwoFactorEnabled) {
      setSetupStarted(true);
    }
  }, [isTwoFactorEnabled]);

  // Handle enabling 2FA
  const handleEnable2FA = async () => {
    if (!user) {
      toast.error('You must be logged in to enable two-factor authentication');
      return;
    }

    setIsInitiating(true);
    setErrorMessage('');

    try {
      const result = await initiateTwoFactor();
      
      if (result.success) {
        setSetupStarted(true);
        // Generate and store backup codes (in a real app, these would come from the backend)
        const codes = Array.from({ length: 10 }, () => 
          Math.floor(10000000 + Math.random() * 90000000).toString()
        );
        setBackupCodes(codes);
        toast.success('Two-factor authentication setup initiated');
      } else {
        setErrorMessage(result.error || 'Failed to set up two-factor authentication');
        toast.error(result.error || 'Failed to set up two-factor authentication');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to set up two-factor authentication');
      toast.error('Failed to set up two-factor authentication');
    } finally {
      setIsInitiating(false);
    }
  };

  // Handle verifying the code
  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    
    setIsVerifying(true);
    setErrorMessage('');
    
    try {
      const result = await verifyTwoFactor(verificationCode);
      
      if (result.success) {
        toast.success('Two-factor authentication enabled successfully!');
        if (onComplete) onComplete();
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Shield className="mr-2 h-5 w-5 text-medical-blue" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by requiring a verification code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isTwoFactorEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              <span className="font-medium">Two-factor authentication is enabled</span>
            </div>
            <p className="text-sm text-gray-500">
              Your account is protected with an additional layer of security. Each time you sign in, you'll need to provide a verification code.
            </p>
          </div>
        ) : setupStarted ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-sm font-medium">Enter Verification Code</div>
              <div className="text-sm text-gray-500">
                Enter the 6-digit code provided. In a real implementation, this would be from an authenticator app or SMS.
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-40 text-center text-lg tracking-widest"
                  disabled={isVerifying}
                />
                <Button 
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
              
              {errorMessage && (
                <div className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errorMessage}
                </div>
              )}
            </div>
            
            {backupCodes.length > 0 && (
              <div className="border rounded-md p-4 bg-gray-50 space-y-3">
                <div className="text-sm font-medium">Backup Codes</div>
                <div className="text-xs text-gray-500">
                  If you lose access to your authentication device, you can use one of these backup codes to sign in. Each code can only be used once.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-xs bg-white border rounded px-2 py-1">
                      {code}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-amber-600">
                  Save these codes in a secure location. They won't be shown again.
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  toast.success('Backup codes copied to clipboard');
                }}>
                  Copy Codes
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Enable two-factor authentication</div>
                <div className="text-sm text-gray-500">
                  Require a verification code when signing in
                </div>
              </div>
              <Switch
                checked={isTwoFactorEnabled}
                onCheckedChange={handleEnable2FA}
                disabled={isInitiating || isTwoFactorEnabled}
              />
            </div>
            
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Why use two-factor authentication?</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Protects your account even if your password is compromised</li>
                      <li>Prevents unauthorized access from unknown devices</li>
                      <li>Provides peace of mind when handling sensitive deliveries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup; 