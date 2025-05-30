
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';

interface InstructionsFieldProps {
  specialInstructions: string;
  onSpecialInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InstructionsField: React.FC<InstructionsFieldProps> = ({
  specialInstructions,
  onSpecialInstructionsChange
}) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="specialInstructions">Special Instructions</Label>
      <div className="relative">
        <Info className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Textarea
          id="specialInstructions"
          name="specialInstructions"
          value={specialInstructions}
          onChange={onSpecialInstructionsChange}
          placeholder="Any special requirements or instructions"
          className="pl-10"
          rows={4}
        />
      </div>
    </div>
  );
};

export default InstructionsField;
