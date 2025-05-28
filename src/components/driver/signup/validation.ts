
import { toast } from 'sonner';
import { DriverSignUpFormData } from './types';

export const validateSignUpForm = (formData: DriverSignUpFormData): boolean => {
  // Check if all required fields are filled
  if (!formData.firstName.trim()) {
    toast.error('First name is required');
    return false;
  }

  if (!formData.lastName.trim()) {
    toast.error('Last name is required');
    return false;
  }

  if (!formData.email.trim()) {
    toast.error('Email is required');
    return false;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    toast.error('Please enter a valid email address');
    return false;
  }

  if (!formData.password) {
    toast.error('Password is required');
    return false;
  }

  if (formData.password.length < 6) {
    toast.error('Password must be at least 6 characters long');
    return false;
  }

  if (!formData.confirmPassword) {
    toast.error('Please confirm your password');
    return false;
  }

  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match');
    return false;
  }

  return true;
};
