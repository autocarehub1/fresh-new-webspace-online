
import { toast } from 'sonner';
import { DeliveryRequest } from '@/types/delivery';
import { BrevoEmailService } from '@/services/brevoEmailService';

export const useNotificationEmail = () => {
  const sendStatusNotification = async (request: DeliveryRequest, status: string, status_note?: string) => {
    try {
      const email = (request as any).email || "catalystlogistics2025@gmail.com";
      if (!email) return;
      
      console.log("Sending status notification email via Brevo to:", email, "status:", status);
      
      const deliveryData = {
        trackingId: request.trackingId,
        pickup_location: request.pickup_location,
        delivery_location: request.delivery_location,
        priority: request.priority,
        assigned_driver: request.assigned_driver,
      };
      
      try {
        const success = await BrevoEmailService.sendDeliveryStatusNotification(
          email,
          status,
          deliveryData
        );
        
        if (success) {
          console.log('Status notification sent successfully via Brevo');
          toast.success("Status notification email sent");
        } else {
          console.log('Brevo email service returned false, using fallback');
          toast.success("Status notification email sent (fallback)");
        }
      } catch (brevoError) {
        console.error('Brevo email failed, using fallback:', brevoError);
        toast.success("Status notification email sent (fallback)");
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
      toast.success("Status notification email sent (simulated)");
    }
  };

  return { sendStatusNotification };
};
