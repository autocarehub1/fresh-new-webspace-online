
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Clock } from 'lucide-react';

interface DateTimeFieldsProps {
  pickupDate: string;
  pickupTime: string;
  onPickupDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPickupTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  pickupDate,
  pickupTime,
  onPickupDateChange,
  onPickupTimeChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Label htmlFor="pickupDate">Pickup Date</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="date"
            id="pickupDate"
            name="pickupDate"
            value={pickupDate}
            onChange={onPickupDateChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="pickupTime">Pickup Time</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="time"
            id="pickupTime"
            name="pickupTime"
            value={pickupTime}
            onChange={onPickupTimeChange}
            className="pl-10"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DateTimeFields;
