
import { ProfileData } from './types';

export const validateProfileForm = (profileData: ProfileData): Record<string, string> => {
  const newErrors: Record<string, string> = {};

  if (!profileData.dateOfBirth) {
    newErrors.dateOfBirth = 'Date of birth is required';
  } else {
    const age = new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear();
    if (age < 18) {
      newErrors.dateOfBirth = 'Must be at least 18 years old';
    }
  }

  if (!profileData.address) {
    newErrors.address = 'Address is required';
  }

  if (!profileData.city) {
    newErrors.city = 'City is required';
  }

  if (!profileData.state) {
    newErrors.state = 'State is required';
  }

  if (!profileData.zipCode) {
    newErrors.zipCode = 'ZIP code is required';
  } else if (!/^\d{5}(-\d{4})?$/.test(profileData.zipCode)) {
    newErrors.zipCode = 'Invalid ZIP code format';
  }

  if (!profileData.emergencyContactName) {
    newErrors.emergencyContactName = 'Emergency contact name is required';
  }

  if (!profileData.emergencyContactPhone) {
    newErrors.emergencyContactPhone = 'Emergency contact phone is required';
  } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(profileData.emergencyContactPhone)) {
    newErrors.emergencyContactPhone = 'Invalid phone number format';
  }

  if (!profileData.emergencyContactRelation) {
    newErrors.emergencyContactRelation = 'Emergency contact relation is required';
  }

  return newErrors;
};

export const formatPhoneNumber = (value: string): string => {
  const phone = value.replace(/\D/g, '');
  if (phone.length <= 3) return phone;
  if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
};
