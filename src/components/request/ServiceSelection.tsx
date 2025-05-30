
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceCategories } from './serviceCategories';

interface ServiceSelectionProps {
  serviceCategory: string;
  serviceType: string;
  onServiceCategoryChange: (value: string) => void;
  onServiceTypeChange: (value: string) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  serviceCategory,
  serviceType,
  onServiceCategoryChange,
  onServiceTypeChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="serviceCategory">Service Category</Label>
        <Select
          value={serviceCategory}
          onValueChange={onServiceCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medical">Medical Delivery</SelectItem>
            <SelectItem value="baggage">Baggage Delivery</SelectItem>
            <SelectItem value="pet">Pet Delivery</SelectItem>
            <SelectItem value="home">Home Improvement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="serviceType">Service Type</Label>
        <Select
          value={serviceType}
          onValueChange={onServiceTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories[serviceCategory as keyof typeof serviceCategories].map((service) => (
              <SelectItem key={service.value} value={service.value}>
                {service.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ServiceSelection;
