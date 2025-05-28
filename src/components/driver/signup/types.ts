
export interface DriverSignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface DriverSignUpProps {
  onSwitchToSignIn: () => void;
}
