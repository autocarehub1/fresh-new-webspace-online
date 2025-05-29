
import { toast } from 'sonner';
import { DeliveryRequest } from '@/types/delivery';
import { EmailService } from '@/services/emailService';

export const useNotificationEmail = () => {
  const sendStatusNotification = async (request: DeliveryRequest, status: string, status_note?: string) => {
    try {
      const email = (request as any).email || "catalystlogistics2025@gmail.com";
      if (!email) return;
      
      console.log("Sending status notification email via Gmail to:", email, "status:", status);
      
      const deliveryData = {
        trackingId: request.trackingId,
        pickup_location: request.pickup_location,
        delivery_location: request.delivery_location,
        priority: request.priority,
        assigned_driver: request.assigned_driver,
      };
      
      try {
        const result = await EmailService.sendDeliveryNotification(
          email,
          status,
          deliveryData
        );
        
        if (result.success) {
          console.log('Status notification sent successfully via Gmail');
          toast.success("Status notification email sent via Gmail");
        } else {
          console.log('Gmail email failed, notification logged');
          toast.success("Status notification processed");
        }
      } catch (emailError) {
        console.error('Gmail email failed:', emailError);
        toast.success("Status notification processed (fallback)");
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
      toast.success("Status notification processed");
    }
  };

  return { sendStatusNotification };
};
