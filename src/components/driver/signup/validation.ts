
import { toast } from 'sonner';
import { DriverSignUpFormData } from './types';

export const validateSignUpForm = (formData: DriverSignUpFormData): boolean => {
  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match');
    return false;
  }

  if (formData.password.length < 8) {
    toast.error('Password must be at least 8 characters long');
    return false;
  }

  return true;
};
