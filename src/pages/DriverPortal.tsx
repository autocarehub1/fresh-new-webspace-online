
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import DriverAuth from '@/components/driver/DriverAuth';
import DriverDashboardMain from '@/components/driver/DriverDashboardMain';

const DriverPortal = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');
    
    if (verified === 'true') {
      toast.success('Email verified successfully! You can now sign in.');
    } else if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-blue-400" />
          <p className="text-white text-lg">Loading Driver Portal...</p>
        </div>
      </div>
    );
  }

  // Show auth forms if not authenticated
  if (!user) {
    return <DriverAuth />;
  }

  // Check if profile setup is needed
  const userMetadata = user.user_metadata;
  if (!userMetadata?.has_completed_profile && !userMetadata?.profile_completed) {
    navigate('/driver-profile-setup', { state: { userId: user.id } });
    return null;
  }

  // Check if onboarding is needed
  if (!userMetadata?.onboarding_completed) {
    navigate('/driver-onboarding');
    return null;
  }

  // Show dashboard for authenticated users
  return <DriverDashboardMain user={user} />;
};

export default DriverPortal;
