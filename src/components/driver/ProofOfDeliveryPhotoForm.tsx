
import React from 'react';
import ProofOfDeliveryCapture from './ProofOfDeliveryCapture';
import { useDeliveryCompletion } from './proof-of-delivery/useDeliveryCompletion';
import { EmailService } from '@/services/emailService';
import { DeliveryCompletionEmailData } from '@/services/emailTemplateService';
import { supabase } from '@/lib/supabase';

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
    
    if (success) {
      // Send delivery completion email with photo
      try {
        // Fetch delivery details for email
        const { data: delivery, error } = await supabase
          .from('delivery_requests')
          .select(`
            *,
            drivers (
              name
            )
          `)
          .eq('id', deliveryId)
          .single();

        if (!error && delivery) {
          const emailData: DeliveryCompletionEmailData = {
            requestId: delivery.id,
            trackingId: delivery.tracking_id || delivery.id,
            customerName: delivery.contact_name || 'Valued Customer',
            customerEmail: delivery.contact_email || 'catnetlogistics@gmail.com',
            pickupLocation: delivery.pickup_location,
            deliveryLocation: delivery.delivery_location,
            completedAt: new Date().toISOString(),
            deliveryPhotoUrl: photoUrl,
            driverName: delivery.drivers?.name || 'Driver'
          };

          await EmailService.sendDeliveryCompletionEmail(emailData);
          console.log('Delivery completion email sent successfully');
        }
      } catch (emailError) {
        console.error('Failed to send delivery completion email:', emailError);
        // Continue with completion even if email fails
      }

      if (onComplete) {
        onComplete();
      }
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
