
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileData } from './types';

interface WorkPreferencesSectionProps {
  profileData: ProfileData;
  onInputChange: (field: keyof ProfileData, value: string) => void;
}

const availabilityOptions = [
  { value: 'full-time', label: 'Full-time (40+ hours/week)' },
  { value: 'part-time', label: 'Part-time (20-39 hours/week)' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'evenings', label: 'Evenings only' },
  { value: 'flexible', label: 'Flexible schedule' }
];

const WorkPreferencesSection: React.FC<WorkPreferencesSectionProps> = ({
  profileData,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Work Preferences</CardTitle>
        <CardDescription>Tell us about your availability and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Select value={profileData.availability} onValueChange={(value) => onInputChange('availability', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your availability" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredAreas">Preferred Delivery Areas</Label>
          <Input
            id="preferredAreas"
            placeholder="e.g., Downtown, Westside, Airport area"
            value={profileData.preferredAreas}
            onChange={(e) => onInputChange('preferredAreas', e.target.value)}
          />
          <p className="text-sm text-gray-500">List areas where you prefer to make deliveries (optional)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="workExperience">Previous Delivery Experience</Label>
          <Textarea
            id="workExperience"
            placeholder="Describe any previous delivery or driving experience..."
            value={profileData.workExperience}
            onChange={(e) => onInputChange('workExperience', e.target.value)}
            rows={3}
          />
          <p className="text-sm text-gray-500">Optional: Tell us about your experience (if any)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkPreferencesSection;
