
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProofOfDeliveryCapture from './ProofOfDeliveryCapture';

interface DeliveryTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeliveryId: string;
  onProofUploaded: (photoUrl: string) => void;
  onCancel: () => void;
}

const DeliveryTrackerDialog: React.FC<DeliveryTrackerDialogProps> = ({
  open,
  onOpenChange,
  selectedDeliveryId,
  onProofUploaded,
  onCancel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Delivery</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Please take a photo as proof of delivery before completing this request.
          </p>
          
          <ProofOfDeliveryCapture
            deliveryId={selectedDeliveryId}
            onPhotoUploaded={onProofUploaded}
            onCancel={onCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryTrackerDialog;
