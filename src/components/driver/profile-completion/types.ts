
export interface ProfileData {
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  workExperience: string;
  availability: string;
  preferredAreas: string;
}

export interface ProfileCompletionProps {
  user: any;
  onComplete: () => void;
}
