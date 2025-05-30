
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Phone, Mail } from 'lucide-react';

interface ContactFieldsProps {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  onContactNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContactFields: React.FC<ContactFieldsProps> = ({
  contactName,
  contactPhone,
  contactEmail,
  onContactNameChange,
  onContactPhoneChange,
  onContactEmailChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <Label htmlFor="contactName">Contact Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            id="contactName"
            name="contactName"
            value={contactName}
            onChange={onContactNameChange}
            placeholder="Your name"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="contactPhone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={contactPhone}
            onChange={onContactPhoneChange}
            placeholder="(555) 555-5555"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="contactEmail">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={contactEmail}
            onChange={onContactEmailChange}
            placeholder="your@email.com"
            className="pl-10"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ContactFields;
