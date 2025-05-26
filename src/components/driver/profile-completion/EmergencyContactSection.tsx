
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileData } from './types';
import { formatPhoneNumber } from './validation';

interface EmergencyContactSectionProps {
  profileData: ProfileData;
  errors: Record<string, string>;
  onInputChange: (field: keyof ProfileData, value: string) => void;
}

const relations = [
  'Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other Family Member', 'Other'
];

const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({
  profileData,
  errors,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Emergency Contact</CardTitle>
        <CardDescription>Someone we can contact in case of emergency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName">Full Name *</Label>
          <Input
            id="emergencyContactName"
            placeholder="Emergency contact full name"
            value={profileData.emergencyContactName}
            onChange={(e) => onInputChange('emergencyContactName', e.target.value)}
            className={errors.emergencyContactName ? 'border-red-500' : ''}
          />
          {errors.emergencyContactName && <p className="text-sm text-red-500">{errors.emergencyContactName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
            <Input
              id="emergencyContactPhone"
              placeholder="(555) 123-4567"
              value={profileData.emergencyContactPhone}
              onChange={(e) => onInputChange('emergencyContactPhone', formatPhoneNumber(e.target.value))}
              className={errors.emergencyContactPhone ? 'border-red-500' : ''}
            />
            {errors.emergencyContactPhone && <p className="text-sm text-red-500">{errors.emergencyContactPhone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelation">Relationship *</Label>
            <Select value={profileData.emergencyContactRelation} onValueChange={(value) => onInputChange('emergencyContactRelation', value)}>
              <SelectTrigger className={errors.emergencyContactRelation ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relations.map((relation) => (
                  <SelectItem key={relation} value={relation.toLowerCase()}>
                    {relation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.emergencyContactRelation && <p className="text-sm text-red-500">{errors.emergencyContactRelation}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyContactSection;
