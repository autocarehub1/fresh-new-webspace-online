
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { ProfileCompletionProps } from './profile-completion/types';
import PersonalInfoSection from './profile-completion/PersonalInfoSection';
import AddressInfoSection from './profile-completion/AddressInfoSection';
import EmergencyContactSection from './profile-completion/EmergencyContactSection';
import WorkPreferencesSection from './profile-completion/WorkPreferencesSection';

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ user, onComplete }) => {
  const {
    profileData,
    errors,
    isLoading,
    handleInputChange,
    handleSubmit
  } = useProfileCompletion(user, onComplete);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Profile</h3>
        <p className="text-gray-600">
          Help us learn more about you to provide the best delivery experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PersonalInfoSection
          profileData={profileData}
          errors={errors}
          onInputChange={handleInputChange}
        />

        <AddressInfoSection
          profileData={profileData}
          errors={errors}
          onInputChange={handleInputChange}
        />

        <EmergencyContactSection
          profileData={profileData}
          errors={errors}
          onInputChange={handleInputChange}
        />

        <WorkPreferencesSection
          profileData={profileData}
          onInputChange={handleInputChange}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="px-8">
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCompletion;
