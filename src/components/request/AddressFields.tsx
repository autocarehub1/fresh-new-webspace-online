
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';

interface AddressFieldsProps {
  pickupAddress: string;
  deliveryAddress: string;
  onPickupAddressChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDeliveryAddressChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const AddressFields: React.FC<AddressFieldsProps> = ({
  pickupAddress,
  deliveryAddress,
  onPickupAddressChange,
  onDeliveryAddressChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Label htmlFor="pickupAddress">Pickup Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Textarea
            id="pickupAddress"
            name="pickupAddress"
            value={pickupAddress}
            onChange={onPickupAddressChange}
            placeholder="Enter pickup address"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="deliveryAddress">Delivery Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Textarea
            id="deliveryAddress"
            name="deliveryAddress"
            value={deliveryAddress}
            onChange={onDeliveryAddressChange}
            placeholder="Enter delivery address"
            className="pl-10"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFields;
