
import React from 'react';
import ProofOfDeliveryCapture from './ProofOfDeliveryCapture';
import { useDeliveryCompletion } from './proof-of-delivery/useDeliveryCompletion';

interface ProofOfDeliveryPhotoFormProps {
  deliveryId: string;
  onComplete?: () => void;
}

const ProofOfDeliveryPhotoForm: React.FC<ProofOfDeliveryPhotoFormProps> = ({ 
  deliveryId, 
  onComplete 
}) => {
  const { completeDeliveryWithPhoto } = useDeliveryCompletion();

  const handlePhotoUploaded = async (photoUrl: string) => {
    const success = await completeDeliveryWithPhoto(deliveryId, photoUrl);
    if (success && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <ProofOfDeliveryCapture
        deliveryId={deliveryId}
        onPhotoUploaded={handlePhotoUploaded}
      />
    </div>
  );
};

export default ProofOfDeliveryPhotoForm;
