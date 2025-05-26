
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeliveryTrackingProofProps {
  delivery: any;
}

const DeliveryTrackingProof: React.FC<DeliveryTrackingProofProps> = ({ delivery }) => {
  if (delivery?.status !== 'completed' || !delivery.proofOfDeliveryPhoto) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Proof of Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <img
            src={delivery.proofOfDeliveryPhoto}
            alt="Proof of Delivery"
            className="rounded shadow-md max-w-xs max-h-80 border"
          />
          <span className="text-xs text-gray-500 mt-2">Photo provided by driver at delivery completion</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTrackingProof;
